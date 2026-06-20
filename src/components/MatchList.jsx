import { useEffect, useState } from 'react'
import { get } from '../api/client'
import PredictionForm from './PredictionForm'
import ChampionPrediction from './ChampionPrediction'

function formatMatchDate(dateString) {
  const utcDate = new Date(dateString.replace(' ', 'T') + 'Z')
  return new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(utcDate)
}

function MatchList() {
  const [matches, setMatches] = useState([])
  const [predictions, setPredictions] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([get('/matches'), get('/match-predictions')])
      .then(([matchesData, predictionsData]) => {
        setMatches(matchesData.data)
        setPredictions(predictionsData.data)
      })
      .catch((err) => setError(err.message))
  }, [])

  function findPredictionFor(matchId) {
    return predictions.find((p) => p.match_id === matchId) ?? null
  }

  function handlePredictionSaved(savedPrediction) {
    setPredictions((current) => [...current, savedPrediction])
  }

  if (error) {
    return <p className="text-red-600">{error}</p>
  }

  return (
    <div className="flex flex-col gap-4 max-w-md w-full">
      <ChampionPrediction />
      <ul className="flex flex-col gap-3">
        {matches.map((match) => (
          <li key={match.id} className="border rounded px-3 py-2 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={match.home_team.flag} alt={match.home_team.name} className="w-6 h-4 object-cover" />
                <span>{match.home_team.name}</span>
              </div>
              <span className="text-sm text-gray-500">
                {match.final_home_goals !== null
                  ? `${match.final_home_goals} - ${match.final_away_goals}`
                  : formatMatchDate(match.match_date_time)}
              </span>
              <div className="flex items-center gap-2">
                <span>{match.away_team.name}</span>
                <img src={match.away_team.flag} alt={match.away_team.name} className="w-6 h-4 object-cover" />
              </div>
            </div>
            <PredictionForm
              match={match}
              existingPrediction={findPredictionFor(match.id)}
              onSaved={handlePredictionSaved}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MatchList