from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timezone
from groq import Groq
import base64
import json
import os
import re

# ─────────────────────────────────────────
#  Config
# ─────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "sua-chave-aqui")
MONGO_URI    = os.getenv("MONGO_URI", "mongodb://localhost:27017")

groq_client  = Groq(api_key=GROQ_API_KEY)
mongo_client = MongoClient(MONGO_URI)
db           = mongo_client["extrator"]
collection   = db["documentos"]

app = FastAPI(title="Extrator de Documentos", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # em produção, limite ao domínio do front
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────
#  Helpers
# ─────────────────────────────────────────
EXTRACT_PROMPT = """
Você é um extrator de documentos. Analise a imagem ou texto fornecido e retorne
SOMENTE um objeto JSON (sem markdown, sem explicações) com os campos que conseguir
identificar. Sempre inclua as chaves abaixo, deixando null quando não encontrar:

{
  "nome_razao_social": null,
  "cpf_cnpj": null,
  "data_emissao": null,
  "competencia": null,
  "periodo_inicio": null,
  "periodo_fim": null,
  "valor_total": null,
  "numero_documento": null,
  "chave_acesso": null,
  "descricao_servico": null,
  "outros": {}
}

Para campos de data, use o formato YYYY-MM-DD quando possível.
Para "outros", inclua quaisquer campos relevantes que não se encaixem nos anteriores.
"""


def safe_parse_json(raw: str) -> dict:
    """Remove possíveis blocos markdown e faz parse seguro."""
    cleaned = re.sub(r"```(?:json)?|```", "", raw).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # tenta extrair o primeiro objeto JSON da string
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError("Não foi possível parsear o JSON retornado pela IA.")


def serialize_doc(doc: dict) -> dict:
    """Converte ObjectId para string para poder serializar como JSON."""
    doc["_id"] = str(doc["_id"])
    return doc


# ─────────────────────────────────────────
#  Modelos de request
# ─────────────────────────────────────────
class UpdatePayload(BaseModel):
    campos: dict


# ─────────────────────────────────────────
#  Endpoints
# ─────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ok", "service": "Extrator de Documentos"}


@app.post("/extract")
async def extract_document(file: UploadFile = File(...)):
    """
    Recebe um arquivo PDF ou imagem (JPG/PNG), envia para o modelo
    de visão da Groq e persiste os campos extraídos no MongoDB.
    """
    allowed = {"image/jpeg", "image/png", "image/jpg", "application/pdf"}
    if file.content_type not in allowed:
        raise HTTPException(
            status_code=415,
            detail=f"Tipo não suportado: {file.content_type}. Use JPG, PNG ou PDF."
        )

    raw_bytes = await file.read()
    b64_data  = base64.b64encode(raw_bytes).decode("utf-8")

    # PDFs são enviados como imagem (página 1). Para multipágina use pymupdf.
    media_type = file.content_type if file.content_type != "application/pdf" else "image/jpeg"

    try:
        response = groq_client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",  # modelo com visão
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{media_type};base64,{b64_data}"
                            },
                        },
                        {
                            "type": "text",
                            "text": EXTRACT_PROMPT,
                        },
                    ],
                }
            ],
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Erro na API Groq: {str(e)}")

    raw_text = response.choices[0].message.content

    if not raw_text:
        raise HTTPException(status_code=502, detail="Resposta vazia da API Groq")

    try:
        campos = safe_parse_json(raw_text)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    doc = {
        "arquivo":      file.filename,
        "content_type": file.content_type,
        "extraido_em":  datetime.now(timezone.utc).isoformat(),
        "revisado":     False,
        "campos":       campos,
        "raw_ia":       raw_text,        # guarda resposta bruta para debug
    }

    result = collection.insert_one(doc)
    doc["_id"] = str(result.inserted_id)

    return doc


@app.get("/documents")
def list_documents(limit: int = 20, skip: int = 0):
    """Lista os documentos salvos (paginado)."""
    docs = list(collection.find().sort("extraido_em", -1).skip(skip).limit(limit))
    return [serialize_doc(d) for d in docs]


@app.get("/documents/{doc_id}")
def get_document(doc_id: str):
    """Retorna um documento pelo _id."""
    try:
        doc = collection.find_one({"_id": ObjectId(doc_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="ID inválido.")
    if not doc:
        raise HTTPException(status_code=404, detail="Documento não encontrado.")
    return serialize_doc(doc)


@app.put("/documents/{doc_id}")
def update_document(doc_id: str, payload: UpdatePayload):
    """Atualiza os campos após revisão manual do usuário."""
    try:
        oid = ObjectId(doc_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID inválido.")

    result = collection.update_one(
        {"_id": oid},
        {"$set": {"campos": payload.campos, "revisado": True, "revisado_em": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Documento não encontrado.")
    return {"ok": True, "doc_id": doc_id}


@app.delete("/documents/{doc_id}")
def delete_document(doc_id: str):
    """Remove um documento do banco."""
    try:
        oid = ObjectId(doc_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID inválido.")
    result = collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Documento não encontrado.")
    return {"ok": True}