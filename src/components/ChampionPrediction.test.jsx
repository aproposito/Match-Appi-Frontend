import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import ChampionPrediction from './ChampionPrediction'
import * as client from '../api/client'

const teams = [
  { id: 22, name: 'España', flag: 'https://flagcdn.com/es.svg' },
  { id: 37, name: 'Portugal', flag: 'https://flagcdn.com/pt.svg' },
]

function mockGet(predictions) {
  vi.spyOn(client, 'get').mockImplementation((endpoint) => {
    if (endpoint === '/teams') {
      return Promise.resolve({ data: teams })
    }
    return Promise.resolve({ data: predictions })
  })
}

describe('ChampionPrediction', () => {
  it('muestra el formulario si no hay predicción previa', async () => {
    mockGet([])

    render(<ChampionPrediction />)

    await waitFor(() => {
      expect(screen.getByText('Predecir campeón')).toBeInTheDocument()
      expect(screen.getByText('España')).toBeInTheDocument()
    })
  })

  it('muestra la predicción existente con opción de editar', async () => {
    mockGet([{ id: 1, user_id: 1, team_id: 22, points_champion: null }])

    render(<ChampionPrediction />)

    await waitFor(() => {
      expect(screen.getByText('Tu predicción de campeón: España')).toBeInTheDocument()
      expect(screen.getByText('Editar')).toBeInTheDocument()
    })
  })

  it('envía la predicción y la muestra tras guardar con éxito', async () => {
    mockGet([])
    vi.spyOn(client, 'post').mockResolvedValue({ id: 1, user_id: 1, team_id: 37, points_champion: null })

    render(<ChampionPrediction />)

    await waitFor(() => screen.getByText('Predecir campeón'))

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '37' } })
    fireEvent.click(screen.getByText('Predecir campeón'))

    await waitFor(() => {
      expect(screen.getByText('Tu predicción de campeón: Portugal')).toBeInTheDocument()
    })
  })

  it('permite editar una predicción existente con PUT', async () => {
    mockGet([{ id: 1, user_id: 1, team_id: 22, points_champion: null }])
    vi.spyOn(client, 'put').mockResolvedValue({ id: 1, user_id: 1, team_id: 37, points_champion: null })

    render(<ChampionPrediction />)

    await waitFor(() => screen.getByText('Editar'))
    fireEvent.click(screen.getByText('Editar'))

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '37' } })
    fireEvent.click(screen.getByText('Guardar cambio'))

    await waitFor(() => {
      expect(client.put).toHaveBeenCalledWith('/champion-predictions/1', { team_id: 37 })
      expect(screen.getByText('Tu predicción de campeón: Portugal')).toBeInTheDocument()
    })
  })

  it('muestra un error si el backend rechaza la predicción por fase terminada', async () => {
    mockGet([])
    vi.spyOn(client, 'post').mockRejectedValue(new Error('La fase de grupos ha terminado.'))

    render(<ChampionPrediction />)

    await waitFor(() => screen.getByText('Predecir campeón'))

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '22' } })
    fireEvent.click(screen.getByText('Predecir campeón'))

    await waitFor(() => {
      expect(screen.getByText('La fase de grupos ha terminado.')).toBeInTheDocument()
    })
  })
})