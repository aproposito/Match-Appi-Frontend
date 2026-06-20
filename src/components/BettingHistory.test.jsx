import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import BettingHistory from './BettingHistory'
import * as client from '../api/client'

function mockGet({ predictions, matches }) {
  vi.spyOn(client, 'get').mockImplementation((endpoint) => {
    if (endpoint === '/match-predictions') {
      return Promise.resolve({ data: predictions })
    }
    return Promise.resolve({ data: matches })
  })
}

describe('BettingHistory', () => {
  it('muestra un mensaje si no hay apuestas resueltas', async () => {
    mockGet({ predictions: [], matches: [] })

    render(<BettingHistory />)

    await waitFor(() => {
      expect(screen.getByText('Todavía no tienes apuestas resueltas.')).toBeInTheDocument()
    })
  })

  it('excluye predicciones de partidos aún sin resultado', async () => {
    mockGet({
      predictions: [{ id: 1, match_id: 10, predicted_home_goals: 2, predicted_away_goals: 1, points_sign: null, points_home_goals: null, points_away_goals: null }],
      matches: [{ id: 10, home_team: { name: 'España' }, away_team: { name: 'Francia' }, final_home_goals: null, final_away_goals: null }],
    })

    render(<BettingHistory />)

    await waitFor(() => {
      expect(screen.getByText('Todavía no tienes apuestas resueltas.')).toBeInTheDocument()
    })
  })

  it('muestra apuesta, resultado y puntos totales de una predicción resuelta', async () => {
    mockGet({
      predictions: [{ id: 2, match_id: 11, predicted_home_goals: 2, predicted_away_goals: 1, points_sign: 50, points_home_goals: 20, points_away_goals: 0 }],
      matches: [{ id: 11, home_team: { name: 'España' }, away_team: { name: 'Francia' }, final_home_goals: 2, final_away_goals: 0 }],
    })

    render(<BettingHistory />)

    await waitFor(() => {
      expect(screen.getByText('España vs Francia')).toBeInTheDocument()
      expect(screen.getByText('70 pts')).toBeInTheDocument()
      expect(screen.getByText(/Tu apuesta: 2 - 1/)).toBeInTheDocument()
      expect(screen.getByText(/Resultado: 2 - 0/)).toBeInTheDocument()
    })
  })
})