import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import PredictionForm from './PredictionForm'
import * as client from '../api/client'

const futureMatch = { id: 1, match_date_time: '2099-01-01 12:00:00', final_home_goals: null, final_away_goals: null }
const pastMatch = { id: 2, match_date_time: '2020-01-01 12:00:00', final_home_goals: null, final_away_goals: null }
const resolvedFutureWindowMatch = { id: 3, match_date_time: '2099-01-01 12:00:00', final_home_goals: 2, final_away_goals: 1 }

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('PredictionForm', () => {
  it('muestra el formulario si el partido no ha empezado y no hay predicción previa', () => {
    render(<PredictionForm match={futureMatch} existingPrediction={null} onSaved={vi.fn()} />)
    expect(screen.getByText('Apostar')).toBeInTheDocument()
  })

  it('muestra "Apuestas cerradas" si el partido ya empezó y no hay predicción previa', () => {
    render(<PredictionForm match={pastMatch} existingPrediction={null} onSaved={vi.fn()} />)
    expect(screen.getByText('Apuestas cerradas')).toBeInTheDocument()
  })

  it('muestra la predicción existente en vez del formulario', () => {
    const existingPrediction = { id: 10, predicted_home_goals: 2, predicted_away_goals: 1 }
    render(<PredictionForm match={futureMatch} existingPrediction={existingPrediction} onSaved={vi.fn()} />)
    expect(screen.getByText('Tu apuesta')).toBeInTheDocument()
    expect(screen.getByText(/2 — 1/)).toBeInTheDocument()
  })

  it('muestra los puntos totales cuando el partido está resuelto', () => {
    const existingPrediction = {
      id: 10,
      predicted_home_goals: 2,
      predicted_away_goals: 1,
      points_sign: 50,
      points_home_goals: 20,
      points_away_goals: 0,
    }
    render(<PredictionForm match={resolvedFutureWindowMatch} existingPrediction={existingPrediction} onSaved={vi.fn()} />)
    expect(screen.getByText(/2 — 1/)).toBeInTheDocument()
    expect(screen.getByText('70 pts')).toBeInTheDocument()
  })
  it('no muestra el botón Editar si el partido ya empezó', () => {
    const existingPrediction = { id: 10, predicted_home_goals: 2, predicted_away_goals: 1 }
    render(<PredictionForm match={pastMatch} existingPrediction={existingPrediction} onSaved={vi.fn()} />)
    expect(screen.queryByText('Editar')).not.toBeInTheDocument()
  })

  it('envía la predicción y llama a onSaved tras un guardado correcto', async () => {
    vi.spyOn(client, 'post').mockResolvedValue({ id: 1, match_id: 1, predicted_home_goals: 3, predicted_away_goals: 0 })
    const onSaved = vi.fn()

    render(<PredictionForm match={futureMatch} existingPrediction={null} onSaved={onSaved} />)

    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: '3' } })
    fireEvent.change(inputs[1], { target: { value: '0' } })
    fireEvent.click(screen.getByRole('button', { name: 'Apostar' }))

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledWith({ id: 1, match_id: 1, predicted_home_goals: 3, predicted_away_goals: 0 })
    })
  })

  it('muestra un error si el backend rechaza la predicción nueva', async () => {
    vi.spyOn(client, 'post').mockRejectedValue(new Error('No puedes apostar a un partido que ya ha empezado.'))

    render(<PredictionForm match={futureMatch} existingPrediction={null} onSaved={vi.fn()} />)

    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: '1' } })
    fireEvent.change(inputs[1], { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Apostar' }))

    await waitFor(() => {
      expect(screen.getByText('No puedes apostar a un partido que ya ha empezado.')).toBeInTheDocument()
    })
  })

  it('al clicar Editar precarga los inputs con la predicción existente', () => {
    const existingPrediction = { id: 10, predicted_home_goals: 2, predicted_away_goals: 1 }
    render(<PredictionForm match={futureMatch} existingPrediction={existingPrediction} onSaved={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }))

    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs[0]).toHaveValue(2)
    expect(inputs[1]).toHaveValue(1)
    expect(screen.getByRole('button', { name: 'Actualizar' })).toBeInTheDocument()
  })

  it('al editar y guardar, llama a put con el id existente y vuelve a la vista de texto', async () => {
    const existingPrediction = { id: 10, predicted_home_goals: 2, predicted_away_goals: 1 }
    vi.spyOn(client, 'put').mockResolvedValue({ id: 10, predicted_home_goals: 4, predicted_away_goals: 2 })
    const onSaved = vi.fn()

    render(<PredictionForm match={futureMatch} existingPrediction={existingPrediction} onSaved={onSaved} />)

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }))

    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: '4' } })
    fireEvent.change(inputs[1], { target: { value: '2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }))

    await waitFor(() => {
      expect(client.put).toHaveBeenCalledWith('/match-predictions/10', {
        predicted_home_goals: 4,
        predicted_away_goals: 2,
      })
      expect(onSaved).toHaveBeenCalledWith({ id: 10, predicted_home_goals: 4, predicted_away_goals: 2 })
    })
  })

  it('muestra un error si el backend rechaza la edición', async () => {
    const existingPrediction = { id: 10, predicted_home_goals: 2, predicted_away_goals: 1 }
    vi.spyOn(client, 'put').mockRejectedValue(new Error('No puedes editar una predicción de un partido que ya ha empezado.'))

    render(<PredictionForm match={futureMatch} existingPrediction={existingPrediction} onSaved={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }))

    await waitFor(() => {
      expect(screen.getByText('No puedes editar una predicción de un partido que ya ha empezado.')).toBeInTheDocument()
    })
  })
})