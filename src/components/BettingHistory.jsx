import { useEffect, useState } from 'react'
import { get } from '../api/client'

function BettingHistory() {
  const [history, setHistory] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([get('/match-predictions'), get('/matches')])
      .then(([predictionsData, matchesData]) => {
        const resolved = predictionsData.data
          .map((prediction) => {
            const match = matchesData.data.find((m) => m.id === prediction.match_id)
            return { prediction, match }
          })
          .filter(({ match }) => match && match.final_home_goals !== null)
        setHistory(resolved)
      })
      .catch((err) => setError(err.message))
  }, [])

  if (error) {
    return <p className="text-red-600">{error}</p>
  }

  if (history.length === 0) {
    return <p className="text-gray-500">Todavía no tienes apuestas resueltas.</p>
  }

  return (
    <ul className="flex flex-col gap-3 max-w-md w-full">
      {history.map(({ prediction, match }) => {
        const totalPoints = prediction.points_sign + prediction.points_home_goals + prediction.points_away_goals
        return (
          <li key={prediction.id} className="border rounded px-3 py-2 flex flex-col gap-1">
            <div className="flex items-center justify-between text-sm">
              <span>{match.home_team.name} vs {match.away_team.name}</span>
              <span className="font-bold">{totalPoints} pts</span>
            </div>
            <div className="text-sm text-gray-500">
              Tu apuesta: {prediction.predicted_home_goals} - {prediction.predicted_away_goals}
              {' · '}
              Resultado: {match.final_home_goals} - {match.final_away_goals}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default BettingHistory