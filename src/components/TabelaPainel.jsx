import FiltroColuna from './FiltroColuna.jsx'

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

// Define as colunas fixas (não-mês) da tabela: rótulo exibido + campo de dados correspondente.
// "congelada" marca quais colunas ficam fixas ao rolar a tabela horizontalmente.
// "truncar" marca quais colunas devem cortar o texto (com "...") em vez de quebrar linha ou expandir.
const COLUNAS_FIXAS = [
  { campo: 'codigo', rotulo: 'DN', congelada: true },
  { campo: 'razao_social', rotulo: 'Razão social', congelada: true, truncar: true },
  { campo: 'endereco', rotulo: 'Endereço', truncar: true },
  { campo: 'numero', rotulo: 'Nº' },
  { campo: 'bairro', rotulo: 'Bairro', truncar: true },
  { campo: 'cep', rotulo: 'CEP' },
  { campo: 'zona', rotulo: 'Zona' },
  { campo: 'gcm', rotulo: 'GCM' },
  { campo: 'potencial_categoria', rotulo: 'Potencial' },
]

// Larguras fixas (em px) usadas para calcular o "left" de cada coluna congelada,
// e aplicadas via style para manter DN e Razão social compactas mesmo truncando.
const LARGURA_DN = 70
const LARGURA_RAZAO_SOCIAL = 200

function estiloCongelado(campo) {
  if (campo === 'codigo') {
    return { position: 'sticky', left: 0, zIndex: 2, width: LARGURA_DN, minWidth: LARGURA_DN, maxWidth: LARGURA_DN }
  }
  if (campo === 'razao_social') {
    return { position: 'sticky', left: LARGURA_DN, zIndex: 2, width: LARGURA_RAZAO_SOCIAL, minWidth: LARGURA_RAZAO_SOCIAL, maxWidth: LARGURA_RAZAO_SOCIAL }
  }
  return undefined
}

export default function TabelaPainel({ linhas, metaMeses, filtrosColuna, definirFiltroColuna }) {
  if (linhas.length === 0) {
    return <div className="vazio-estado">Nenhum dado encontrado. Use os botões de upload acima, ou ajuste os filtros.</div>
  }

  return (
    <div className="tabela-scroll">
      <table className="tabela-dados">
        <thead>
          <tr>
            {COLUNAS_FIXAS.map(({ campo, rotulo, congelada, truncar }) => (
              <th
                key={campo}
                className={`${congelada ? 'celula-congelada' : ''} ${truncar ? 'celula-truncar' : ''}`}
                style={estiloCongelado(campo)}
              >
                <div className="cabecalho-coluna">
                  <span>{rotulo}</span>
                  <FiltroColuna
                    campo={campo}
                    linhas={linhas}
                    valorAtual={filtrosColuna[campo]}
                    onMudar={definirFiltroColuna}
                  />
                </div>
              </th>
            ))}
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
              <td className="celula-congelada" style={estiloCongelado('codigo')}>{l.codigo}</td>
              <td className="celula-congelada celula-truncar" style={estiloCongelado('razao_social')} title={l.razao_social}>{l.razao_social}</td>
              <td className="celula-truncar" title={l.endereco}>{l.endereco}</td>
              <td>{l.numero}</td>
              <td className="celula-truncar" title={l.bairro}>{l.bairro}</td>
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
