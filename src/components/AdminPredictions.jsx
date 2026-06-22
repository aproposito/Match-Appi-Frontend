import { useEffect, useState } from 'react'
import { get } from '../api/client'
import PageLayout from './PageLayout'
import MatchCard from './MatchCard'

function AdminPredictions() {
  const [predictions, setPredictions] = useState([])
  const [matches, setMatches] = useState([])
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([get('/match-predictions'), get('/matches?scope=all'), get('/users')])
      .then(([predictionsData, matchesData, usersData]) => {
        setPredictions(predictionsData.data)
        setMatches(matchesData.data)
        setUsers(usersData.data)
      })
      .catch((err) => setError(err.message))
  }, [])

  if (error) {
    return <p className="text-red-600">{error}</p>
  }

  if (predictions.length === 0) {
    return (
      <PageLayout>
        <p className="text-gray-500">No hay apuestas registradas.</p>
      </PageLayout>
    )
  }

  const filteredPredictions = selectedUserId
    ? predictions.filter((p) => p.user_id === Number(selectedUserId))
    : predictions

  return (
    <PageLayout>
      <div className="max-w-md mx-auto flex flex-col gap-4">
        <div className="border rounded overflow-hidden">
          <div className="bg-[#0a0e1a] px-5 py-3">
            <span className="font-display text-sm font-bold uppercase tracking-wide text-gray-400">Filtrar por usuario</span>
          </div>
          <div className="px-5 py-3">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="border rounded px-3 py-2 font-display text-sm bg-white w-full"
            >
              <option value="">Todos los usuarios</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
        </div>
        <ul className="flex flex-col gap-3 w-full">
          {filteredPredictions.map((prediction) => {
            const match = matches.find((m) => m.id === prediction.match_id)
            const user = users.find((u) => u.id === prediction.user_id)
            if (!match) return null

            const isResolved = match.final_home_goals !== null
            const totalPoints = isResolved
              ? prediction.points_sign + prediction.points_home_goals + prediction.points_away_goals
              : null
            const guessedSign = isResolved && prediction.points_sign > 0
            const guessedExactScore = isResolved && prediction.points_home_goals > 0 && prediction.points_away_goals > 0
            const accentColor = !isResolved ? 'text-gray-500' : guessedSign ? 'text-[#166534]' : 'text-gray-500'

            return (
              <MatchCard
                key={prediction.id}
                match={match}
                headerColor={isResolved
                  ? guessedSign ? 'bg-[#166534]' : 'bg-gray-500'
                  : undefined
                }
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
                  <div className="flex flex-col gap-0.5">
                    <span className="font-display text-sm font-bold uppercase" style={{ fontWeight: 700 }}>
                      {user ? user.name : `#${prediction.user_id}`}
                    </span>
                    <span className={`text-xs font-bold uppercase ${accentColor}`}>
                      Apuesta{' '}
                      <span className="font-display text-base normal-case" style={{ fontWeight: 700 }}>
                        {prediction.predicted_home_goals} — {prediction.predicted_away_goals}
                      </span>
                    </span>
                  </div>
                  {isResolved && (
                    <span className={`font-display text-base ${accentColor}`} style={{ fontWeight: 700 }}>
                      {totalPoints} pts
                    </span>
                  )}
                </div>
              </MatchCard>
            )
          })}
        </ul>
      </div>
    </PageLayout>
  )
}

export default AdminPredictions