import { useState, useCallback, useRef } from "react";

// ─── Config ────────────────────────────────────────────────
const API_BASE = "http://localhost:8000";

// ─── Field labels map ──────────────────────────────────────
const FIELD_LABELS = {
  nome_razao_social: "Nome / Razão Social",
  cpf_cnpj: "CPF / CNPJ",
  data_emissao: "Data de Emissão",
  competencia: "Competência",
  periodo_inicio: "Início do Período",
  periodo_fim: "Fim do Período",
  valor_total: "Valor Total",
  numero_documento: "Número do Documento",
  chave_acesso: "Chave de Acesso",
  descricao_servico: "Descrição do Serviço",
};

// ─── Styles ────────────────────────────────────────────────
const S = {
  app: {
    minHeight: "100vh",
    background: "#0d0d0f",
    color: "#e8e6e0",
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    padding: "0",
  },
  header: {
    borderBottom: "1px solid #2a2a2e",
    padding: "20px 40px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    background: "#0d0d0f",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  headerTitle: {
    fontSize: "15px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    color: "#e8e6e0",
    textTransform: "uppercase",
  },
  headerSub: {
    fontSize: "11px",
    color: "#555",
    letterSpacing: "0.05em",
    marginTop: "2px",
  },
  logo: {
    width: "32px",
    height: "32px",
    background: "#c8f135",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  main: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "40px 24px",
  },
  dropZone: (active) => ({
    border: `1.5px dashed ${active ? "#c8f135" : "#2a2a2e"}`,
    borderRadius: "12px",
    padding: "56px 24px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    background: active ? "rgba(200,241,53,0.04)" : "#111113",
    marginBottom: "32px",
  }),
  dropIcon: {
    fontSize: "40px",
    marginBottom: "16px",
    display: "block",
    color: "#444",
  },
  dropTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#e8e6e0",
    marginBottom: "6px",
    letterSpacing: "0.04em",
  },
  dropSub: {
    fontSize: "12px",
    color: "#555",
    letterSpacing: "0.03em",
  },
  progressWrap: {
    margin: "0 0 32px",
  },
  progressLabel: {
    fontSize: "12px",
    color: "#888",
    marginBottom: "8px",
    display: "flex",
    justifyContent: "space-between",
  },
  progressBar: {
    height: "3px",
    background: "#1e1e22",
    borderRadius: "2px",
    overflow: "hidden",
  },
  progressFill: (pct) => ({
    height: "100%",
    width: `${pct}%`,
    background: "#c8f135",
    borderRadius: "2px",
    transition: "width 0.3s ease",
  }),
  tabBar: {
    display: "flex",
    gap: "0",
    borderBottom: "1px solid #1e1e22",
    marginBottom: "24px",
  },
  tab: (active) => ({
    padding: "10px 20px",
    fontSize: "12px",
    cursor: "pointer",
    background: "none",
    border: "none",
    borderBottom: `2px solid ${active ? "#c8f135" : "transparent"}`,
    color: active ? "#c8f135" : "#555",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    fontFamily: "inherit",
    fontWeight: active ? "600" : "400",
    transition: "all 0.15s",
    marginBottom: "-1px",
  }),
  sectionLabel: {
    fontSize: "10px",
    color: "#555",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    marginBottom: "12px",
    marginTop: "24px",
    display: "block",
  },
  fieldRow: {
    display: "grid",
    gridTemplateColumns: "180px 1fr",
    alignItems: "start",
    gap: "12px",
    padding: "10px 0",
    borderBottom: "1px solid #1a1a1e",
  },
  fieldLabel: {
    fontSize: "11px",
    color: "#555",
    letterSpacing: "0.05em",
    paddingTop: "7px",
    lineHeight: "1.4",
  },
  fieldInput: {
    fontSize: "13px",
    color: "#e8e6e0",
    background: "transparent",
    border: "1px solid transparent",
    borderRadius: "5px",
    padding: "5px 8px",
    width: "100%",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
    lineHeight: "1.5",
  },
  jsonBlock: {
    background: "#111113",
    border: "1px solid #1e1e22",
    borderRadius: "10px",
    padding: "20px",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "12px",
    color: "#8a9",
    whiteSpace: "pre",
    overflowX: "auto",
    lineHeight: "1.7",
  },
  btnRow: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    marginTop: "28px",
  },
  btn: (variant) => ({
    padding: "9px 20px",
    borderRadius: "7px",
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    fontWeight: "600",
    border: variant === "primary" ? "none" : "1px solid #2a2a2e",
    background: variant === "primary" ? "#c8f135" : "transparent",
    color: variant === "primary" ? "#0d0d0f" : "#888",
    transition: "all 0.15s",
  }),
  toast: (type) => ({
    position: "fixed",
    bottom: "28px",
    right: "28px",
    background: type === "success" ? "#1a2e0a" : "#2e0a0a",
    border: `1px solid ${type === "success" ? "#4a8a1a" : "#8a2a2a"}`,
    color: type === "success" ? "#c8f135" : "#f13535",
    padding: "12px 20px",
    borderRadius: "8px",
    fontSize: "12px",
    fontFamily: "'IBM Plex Mono', monospace",
    letterSpacing: "0.04em",
    zIndex: 999,
    maxWidth: "360px",
  }),
  badge: (type) => ({
    display: "inline-block",
    fontSize: "10px",
    padding: "2px 8px",
    borderRadius: "4px",
    letterSpacing: "0.06em",
    fontWeight: "600",
    background:
      type === "saved" ? "#1a2e0a" : type === "error" ? "#2e0a0a" : "#1a1a22",
    color: type === "saved" ? "#c8f135" : type === "error" ? "#f13535" : "#888",
    border:
      type === "saved"
        ? "1px solid #4a8a1a"
        : type === "error"
          ? "1px solid #8a2a2a"
          : "1px solid #2a2a2e",
  }),
  historyCard: {
    background: "#111113",
    border: "1px solid #1e1e22",
    borderRadius: "10px",
    padding: "16px 20px",
    marginBottom: "10px",
    cursor: "pointer",
    transition: "border-color 0.15s",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 24px",
    color: "#444",
    fontSize: "12px",
    letterSpacing: "0.06em",
  },
};

