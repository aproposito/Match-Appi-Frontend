import { useEffect, useState } from 'react'
import { get } from '../api/client'
import PredictionForm from './PredictionForm'
import ChampionPrediction from './ChampionPrediction'
import PageLayout from './PageLayout'
import MatchCard from './MatchCard'

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
    setPredictions((current) => {
      const exists = current.some((p) => p.id === savedPrediction.id)
      return exists
        ? current.map((p) => (p.id === savedPrediction.id ? savedPrediction : p))
        : [...current, savedPrediction]
    })
  }

  if (error) {
    return <p className="text-red-600">{error}</p>
  }

  return (
    <PageLayout>
      <div className="flex justify-between items-start gap-12">
        <ul className="flex flex-col gap-3 max-w-md w-full mx-auto">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match}>
              <PredictionForm
                match={match}
                existingPrediction={findPredictionFor(match.id)}
                onSaved={handlePredictionSaved}
              />
            </MatchCard>
          ))}
        </ul>
        <ChampionPrediction />
      </div>
    </PageLayout>
  )
}

export default MatchList