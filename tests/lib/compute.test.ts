import { describe, expect, it } from "vitest";

import {
  computeUpcoming,
  enrich,
  normStatus,
  normalizeMoney,
  parseBRL,
  summarize,
} from "../../src/lib/compute";

describe("compute utilities", () => {
  it("parses BRL strings in Brazilian formats", () => {
    expect(parseBRL("R$ 15.000,00")).toBe(15000);
    expect(parseBRL("1.500,50")).toBe(1500.5);
    expect(parseBRL("15000")).toBe(15000);
    expect(parseBRL("abc")).toBeNull();
  });

  it("normalizes money strings without altering free-form text", () => {
    const formatted = normalizeMoney("R$ 15.000,00").replace(/\s/g, " ");
    expect(formatted).toBe("R$ 15.000,00");
    expect(normalizeMoney("1500").replace(/\s/g, " ")).toBe("R$ 1.500,00");
    expect(normalizeMoney("texto livre")).toBe("texto livre");
  });

  it("coalesces legacy status values into the canonical ones", () => {
    expect(normStatus("Pago")).toBe("Pago");
    expect(normStatus("Devolvido")).toBe("Atrasado");
    expect(normStatus("A Confirmar")).toBe("Verificar");
    expect(normStatus("Conclusão")).toBe("Pendente");
  });

  it("enriches an agreement with total, monthly value, and open state", () => {
    const agreement = {
      id: "1",
      devedor: "Ana",
      emitente: "Banco",
      tipo: "Recorrente",
      valorParcela: "R$ 500,00",
      qtd: "Mensal",
      valorTotal: "",
      parcelasPagas: "0",
      valorPago: "0",
      vencimento: "10/12/2026",
      periodo: "Mensal",
      status: "Pendente",
      obs: "",
      anotacao: "",
    };

    const result = enrich(agreement);

    expect(result.status).toBe("Pendente");
    expect(result.finite).toBeNull();
    expect(result.monthly).toBe(500);
    expect(result.open).toBe(true);
  });

  it("summarizes totals by status, type and debtor", () => {
    const entries = [
      enrich({
        id: "1",
        devedor: "Ana",
        emitente: "Banco",
        tipo: "Parcelado",
        valorParcela: "100,00",
        qtd: "3",
        valorTotal: "300,00",
        parcelasPagas: "0",
        valorPago: "0",
        vencimento: "10/12/2026",
        periodo: "Mensal",
        status: "Pendente",
        obs: "",
        anotacao: "",
      }),
      enrich({
        id: "2",
        devedor: "Ana",
        emitente: "Banco",
        tipo: "Parcelado",
        valorParcela: "200,00",
        qtd: "2",
        valorTotal: "400,00",
        parcelasPagas: "0",
        valorPago: "0",
        vencimento: "10/12/2026",
        periodo: "Mensal",
        status: "Pago",
        obs: "",
        anotacao: "",
      }),
      enrich({
        id: "3",
        devedor: "Bia",
        emitente: "Banco",
        tipo: "Recorrente",
        valorParcela: "250,00",
        qtd: "Mensal",
        valorTotal: "",
        parcelasPagas: "0",
        valorPago: "0",
        vencimento: "10/12/2026",
        periodo: "Mensal",
        status: "Pendente",
        obs: "",
        anotacao: "",
      }),
    ];

    const summary = summarize(entries);

    expect(summary.totalReceber).toBe(300);
    expect(summary.totalMensal).toBe(250);
    expect(summary.totalPago).toBe(400);
    expect(summary.nDevedores).toBe(2);
    expect(summary.byDevedor.some((d) => d.name === "Ana" && d.value === 300)).toBe(true);
  });

  it("computes upcoming instalments within the next 30 and 90 days", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const in10Days = new Date(today);
    in10Days.setDate(today.getDate() + 10);
    const in40Days = new Date(today);
    in40Days.setDate(today.getDate() + 40);
    const in100Days = new Date(today);
    in100Days.setDate(today.getDate() + 100);

    const parcelas = [
      {
        devedor: "Ana",
        emitente: "Banco",
        tipo: "Parcelado",
        valor: "150,00",
        data: `${String(in10Days.getDate()).padStart(2, "0")}/${String(in10Days.getMonth() + 1).padStart(2, "0")}/${in10Days.getFullYear()}`,
        status: "Pendente",
      },
      {
        devedor: "Ana",
        emitente: "Banco",
        tipo: "Parcelado",
        valor: "250,00",
        data: `${String(in40Days.getDate()).padStart(2, "0")}/${String(in40Days.getMonth() + 1).padStart(2, "0")}/${in40Days.getFullYear()}`,
        status: "Pendente",
      },
      {
        devedor: "Ana",
        emitente: "Banco",
        tipo: "Parcelado",
        valor: "350,00",
        data: `${String(in100Days.getDate()).padStart(2, "0")}/${String(in100Days.getMonth() + 1).padStart(2, "0")}/${in100Days.getFullYear()}`,
        status: "Pendente",
      },
      {
        devedor: "Ana",
        emitente: "Banco",
        tipo: "Parcelado",
        valor: "999,00",
        data: `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`,
        status: "Pago",
      },
    ];

    const upcoming = computeUpcoming(parcelas);

    expect(upcoming.count30).toBe(1);
    expect(upcoming.count90).toBe(2);
    expect(upcoming.venc30).toBe(150);
    expect(upcoming.venc90).toBe(400);
    expect(upcoming.list.every((item) => item.status !== "Pago")).toBe(true);
  });
});
