import { useEffect, useState } from 'react'
import { get } from '../api/client'
import PageLayout from './PageLayout'
import MatchCard from './MatchCard'

function BettingHistory() {
  const [history, setHistory] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([get('/match-predictions'), get('/matches?scope=all')])
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
    return (
      <PageLayout>
        <p className="text-gray-500">Todavía no tienes apuestas resueltas.</p>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <ul className="flex flex-col gap-3 max-w-md mx-auto w-full">
        {history.map(({ prediction, match }) => {
          const totalPoints = prediction.points_sign + prediction.points_home_goals + prediction.points_away_goals
          const guessedSign = prediction.points_sign > 0
          const guessedExactScore = prediction.points_home_goals > 0 && prediction.points_away_goals > 0
          const accentColor = guessedSign ? 'text-[#166534]' : 'text-gray-500'

          return (
            <MatchCard
              key={prediction.id}
              match={match}
              headerColor={guessedSign ? 'bg-[#166534]' : 'bg-gray-500'}
              footer={
                guessedExactScore && (
                  <div className="bg-[#dc2626] py-1.5 flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                    <span className="font-display text-xs font-bold uppercase tracking-wide text-white">
                      Marcador exacto
                    </span>
                  </div>
                )
              }
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase ${accentColor}`}>
                  Tu apuesta{' '}
                  <span className="font-display text-base normal-case" style={{ fontWeight: 700 }}>
                    {prediction.predicted_home_goals} — {prediction.predicted_away_goals}
                  </span>
                </span>
                <span className={`font-display text-base ${accentColor}`} style={{ fontWeight: 700 }}>
                  {totalPoints} pts
                </span>
              </div>
            </MatchCard>
          )
        })}
      </ul>
    </PageLayout>
  )
}

export default BettingHistory