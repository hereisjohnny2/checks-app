"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Acordo, AcordoInput, Parcela } from "@/lib/types";
import { computeUpcoming, enrich, normalizeMoney, summarize, type Enriched } from "@/lib/compute";
import * as api from "@/lib/api";
import Dashboard from "./Dashboard";
import DevedorList from "./DevedorList";
import EditModal from "./EditModal";
import { readModuleState } from "@/lib/modules";
import AppHeader from "./AppHeader";

type Tab = "dashboard" | "devedor";

export default function AppShell() {
  const [acordos, setAcordos] = useState<Acordo[]>([]);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gerado, setGerado] = useState("");
  const [moduleEnabled, setModuleEnabled] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Acordo | null>(null);

  const reload = useCallback(async () => {
    const [a, p] = await Promise.all([api.getAcordos(), api.getParcelas()]);
    setAcordos(a);
    setParcelas(p);
  }, []);

  useEffect(() => {
    setGerado(new Date().toLocaleDateString("pt-BR"));
    reload()
      .catch((e) => setError(e instanceof Error ? e.message : "Falha ao carregar os dados."))
      .finally(() => setLoading(false));
  }, [reload]);

  useEffect(() => {
    setModuleEnabled(readModuleState().debitos);
  }, []);

  const enriched: Enriched[] = useMemo(() => acordos.map(enrich), [acordos]);
  const summary = useMemo(() => summarize(enriched), [enriched]);
  const upcoming = useMemo(() => computeUpcoming(parcelas), [parcelas]);

  /* ---- CRUD ---- */
  const handleSave = async (data: AcordoInput) => {
    const payload: AcordoInput = {
      ...data,
      valorParcela: normalizeMoney(data.valorParcela),
      valorTotal: normalizeMoney(data.valorTotal),
      valorPago: normalizeMoney(data.valorPago),
    };
    try {
      if (editing) {
        const updated = await api.updateAcordo(editing.id, payload);
        setAcordos((list) => list.map((a) => (a.id === updated.id ? updated : a)));
      } else {
        const created = await api.createAcordo(payload);
        setAcordos((list) => [...list, created]);
      }
      setModalOpen(false);
      setEditing(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao salvar.");
    }
  };

  const handleDelete = async (a: Enriched) => {
    if (!confirm(`Excluir o acordo de "${a.devedor}" (${a.valorParcela || "sem valor"})?`)) return;
    try {
      await api.deleteAcordo(a.id);
      setAcordos((list) => list.filter((x) => x.id !== a.id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao excluir.");
    }
  };

  const handleStatus = async (a: Enriched, status: string) => {
    const prev = acordos;
    setAcordos((list) => list.map((x) => (x.id === a.id ? { ...x, status } : x))); // otimista
    try {
      await api.updateAcordo(a.id, { status });
    } catch (e) {
      setAcordos(prev); // reverte
      alert(e instanceof Error ? e.message : "Erro ao mudar status.");
    }
  };

  const handleFieldChange = async (a: Enriched, field: keyof AcordoInput, value: string) => {
    if (value === a[field]) return;
    const normalized = field === "valorPago" ? normalizeMoney(value) : value;
    const prev = acordos;
    setAcordos((list) => list.map((x) => (x.id === a.id ? { ...x, [field]: normalized } : x)));
    try {
      await api.updateAcordo(a.id, { [field]: normalized });
    } catch (e) {
      setAcordos(prev);
      alert(e instanceof Error ? e.message : "Erro ao atualizar a parcela.");
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(acordos, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cheques-acordos.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (a: Enriched) => {
    const { finite: _f, monthly: _m, open: _o, ...raw } = a;
    void _f;
    void _m;
    void _o;
    setEditing(raw);
    setModalOpen(true);
  };

  if (!moduleEnabled) {
    return (
      <>
        <AppHeader title="Duo Painel Admin" subtitle="Módulo de débitos desativado." />
        <main>
          <p className="status-msg">Este módulo está desativado. Ative-o nas configurações para acessar os débitos.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Duo Painel Admin" subtitle={`Módulo de débitos · dados via API ${gerado && `· gerado em ${gerado}`}`} />

      <nav className="tabs">
        <button className={`tab-btn${tab === "dashboard" ? " active" : ""}`} onClick={() => setTab("dashboard")}>
          Dashboard
        </button>
        <button className={`tab-btn${tab === "devedor" ? " active" : ""}`} onClick={() => setTab("devedor")}>
          Por Devedor
        </button>
      </nav>

      <main>
        {loading && <p className="status-msg">Carregando dados da API…</p>}
        {error && <p className="status-msg error">Erro: {error}</p>}

        {!loading && !error && (
          <>
            {tab === "dashboard" && <Dashboard summary={summary} upcoming={upcoming} />}
            {tab === "devedor" && (
              <DevedorList
                items={enriched}
                search={search}
                onSearchChange={setSearch}
                onAdd={openNew}
                onExport={handleExport}
                onEdit={openEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatus}
                onFieldChange={handleFieldChange}
              />
            )}
          </>
        )}
      </main>

      <EditModal
        open={modalOpen}
        editing={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />
    </>
  );
}
