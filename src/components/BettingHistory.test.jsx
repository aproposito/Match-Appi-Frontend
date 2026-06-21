import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import BettingHistory from './BettingHistory'
import * as client from '../api/client'

const baseMatch = {
  id: 11,
  home_team: { name: 'España', flag: 'https://flagcdn.com/es.svg' },
  away_team: { name: 'Francia', flag: 'https://flagcdn.com/fr.svg' },
  phase: 'groups',
  match_date_time: '2026-06-22 23:00:00',
  final_home_goals: 2,
  final_away_goals: 0,
}

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
      matches: [{ ...baseMatch, id: 10, final_home_goals: null, final_away_goals: null }],
    })

    render(<BettingHistory />)

    await waitFor(() => {
      expect(screen.getByText('Todavía no tienes apuestas resueltas.')).toBeInTheDocument()
    })
  })

  it('muestra apuesta, resultado y puntos totales de una predicción resuelta', async () => {
    mockGet({
      predictions: [{ id: 2, match_id: 11, predicted_home_goals: 2, predicted_away_goals: 1, points_sign: 50, points_home_goals: 20, points_away_goals: 0 }],
      matches: [baseMatch],
    })

    render(<BettingHistory />)

    await waitFor(() => {
      expect(screen.getByText('España')).toBeInTheDocument()
      expect(screen.getByText('Francia')).toBeInTheDocument()
      expect(screen.getByText('2 — 0')).toBeInTheDocument()
      expect(screen.getByText('70 pts')).toBeInTheDocument()
      expect(screen.getByText(/2 — 1/)).toBeInTheDocument()
    })
  })

  it('no muestra la banda de marcador exacto si solo se acertó el signo', async () => {
    mockGet({
      predictions: [{ id: 2, match_id: 11, predicted_home_goals: 5, predicted_away_goals: 1, points_sign: 50, points_home_goals: 0, points_away_goals: 0 }],
      matches: [baseMatch],
    })

    render(<BettingHistory />)

    await waitFor(() => {
      expect(screen.getByText('50 pts')).toBeInTheDocument()
      expect(screen.queryByText('Marcador exacto')).not.toBeInTheDocument()
    })
  })

  it('muestra la banda de marcador exacto cuando ambos goles fueron exactos', async () => {
    mockGet({
      predictions: [{ id: 3, match_id: 11, predicted_home_goals: 2, predicted_away_goals: 0, points_sign: 50, points_home_goals: 20, points_away_goals: 20 }],
      matches: [baseMatch],
    })

    render(<BettingHistory />)

    await waitFor(() => {
      expect(screen.getByText('90 pts')).toBeInTheDocument()
      expect(screen.getByText('Marcador exacto')).toBeInTheDocument()
    })
  })

  it('no muestra la banda de marcador exacto si no se acertó ningún signo', async () => {
    mockGet({
      predictions: [{ id: 4, match_id: 11, predicted_home_goals: 0, predicted_away_goals: 1, points_sign: 0, points_home_goals: 0, points_away_goals: 0 }],
      matches: [baseMatch],
    })

    render(<BettingHistory />)

    await waitFor(() => {
      expect(screen.getByText('0 pts')).toBeInTheDocument()
      expect(screen.queryByText('Marcador exacto')).not.toBeInTheDocument()
    })
  })
})