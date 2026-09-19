"use client";

import { fmt, STATUS_STYLE, type Summary, type Upcoming } from "@/lib/compute";

function chipStyle(status: string) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.Pendente;
  return { background: s.bg, color: s.fg };
}

export default function Dashboard({ summary, upcoming }: { summary: Summary; upcoming: Upcoming }) {
  const maxBar = summary.byDevedor.length ? summary.byDevedor[0].value : 1;

  return (
    <section>
      <div className="kpis">
        <div className="kpi">
          <div className="label">Total a Receber</div>
          <div className="value">{fmt(summary.totalReceber)}</div>
          <div className="sub">valores fixos em aberto</div>
        </div>
        <div className="kpi indigo">
          <div className="label">Recorrente / mês</div>
          <div className="value">{fmt(summary.totalMensal)}</div>
          <div className="sub">juros e mensalidades</div>
        </div>
        <div className="kpi amber">
          <div className="label">A vencer · 30 dias</div>
          <div className="value">{fmt(upcoming.venc30)}</div>
          <div className="sub">{upcoming.count30} parcela(s)</div>
        </div>
        <div className="kpi teal">
          <div className="label">A vencer · 90 dias</div>
          <div className="value">{fmt(upcoming.venc90)}</div>
          <div className="sub">{upcoming.count90} parcela(s)</div>
        </div>
        <div className="kpi green">
          <div className="label">Já Pago</div>
          <div className="value">{fmt(summary.totalPago)}</div>
          <div className="sub">quitados</div>
        </div>
        <div className="kpi gray">
          <div className="label">Encerrado</div>
          <div className="value">{fmt(summary.totalEncerrado)}</div>
          <div className="sub">não cobrar</div>
        </div>
        <div className="kpi">
          <div className="label">Acordos</div>
          <div className="value">{summary.nAcordos}</div>
          <div className="sub">{summary.nDevedores} devedores</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 22 }}>
        <h2>
          Resumo por Status <span className="hint">{summary.nAcordos} acordos · {summary.byStatus.length} status</span>
        </h2>
        <div className="status-chips">
          {[...summary.byStatus]
            .sort((a, b) => b.n - a.n)
            .map((s) => (
              <span className="st-chip" key={s.key}>
                <span className="badge" style={chipStyle(s.key)}>
                  {s.key}
                </span>
                <span className="st-n">{s.n}</span>
              </span>
            ))}
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <h2>Por Status</h2>
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th className="num">Acordos</th>
                <th className="num">Valor (fixo)</th>
                <th className="num">Mensal</th>
              </tr>
            </thead>
            <tbody>
              {summary.byStatus.map((s) => (
                <tr key={s.key}>
                  <td>
                    <span className="badge" style={chipStyle(s.key)}>
                      {s.key}
                    </span>
                  </td>
                  <td className="num">{s.n}</td>
                  <td className="num">{s.fin ? fmt(s.fin) : "—"}</td>
                  <td className="num">{s.men ? fmt(s.men) + "/mês" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2>Por Tipo</h2>
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th className="num">Acordos</th>
                <th className="num">Valor (fixo)</th>
                <th className="num">Mensal</th>
              </tr>
            </thead>
            <tbody>
              {summary.byTipo.map((t) => (
                <tr key={t.key}>
                  <td>
                    <strong>{t.key}</strong>
                  </td>
                  <td className="num">{t.n}</td>
                  <td className="num">{t.fin ? fmt(t.fin) : "—"}</td>
                  <td className="num">{t.men ? fmt(t.men) + "/mês" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 22 }}>
        <h2>
          Total a Receber por Devedor <span className="hint">(valores fixos em aberto)</span>
        </h2>
        <div className="bars">
          {summary.byDevedor.map((d) => (
            <div className="bar-row" key={d.name}>
              <span className="bar-name" title={d.name}>
                {d.name}
              </span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: `${Math.max(3, (d.value / maxBar) * 100)}%` }} />
              </span>
              <span className="bar-val">{fmt(d.value)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>
          Próximos Vencimentos <span className="hint">(cheques/promissórias com data, ainda não pagos)</span>
        </h2>
        <table>
          <thead>
            <tr>
              <th>Vencimento</th>
              <th>Devedor</th>
              <th>Emitente</th>
              <th>Tipo</th>
              <th className="num">Valor</th>
              <th>Faltam</th>
            </tr>
          </thead>
          <tbody>
            {upcoming.list.slice(0, 18).map((p, i) => {
              const style = p.days <= 30 ? STATUS_STYLE.Atrasado : p.days <= 60 ? STATUS_STYLE.Verificar : STATUS_STYLE.Pendente;
              return (
                <tr key={i}>
                  <td>{p.date.toLocaleDateString("pt-BR")}</td>
                  <td>{p.devedor}</td>
                  <td className="muted">{p.emitente || "—"}</td>
                  <td>{p.tipo}</td>
                  <td className="num">{fmt(p.value)}</td>
                  <td>
                    <span className="badge" style={{ background: style.bg, color: style.fg }}>
                      {p.days} dia(s)
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {upcoming.list.length === 0 && <p className="foot-note">Nenhum vencimento futuro cadastrado com data.</p>}
      </div>
    </section>
  );
}
