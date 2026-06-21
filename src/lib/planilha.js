// XLSX é importado dinamicamente dentro de lerArquivoPlanilha() para reduzir o bundle inicial.

/**
 * Lê um arquivo (xlsx, xls ou csv) e retorna um array de objetos,
 * um por linha, com as chaves sendo o cabeçalho original da planilha.
 */
export async function lerArquivoPlanilha(arquivo) {
  const XLSX = await import('xlsx')
  const buffer = await arquivo.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
  const primeiraAba = workbook.SheetNames[0]
  const planilha = workbook.Sheets[primeiraAba]
  // defval: '' garante que células vazias não quebrem o mapeamento de colunas
  const linhas = XLSX.utils.sheet_to_json(planilha, { defval: '', raw: false })
  return linhas
}

/**
 * Normaliza um texto de cabeçalho: remove acentos, espaços extras,
 * deixa minúsculo e troca espaços por underline.
 * Isso permite reconhecer "Razão Social", "razao social", "RAZAO_SOCIAL" como o mesmo campo.
 */
export function normalizarCabecalho(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

/**
 * Dado um objeto "mapa" { nome_coluna_banco: [possíveis nomes na planilha] },
 * e uma linha lida da planilha, devolve um novo objeto já mapeado
 * para os nomes de coluna do banco de dados.
 */
export function mapearLinha(linha, mapaColunas) {
  const linhaNormalizada = {}
  for (const chaveOriginal of Object.keys(linha)) {
    linhaNormalizada[normalizarCabecalho(chaveOriginal)] = linha[chaveOriginal]
  }

  const resultado = {}
  for (const [colunaBanco, possiveisNomes] of Object.entries(mapaColunas)) {
    for (const nomePossivel of possiveisNomes) {
      const chaveNormalizada = normalizarCabecalho(nomePossivel)
      if (linhaNormalizada[chaveNormalizada] !== undefined && linhaNormalizada[chaveNormalizada] !== '') {
        resultado[colunaBanco] = linhaNormalizada[chaveNormalizada]
        break
      }
    }
  }
  return resultado
}

/** Converte um valor de planilha (texto tipo "1.234.567,89" ou número) em número. */
export function paraNumero(valor) {
  if (valor === '' || valor === null || valor === undefined) return null
  if (typeof valor === 'number') return valor
  const texto = String(valor).trim()
  if (texto === '-' || texto === '') return 0
  // Remove separador de milhar (.) e troca vírgula decimal por ponto
  const limpo = texto.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '')
  const numero = parseFloat(limpo)
  return isNaN(numero) ? null : numero
}

/** Converte uma data de planilha (Date, serial Excel, ou texto dd/mm/aaaa) para "AAAA-MM-DD". */
export function paraDataISO(valor) {
  if (!valor) return null
  if (valor instanceof Date) {
    return valor.toISOString().slice(0, 10)
  }
  const texto = String(valor).trim()
  const match = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (match) {
    const [, dia, mes, ano] = match
    return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
  }
  return null
}
