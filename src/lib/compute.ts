import type { Acordo, Parcela, Status } from "./types";

/* =====================================================================
   Funções puras — compartilhadas por cliente e servidor.
   NÃO importar nada de node aqui (este módulo roda no browser).
   ===================================================================== */

export const STATUSES: Status[] = ["Pendente", "Pago", "Atrasado", "Verificar", "Encerrado"];

/** Status considerados "fechados" (não entram em "a receber"). */
export const CLOSED = new Set<string>(["Pago", "Encerrado"]);

/** Cores de cada status (fundo/texto) para badges e seletores. */
export const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  Pendente: { bg: "#dbeafe", fg: "#1d4ed8" },
  Pago: { bg: "#dcfce7", fg: "#15803d" },
  Atrasado: { bg: "#fee2e2", fg: "#b91c1c" },
  Verificar: { bg: "#ede9fe", fg: "#6d28d9" },
  Encerrado: { bg: "#e2e8f0", fg: "#475569" },
};

/** Consolida qualquer status legado em uma das 5 categorias. */
export function normStatus(s: string): Status {
  switch (s) {
    case "Pago":
      return "Pago";
    case "Atrasado":
    case "Devolvido":
      return "Atrasado";
    case "Conferir":
    case "Atenção":
    case "A Confirmar":
    case "Verificar":
      return "Verificar";
    case "Cancelado":
    case "Encerrado":
      return "Encerrado";
    default:
      return "Pendente";
  }
}

/** "R$ 15.000,00" | "15000" | "1.500,50" -> Number (ou null). */
export function parseBRL(s?: string | null): number | null {
  if (s == null || s === "") return null;
  const str = String(s);
  if (!/\d/.test(str)) return null;
  const m = str.match(/-?\d[\d.]*(?:,\d{1,2})?/);
  if (!m) return null;
  let t = m[0];
  t = t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t.replace(/\./g, "");
  const n = parseFloat(t);
  return isNaN(n) ? null : n;
}

/** Reformata "15000" -> "R$ 15.000,00"; mantém textos livres intactos. */
export function normalizeMoney(s?: string | null): string {
  const str = String(s ?? "").trim();
  if (str === "") return "";
  if (/^R?\$?\s*\d[\d.]*(?:,\d{1,2})?$/.test(str)) {
    const n = parseBRL(str);
    if (n != null) return fmt(n);
  }
  return str;
}

export function fmt(n: number): string {
  return (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function parseQty(s?: string | null): number | null {
  const m = String(s ?? "").match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

export function parseDate(s?: string | null): Date | null {
  const m = String(s ?? "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null;
}

export interface Enriched extends Acordo {
  finite: number | null; // valor fixo total do acordo
  monthly: number | null; // valor mensal (recorrente sem fim)
  open: boolean; // ainda a receber?
}

export function enrich(a: Acordo): Enriched {
  const status = normStatus(a.status);
  const vp = parseBRL(a.valorParcela);
  const vt = parseBRL(a.valorTotal);
  const q = parseQty(a.qtd);
  const isMonthly = /mensal/i.test(a.qtd) || a.tipo === "Recorrente";
  const recurringOpen = isMonthly && vt == null && q == null;

  let finite: number | null = null;
  if (vt != null) finite = vt;
  else if (vp != null && q != null) finite = vp * q;
  else if (vp != null && !recurringOpen) finite = vp;

  return {
    ...a,
    status,
    finite,
    monthly: recurringOpen ? vp : null,
    open: !CLOSED.has(status),
  };
}

/* ---- Agregações do dashboard ---- */

export interface Summary {
  totalReceber: number;
  totalMensal: number;
  totalPago: number;
  totalEncerrado: number;
  nAcordos: number;
  nDevedores: number;
  byStatus: { key: string; n: number; fin: number; men: number }[];
  byTipo: { key: string; n: number; fin: number; men: number }[];
  byDevedor: { name: string; value: number }[];
}

export function summarize(list: Enriched[]): Summary {
  const open = list.filter((a) => a.open);

  const groupBy = (keyFn: (a: Enriched) => string) => {
    const map = new Map<string, { key: string; n: number; fin: number; men: number }>();
    for (const a of list) {
      const key = keyFn(a) || "—";
      const g = map.get(key) ?? { key, n: 0, fin: 0, men: 0 };
      g.n++;
      g.fin += a.finite ?? 0;
      g.men += a.monthly ?? 0;
      map.set(key, g);
    }
    return [...map.values()];
  };

  const byDevMap = new Map<string, number>();
  for (const a of open) byDevMap.set(a.devedor, (byDevMap.get(a.devedor) ?? 0) + (a.finite ?? 0));

  return {
    totalReceber: open.reduce((s, a) => s + (a.finite ?? 0), 0),
    totalMensal: open.reduce((s, a) => s + (a.monthly ?? 0), 0),
    totalPago: list.filter((a) => a.status === "Pago").reduce((s, a) => s + (a.finite ?? 0), 0),
    totalEncerrado: list.filter((a) => a.status === "Encerrado").reduce((s, a) => s + (a.finite ?? 0), 0),
    nAcordos: list.length,
    nDevedores: new Set(list.map((a) => a.devedor)).size,
    byStatus: groupBy((a) => a.status).sort((a, b) => b.fin - a.fin),
    byTipo: groupBy((a) => a.tipo).sort((a, b) => b.fin - a.fin),
    byDevedor: [...byDevMap.entries()]
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value),
  };
}

export interface UpcomingItem extends Parcela {
  date: Date;
  value: number;
  days: number;
}

export interface Upcoming {
  list: UpcomingItem[];
  venc30: number;
  venc90: number;
  count30: number;
  count90: number;
}

export function computeUpcoming(parcelas: Parcela[]): Upcoming {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const in30 = new Date(hoje);
  in30.setDate(in30.getDate() + 30);
  const in90 = new Date(hoje);
  in90.setDate(in90.getDate() + 90);

  const futuras = parcelas
    .map((p) => {
      const date = parseDate(p.data);
      return date ? { ...p, date, value: parseBRL(p.valor) ?? 0, days: Math.round((date.getTime() - hoje.getTime()) / 86400000) } : null;
    })
    .filter((p): p is UpcomingItem => p !== null && p.status !== "Pago" && p.date >= hoje)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return {
    list: futuras,
    venc30: futuras.filter((p) => p.date <= in30).reduce((s, p) => s + p.value, 0),
    venc90: futuras.filter((p) => p.date <= in90).reduce((s, p) => s + p.value, 0),
    count30: futuras.filter((p) => p.date <= in30).length,
    count90: futuras.filter((p) => p.date <= in90).length,
  };
}
