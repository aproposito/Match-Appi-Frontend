import { useState } from 'react'
import { post } from '../api/client'

function hasMatchStarted(matchDateTime) {
  const utcDate = new Date(matchDateTime.replace(' ', 'T') + 'Z')
  return utcDate <= new Date()
}

function PredictionForm({ match, existingPrediction, onSaved }) {
  const [homeGoals, setHomeGoals] = useState('')
  const [awayGoals, setAwayGoals] = useState('')
  const [error, setError] = useState('')

  if (existingPrediction) {
    return (
      <p className="text-sm text-gray-600">
        Tu apuesta: {existingPrediction.predicted_home_goals} - {existingPrediction.predicted_away_goals}
      </p>
    )
  }

  if (hasMatchStarted(match.match_date_time)) {
    return <p className="text-sm text-gray-400">Apuestas cerradas</p>
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const data = await post('/match-predictions', {
        match_id: match.id,
        predicted_home_goals: Number(homeGoals),
        predicted_away_goals: Number(awayGoals),
      })
      onSaved(data)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="number"
        min="0"
        value={homeGoals}
        onChange={(e) => setHomeGoals(e.target.value)}
        className="border rounded w-14 px-2 py-1 text-center"
        required
      />
      <span>-</span>
      <input
        type="number"
        min="0"
        value={awayGoals}
        onChange={(e) => setAwayGoals(e.target.value)}
        className="border rounded w-14 px-2 py-1 text-center"
        required
      />
      <button type="submit" className="bg-blue-600 text-white rounded px-3 py-1 text-sm">
        Apostar
      </button>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  )
}

export default PredictionForm