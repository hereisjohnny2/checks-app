import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!;

export function isJwtClockSkewError(error: unknown): boolean {
  return error instanceof Error && /jwt issued at future|issued at future/i.test(error.message);
}

export async function getAuthenticatedUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      if (isJwtClockSkewError(error)) {
        return null;
      }
      return null;
    }

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    if (isJwtClockSkewError(error)) {
      return null;
    }
    return null;
  }
}
