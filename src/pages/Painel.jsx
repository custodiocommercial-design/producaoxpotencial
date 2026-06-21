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
  const [filtroGcm, setFiltroGcm] = useState('')
  const [mensagem, setMensagem] = useState(null) // { texto, ehErro }
  const [modalRotacao, setModalRotacao] = useState(null) // { arquivo } quando aguardando confirmação
  const [rotuloNovoM1, setRotuloNovoM1] = useState('')

  function aoConcluirUpload(texto, ehErro = false) {
    setMensagem({ texto, ehErro })
    recarregar()
    setTimeout(() => setMensagem(null), 6000)
  }

  const { processando, uploadPotencial, uploadLojas, uploadProducao } = useUploads({ aoConcluir: aoConcluirUpload })

  const listaGcm = useMemo(() => {
    const conjunto = new Set(linhasConsolidadas.map((l) => l.gcm).filter(Boolean))
    return Array.from(conjunto).sort()
  }, [linhasConsolidadas])

  const linhasFiltradas = useMemo(() => {
    if (!filtroGcm) return linhasConsolidadas
    return linhasConsolidadas.filter((l) => l.gcm === filtroGcm)
  }, [linhasConsolidadas, filtroGcm])

  function aoSelecionarArquivoM1(arquivo) {
    // Pede o rótulo do mês e confirma a rotação antes de processar.
    // Resolve a Promise imediatamente — o upload de fato só roda
    // depois da confirmação no modal (confirmarRotacaoEEnviar).
    setModalRotacao({ arquivo })
    return Promise.resolve()
  }

  function confirmarRotacaoEEnviar() {
    const arquivo = modalRotacao.arquivo
    setModalRotacao(null)
    const rotulo = rotuloNovoM1.trim() || null
    uploadProducao(arquivo, 'M1', rotulo)
    setRotuloNovoM1('')
  }

  function cancelarRotacao() {
    setModalRotacao(null)
    setRotuloNovoM1('')
  }

  return (
    <div className="app-shell" style={{ flexDirection: 'column' }}>
      <header className="topo">
        <div className="marca">Painel <span className="x">×</span> Produção</div>
        <div className="usuario">
          <span>{perfil?.email}</span>
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
                      aoSelecionar={(arq) => uploadProducao(arq, 'M3', null)}
                      ultimaAtualizacao={metaMeses.M3}
                    />
                    <BotaoUpload
                      rotulo="Produção M2"
                      processando={processando === 'M2'}
                      aoSelecionar={(arq) => uploadProducao(arq, 'M2', null)}
                      ultimaAtualizacao={metaMeses.M2}
                    />
                    <BotaoUpload
                      rotulo="Produção M1 (atual)"
                      processando={processando === 'M1'}
                      aoSelecionar={aoSelecionarArquivoM1}
                      ultimaAtualizacao={metaMeses.M1}
                    />
                  </div>
                )}
              </div>

              <div className="filtro-barra">
                <select value={filtroGcm} onChange={(e) => setFiltroGcm(e.target.value)}>
                  <option value="">Todos os GCM</option>
                  {listaGcm.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <TabelaPainel linhas={linhasFiltradas} metaMeses={metaMeses} />
            </div>
          </>
        )}
      </main>

      {modalRotacao && (
        <div className="modal-fundo" role="dialog" aria-modal="true">
          <div className="modal-caixa">
            <h3>Avançar a esteira de meses?</h3>
            <p>
              O conteúdo atual de M1 ({metaMeses.M1 || 'sem rótulo'}) será movido para M2,
              o conteúdo de M2 será movido para M3, e o M3 atual será descartado.
            </p>
            <div className="campo">
              <label htmlFor="rotuloMes">Nome do novo mês (ex: Junho/2026)</label>
              <input
                id="rotuloMes"
                type="text"
                value={rotuloNovoM1}
                onChange={(e) => setRotuloNovoM1(e.target.value)}
                placeholder="Junho/2026"
              />
            </div>
            <div className="modal-acoes">
              <button className="btn-secundario" onClick={cancelarRotacao}>Cancelar</button>
              <button className="btn-primario" style={{ width: 'auto', padding: '8px 16px' }} onClick={confirmarRotacaoEEnviar}>
                Confirmar e avançar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
