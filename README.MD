# 📄 Desafio Técnico I.a — Extrator de Documentos

## 📌 Visão Geral

Este projeto tem como objetivo criar uma ferramenta capaz de **extrair informações estruturadas a partir de documentos não estruturados** (PDFs e imagens), utilizando Inteligência Artificial.

A solução funciona como uma ponte entre documentos e sistemas internos, automatizando o preenchimento de dados e reduzindo o trabalho manual.

---

## 🧱 Arquitetura do Projeto

O sistema é dividido em duas partes principais:

### 🔹 Back-end

* Framework: **FastAPI**
* Responsável por:

  * Receber uploads de arquivos (PDF, JPG, PNG)
  * Processar os documentos com IA (LLM via API)
  * Extrair informações relevantes
  * Armazenar os dados em banco NoSQL

### 🔹 Front-end

* Framework: **React** (ou HTML/JS)
* Responsável por:

  * Interface de upload (drag and drop)
  * Exibição dos dados extraídos
  * Permitir edição manual dos campos
  * Visualização do JSON bruto

---

## 🚀 Funcionalidades

### 📤 Upload de Arquivos

* Suporte para:

  * PDF
  * Imagens (JPG, PNG)
* Envio via interface drag-and-drop

---

### 🧠 Processamento com IA

* Uso de uma LLM via API para:

  * Ler o conteúdo do documento
  * Interpretar texto não estruturado
  * Retornar dados estruturados em JSON

---

### 📊 Campos Extraídos

O sistema tenta identificar automaticamente:

* **Identificação**

  * Nome completo
  * CPF ou CNPJ

* **Cronologia**

  * Data de emissão ou ocorrência

* **Referência**

  * Período (data de início e fim)

* **Outros campos**

  * Ex: número da nota fiscal, valores, descrição, etc.

---

### 💾 Persistência de Dados

* Banco de dados NoSQL:

  * MongoDB **ou** Firebase
* Estrutura flexível (JSON)

---

### 🖥️ Dashboard (Front-end)

* Visualização dos dados extraídos
* Edição manual dos campos
* Exibição do JSON bruto (debug)
* Feedback visual para o usuário

---

## 🛠️ Tecnologias Utilizadas

### Back-end

* FastAPI
* Python
* Biblioteca para leitura de arquivos (ex: PyPDF, Pillow)
* API de LLM (OpenAI, Anthropic, etc.)

### Front-end

* React (ou HTML + JavaScript)
* Axios ou Fetch API

### Banco de Dados

* MongoDB ou Firebase

---

## ⚙️ Como Rodar o Projeto

### 🔧 Back-end

1. Instalar dependências:

```bash
pip install fastapi uvicorn python-multipart
```

2. Rodar o servidor:

```bash
uvicorn main:app --reload
```

---

### 💻 Front-end

1. Instalar dependências:

```bash
npm install
```

2. Rodar:

```bash
npm run dev
```

---

## 🔌 Estrutura da API

### POST `/upload`

**Descrição:** Recebe um arquivo e retorna os dados extraídos.

**Request:**

* Form-data:

  * file: PDF ou imagem

**Response (exemplo):**

```json
{
  "nome": "João Silva",
  "cpf": "123.456.789-00",
  "data": "2024-01-10",
  "periodo": {
    "inicio": "2024-01-01",
    "fim": "2024-01-31"
  },
  "outros": {
    "valor": "R$ 1500,00"
  }
}
```

---

## 🧪 Melhorias Futuras

* Melhorar precisão da extração com OCR dedicado
* Validação de CPF/CNPJ
* Histórico de uploads
* Autenticação de usuários
* Exportação de dados (CSV/Excel)

---

## 📎 Observações

* A qualidade da extração depende da LLM utilizada
* Documentos com baixa qualidade podem gerar erros
* O sistema permite edição manual para correção

---

## 📌 Objetivo do Desafio

Demonstrar:

* Integração com APIs de IA
* Manipulação de arquivos
* Criação de APIs REST
* Uso de banco NoSQL
* Construção de interface interativa

---
