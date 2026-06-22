import TabelaPainel from '../components/TabelaPainel.jsx'

export default function PaginaPainel({ linhas, metaMeses, filtrosColuna, definirFiltroColuna }) {
  return (
    <div className="bloco bloco-tabela-principal">
      <TabelaPainel
        linhas={linhas}
        metaMeses={metaMeses}
        filtrosColuna={filtrosColuna}
        definirFiltroColuna={definirFiltroColuna}
      />
    </div>
  )
}
