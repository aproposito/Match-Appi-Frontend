import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import ProfileForm from './ProfileForm'
import * as client from '../api/client'

describe('ProfileForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('actualiza nombre y email correctamente', async () => {
    vi.spyOn(client, 'put').mockResolvedValue({ id: 1, name: 'Nuevo Nombre', email: 'nuevo@matchappi.com', role: 'user', avatar: null })

    render(<ProfileForm userId={1} currentName="Usuario Normal" currentEmail="user@matchappi.com" onAccountDeleted={vi.fn()} onLogout={vi.fn()} />)

    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'Nuevo Nombre' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar datos' }))

    await waitFor(() => {
      expect(client.put).toHaveBeenCalledWith('/users/1', { name: 'Nuevo Nombre', email: 'user@matchappi.com' })
      expect(screen.getByText('Perfil actualizado.')).toBeInTheDocument()
    })
  })

  it('cambia la contraseña enviando la confirmación', async () => {
    vi.spyOn(client, 'put').mockResolvedValue({ id: 1, name: 'Usuario Normal', email: 'user@matchappi.com', role: 'user', avatar: null })

    render(<ProfileForm userId={1} currentName="Usuario Normal" currentEmail="user@matchappi.com" onAccountDeleted={vi.fn()} onLogout={vi.fn()} />)

    fireEvent.change(screen.getByPlaceholderText('Nueva contraseña'), { target: { value: 'nuevapass123' } })
    fireEvent.change(screen.getByPlaceholderText('Confirmar contraseña'), { target: { value: 'nuevapass123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))

    await waitFor(() => {
      expect(client.put).toHaveBeenCalledWith('/users/1', { password: 'nuevapass123', password_confirmation: 'nuevapass123' })
      expect(screen.getByText('Contraseña actualizada.')).toBeInTheDocument()
    })
  })

  it('muestra error si el backend rechaza la confirmación de contraseña', async () => {
    vi.spyOn(client, 'put').mockRejectedValue(new Error('The password field confirmation does not match.'))

    render(<ProfileForm userId={1} currentName="Usuario Normal" currentEmail="user@matchappi.com" onAccountDeleted={vi.fn()} onLogout={vi.fn()} />)

    fireEvent.change(screen.getByPlaceholderText('Nueva contraseña'), { target: { value: 'a' } })
    fireEvent.change(screen.getByPlaceholderText('Confirmar contraseña'), { target: { value: 'b' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))

    await waitFor(() => {
      expect(screen.getByText('The password field confirmation does not match.')).toBeInTheDocument()
    })
  })

  it('pide confirmación antes de eliminar la cuenta, y la elimina al confirmar', async () => {
    vi.spyOn(client, 'del').mockResolvedValue({ id: 1, name: 'Usuario Normal', email: 'user@matchappi.com', role: 'user', avatar: null })
    const onAccountDeleted = vi.fn()

    render(<ProfileForm userId={1} currentName="Usuario Normal" currentEmail="user@matchappi.com" onAccountDeleted={onAccountDeleted} onLogout={vi.fn()} />)

    fireEvent.click(screen.getByText('Eliminar mi cuenta'))
    expect(screen.getByText(/Esta acción no se puede deshacer/)).toBeInTheDocument()

    fireEvent.click(screen.getByText('Sí, eliminar'))

    await waitFor(() => {
      expect(client.del).toHaveBeenCalledWith('/users/1')
      expect(onAccountDeleted).toHaveBeenCalled()
    })
  })

  it('cancela la eliminación sin llamar a la API', () => {
    const delSpy = vi.spyOn(client, 'del').mockResolvedValue({})

    render(<ProfileForm userId={1} currentName="Usuario Normal" currentEmail="user@matchappi.com" onAccountDeleted={vi.fn()} onLogout={vi.fn()} />)

    fireEvent.click(screen.getByText('Eliminar mi cuenta'))
    fireEvent.click(screen.getByText('Cancelar'))

    expect(screen.queryByText(/Esta acción no se puede deshacer/)).not.toBeInTheDocument()
    expect(delSpy).not.toHaveBeenCalled()
  })

  it('llama a onLogout al pulsar Cerrar sesión', () => {
    const onLogout = vi.fn()

    render(<ProfileForm userId={1} currentName="Usuario Normal" currentEmail="user@matchappi.com" onAccountDeleted={vi.fn()} onLogout={onLogout} />)

    fireEvent.click(screen.getByText('Cerrar sesión'))

    expect(onLogout).toHaveBeenCalled()
  })
})