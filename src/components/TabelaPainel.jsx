function formatarMoeda(valor) {
  if (!valor) return <span className="num-vazio">—</span>
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(valor)
}

export default function TabelaPainel({ linhas, metaMeses }) {
  if (linhas.length === 0) {
    return <div className="vazio-estado">Nenhum dado carregado ainda. Use os botões de upload acima para começar.</div>
  }

  return (
    <div className="tabela-scroll">
      <table className="tabela-dados">
        <thead>
          <tr>
            <th>Código</th>
            <th>Razão social</th>
            <th>GCM</th>
            <th>Zona</th>
            <th>Bairro</th>
            <th>Potencial</th>
            <th>Mercado</th>
            <th>{metaMeses.M3 || 'M3'}</th>
            <th>{metaMeses.M2 || 'M2'}</th>
            <th>{metaMeses.M1 || 'M1 (atual)'}</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => (
            <tr key={l.codigo}>
              <td>{l.codigo}</td>
              <td>{l.razao_social}</td>
              <td>{l.gcm}</td>
              <td>{l.zona}</td>
              <td>{l.bairro}</td>
              <td>{formatarMoeda(l.potencial)}</td>
              <td>{formatarMoeda(l.mercado)}</td>
              <td>{formatarMoeda(l.producao_m3)}</td>
              <td>{formatarMoeda(l.producao_m2)}</td>
              <td>{formatarMoeda(l.producao_m1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
