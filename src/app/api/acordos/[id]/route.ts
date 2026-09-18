import { NextResponse } from "next/server";
import { updateAcordo, deleteAcordo, pickAcordoPatch } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const errMsg = (e: unknown) => (e instanceof Error ? e.message : "Erro inesperado.");

// PUT /api/acordos/:id -> atualiza (parcial ou total) um acordo
export async function PUT(request: Request, { params }: Params) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const patch = pickAcordoPatch(body);
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nenhum campo para atualizar." }, { status: 400 });
  }

  try {
    const updated = await updateAcordo(id, patch);
    if (!updated) {
      return NextResponse.json({ error: "Acordo não encontrado." }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: errMsg(e) }, { status: 500 });
  }
}

// DELETE /api/acordos/:id -> remove um acordo
export async function DELETE(_request: Request, { params }: Params) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id } = await params;
  try {
    const ok = await deleteAcordo(id);
    if (!ok) {
      return NextResponse.json({ error: "Acordo não encontrado." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: errMsg(e) }, { status: 500 });
  }
}
