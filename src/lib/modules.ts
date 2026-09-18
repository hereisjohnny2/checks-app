export type ModuleId = "debitos";

export interface AppModule {
  id: ModuleId;
  slug: string;
  label: string;
  description: string;
  enabledByDefault: boolean;
}

export const APP_MODULES: AppModule[] = [
  {
    id: "debitos",
    slug: "debitos",
    label: "Débitos",
    description: "Acompanhe acordos, parcelas, pagamentos e recebíveis.",
    enabledByDefault: true,
  },
];

export const MODULES_STORAGE_KEY = "checks-app-modules";

export function readModuleState(): Record<ModuleId, boolean> {
  const defaults = Object.fromEntries(APP_MODULES.map((module) => [module.id, module.enabledByDefault])) as Record<ModuleId, boolean>;
  if (typeof window === "undefined") return defaults;

  try {
    const stored = JSON.parse(window.localStorage.getItem(MODULES_STORAGE_KEY) ?? "{}") as Record<string, unknown>;
    for (const module of APP_MODULES) {
      const value = stored[module.id];
      if (typeof value === "boolean") defaults[module.id] = value;
    }
  } catch {
    // Prefer the defaults when local storage contains invalid data.
  }
  return defaults;
}

export function saveModuleState(state: Record<ModuleId, boolean>) {
  window.localStorage.setItem(MODULES_STORAGE_KEY, JSON.stringify(state));
}
