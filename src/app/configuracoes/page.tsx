"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { APP_MODULES, readModuleState, saveModuleState, type ModuleId } from "@/lib/modules";
import AppHeader from "@/components/AppHeader";

export default function ConfiguracoesPage() {
  const [modules, setModules] = useState<Record<ModuleId, boolean>>(() => readModuleState());

  const toggleModule = (id: ModuleId) => {
    setModules((current) => {
      const next = { ...current, [id]: !current[id] };
      saveModuleState(next);
      return next;
    });
  };

  return (
    <>
      <AppHeader title="Duo Painel Admin" subtitle="Organize os módulos disponíveis no seu painel." />

      <main className="settings-main">
        <div className="settings-heading">
          <div>
            <h2>Módulos</h2>
            <p>Ative somente as áreas que deseja usar agora.</p>
          </div>
          <span className="settings-count">{APP_MODULES.length} módulo disponível</span>
        </div>

        <section className="module-grid" aria-label="Módulos da aplicação">
          {APP_MODULES.map((module) => (
            <article className={`module-card${modules[module.id] ? " enabled" : " disabled"}`} key={module.id}>
              <div className="module-card-icon">{module.label.charAt(0)}</div>
              <div className="module-card-content">
                <div className="module-card-title-row">
                  <h3>{module.label}</h3>
                  <span className="module-status">{modules[module.id] ? "Ativo" : "Inativo"}</span>
                </div>
                <p>{module.description}</p>
                <Link className="module-route" href={`/${module.slug}`}>
                  /{module.slug}
                </Link>
              </div>
              <button
                className={`module-toggle${modules[module.id] ? " active" : ""}`}
                type="button"
                role="switch"
                aria-checked={modules[module.id]}
                aria-label={`${modules[module.id] ? "Desativar" : "Ativar"} módulo ${module.label}`}
                onClick={() => toggleModule(module.id)}
              >
                <span />
              </button>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
