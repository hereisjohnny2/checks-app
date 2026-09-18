export type Status = "Pendente" | "Pago" | "Atrasado" | "Verificar" | "Encerrado";

export interface Acordo {
  id: string;
  devedor: string;
  emitente: string;
  tipo: string;
  valorParcela: string;
  qtd: string;
  valorTotal: string;
  parcelasPagas: string;
  valorPago: string;
  vencimento: string;
  periodo: string;
  status: string;
  obs: string;
  anotacao: string;
}

/** Dados enviados pelo cliente ao criar/editar (sem o id). */
export type AcordoInput = Omit<Acordo, "id">;

export interface Parcela {
  devedor: string;
  emitente: string;
  tipo: string;
  valor: string;
  data: string; // dd/mm/yyyy
  status: string;
}

export interface Database {
  acordos: Acordo[];
  parcelas: Parcela[];
}