// ─── Toast component ───────────────────────────────────────
function Toast({ msg, type, onClose }) {
  if (!msg) return null;
  return (
    <div style={S.toast(type)} onClick={onClose}>
      {type === "success" ? "✓ " : "✗ "}
      {msg}
    </div>
  );
}

// ─── DropZone component ────────────────────────────────────
function DropZone({ onFile, loading }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  const handle = (file) => {
    if (!file) return;
    const ok = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!ok.includes(file.type)) {
      alert("Formato inválido. Use JPG, PNG ou PDF.");
      return;
    }
    onFile(file);
  };

  return (
    <div
      style={S.dropZone(drag)}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        handle(e.dataTransfer.files[0]);
      }}
      onClick={() => !loading && inputRef.current.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        style={{ display: "none" }}
        onChange={(e) => handle(e.target.files[0])}
      />
      <span style={S.dropIcon}>
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <rect
            x="9"
            y="5"
            width="20"
            height="27"
            rx="3"
            stroke="#444"
            strokeWidth="1.5"
          />
          <path d="M29 5l6 6" stroke="#444" strokeWidth="1.5" />
          <path d="M29 5v6h6" stroke="#444" strokeWidth="1.5" />
          <path
            d="M15 22h14M15 28h10"
            stroke="#444"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <p style={S.dropTitle}>
        {loading ? "Processando..." : "Arraste o documento aqui"}
      </p>
      <p style={S.dropSub}>PDF · JPG · PNG — ou clique para selecionar</p>
    </div>
  );
}

// ─── Progress bar ──────────────────────────────────────────
function ProgressBar({ pct, label }) {
  return (
    <div style={S.progressWrap}>
      <div style={S.progressLabel}>
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div style={S.progressBar}>
        <div style={S.progressFill(pct)} />
      </div>
    </div>
  );
}

