import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'

export default function Login() {
  const { entrar, cadastrar } = useAuth()
  const [modo, setModo] = useState('entrar') // 'entrar' | 'cadastrar'
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function aoEnviar(e) {
    e.preventDefault()
    setErro('')
    setSucesso('')
    setEnviando(true)

    if (modo === 'entrar') {
      const { error } = await entrar(email, senha)
      if (error) setErro('E-mail ou senha incorretos.')
    } else {
      const { error } = await cadastrar(email, senha)
      if (error) {
        setErro(error.message)
      } else {
        setSucesso('Conta criada. Você já pode entrar — peça ao administrador para liberar seu acesso, se necessário.')
        setModo('entrar')
      }
    }
    setEnviando(false)
  }

  return (
    <div className="tela-login">
      <div className="cartao-login">
        <h1>Painel Potencial × Produção</h1>
        <p className="subtitulo">
          {modo === 'entrar' ? 'Entre com sua conta para continuar.' : 'Crie sua conta de acesso.'}
        </p>

        {erro && <div className="erro-form">{erro}</div>}
        {sucesso && <div className="aviso-sucesso">{sucesso}</div>}

        <form onSubmit={aoEnviar}>
          <div className="campo">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="campo">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              required
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
            />
          </div>
          <button className="btn-primario" type="submit" disabled={enviando}>
            {enviando ? 'Aguarde…' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <div className="link-alternar">
          {modo === 'entrar' ? (
            <>Ainda não tem conta? <button onClick={() => { setModo('cadastrar'); setErro(''); setSucesso('') }}>Cadastre-se</button></>
          ) : (
            <>Já tem conta? <button onClick={() => { setModo('entrar'); setErro(''); setSucesso('') }}>Entrar</button></>
          )}
        </div>
      </div>
    </div>
  )
}
