import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import AdminPredictions from './AdminPredictions'
import * as client from '../api/client'

const users = [
  { id: 1, name: 'Usuario Normal', email: 'user@matchappi.com', role: 'user', avatar: null },
  { id: 2, name: 'Otro Usuario', email: 'otro@matchappi.com', role: 'user', avatar: null },
]

const baseMatch = {
  id: 10,
  home_team: { id: 22, name: 'España', flag: 'https://flagcdn.com/es.svg' },
  away_team: { id: 37, name: 'Portugal', flag: 'https://flagcdn.com/pt.svg' },
  phase: 'groups',
  match_date_time: '2026-06-22 23:00:00',
  final_home_goals: 2,
  final_away_goals: 0,
}

const pendingMatch = {
  id: 11,
  home_team: { id: 1, name: 'Canadá', flag: 'https://flagcdn.com/ca.svg' },
  away_team: { id: 2, name: 'EE. UU.', flag: 'https://flagcdn.com/us.svg' },
  phase: 'groups',
  match_date_time: '2099-01-01 20:00:00',
  final_home_goals: null,
  final_away_goals: null,
}

function mockGet(predictions, matches = [baseMatch]) {
  vi.spyOn(client, 'get').mockImplementation((endpoint) => {
    if (endpoint === '/match-predictions') return Promise.resolve({ data: predictions })
    if (endpoint === '/matches?scope=all') return Promise.resolve({ data: matches })
    if (endpoint === '/users') return Promise.resolve({ data: users })
    return Promise.resolve({ data: [] })
  })
}

describe('AdminPredictions', () => {
  it('muestra una predicción resuelta con nombre de usuario y puntos', async () => {
    mockGet([
      { id: 1, match_id: 10, user_id: 1, predicted_home_goals: 2, predicted_away_goals: 1, points_sign: 50, points_home_goals: 20, points_away_goals: 0 },
    ])

    render(<AdminPredictions />)

    await waitFor(() => {
      expect(screen.getAllByText('Usuario Normal').length).toBeGreaterThan(0)
      expect(screen.getByText(/70/)).toBeInTheDocument()
      expect(screen.getByText('España')).toBeInTheDocument()
      expect(screen.getByText('Portugal')).toBeInTheDocument()
    })
  })

  it('muestra una predicción pendiente sin puntos', async () => {
    mockGet([
      { id: 2, match_id: 11, user_id: 1, predicted_home_goals: 1, predicted_away_goals: 1, points_sign: null, points_home_goals: null, points_away_goals: null },
    ], [pendingMatch])

    render(<AdminPredictions />)

    await waitFor(() => {
      expect(screen.getByText('Canadá')).toBeInTheDocument()
      expect(screen.queryByText(/pts/)).not.toBeInTheDocument()
    })
  })

  it('filtra predicciones por usuario al seleccionar en el select', async () => {
    mockGet([
      { id: 1, match_id: 10, user_id: 1, predicted_home_goals: 2, predicted_away_goals: 1, points_sign: 50, points_home_goals: 20, points_away_goals: 0 },
      { id: 2, match_id: 10, user_id: 2, predicted_home_goals: 0, predicted_away_goals: 0, points_sign: 0, points_home_goals: 0, points_away_goals: 0 },
    ])

    render(<AdminPredictions />)

    await waitFor(() => {
      expect(screen.getAllByText('España')).toHaveLength(2)
    })

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } })

    await waitFor(() => {
      expect(screen.getAllByText('España')).toHaveLength(1)
      expect(screen.getAllByText('Usuario Normal').length).toBeGreaterThan(0)
    })
  })
})