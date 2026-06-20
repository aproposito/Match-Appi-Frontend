import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import LoginForm from './LoginForm'
import * as client from '../api/client'

describe('LoginForm', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('guarda el token y los datos del usuario, y llama a onLoginSuccess tras un login correcto', async () => {
    vi.spyOn(client, 'post').mockResolvedValue({ token: 'fake-token' })
    vi.spyOn(client, 'get').mockResolvedValue({ id: 1, name: 'Usuario Normal', email: 'user@matchappi.com', role: 'user', avatar: null })
    const onLoginSuccess = vi.fn()

    render(<LoginForm onLoginSuccess={onLoginSuccess} />)

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'user@matchappi.com' } })
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: '12345678' } })
    fireEvent.click(screen.getByText('Entrar'))

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('fake-token')
      expect(localStorage.getItem('role')).toBe('user')
      expect(localStorage.getItem('userId')).toBe('1')
      expect(localStorage.getItem('userName')).toBe('Usuario Normal')
      expect(localStorage.getItem('userEmail')).toBe('user@matchappi.com')
      expect(onLoginSuccess).toHaveBeenCalled()
    })
  })

  it('muestra un mensaje de error si las credenciales son incorrectas', async () => {
    vi.spyOn(client, 'post').mockRejectedValue(new Error('Credenciales incorrectas'))

    render(<LoginForm onLoginSuccess={vi.fn()} />)

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'user@matchappi.com' } })
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'mala' } })
    fireEvent.click(screen.getByText('Entrar'))

    await waitFor(() => {
      expect(screen.getByText('Credenciales incorrectas')).toBeInTheDocument()
    })
  })
})