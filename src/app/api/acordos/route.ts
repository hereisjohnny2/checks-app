import { NextResponse } from "next/server";
import { listAcordos, insertAcordo, sanitizeAcordo } from "@/lib/db";

export const dynamic = "force-dynamic";

const errMsg = (e: unknown) => (e instanceof Error ? e.message : "Erro inesperado.");

// GET /api/acordos  -> lista todos os acordos
export async function GET() {
  try {
    return NextResponse.json(await listAcordos());
  } catch (e) {
    return NextResponse.json({ error: errMsg(e) }, { status: 500 });
  }
}

// POST /api/acordos -> cria um novo acordo
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const data = sanitizeAcordo(body);
  if (!data.devedor.trim()) {
    return NextResponse.json({ error: "O campo 'devedor' é obrigatório." }, { status: 400 });
  }

  try {
    const novo = await insertAcordo(data);
    return NextResponse.json(novo, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: errMsg(e) }, { status: 500 });
  }
}
