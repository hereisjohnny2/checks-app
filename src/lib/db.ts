import { getServerSupabase } from "./supabase";
import type { Acordo, AcordoInput, Parcela } from "./types";

/* =====================================================================
   Camada de dados — Supabase (PostgreSQL).
   Mapeia colunas snake_case do Postgres <-> campos camelCase do app.
   Só pode ser importado no servidor (route handlers).
   ===================================================================== */

const FIELDS: (keyof AcordoInput)[] = [
  "devedor",
  "emitente",
  "tipo",
  "valorParcela",
  "qtd",
  "valorTotal",
  "parcelasPagas",
  "valorPago",
  "vencimento",
  "periodo",
  "status",
  "obs",
  "anotacao",
];

/** Campo camelCase (app) -> coluna snake_case (Postgres). */
const COL: Record<keyof AcordoInput, string> = {
  devedor: "devedor",
  emitente: "emitente",
  tipo: "tipo",
  valorParcela: "valor_parcela",
  qtd: "qtd",
  valorTotal: "valor_total",
  parcelasPagas: "parcelas_pagas",
  valorPago: "valor_pago",
  vencimento: "vencimento",
  periodo: "periodo",
  status: "status",
  obs: "obs",
  anotacao: "anotacao",
};

const ACORDO_SELECT = "id, devedor, emitente, tipo, valor_parcela, qtd, valor_total, parcelas_pagas, valor_pago, vencimento, periodo, status, obs, anotacao";

interface AcordoRow {
  id: string;
  devedor: string;
  emitente: string;
  tipo: string;
  valor_parcela: string;
  qtd: string;
  valor_total: string;
  parcelas_pagas: string;
  valor_pago: string;
  vencimento: string;
  periodo: string;
  status: string;
  obs: string;
  anotacao: string;
}

function rowToAcordo(r: AcordoRow): Acordo {
  return {
    id: r.id,
    devedor: r.devedor,
    emitente: r.emitente,
    tipo: r.tipo,
    valorParcela: r.valor_parcela,
    qtd: r.qtd,
    valorTotal: r.valor_total,
    parcelasPagas: r.parcelas_pagas,
    valorPago: r.valor_pago,
    vencimento: r.vencimento,
    periodo: r.periodo,
    status: r.status,
    obs: r.obs,
    anotacao: r.anotacao,
  };
}

/** Converte um patch camelCase em colunas snake_case (apenas campos presentes). */
function patchToRow(patch: Partial<AcordoInput>): Record<string, string> {
  const row: Record<string, string> = {};
  for (const key of FIELDS) {
    if (patch[key] !== undefined) row[COL[key]] = String(patch[key]);
  }
  return row;
}

/** Normaliza o corpo em um AcordoInput completo (todos os campos como string). */
export function sanitizeAcordo(body: unknown): AcordoInput {
  const src = (body ?? {}) as Record<string, unknown>;
  const out = {} as AcordoInput;
  for (const key of FIELDS) out[key] = src[key] == null ? "" : String(src[key]);
  return out;
}

/** Extrai apenas os campos presentes no corpo (para updates parciais). */
export function pickAcordoPatch(body: unknown): Partial<AcordoInput> {
  const src = (body ?? {}) as Record<string, unknown>;
  const out: Partial<AcordoInput> = {};
  for (const key of FIELDS) if (src[key] !== undefined) out[key] = String(src[key]);
  return out;
}

/* ---- Operações ---- */

export async function listAcordos(): Promise<Acordo[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase.from("acordos").select(ACORDO_SELECT).order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as AcordoRow[]).map(rowToAcordo);
}

export async function insertAcordo(input: AcordoInput): Promise<Acordo> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase.from("acordos").insert(patchToRow(input)).select(ACORDO_SELECT).single();
  if (error) throw new Error(error.message);
  return rowToAcordo(data as unknown as AcordoRow);
}

export async function updateAcordo(id: string, patch: Partial<AcordoInput>): Promise<Acordo | null> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase.from("acordos").update(patchToRow(patch)).eq("id", id).select(ACORDO_SELECT).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? rowToAcordo(data as unknown as AcordoRow) : null;
}

export async function deleteAcordo(id: string): Promise<boolean> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase.from("acordos").delete().eq("id", id).select("id").maybeSingle();
  if (error) throw new Error(error.message);
  return data != null;
}

export async function listParcelas(): Promise<Parcela[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase.from("parcelas").select("devedor, emitente, tipo, valor, data, status").order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Parcela[];
}
