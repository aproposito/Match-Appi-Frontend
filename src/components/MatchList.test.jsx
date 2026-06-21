import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import MatchList from './MatchList'
import * as client from '../api/client'

const baseMatch = {
  id: 1,
  home_team: { id: 1, name: 'España', flag: 'https://flagcdn.com/es.svg' },
  away_team: { id: 2, name: 'Francia', flag: 'https://flagcdn.com/fr.svg' },
  phase: 'groups',
  match_date_time: '2099-01-01 23:00:00',
  final_home_goals: null,
  final_away_goals: null,
}

function mockGet(matches, predictions = []) {
  vi.spyOn(client, 'get').mockImplementation((endpoint) => {
    if (endpoint === '/matches') {
      return Promise.resolve({ data: matches })
    }
    return Promise.resolve({ data: predictions })
  })
}

describe('MatchList', () => {
  it('muestra cada partido como MatchCard con su PredictionForm', async () => {
    mockGet([baseMatch])

    render(<MatchList />)

    await waitFor(() => {
      expect(screen.getByText('España')).toBeInTheDocument()
      expect(screen.getByText('Francia')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Apostar' })).toBeInTheDocument()
    })
  })

  it('pasa la predicción existente del partido correcto a PredictionForm', async () => {
    mockGet([baseMatch], [{ id: 10, match_id: 1, predicted_home_goals: 2, predicted_away_goals: 1 }])

    render(<MatchList />)

    await waitFor(() => {
      expect(screen.getByText(/Tu apuesta/)).toBeInTheDocument()
      expect(screen.getByText(/2 — 1/)).toBeInTheDocument()
    })
  })

  it('muestra un error si falla la carga de partidos o predicciones', async () => {
    vi.spyOn(client, 'get').mockRejectedValue(new Error('Error de red'))

    render(<MatchList />)

    await waitFor(() => {
      expect(screen.getByText('Error de red')).toBeInTheDocument()
    })
  })
})