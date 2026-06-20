import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import PredictionForm from './PredictionForm'
import * as client from '../api/client'

const futureMatch = { id: 1, match_date_time: '2099-01-01 12:00:00' }
const pastMatch = { id: 2, match_date_time: '2020-01-01 12:00:00' }

describe('PredictionForm', () => {
  it('muestra el formulario si el partido no ha empezado y no hay predicción previa', () => {
    render(<PredictionForm match={futureMatch} existingPrediction={null} onSaved={vi.fn()} />)
    expect(screen.getByText('Apostar')).toBeInTheDocument()
  })

  it('muestra "Apuestas cerradas" si el partido ya empezó', () => {
    render(<PredictionForm match={pastMatch} existingPrediction={null} onSaved={vi.fn()} />)
    expect(screen.getByText('Apuestas cerradas')).toBeInTheDocument()
  })

  it('muestra la predicción existente en vez del formulario', () => {
    const existingPrediction = { predicted_home_goals: 2, predicted_away_goals: 1 }
    render(<PredictionForm match={futureMatch} existingPrediction={existingPrediction} onSaved={vi.fn()} />)
    expect(screen.getByText('Tu apuesta: 2 - 1')).toBeInTheDocument()
  })

  it('envía la predicción y llama a onSaved tras un guardado correcto', async () => {
    vi.spyOn(client, 'post').mockResolvedValue({ id: 1, match_id: 1, predicted_home_goals: 3, predicted_away_goals: 0 })
    const onSaved = vi.fn()

    render(<PredictionForm match={futureMatch} existingPrediction={null} onSaved={onSaved} />)

    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: '3' } })
    fireEvent.change(inputs[1], { target: { value: '0' } })
    fireEvent.click(screen.getByText('Apostar'))

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledWith({ id: 1, match_id: 1, predicted_home_goals: 3, predicted_away_goals: 0 })
    })
  })

  it('muestra un error si el backend rechaza la predicción', async () => {
    vi.spyOn(client, 'post').mockRejectedValue(new Error('No puedes apostar a un partido que ya ha empezado.'))

    render(<PredictionForm match={futureMatch} existingPrediction={null} onSaved={vi.fn()} />)

    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: '1' } })
    fireEvent.change(inputs[1], { target: { value: '1' } })
    fireEvent.click(screen.getByText('Apostar'))

    await waitFor(() => {
      expect(screen.getByText('No puedes apostar a un partido que ya ha empezado.')).toBeInTheDocument()
    })
  })
})