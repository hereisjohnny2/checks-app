import { NextResponse } from "next/server";
import { listParcelas } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/parcelas -> lista as parcelas datadas (próximos vencimentos)
export async function GET() {
  try {
    return NextResponse.json(await listParcelas());
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erro inesperado." }, { status: 500 });
  }
}
