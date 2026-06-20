import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import AdminPredictions from './AdminPredictions'
import * as client from '../api/client'

const users = [
  { id: 1, name: 'Usuario Normal', email: 'user@matchappi.com', role: 'user', avatar: null },
]

const matches = [
  {
    id: 10,
    home_team: { id: 22, name: 'España', flag: 'https://flagcdn.com/es.svg' },
    away_team: { id: 37, name: 'Portugal', flag: 'https://flagcdn.com/pt.svg' },
    phase: 'groups',
    final_home_goals: 2,
    final_away_goals: 0,
  },
  {
    id: 11,
    home_team: { id: 1, name: 'Canadá', flag: 'https://flagcdn.com/ca.svg' },
    away_team: { id: 2, name: 'EE. UU.', flag: 'https://flagcdn.com/us.svg' },
    phase: 'groups',
    final_home_goals: null,
    final_away_goals: null,
  },
]

function mockGet(predictions) {
  vi.spyOn(client, 'get').mockImplementation((endpoint) => {
    if (endpoint === '/match-predictions') return Promise.resolve({ data: predictions })
    if (endpoint === '/matches') return Promise.resolve({ data: matches })
    if (endpoint === '/users') return Promise.resolve({ data: users })
    return Promise.resolve({ data: [] })
  })
}

describe('AdminPredictions', () => {
  it('muestra una predicción resuelta con nombre de usuario, partido y puntos', async () => {
    mockGet([
      { id: 1, match_id: 10, user_id: 1, predicted_home_goals: 2, predicted_away_goals: 1, points_sign: 50, points_home_goals: 20, points_away_goals: 0 },
    ])

    render(<AdminPredictions />)

    await waitFor(() => {
      expect(screen.getByText('Usuario Normal')).toBeInTheDocument()
      expect(screen.getByText('70 pts')).toBeInTheDocument()
      expect(screen.getByText(/España vs Portugal/)).toBeInTheDocument()
      expect(screen.getByText(/Resultado: 2 - 0/)).toBeInTheDocument()
    })
  })

  it('muestra una predicción pendiente sin puntos ni resultado', async () => {
    mockGet([
      { id: 2, match_id: 11, user_id: 1, predicted_home_goals: 1, predicted_away_goals: 1, points_sign: null, points_home_goals: null, points_away_goals: null },
    ])

    render(<AdminPredictions />)

    await waitFor(() => {
      expect(screen.getByText(/Canadá vs EE\. UU\./)).toBeInTheDocument()
      expect(screen.queryByText(/pts/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Resultado:/)).not.toBeInTheDocument()
    })
  })
})