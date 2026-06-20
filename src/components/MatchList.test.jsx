import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import MatchList from './MatchList'
import * as client from '../api/client'

describe('MatchList', () => {
  it('muestra los partidos con sus equipos', async () => {
    vi.spyOn(client, 'get').mockImplementation((endpoint) => {
      if (endpoint === '/matches') {
        return Promise.resolve({
          data: [
            {
              id: 1,
              home_team: { id: 1, name: 'España', flag: 'https://flagcdn.com/es.svg' },
              away_team: { id: 2, name: 'Francia', flag: 'https://flagcdn.com/fr.svg' },
              phase: 'groups',
              match_date_time: '2026-06-22 23:00:00',
              final_home_goals: null,
              final_away_goals: null,
            },
          ],
        })
      }
      return Promise.resolve({ data: [] })
    })

    render(<MatchList />)

    await waitFor(() => {
      expect(screen.getByText('España')).toBeInTheDocument()
      expect(screen.getByText('Francia')).toBeInTheDocument()
      expect(screen.getByText('23/6, 01:00')).toBeInTheDocument()
    })
  })

  it('muestra el resultado si el partido ya tiene goles registrados', async () => {
    vi.spyOn(client, 'get').mockImplementation((endpoint) => {
      if (endpoint === '/matches') {
        return Promise.resolve({
          data: [
            {
              id: 2,
              home_team: { id: 1, name: 'España', flag: 'https://flagcdn.com/es.svg' },
              away_team: { id: 2, name: 'Francia', flag: 'https://flagcdn.com/fr.svg' },
              phase: 'groups',
              match_date_time: '2026-06-22 23:00:00',
              final_home_goals: 2,
              final_away_goals: 1,
            },
          ],
        })
      }
      return Promise.resolve({ data: [] })
    })

    render(<MatchList />)

    await waitFor(() => {
      expect(screen.getByText('2 - 1')).toBeInTheDocument()
    })
  })
})