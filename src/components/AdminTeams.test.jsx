import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import AdminTeams from './AdminTeams'
import * as client from '../api/client'

const teams = [
  { id: 22, name: 'España', flag: 'https://flagcdn.com/es.svg' },
  { id: 37, name: 'Portugal', flag: 'https://flagcdn.com/pt.svg' },
]

describe('AdminTeams', () => {
  it('muestra los equipos existentes', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({ data: teams })

    render(<AdminTeams />)

    await waitFor(() => {
      expect(screen.getByText('España')).toBeInTheDocument()
      expect(screen.getByText('Portugal')).toBeInTheDocument()
    })
  })

  it('muestra el formulario de creación de equipo', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({ data: [] })

    render(<AdminTeams />)

    await waitFor(() => {
      expect(screen.getByText('Crear equipo')).toBeInTheDocument()
    })
  })
})