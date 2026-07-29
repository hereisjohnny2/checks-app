-- =====================================================================
-- Migration: schema inicial (acordos + parcelas)
-- Banco: PostgreSQL (Supabase)
-- gen_random_uuid() é nativo no PostgreSQL 13+ (Supabase usa 15+).
-- Se estiver em PG < 13, rode antes: create extension if not exists pgcrypto;
-- =====================================================================

create table if not exists public.acordos (
  id            uuid primary key default gen_random_uuid(),
  devedor       text not null,
  emitente      text not null default '',
  tipo          text not null default 'Cheque',
  valor_parcela text not null default '',
  qtd           text not null default '',
  valor_total   text not null default '',
  vencimento    text not null default '',
  periodo       text not null default '',
  status        text not null default 'Pendente'
                  check (status in ('Pendente', 'Pago', 'Atrasado', 'Verificar', 'Encerrado')),
  obs           text not null default '',
  created_at    timestamptz not null default now()
);

create table if not exists public.parcelas (
  id         uuid primary key default gen_random_uuid(),
  devedor    text not null,
  emitente   text not null default '',
  tipo       text not null default 'Cheque',
  valor      text not null default '',
  data       text not null default '',   -- dd/mm/yyyy (texto, para casar com o app)
  status     text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists acordos_devedor_idx on public.acordos (devedor);
create index if not exists parcelas_devedor_idx on public.parcelas (devedor);

-- RLS habilitado (boa prática). O app acessa via SERVICE ROLE no servidor,
-- que ignora RLS. Assim, sem políticas públicas, a chave anônima não lê nada.
alter table public.acordos  enable row level security;
alter table public.parcelas enable row level security;
