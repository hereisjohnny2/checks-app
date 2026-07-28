import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* =====================================================================
   Cliente Supabase para uso NO SERVIDOR (route handlers).
   Usa a SERVICE ROLE KEY — nunca exponha essa chave ao browser
   (não prefixe com NEXT_PUBLIC_). Ela ignora o RLS.
   ===================================================================== */

let cached: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Chave SECRETA (server-only). Aceita o nome clássico e o novo do Supabase.
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase não configurado. Em cheques-app/.env.local defina a URL (SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_URL) e a CHAVE SECRETA (SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_SECRET_KEY). Use a chave secreta/service_role — a publishable/anon não funciona porque o RLS está ativo."
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
