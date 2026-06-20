import { useEffect, useState } from 'react'
import { get } from '../api/client'

function AdminPredictions() {
  const [predictions, setPredictions] = useState([])
  const [matches, setMatches] = useState([])
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([get('/match-predictions'), get('/matches'), get('/users')])
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

  return (
    <div>
      <h2 className="font-bold mb-2">Apuestas de todos los usuarios</h2>
      <ul className="flex flex-col gap-2 max-w-lg">
        {predictions.map((prediction) => {
          const match = matches.find((m) => m.id === prediction.match_id)
          const user = users.find((u) => u.id === prediction.user_id)
          const isResolved = match && match.final_home_goals !== null
          const totalPoints = isResolved
            ? prediction.points_sign + prediction.points_home_goals + prediction.points_away_goals
            : null

          return (
            <li key={prediction.id} className="border rounded px-3 py-2 text-sm flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{user ? user.name : `usuario #${prediction.user_id}`}</span>
                {isResolved && <span className="font-bold">{totalPoints} pts</span>}
              </div>
              <div className="text-gray-600">
                {match ? `${match.home_team.name} vs ${match.away_team.name}` : `partido #${prediction.match_id}`}
                {' · '}
                Apostó: {prediction.predicted_home_goals} - {prediction.predicted_away_goals}
                {isResolved && ` · Resultado: ${match.final_home_goals} - ${match.final_away_goals}`}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default AdminPredictions