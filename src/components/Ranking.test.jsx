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
      const rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveTextContent('Admin')
      expect(rows[2]).toHaveTextContent('Usuario Normal')
    })
  })
})