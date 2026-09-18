"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase-browser";

interface Props {
  title: string;
  subtitle: string;
}

export default function AppHeader({ title, subtitle }: Props) {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    setDarkMode(window.localStorage.getItem("checks-app-theme") === "dark");
    createBrowserSupabase()
      .auth.getUser()
      .then(({ data }) => setUserEmail(data.user?.email ?? null));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    window.localStorage.setItem("checks-app-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const signOut = async () => {
    await createBrowserSupabase().auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  return (
    <header className="top">
      <div className="top-inner">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="top-actions">
          {userEmail && <span className="top-user">{userEmail}</span>}
          <button className="btn on-dark theme-toggle" onClick={() => setDarkMode((value) => !value)}>
            {darkMode ? "Modo claro" : "Modo escuro"}
          </button>
          <Link className="btn on-dark" href="/configuracoes">
            Configurações
          </Link>
          <button className="btn on-dark" onClick={signOut}>
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
