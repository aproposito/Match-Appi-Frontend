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
    <div className="w-56 shrink-0">
      <div className="bg-[#0a0e1a] text-white px-3 py-2 rounded-t flex items-center gap-2">
        <span>🏆</span>
        <span className="text-xs font-bold uppercase">Campeón del Mundial</span>
      </div>
      <div className="border border-t-0 rounded-b px-3 py-3 flex flex-col gap-2">
        <p className="text-xs text-gray-500">
          Puedes cambiar tu predicción de campeón mientras dure la fase de grupos.
        </p>
        {showForm ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
              required
            >
              <option value="">Elige un equipo</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
            <button type="submit" className="bg-[#1e40af] text-white rounded px-3 py-1 text-sm font-bold uppercase">
              {existingPrediction ? 'Actualizar' : 'Predecir campeón'}
            </button>
            {error && <p className="text-red-600 text-xs">{error}</p>}
          </form>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2">
            <img
              src={teams.find((t) => t.id === existingPrediction.team_id)?.flag}
              alt={teams.find((t) => t.id === existingPrediction.team_id)?.name}
              className="w-9 h-6 object-cover shadow-sm"
            />
            <span className="font-display text-lg uppercase text-center" style={{ fontWeight: 600 }}>
              {teams.find((t) => t.id === existingPrediction.team_id)?.name}
            </span>
            <button onClick={startEditing} className="bg-[#1e40af] text-white rounded px-3 py-1 text-xs font-bold uppercase font-display w-full">
              Actualizar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChampionPrediction