import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import EditModal from "@/components/debitos/EditModal";

const baseAgreement = {
  id: "abc-1",
  devedor: "Maria Silva",
  emitente: "Banco do Brasil",
  tipo: "Cheque",
  valorParcela: "R$ 1500,00",
  qtd: "3",
  valorTotal: "R$ 4500,00",
  parcelasPagas: "1",
  valorPago: "R$ 1500,00",
  vencimento: "10",
  periodo: "jan/2026",
  status: "Pendente",
  obs: "Observação antiga",
  anotacao: "Anotação antiga",
};

describe("EditModal", () => {
  beforeEach(() => {
    vi.spyOn(window, "alert").mockImplementation(() => undefined);
  });

  it("renders the editing form with existing values and saves the submitted form", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(<EditModal open editing={baseAgreement} onClose={onClose} onSave={onSave} />);

    expect(screen.getByText("Editar acordo")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Maria Silva")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Banco do Brasil")).toBeInTheDocument();

    const devedorInput = screen.getByPlaceholderText("Nome do devedor");

    await user.clear(devedorInput);
    await user.type(devedorInput, "Maria Souza");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave.mock.calls[0][0]).toMatchObject({
      devedor: "Maria Souza",
      emitente: "Banco do Brasil",
      status: "Pendente",
    });
  });

  it("blocks saving when the devedor is blank and closes when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onClose = vi.fn();

    const { container } = render(<EditModal open editing={null} onClose={onClose} onSave={onSave} />);

    const input = screen.getByPlaceholderText("Nome do devedor");
    await user.clear(input);
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(onSave).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith("Informe o nome do devedor.");

    const overlay = container.querySelector(".modal-overlay");
    expect(overlay).not.toBeNull();

    fireEvent.mouseDown(overlay!, { target: overlay! });
    fireEvent.click(overlay!, { target: overlay! });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders a new agreement form and closes on Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSave = vi.fn();

    render(<EditModal open editing={null} onClose={onClose} onSave={onSave} />);

    expect(screen.getByText("Novo acordo")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
