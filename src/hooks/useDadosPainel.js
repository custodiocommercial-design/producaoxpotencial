import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useDadosPainel() {
  const [potencial, setPotencial] = useState([])
  const [lojas, setLojas] = useState([])
  const [producao, setProducao] = useState([])
  const [metaMeses, setMetaMeses] = useState({ M1: null, M2: null, M3: null })
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(async () => {
    setCarregando(true)
    const [resPotencial, resLojas, resProducao, resMeta] = await Promise.all([
      supabase.from('potencial').select('*'),
      supabase.from('lojas').select('*'),
      supabase.from('producao').select('*'),
      supabase.from('producao_meta').select('*'),
    ])

    setPotencial(resPotencial.data || [])
    setLojas(resLojas.data || [])
    setProducao(resProducao.data || [])

    const meta = { M1: null, M2: null, M3: null }
    for (const linha of resMeta.data || []) {
      meta[linha.mes_posicao] = linha.rotulo_mes
    }
    setMetaMeses(meta)
    setCarregando(false)
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  // Consolida por código de loja (DN / FILIAL / DEALER são o mesmo código)
  const linhasConsolidadas = consolidar(potencial, lojas, producao)

  return { potencial, lojas, producao, metaMeses, linhasConsolidadas, carregando, recarregar: carregar }
}

function consolidar(potencial, lojas, producao) {
  const mapaLojas = new Map(lojas.map((l) => [String(l.filial), l]))

  const producaoPorLojaEMes = new Map() // chave: codigo|mesPosicao -> { valor, quantidade }
  for (const p of producao) {
    const chave = `${p.dealer}|${p.mes_posicao}`
    const atual = producaoPorLojaEMes.get(chave) || { valor: 0, quantidade: 0 }
    atual.valor += Number(p.vlr_financiado) || 0
    atual.quantidade += Number(p.quant) || 0
    producaoPorLojaEMes.set(chave, atual)
  }

  return potencial.map((pot) => {
    const codigo = String(pot.dn)
    const loja = mapaLojas.get(codigo)
    const m1 = producaoPorLojaEMes.get(`${codigo}|M1`) || { valor: 0, quantidade: 0 }
    const m2 = producaoPorLojaEMes.get(`${codigo}|M2`) || { valor: 0, quantidade: 0 }
    const m3 = producaoPorLojaEMes.get(`${codigo}|M3`) || { valor: 0, quantidade: 0 }

    return {
      codigo,
      razao_social: pot.razao_social || loja?.razao_loja || loja?.nome_fantasia || '',
      bairro: pot.bairro || loja?.bairro || '',
      zona: pot.zona || loja?.regiao || '',
      gcm: pot.gcm || loja?.gcm || '',
      status_loja: loja?.status_loja || '',
      potencial: Number(pot.potencial) || 0,
      mercado: Number(pot.mercado) || 0,
      producao_m1: m1.valor,
      qtd_m1: m1.quantidade,
      producao_m2: m2.valor,
      qtd_m2: m2.quantidade,
      producao_m3: m3.valor,
      qtd_m3: m3.quantidade,
    }
  })
}
