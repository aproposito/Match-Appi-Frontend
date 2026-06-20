import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import AdminUsers from './AdminUsers'
import * as client from '../api/client'

const users = [
  { id: 1, name: 'Usuario Normal', email: 'user@matchappi.com', role: 'user', avatar: null },
  { id: 2, name: 'Admin', email: 'admin@matchappi.com', role: 'admin', avatar: null },
]

describe('AdminUsers', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('muestra la lista de usuarios', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({ data: users })

    render(<AdminUsers />)

    await waitFor(() => {
      expect(screen.getByText('Usuario Normal')).toBeInTheDocument()
      expect(screen.getByText('Admin')).toBeInTheDocument()
    })
  })

  it('edita un usuario y actualiza la lista', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({ data: users })
    vi.spyOn(client, 'put').mockResolvedValue({ id: 1, name: 'Nombre Editado', email: 'user@matchappi.com', role: 'user', avatar: null })

    render(<AdminUsers />)

    await waitFor(() => screen.getByText('Usuario Normal'))

    fireEvent.click(screen.getAllByText('Editar')[0])
    const nameInput = screen.getAllByRole('textbox')[0]
    fireEvent.change(nameInput, { target: { value: 'Nombre Editado' } })
    fireEvent.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(client.put).toHaveBeenCalledWith('/users/1', { name: 'Nombre Editado', email: 'user@matchappi.com' })
      expect(screen.getByText('Nombre Editado')).toBeInTheDocument()
    })
  })

  it('elimina un usuario tras confirmar', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({ data: users })
    vi.spyOn(client, 'del').mockResolvedValue({})

    render(<AdminUsers />)

    await waitFor(() => screen.getByText('Usuario Normal'))

    const deleteButtons = screen.getAllByText('Eliminar')
    fireEvent.click(deleteButtons[0])
    fireEvent.click(screen.getByText('Confirmar'))

    await waitFor(() => {
      expect(client.del).toHaveBeenCalledWith('/users/1')
      expect(screen.queryByText('Usuario Normal')).not.toBeInTheDocument()
    })
  })
})