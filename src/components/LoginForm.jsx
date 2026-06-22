import { post, get } from '../api/client'
import { useState } from 'react'

function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const data = await post('/login', { email, password })
      localStorage.setItem('token', data.token)
      const user = await get('/user')
      localStorage.setItem('role', user.role)
      localStorage.setItem('userId', user.id)
      localStorage.setItem('userName', user.name)
      localStorage.setItem('userEmail', user.email)
      onLoginSuccess()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      <div className="text-4xl font-logo tracking-wide">
        <span className="text-[#0a0e1a]">MATCH</span>
        <span className="text-[#dc2626]">APP</span>
      </div>
      <div className="w-full border rounded overflow-hidden">
        <div className="bg-[#0a0e1a] px-5 py-3">
          <span className="font-display text-sm font-bold uppercase tracking-wide text-gray-400">Iniciar sesión</span>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-5 py-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="border rounded px-3 py-2 text-sm w-full"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="border rounded px-3 py-2 text-sm w-full"
            required
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="bg-[#166534] text-white rounded px-3 py-2 font-display text-sm font-bold uppercase">
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginForm