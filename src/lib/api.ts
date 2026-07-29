import type { Acordo, AcordoInput, Parcela } from "./types";

/* Cliente HTTP para a API de acordos/parcelas. */

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const msg = await res.json().catch(() => null);
    throw new Error(msg?.error ?? `Erro ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function getAcordos(): Promise<Acordo[]> {
  return fetch("/api/acordos", { cache: "no-store" }).then((r) => handle<Acordo[]>(r));
}

export function getParcelas(): Promise<Parcela[]> {
  return fetch("/api/parcelas", { cache: "no-store" }).then((r) => handle<Parcela[]>(r));
}

export function createAcordo(input: AcordoInput): Promise<Acordo> {
  return fetch("/api/acordos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).then((r) => handle<Acordo>(r));
}

export function updateAcordo(id: string, patch: Partial<AcordoInput>): Promise<Acordo> {
  return fetch(`/api/acordos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  }).then((r) => handle<Acordo>(r));
}

export function deleteAcordo(id: string): Promise<{ ok: true }> {
  return fetch(`/api/acordos/${id}`, { method: "DELETE" }).then((r) => handle<{ ok: true }>(r));
}
