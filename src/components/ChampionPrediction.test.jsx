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

  it('muestra la predicción existente con su bandera y opción de actualizar', async () => {
    mockGet([{ id: 1, user_id: 1, team_id: 22, points_champion: null }])

    const { container } = render(<ChampionPrediction />)

    await waitFor(() => {
      expect(screen.getByText('Tu campeón:')).toBeInTheDocument()
      expect(screen.getByText('España')).toBeInTheDocument()
      expect(container.querySelector('img')).toHaveAttribute('src', 'https://flagcdn.com/es.svg')
      expect(screen.getByRole('button', { name: 'Actualizar' })).toBeInTheDocument()
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
      expect(screen.getByText('Tu campeón:')).toBeInTheDocument()
      expect(screen.getByText('Portugal')).toBeInTheDocument()
    })
  })

  it('permite editar una predicción existente con PUT', async () => {
    mockGet([{ id: 1, user_id: 1, team_id: 22, points_champion: null }])
    vi.spyOn(client, 'put').mockResolvedValue({ id: 1, user_id: 1, team_id: 37, points_champion: null })

    render(<ChampionPrediction />)

    await waitFor(() => screen.getByRole('button', { name: 'Actualizar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }))

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '37' } })
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }))

    await waitFor(() => {
      expect(client.put).toHaveBeenCalledWith('/champion-predictions/1', { team_id: 37 })
      expect(screen.getByText('Portugal')).toBeInTheDocument()
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