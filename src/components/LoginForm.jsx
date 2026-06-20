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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="border rounded px-3 py-2"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        className="border rounded px-3 py-2"
        required
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button type="submit" className="bg-blue-600 text-white rounded px-3 py-2">
        Entrar
      </button>
    </form>
  )
}

export default LoginForm