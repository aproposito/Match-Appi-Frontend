import { useEffect, useState } from 'react'
import { get, post, put } from '../api/client'

function ChampionPrediction() {
  const [teams, setTeams] = useState([])
  const [existingPrediction, setExistingPrediction] = useState(null)
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([get('/teams'), get('/champion-predictions')])
      .then(([teamsData, predictionsData]) => {
        setTeams(teamsData.data)
        setExistingPrediction(predictionsData.data[0] ?? null)
      })
      .catch((err) => setError(err.message))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const data = existingPrediction
        ? await put(`/champion-predictions/${existingPrediction.id}`, { team_id: Number(selectedTeamId) })
        : await post('/champion-predictions', { team_id: Number(selectedTeamId) })
      setExistingPrediction(data)
      setIsEditing(false)
    } catch (err) {
      setError(err.message)
    }
  }

  function startEditing() {
    setSelectedTeamId(String(existingPrediction.team_id))
    setIsEditing(true)
    setError('')
  }

  const showForm = !existingPrediction || isEditing

  return (
    <div className="border rounded px-3 py-2 max-w-sm w-full">
      <p className="text-xs text-gray-500 mb-2">
        Puedes cambiar tu predicción de campeón mientras dure la fase de grupos.
      </p>
      {showForm ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="border rounded px-3 py-2"
            required
          >
            <option value="">Elige un equipo</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
          <button type="submit" className="bg-blue-600 text-white rounded px-3 py-2">
            {existingPrediction ? 'Guardar cambio' : 'Predecir campeón'}
          </button>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Tu predicción de campeón: {teams.find((t) => t.id === existingPrediction.team_id)?.name}
          </p>
          <button onClick={startEditing} className="text-blue-600 underline text-sm">
            Editar
          </button>
        </div>
      )}
    </div>
  )
}

export default ChampionPrediction