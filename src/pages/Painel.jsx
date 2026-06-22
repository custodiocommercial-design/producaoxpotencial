import { useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useDadosPainel } from '../hooks/useDadosPainel.js'
import { useUploads } from '../hooks/useUploads.js'
import Kpis from '../components/Kpis.jsx'
import EsteiraDeMeses from '../components/EsteiraDeMeses.jsx'
import BotaoUpload from '../components/BotaoUpload.jsx'
import TabelaPainel from '../components/TabelaPainel.jsx'

export default function Painel() {
  const { perfil, ehAdmin, sair } = useAuth()
  const { linhasConsolidadas, metaMeses, carregando, recarregar } = useDadosPainel()
  const [mensagem, setMensagem] = useState(null) // { texto, ehErro }
  const [confirmandoNovoMes, setConfirmandoNovoMes] = useState(null) // arquivo aguardando confirmação
  const [filtrosColuna, setFiltrosColuna] = useState({}) // { nomeCampo: valorFiltro }

  function aoConcluirUpload(texto, ehErro = false) {
    setMensagem({ texto, ehErro })
    recarregar()
    setTimeout(() => setMensagem(null), 6000)
  }

  const { processando, uploadPotencial, uploadLojas, uploadProducao, uploadNovoMes } = useUploads({ aoConcluir: aoConcluirUpload })

  function aoEscolherArquivoNovoMes(arquivo) {
    // Pede confirmação antes de rotacionar a esteira; o upload de fato
    // só roda depois que o usuário confirmar no modal.
    setConfirmandoNovoMes(arquivo)
    return Promise.resolve()
  }

  function confirmarNovoMes() {
    const arquivo = confirmandoNovoMes
    setConfirmandoNovoMes(null)
    uploadNovoMes(arquivo)
  }

  function definirFiltroColuna(campo, valor) {
    setFiltrosColuna((atual) => ({ ...atual, [campo]: valor }))
  }

  const linhasFiltradas = useMemo(() => {
    return linhasConsolidadas.filter((linha) =>
      Object.entries(filtrosColuna).every(([campo, valorFiltro]) => {
        if (!valorFiltro) return true
        const valorLinha = String(linha[campo] ?? '').toLowerCase()
        return valorLinha.includes(String(valorFiltro).toLowerCase())
      })
    )
  }, [linhasConsolidadas, filtrosColuna])

  return (
    <div className="app-shell" style={{ flexDirection: 'column' }}>
      <header className="topo">
        <div className="marca">Painel <span className="x">×</span> Produção</div>
        <div className="usuario">
          <span>{perfil?.nome || perfil?.email}</span>
          <span className={`badge-papel ${ehAdmin ? 'admin' : 'visualizador'}`}>
            {ehAdmin ? 'Admin' : 'Visualizador'}
          </span>
          <button className="btn-sair" onClick={sair}>Sair</button>
        </div>
      </header>

      <main className="conteudo">
        {mensagem && (
          <div className={mensagem.ehErro ? 'erro-form' : 'aviso-sucesso'}>{mensagem.texto}</div>
        )}

        <EsteiraDeMeses metaMeses={metaMeses} />

        {carregando ? (
          <div className="status-carregando">Carregando dados…</div>
        ) : (
          <>
            <Kpis linhas={linhasConsolidadas} metaMeses={metaMeses} />

            <div className="bloco">
              <div className="bloco-cabecalho">
                <h2>Bases de dados</h2>
                {ehAdmin && (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <BotaoUpload
                      rotulo="Potencial"
                      processando={processando === 'potencial'}
                      aoSelecionar={uploadPotencial}
                    />
                    <BotaoUpload
                      rotulo="Lojas"
                      processando={processando === 'lojas'}
                      aoSelecionar={uploadLojas}
                    />
                    <BotaoUpload
                      rotulo="Produção M3"
                      processando={processando === 'M3'}
                      aoSelecionar={(arq) => uploadProducao(arq, 'M3')}
                      ultimaAtualizacao={metaMeses.M3}
                    />
                    <BotaoUpload
                      rotulo="Produção M2"
                      processando={processando === 'M2'}
                      aoSelecionar={(arq) => uploadProducao(arq, 'M2')}
                      ultimaAtualizacao={metaMeses.M2}
                    />
                    <BotaoUpload
                      rotulo="Produção M1"
                      processando={processando === 'M1'}
                      aoSelecionar={(arq) => uploadProducao(arq, 'M1')}
                      ultimaAtualizacao={metaMeses.M1}
                    />
                    <BotaoUpload
                      rotulo="Novo mês"
                      processando={processando === 'NOVO_MES'}
                      aoSelecionar={aoEscolherArquivoNovoMes}
                    />
                  </div>
                )}
              </div>

              <TabelaPainel
                linhas={linhasFiltradas}
                metaMeses={metaMeses}
                filtrosColuna={filtrosColuna}
                definirFiltroColuna={definirFiltroColuna}
              />
            </div>
          </>
        )}
      </main>

      {confirmandoNovoMes && (
        <div className="modal-fundo" role="dialog" aria-modal="true">
          <div className="modal-caixa">
            <h3>Avançar a esteira de meses?</h3>
            <p>
              O conteúdo atual de M1 ({metaMeses.M1 || 'sem dados'}) será movido para M2,
              o conteúdo de M2 será movido para M3, e o M3 atual será descartado.
              O arquivo selecionado entra como o novo M1.
            </p>
            <div className="modal-acoes">
              <button className="btn-secundario" onClick={() => setConfirmandoNovoMes(null)}>Cancelar</button>
              <button className="btn-primario" style={{ width: 'auto', padding: '8px 16px' }} onClick={confirmarNovoMes}>
                Confirmar e avançar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
