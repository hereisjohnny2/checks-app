"use client";

import { useEffect, useRef, useState } from "react";
import type { Acordo, AcordoInput } from "@/lib/types";
import { STATUSES } from "@/lib/compute";

const EMPTY: AcordoInput = {
  devedor: "",
  emitente: "",
  tipo: "Cheque",
  valorParcela: "",
  qtd: "",
  valorTotal: "",
  parcelasPagas: "",
  valorPago: "",
  vencimento: "",
  periodo: "",
  status: "Pendente",
  obs: "",
  anotacao: "",
};

interface Props {
  open: boolean;
  editing: Acordo | null;
  onClose: () => void;
  onSave: (data: AcordoInput) => void;
}

export default function EditModal({ open, editing, onClose, onSave }: Props) {
  const [form, setForm] = useState<AcordoInput>(EMPTY);
  const downOnBackdrop = useRef(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      const { id: _id, ...rest } = editing;
      void _id;
      setForm({ ...EMPTY, ...rest });
    } else {
      setForm(EMPTY);
    }
  }, [open, editing]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const set = (k: keyof AcordoInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    if (!form.devedor.trim()) {
      alert("Informe o nome do devedor.");
      return;
    }
    onSave(form);
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        downOnBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && downOnBackdrop.current) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-head">
          <h3>{editing ? "Editar acordo" : "Novo acordo"}</h3>
          <button className="icon-btn" onClick={onClose} title="Fechar">
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Devedor *</label>
            <input autoFocus type="text" placeholder="Nome do devedor" value={form.devedor} onChange={set("devedor")} />
          </div>
          <div className="field">
            <label>Emitente</label>
            <input type="text" placeholder="Nome no cheque (opcional)" value={form.emitente} onChange={set("emitente")} />
          </div>
          <div className="row2">
            <div className="field">
              <label>Tipo</label>
              <select value={form.tipo} onChange={set("tipo")}>
                <option>Cheque</option>
                <option>Promissória</option>
                <option>Recorrente</option>
              </select>
            </div>
            <div className="field">
              <label>Status</label>
              <select value={form.status} onChange={set("status")}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="row2">
            <div className="field">
              <label>Valor Parcela</label>
              <input type="text" placeholder="R$ 0,00" value={form.valorParcela} onChange={set("valorParcela")} />
            </div>
            <div className="field">
              <label>Qtd Parcelas</label>
              <input type="text" placeholder="ex: 8, Mensal" value={form.qtd} onChange={set("qtd")} />
            </div>
          </div>
          <div className="row2">
            <div className="field">
              <label>Valor Total</label>
              <input type="text" placeholder="R$ 0,00" value={form.valorTotal} onChange={set("valorTotal")} />
            </div>
            <div className="field">
              <label>Parcelas Pagas</label>
              <input type="number" min="0" step="1" placeholder="ex: 3" value={form.parcelasPagas} onChange={set("parcelasPagas")} />
            </div>
          </div>
          <div className="row2">
            <div className="field">
              <label>Valor Pago</label>
              <input type="text" placeholder="R$ 0,00" value={form.valorPago} onChange={set("valorPago")} />
            </div>
            <div className="field">
              <label>Vencimento</label>
              <input type="text" placeholder="ex: Dia 10" value={form.vencimento} onChange={set("vencimento")} />
            </div>
          </div>
          <div className="field">
            <label>Período</label>
            <input type="text" placeholder="ex: jul/2026 a fev/2027" value={form.periodo} onChange={set("periodo")} />
          </div>
          <div className="field">
            <label>Observações</label>
            <textarea rows={3} placeholder="Detalhes do acordo..." value={form.obs} onChange={set("obs")} />
          </div>
          <div className="field">
            <label>Anotação</label>
            <textarea rows={3} placeholder="Anotações sobre os pagamentos..." value={form.anotacao} onChange={set("anotacao")} />
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn primary" onClick={submit}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
