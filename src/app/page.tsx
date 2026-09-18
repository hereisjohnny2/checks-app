"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { APP_MODULES, readModuleState, type ModuleId } from "@/lib/modules";
import AppHeader from "@/components/AppHeader";

export default function Home() {
  const [modules, setModules] = useState<Record<ModuleId, boolean>>(() => readModuleState());

  useEffect(() => {
    setModules(readModuleState());
  }, []);

  return (
    <>
      <AppHeader title="Duo Painel Admin" subtitle="Escolha uma área para começar." />

      <main className="home-main">
        <div className="settings-heading">
          <div>
            <h2>Módulos disponíveis</h2>
            <p>Acesse os módulos ativos ou gerencie sua disponibilidade.</p>
          </div>
          <span className="settings-count">{APP_MODULES.filter((module) => modules[module.id]).length} ativo(s)</span>
        </div>

        <section className="module-grid" aria-label="Módulos disponíveis">
          {APP_MODULES.map((module) => {
            const enabled = modules[module.id];
            return (
              <article className={`module-card home-module-card${enabled ? " enabled" : " disabled"}`} key={module.id}>
                <div className="module-card-icon">{module.label.charAt(0)}</div>
                <div className="module-card-content">
                  <div className="module-card-title-row">
                    <h3>{module.label}</h3>
                    <span className="module-status">{enabled ? "Ativo" : "Inativo"}</span>
                  </div>
                  <p>{module.description}</p>
                  {enabled ? (
                    <Link className="btn primary home-module-link" href={`/${module.slug}`}>
                      Abrir módulo
                    </Link>
                  ) : (
                    <span className="module-unavailable">Ative em Configurações</span>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </>
  );
}
