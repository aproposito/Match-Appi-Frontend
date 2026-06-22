import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import TeamList from './TeamList'
import * as client from '../api/client'

describe('TeamList', () => {
  it('muestra los equipos recibidos de la API', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({
      data: [
        { id: 1, name: 'España', flag: 'https://flagcdn.com/es.svg' },
        { id: 2, name: 'Francia', flag: 'https://flagcdn.com/fr.svg' },
      ],
    })

    render(<TeamList />)

    await waitFor(() => {
      expect(screen.getByText('España')).toBeInTheDocument()
      expect(screen.getByText('Francia')).toBeInTheDocument()
    })
  })

  it('muestra un mensaje de error si la API falla', async () => {
    vi.spyOn(client, 'get').mockRejectedValue(new Error('Unauthenticated.'))

    render(<TeamList />)

    await waitFor(() => {
      expect(screen.getByText('Unauthenticated.')).toBeInTheDocument()
    })
  })

  it('no muestra el formulario de creación por defecto', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({ data: [] })

    render(<TeamList />)

    await waitFor(() => {
      expect(screen.queryByText('Crear equipo')).not.toBeInTheDocument()
    })
  })

  it('crea un equipo nuevo cuando showCreateForm es true', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({ data: [] })
    vi.spyOn(client, 'post').mockResolvedValue({ id: 99, name: 'Italia', flag: null })

    render(<TeamList showCreateForm />)

    await waitFor(() => screen.getByText('Crear equipo'))

    fireEvent.change(screen.getByPlaceholderText('Nombre del equipo'), { target: { value: 'Italia' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear' }))

    await waitFor(() => {
      expect(screen.getByText('Italia')).toBeInTheDocument()
    })
  })

  it('edita un equipo existente', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({
      data: [{ id: 1, name: 'España', flag: 'https://flagcdn.com/es.svg' }],
    })
    vi.spyOn(client, 'put').mockResolvedValue({ id: 1, name: 'España editada', flag: 'https://flagcdn.com/es.svg' })

    render(<TeamList />)

    await waitFor(() => screen.getByText('España'))

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }))
    const nameInput = screen.getAllByRole('textbox')[0]
    fireEvent.change(nameInput, { target: { value: 'España editada' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => {
      expect(client.put).toHaveBeenCalledWith('/teams/1', { name: 'España editada', flag: 'https://flagcdn.com/es.svg' })
      expect(screen.getByText('España editada')).toBeInTheDocument()
    })
  })

  it('elimina un equipo tras confirmar', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({
      data: [{ id: 1, name: 'España', flag: 'https://flagcdn.com/es.svg' }],
    })
    vi.spyOn(client, 'del').mockResolvedValue({})

    render(<TeamList />)

    await waitFor(() => screen.getByText('España'))

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    await waitFor(() => {
      expect(client.del).toHaveBeenCalledWith('/teams/1')
      expect(screen.queryByText('España')).not.toBeInTheDocument()
    })
  })
})