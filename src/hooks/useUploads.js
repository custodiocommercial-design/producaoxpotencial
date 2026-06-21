import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { lerArquivoPlanilha, mapearLinha, paraNumero, paraDataISO } from '../lib/planilha'
import {
  MAPA_POTENCIAL, MAPA_LOJAS, MAPA_PRODUCAO, separarDealer,
  CAMPOS_NUMERICOS_POTENCIAL, CAMPOS_NUMERICOS_PRODUCAO,
} from '../lib/mapaColunas'

const TAMANHO_LOTE = 500 // insere em lotes para não sobrecarregar a requisição

async function inserirEmLotes(tabela, linhas) {
  for (let i = 0; i < linhas.length; i += TAMANHO_LOTE) {
    const lote = linhas.slice(i, i + TAMANHO_LOTE)
    const { error } = await supabase.from(tabela).insert(lote)
    if (error) throw error
  }
}

export function useUploads({ aoConcluir }) {
  const [processando, setProcessando] = useState(null) // qual upload está rodando: 'potencial' | 'lojas' | 'M1' | etc

  async function uploadLojas(arquivo) {
    setProcessando('lojas')
    try {
      const linhasBrutas = await lerArquivoPlanilha(arquivo)
      const linhas = linhasBrutas
        .map((linha) => {
          const mapeada = mapearLinha(linha, MAPA_LOJAS)
          if (!mapeada.dn) return null // ignora linhas sem código de loja
          return mapeada
        })
        .filter(Boolean)

      if (linhas.length === 0) {
        throw new Error('Nenhuma linha válida encontrada no arquivo (verifique se a coluna DN está preenchida).')
      }

      const { error: erroDelete } = await supabase.from('lojas').delete().neq('id', 0)
      if (erroDelete) throw erroDelete
      await inserirEmLotes('lojas', linhas)

      aoConcluir?.(`Lojas atualizadas: ${linhas.length} registros carregados.`)
    } catch (e) {
      aoConcluir?.(`Erro ao subir Lojas: ${e.message}`, true)
    } finally {
      setProcessando(null)
    }
  }

  async function uploadPotencial(arquivo) {
    setProcessando('potencial')
    try {
      const linhasBrutas = await lerArquivoPlanilha(arquivo)
      const linhas = linhasBrutas
        .map((linha) => {
          const mapeada = mapearLinha(linha, MAPA_POTENCIAL)
          if (!mapeada.cnpj_loja) return null // ignora linhas sem CNPJ (chave de ligação)
          for (const campo of CAMPOS_NUMERICOS_POTENCIAL) {
            mapeada[campo] = paraNumero(mapeada[campo])
          }
          return mapeada
        })
        .filter(Boolean)

      if (linhas.length === 0) {
        throw new Error('Nenhuma linha válida encontrada no arquivo (verifique se a coluna CNPJ_LOJA está preenchida).')
      }

      const { error: erroDelete } = await supabase.from('potencial').delete().neq('id', 0)
      if (erroDelete) throw erroDelete
      await inserirEmLotes('potencial', linhas)

      aoConcluir?.(`Potencial atualizado: ${linhas.length} registros carregados.`)
    } catch (e) {
      aoConcluir?.(`Erro ao subir Potencial: ${e.message}`, true)
    } finally {
      setProcessando(null)
    }
  }

  async function uploadProducao(arquivo, posicaoMes, rotuloMes) {
    setProcessando(posicaoMes)
    try {
      const linhasBrutas = await lerArquivoPlanilha(arquivo)
      const linhas = linhasBrutas
        .map((linha) => {
          const mapeada = mapearLinha(linha, MAPA_PRODUCAO)
          if (!mapeada.dealer) return null

          // Separa o campo DEALER bruto ("60441-NOME DA LOJA") em código + nome,
          // equivalente ao "Texto por colunas" do Excel usando "-" como delimitador.
          const { dn, dealer_nome } = separarDealer(mapeada.dealer)
          mapeada.dn = dn
          mapeada.dealer_nome = dealer_nome
          delete mapeada.dealer // não existe essa coluna na tabela; guardamos dn e dealer_nome

          mapeada.pagamento = paraDataISO(mapeada.pagamento)
          for (const campo of CAMPOS_NUMERICOS_PRODUCAO) {
            mapeada[campo] = paraNumero(mapeada[campo])
          }
          mapeada.mes_posicao = posicaoMes
          return mapeada
        })
        .filter(Boolean)

      if (linhas.length === 0) {
        throw new Error('Nenhuma linha válida encontrada no arquivo (verifique se a coluna DEALER está preenchida).')
      }

      // Se for upload em M1, roda a rotação M1->M2->M3 ANTES de inserir o novo conteúdo
      if (posicaoMes === 'M1') {
        const { error: erroRpc } = await supabase.rpc('rotacionar_producao')
        if (erroRpc) throw erroRpc
      } else {
        // Upload direto em M2 ou M3: substitui apenas aquela posição
        const { error: erroDelete } = await supabase.from('producao').delete().eq('mes_posicao', posicaoMes)
        if (erroDelete) throw erroDelete
      }

      await inserirEmLotes('producao', linhas)

      // Atualiza o rótulo do mês (ex: "Junho/2026") na posição M1
      if (posicaoMes === 'M1') {
        const { error: erroMeta } = await supabase
          .from('producao_meta')
          .update({ rotulo_mes: rotuloMes, atualizado_em: new Date().toISOString() })
          .eq('mes_posicao', 'M1')
        if (erroMeta) throw erroMeta
      }

      aoConcluir?.(`Produção (${posicaoMes}) atualizada: ${linhas.length} lançamentos carregados.`)
    } catch (e) {
      aoConcluir?.(`Erro ao subir Produção ${posicaoMes}: ${e.message}`, true)
    } finally {
      setProcessando(null)
    }
  }

  return { processando, uploadPotencial, uploadLojas, uploadProducao }
}
