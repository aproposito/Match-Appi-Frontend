import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import Ranking from './Ranking'
import * as client from '../api/client'

describe('Ranking', () => {
  it('ordena a los usuarios por puntos totales de mayor a menor', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({
      data: [
        { id: 1, name: 'Usuario Normal', match_points: 3, champion_points: 0, total_points: 3 },
        { id: 2, name: 'Admin', match_points: 5, champion_points: 2, total_points: 7 },
      ],
    })

    render(<Ranking />)

    await waitFor(() => {
      const names = screen.getAllByText(/Admin|Usuario Normal/).map((el) => el.textContent)
      expect(names.indexOf('Admin')).toBeLessThan(names.indexOf('Usuario Normal'))
    })
  })

  it('marca al primer puesto como líder con su badge', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({
      data: [
        { id: 1, name: 'Usuario Normal', match_points: 3, champion_points: 0, total_points: 3 },
        { id: 2, name: 'Admin', match_points: 5, champion_points: 2, total_points: 7 },
      ],
    })

    render(<Ranking />)

    await waitFor(() => {
      expect(screen.getByText('Líder')).toBeInTheDocument()
    })
  })

  it('muestra la cabecera de columnas', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({ data: [] })

    render(<Ranking />)

    await waitFor(() => {
      expect(screen.getByText('Jugador')).toBeInTheDocument()
      expect(screen.getByText('Pts')).toBeInTheDocument()
    })
  })

  it('muestra un error si falla la carga del ranking', async () => {
    vi.spyOn(client, 'get').mockRejectedValue(new Error('Error de red'))

    render(<Ranking />)

    await waitFor(() => {
      expect(screen.getByText('Error de red')).toBeInTheDocument()
    })
  })

  it('tinta las filas del top 3 con su color y deja sin tintar a partir del cuarto puesto', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({
      data: [
        { id: 1, name: 'Primero', match_points: 0, champion_points: 0, total_points: 100 },
        { id: 2, name: 'Segundo', match_points: 0, champion_points: 0, total_points: 90 },
        { id: 3, name: 'Tercero', match_points: 0, champion_points: 0, total_points: 80 },
        { id: 4, name: 'Cuarto', match_points: 0, champion_points: 0, total_points: 70 },
      ],
    })

    render(<Ranking />)

    await waitFor(() => {
      expect(screen.getByText('Primero').closest('.border-b').className).toContain('bg-red-50')
      expect(screen.getByText('Segundo').closest('.border-b').className).toContain('bg-blue-50')
      expect(screen.getByText('Tercero').closest('.border-b').className).toContain('bg-green-50')
      expect(screen.getByText('Cuarto').closest('.border-b').className).not.toMatch(/bg-(red|blue|green)-50/)
    })
  })
})