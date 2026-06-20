import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import AdminMatches from './AdminMatches'
import * as client from '../api/client'

const teams = [
  { id: 22, name: 'España', flag: 'https://flagcdn.com/es.svg' },
  { id: 37, name: 'Portugal', flag: 'https://flagcdn.com/pt.svg' },
]

const matches = [
  {
    id: 1,
    home_team: { id: 22, name: 'España', flag: 'https://flagcdn.com/es.svg' },
    away_team: { id: 37, name: 'Portugal', flag: 'https://flagcdn.com/pt.svg' },
    phase: 'groups',
    match_date_time: '2026-06-22 23:00:00',
    final_home_goals: null,
    final_away_goals: null,
  },
]

function mockGet() {
  vi.spyOn(client, 'get').mockImplementation((endpoint) => {
    if (endpoint === '/teams') return Promise.resolve({ data: teams })
    if (endpoint === '/matches') return Promise.resolve({ data: matches })
    return Promise.resolve({ data: [] })
  })
}

describe('AdminMatches', () => {
  it('muestra los partidos existentes', async () => {
    mockGet()

    render(<AdminMatches />)

    await waitFor(() => {
      expect(screen.getByText('España vs Portugal')).toBeInTheDocument()
    })
  })

  it('crea un partido nuevo', async () => {
    mockGet()
    const newMatch = {
      id: 2,
      home_team: teams[0],
      away_team: teams[1],
      phase: 'groups',
      match_date_time: '2026-06-25T20:00',
      final_home_goals: null,
      final_away_goals: null,
    }
    vi.spyOn(client, 'post').mockResolvedValue(newMatch)

    render(<AdminMatches />)

    await waitFor(() => screen.getByRole('button', { name: 'Crear partido' }))

    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[0], { target: { value: '22' } })
    fireEvent.change(selects[1], { target: { value: '37' } })

    const dateInput = document.querySelector('input[type="datetime-local"]')
    fireEvent.change(dateInput, { target: { value: '2026-06-25T20:00' } })

    fireEvent.click(screen.getByRole('button', { name: 'Crear partido' }))

    await waitFor(() => {
      expect(client.post).toHaveBeenCalledWith('/matches', {
        home_team_id: 22,
        away_team_id: 37,
        phase: 'groups',
        match_date_time: '2026-06-25T20:00',
      })
    })
  })

  it('actualiza el resultado de un partido existente', async () => {
    mockGet()
    vi.spyOn(client, 'put').mockResolvedValue({ ...matches[0], final_home_goals: 2, final_away_goals: 1 })

    render(<AdminMatches />)

    await waitFor(() => screen.getByText('España vs Portugal'))

    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: '2' } })
    fireEvent.change(inputs[1], { target: { value: '1' } })
    fireEvent.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(client.put).toHaveBeenCalledWith('/matches/1', { final_home_goals: 2, final_away_goals: 1 })
    })
  })
})