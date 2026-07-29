import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cheques & Promissórias — Painel",
  description: "Painel de acompanhamento de recebíveis (cheques e promissórias).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
