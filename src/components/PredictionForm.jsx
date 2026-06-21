import { useState } from 'react'
import { post, put } from '../api/client'

function hasMatchStarted(matchDateTime) {
  const utcDate = new Date(matchDateTime.replace(' ', 'T') + 'Z')
  return utcDate <= new Date()
}

function PredictionForm({ match, existingPrediction, onSaved }) {
  const [homeGoals, setHomeGoals] = useState('')
  const [awayGoals, setAwayGoals] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')

  const matchStarted = hasMatchStarted(match.match_date_time)

  if (existingPrediction && !isEditing) {
    const isResolved = match.final_home_goals !== null
    const totalPoints =
      (existingPrediction.points_sign ?? 0) +
      (existingPrediction.points_home_goals ?? 0) +
      (existingPrediction.points_away_goals ?? 0)

    return (
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-gray-500 uppercase font-bold">Tu apuesta</span>
          <span className="text-lg font-bold text-blue-700">
            {existingPrediction.predicted_home_goals} — {existingPrediction.predicted_away_goals}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isResolved && <span className="text-sm font-bold text-[#15803d]">{totalPoints} pts</span>}
          {!matchStarted && (
            <button
              onClick={() => {
                setHomeGoals(String(existingPrediction.predicted_home_goals))
                setAwayGoals(String(existingPrediction.predicted_away_goals))
                setIsEditing(true)
                setError('')
              }}
              className="text-blue-600 underline text-sm"
            >
              Editar
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!existingPrediction && matchStarted) {
    return <p className="text-sm text-gray-400">Apuestas cerradas</p>
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const data = existingPrediction
        ? await put(`/match-predictions/${existingPrediction.id}`, {
            predicted_home_goals: Number(homeGoals),
            predicted_away_goals: Number(awayGoals),
          })
        : await post('/match-predictions', {
            match_id: match.id,
            predicted_home_goals: Number(homeGoals),
            predicted_away_goals: Number(awayGoals),
          })
      onSaved(data)
      setIsEditing(false)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center justify-center gap-2">
      <span className="text-xs text-gray-500 uppercase font-bold mr-1">Tu apuesta:</span>
      <input
        type="number"
        min="0"
        value={homeGoals}
        onChange={(e) => setHomeGoals(e.target.value)}
        className="border rounded w-14 px-2 py-1 text-center"
        required
      />
      <span>—</span>
      <input
        type="number"
        min="0"
        value={awayGoals}
        onChange={(e) => setAwayGoals(e.target.value)}
        className="border rounded w-14 px-2 py-1 text-center"
        required
      />
      <button
        type="submit"
        className={`text-white rounded px-3 py-1 text-sm font-bold uppercase ${
          existingPrediction ? 'bg-[#1e40af]' : 'bg-[#166534]'
        }`}
      >
        {existingPrediction ? 'Actualizar' : 'Apostar'}
      </button>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  )
}

export default PredictionForm