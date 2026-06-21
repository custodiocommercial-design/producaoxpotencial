function formatarMoeda(valor) {
  if (!valor) return <span className="num-vazio">—</span>
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(valor)
}

function formatarNumero(valor) {
  if (!valor) return <span className="num-vazio">0</span>
  return new Intl.NumberFormat('pt-BR').format(valor)
}

// Cores de fundo para cada faixa de potencial, parecido com a planilha original.
// Caso apareça uma faixa não prevista aqui, cai no estilo neutro (sem cor).
const CORES_POTENCIAL = {
  'A. 1 GRAVAME': { fundo: '#FBE5D6', texto: '#7A4A1E' },
  'B. 2-5 GRAVAMES': { fundo: '#F4C56B', texto: '#5A3D00' },
  'C. 6-10 GRAVAMES': { fundo: '#D9D9D9', texto: '#3D3D3D' },
  'D. 11-20 GRAVAMES': { fundo: '#9DC3E6', texto: '#1A3D5C' },
  'E. 21-30 GRAVAMES': { fundo: '#A9D18E', texto: '#274E13' },
  'F. > 30 GRAVAMES': { fundo: '#2E75B6', texto: '#FFFFFF' },
}

function BadgePotencial({ valor }) {
  if (!valor) return <span className="num-vazio">—</span>
  const cor = CORES_POTENCIAL[valor.toUpperCase().trim()]
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: '0.72rem',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        background: cor?.fundo || '#EEE',
        color: cor?.texto || '#444',
      }}
    >
      {valor}
    </span>
  )
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
            <th>DN</th>
            <th>Razão social</th>
            <th>Endereço</th>
            <th>Nº</th>
            <th>Bairro</th>
            <th>CEP</th>
            <th>Zona</th>
            <th>GCM</th>
            <th>Potencial</th>
            <th>Volume Mercado</th>
            <th>Ctos Merc</th>
            <th>{metaMeses.M3 || 'M3'}</th>
            <th>Ctos</th>
            <th>{metaMeses.M2 || 'M2'}</th>
            <th>Ctos</th>
            <th>{metaMeses.M1 || 'M1 (atual)'}</th>
            <th>Ctos</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => (
            <tr key={l.codigo}>
              <td>{l.codigo}</td>
              <td>{l.razao_social}</td>
              <td>{l.endereco}</td>
              <td>{l.numero}</td>
              <td>{l.bairro}</td>
              <td>{l.cep}</td>
              <td>{l.zona}</td>
              <td>{l.gcm}</td>
              <td><BadgePotencial valor={l.potencial_categoria} /></td>
              <td>{formatarMoeda(l.volume_mercado)}</td>
              <td>{formatarNumero(l.ctos_merc)}</td>
              <td>{formatarMoeda(l.producao_m3)}</td>
              <td>{formatarNumero(l.qtd_m3)}</td>
              <td>{formatarMoeda(l.producao_m2)}</td>
              <td>{formatarNumero(l.qtd_m2)}</td>
              <td>{formatarMoeda(l.producao_m1)}</td>
              <td>{formatarNumero(l.qtd_m1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
