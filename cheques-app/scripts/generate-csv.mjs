// =====================================================================
// Gera 2 CSVs (um por tabela) a partir de data/db.json, prontos para
// o "Import data via CSV" do Supabase.
// Uso:  node scripts/generate-csv.mjs
// Saída: supabase/csv/acordos.csv  e  supabase/csv/parcelas.csv
//
// Observações:
//  - Cabeçalho usa os nomes das COLUNAS do Postgres (snake_case).
//  - NÃO inclui 'id' nem 'created_at' (o banco preenche pelos defaults).
//  - Todos os valores são entre aspas -> células vazias viram "" (string
//    vazia), evitando erro de NOT NULL nas colunas de texto.
// =====================================================================
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const db = JSON.parse(readFileSync(path.join(root, "data", "db.json"), "utf-8"));

// coluna (Postgres)  <->  chave (JSON)
const ACORDO = [
  ["devedor", "devedor"],
  ["emitente", "emitente"],
  ["tipo", "tipo"],
  ["valor_parcela", "valorParcela"],
  ["qtd", "qtd"],
  ["valor_total", "valorTotal"],
  ["vencimento", "vencimento"],
  ["periodo", "periodo"],
  ["status", "status"],
  ["obs", "obs"],
];
const PARCELA = [
  ["devedor", "devedor"],
  ["emitente", "emitente"],
  ["tipo", "tipo"],
  ["valor", "valor"],
  ["data", "data"],
  ["status", "status"],
];

const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

function toCsv(rows, cols) {
  const header = cols.map(([c]) => c).join(",");
  const body = rows.map((r) => cols.map(([, key]) => cell(r[key])).join(",")).join("\n");
  return header + "\n" + body + "\n";
}

const outDir = path.join(root, "supabase", "csv");
mkdirSync(outDir, { recursive: true });

writeFileSync(path.join(outDir, "acordos.csv"), toCsv(db.acordos, ACORDO), "utf-8");
writeFileSync(path.join(outDir, "parcelas.csv"), toCsv(db.parcelas, PARCELA), "utf-8");

console.log(`OK: acordos.csv (${db.acordos.length} linhas) e parcelas.csv (${db.parcelas.length} linhas) em supabase/csv/`);
