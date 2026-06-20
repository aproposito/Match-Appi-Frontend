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
    fireEvent.click(screen.getByText('Crear equipo'))

    await waitFor(() => {
      expect(screen.getByText('Italia')).toBeInTheDocument()
    })
  })
})
