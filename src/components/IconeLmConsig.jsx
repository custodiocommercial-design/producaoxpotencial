export default function IconeLmConsig({ dn, ativo, aoAlternar }) {
  return (
    <button
      className={`icone-lm-consig ${ativo ? 'ativo' : ''}`}
      onClick={() => aoAlternar(dn)}
      title={ativo ? 'LM Consig ativo — clique para desativar' : 'LM Consig inativo — clique para ativar'}
      aria-pressed={ativo}
    >
      {/* Ícone simples de carro em SVG, cor controlada via CSS (currentColor) */}
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3 13l1.5-4.5A2 2 0 016.4 7h11.2a2 2 0 011.9 1.5L21 13M5 13h14v4a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H8v1a1 1 0 01-1 1H6a1 1 0 01-1-1v-4z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="7.5" cy="13.5" r="1.3" fill="currentColor" />
        <circle cx="16.5" cy="13.5" r="1.3" fill="currentColor" />
      </svg>
    </button>
  )
}
