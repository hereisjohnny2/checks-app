// =====================================================================
// Gera um migration SQL de seed a partir de data/db.json.
// Uso:  node scripts/generate-seed-sql.mjs
// Saída: supabase/migrations/20260728120100_seed.sql (idempotente)
// =====================================================================
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const db = JSON.parse(readFileSync(path.join(root, "data", "db.json"), "utf-8"));

// Literal SQL com escape de aspas simples.
const q = (v) => `'${String(v ?? "").replace(/'/g, "''")}'`;

// Colunas da tabela  <->  chaves do JSON
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

const rows = (list, cols) => list.map((item) => `    (${cols.map(([, key]) => q(item[key])).join(", ")})`).join(",\n");

const acordoCols = ACORDO.map(([c]) => c).join(", ");
const parcelaCols = PARCELA.map(([c]) => c).join(", ");

const sql = `-- =====================================================================
-- Migration: seed de dados (GERADO AUTOMATICAMENTE a partir de data/db.json)
-- Regenerar com:  npm run db:seed-sql
-- Idempotente: só insere se a tabela estiver vazia.
-- =====================================================================

do $$
begin
  if (select count(*) from public.acordos) = 0 then
    insert into public.acordos (${acordoCols}) values
${rows(db.acordos, ACORDO)};
  end if;

  if (select count(*) from public.parcelas) = 0 then
    insert into public.parcelas (${parcelaCols}) values
${rows(db.parcelas, PARCELA)};
  end if;
end $$;
`;

const outDir = path.join(root, "supabase", "migrations");
mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "20260728120100_seed.sql");
writeFileSync(outFile, sql, "utf-8");

console.log(`OK: ${db.acordos.length} acordos + ${db.parcelas.length} parcelas -> ${path.relative(root, outFile)}`);
