-- Campos de acompanhamento do pagamento das parcelas de cada acordo.
alter table public.acordos
  add column if not exists parcelas_pagas text not null default '',
  add column if not exists valor_pago text not null default '',
  add column if not exists anotacao text not null default '';