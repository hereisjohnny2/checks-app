'use client'

import DebitosApp from "@/app/debitos/DebitosApp";
import AppShell from "@/components/AppShell";

export default function DebitosPage() {
  return (
    <AppShell moduleName="debitos">
      <DebitosApp />
    </AppShell>
  )
}