// ─── Dashboard de conferência ──────────────────────────────
function Dashboard({ doc, onSave, onBack }) {
  const [campos, setCampos] = useState(doc.campos || {});
  const [activeTab, setActiveTab] = useState("fields");
  const [saving, setSaving] = useState(false);

  const updateField = (key, val) => {
    setCampos((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(doc._id, campos);
    setSaving(false);
  };

  const mainFields = Object.entries(FIELD_LABELS).map(([key, label]) => ({
    key,
    label,
    value: campos[key] ?? "",
  }));

  const outrosFields = Object.entries(campos.outros || {});

  const displayDoc = { ...doc, campos };

  return (
    <div>
      {/* header info */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "24px",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "15px",
              fontWeight: "600",
              color: "#e8e6e0",
              letterSpacing: "0.03em",
            }}
          >
            {doc.arquivo}
          </div>
          <div style={{ fontSize: "11px", color: "#555", marginTop: "4px" }}>
            Extraído em {new Date(doc.extraido_em).toLocaleString("pt-BR")}
            {" · "}
            <span style={S.badge(doc.revisado ? "saved" : "default")}>
              {doc.revisado ? "revisado" : "não revisado"}
            </span>
          </div>
        </div>
        <button style={S.btn("ghost")} onClick={onBack}>
          ← voltar
        </button>
      </div>

      {/* tab bar */}
      <div style={S.tabBar}>
        <button
          style={S.tab(activeTab === "fields")}
          onClick={() => setActiveTab("fields")}
        >
          Campos
        </button>
        <button
          style={S.tab(activeTab === "json")}
          onClick={() => setActiveTab("json")}
        >
          JSON bruto
        </button>
      </div>

      {activeTab === "fields" && (
        <div>
          <span style={S.sectionLabel}>Identificação & Cronologia</span>
          {mainFields.map(({ key, label, value }) => (
            <div key={key} style={S.fieldRow}>
              <div style={S.fieldLabel}>{label}</div>
              <input
                style={S.fieldInput}
                value={value || ""}
                placeholder={value === null ? "— não encontrado —" : ""}
                onChange={(e) => updateField(key, e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = "#c8f135")}
                onBlur={(e) => (e.target.style.borderColor = "transparent")}
              />
            </div>
          ))}

          {outrosFields.length > 0 && (
            <>
              <span style={S.sectionLabel}>Outros campos detectados</span>
              {outrosFields.map(([key, val]) => (
                <div key={key} style={S.fieldRow}>
                  <div style={S.fieldLabel}>{key}</div>
                  <input
                    style={S.fieldInput}
                    value={
                      typeof val === "object" ? JSON.stringify(val) : val || ""
                    }
                    onChange={(e) =>
                      setCampos((prev) => ({
                        ...prev,
                        outros: { ...prev.outros, [key]: e.target.value },
                      }))
                    }
                    onFocus={(e) => (e.target.style.borderColor = "#c8f135")}
                    onBlur={(e) => (e.target.style.borderColor = "transparent")}
                  />
                </div>
              ))}
            </>
          )}

          <div style={S.btnRow}>
            <button style={S.btn("ghost")}>Descartar</button>
            <button
              style={S.btn("primary")}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Salvando..." : "Salvar no banco →"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "json" && (
        <div style={S.jsonBlock}>{JSON.stringify(displayDoc, null, 2)}</div>
      )}
    </div>
  );
}

// ─── History list ──────────────────────────────────────────
function History({ docs, onSelect, onDelete }) {
  if (docs.length === 0) {
    return (
      <div style={S.emptyState}>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>◫</div>
        Nenhum documento extraído ainda.
      </div>
    );
  }
  return (
    <div>
      {docs.map((d) => (
        <div
          key={d._id}
          style={S.historyCard}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#333")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1e1e22")}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "8px",
            }}
          >
            <div
              style={{ flex: 1, cursor: "pointer" }}
              onClick={() => onSelect(d)}
            >
              <div
                style={{
                  fontSize: "13px",
                  color: "#e8e6e0",
                  fontWeight: "500",
                  marginBottom: "4px",
                }}
              >
                {d.arquivo}
              </div>
              <div style={{ fontSize: "11px", color: "#555" }}>
                {new Date(d.extraido_em).toLocaleString("pt-BR")}
                {" · "}
                {d.campos?.nome_razao_social || d.campos?.cpf_cnpj || "—"}
                {" · "}
                <span style={S.badge(d.revisado ? "saved" : "default")}>
                  {d.revisado ? "revisado" : "pendente"}
                </span>
              </div>
            </div>
            <button
              style={{
                background: "none",
                border: "none",
                color: "#444",
                cursor: "pointer",
                fontSize: "16px",
                padding: "0 4px",
              }}
              onClick={() => onDelete(d._id)}
              title="Excluir"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("upload"); // upload | dashboard | history
  const [currentDoc, setCurrentDoc] = useState(null);
  const [progress, setProgress] = useState({ pct: 0, label: "" });
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState(null);
  const [activeNav, setActiveNav] = useState("upload");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Upload & extract ──────────────────────────────
  const handleFile = useCallback(async (file) => {
    setLoading(true);
    setView("upload");

    const steps = [
      { pct: 20, label: "Enviando arquivo..." },
      { pct: 50, label: "Analisando com Groq..." },
      { pct: 80, label: "Extraindo campos..." },
      { pct: 95, label: "Estruturando JSON..." },
    ];

    let stepIdx = 0;
    const iv = setInterval(() => {
      if (stepIdx < steps.length) {
        setProgress(steps[stepIdx]);
        stepIdx++;
      }
    }, 700);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(`${API_BASE}/extract`, {
        method: "POST",
        body: form,
      });

      clearInterval(iv);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Erro desconhecido");
      }

      setProgress({ pct: 100, label: "Concluído!" });
      const doc = await res.json();

      setTimeout(() => {
        setCurrentDoc(doc);
        setView("dashboard");
        setLoading(false);
        setProgress({ pct: 0, label: "" });
      }, 500);
    } catch (err) {
      clearInterval(iv);
      setLoading(false);
      setProgress({ pct: 0, label: "" });
      showToast(err.message, "error");
    }
  }, []);

  // ── Save / update ─────────────────────────────────
  const handleSave = async (id, campos) => {
    try {
      const res = await fetch(`${API_BASE}/documents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campos }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      setCurrentDoc((prev) => ({ ...prev, campos, revisado: true }));
      showToast("Documento salvo com sucesso!", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // ── Load history ──────────────────────────────────
  const loadHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/documents?limit=50`);
      const docs = await res.json();
      setHistory(docs);
      setView("history");
      setActiveNav("history");
    } catch {
      showToast("Não foi possível carregar o histórico", "error");
    }
  };

  // ── Delete ────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Excluir este documento?")) return;
    try {
      await fetch(`${API_BASE}/documents/${id}`, { method: "DELETE" });
      setHistory((prev) => prev.filter((d) => d._id !== id));
      showToast("Documento excluído", "success");
    } catch {
      showToast("Erro ao excluir", "error");
    }
  };

  // ─────────────────────────────────────────────────
  return (
    <div style={S.app}>
      {/* Header */}
      <header style={S.header}>
        <div style={S.logo}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="1" width="10" height="14" rx="2" fill="#0d0d0f" />
            <path d="M12 1l4 4" stroke="#0d0d0f" strokeWidth="1.5" />
            <path d="M12 1v4h4" stroke="#0d0d0f" strokeWidth="1.5" />
            <path
              d="M4 10h8M4 13h6"
              stroke="#0d0d0f"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div>
          <div style={S.headerTitle}>Extrator de Documento</div>
          <div style={S.headerSub}>Groq · MongoDB</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
          <button
            style={{
              ...S.btn(activeNav === "upload" ? "primary" : "ghost"),
              fontSize: "11px",
            }}
            onClick={() => {
              setView("upload");
              setActiveNav("upload");
            }}
          >
            Novo
          </button>
          <button
            style={{
              ...S.btn(activeNav === "history" ? "primary" : "ghost"),
              fontSize: "11px",
            }}
            onClick={loadHistory}
          >
            Histórico
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={S.main}>
        {view === "upload" && (
          <>
            <DropZone onFile={handleFile} loading={loading} />
            {loading && progress.pct > 0 && (
              <ProgressBar pct={progress.pct} label={progress.label} />
            )}
            {!loading && (
              <div
                style={{
                  textAlign: "center",
                  color: "#333",
                  fontSize: "11px",
                  letterSpacing: "0.06em",
                }}
              >
                OS DADOS SÃO PROCESSADOS PELA API DA GROQ E SALVOS NO MONGODB
              </div>
            )}
          </>
        )}

        {view === "dashboard" && currentDoc && (
          <Dashboard
            doc={currentDoc}
            onSave={handleSave}
            onBack={() => {
              setView("upload");
              setActiveNav("upload");
            }}
          />
        )}

        {view === "history" && (
          <History
            docs={history}
            onSelect={(d) => {
              setCurrentDoc(d);
              setView("dashboard");
            }}
            onDelete={handleDelete}
          />
        )}
      </main>

      {/* Toast */}
      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
