import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/* =====================================================================
   Cliente Supabase para o BROWSER (auth). Usa a chave pública
   (anon / publishable). Guarda a sessão em cookies para o middleware/SSR.
   Singleton para evitar múltiplas instâncias de GoTrueClient.
   ===================================================================== */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!;

let client: SupabaseClient | undefined;

export function createBrowserSupabase(): SupabaseClient {
  if (!client) client = createBrowserClient(url, anonKey);
  return client;
}
