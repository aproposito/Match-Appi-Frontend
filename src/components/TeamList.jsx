import { useEffect, useState } from 'react'
import { get, post } from '../api/client'

function TeamList({ showCreateForm = false }) {
  const [teams, setTeams] = useState([])
  const [name, setName] = useState('')
  const [flag, setFlag] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    get('/teams')
      .then((data) => setTeams(data.data))
      .catch((err) => setError(err.message))
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    try {
      const newTeam = await post('/teams', { name, flag: flag || null })
      setTeams((current) => [...current, newTeam])
      setName('')
      setFlag('')
    } catch (err) {
      setError(err.message)
    }
  }

  if (error) {
    return <p className="text-red-600">{error}</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {showCreateForm && (
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del equipo"
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="text"
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
            placeholder="URL de la bandera (opcional)"
            className="border rounded px-3 py-2"
          />
          <button type="submit" className="bg-blue-600 text-white rounded px-3 py-2">
            Crear equipo
          </button>
        </form>
      )}
      <ul className="grid grid-cols-2 gap-3 max-w-md">
        {teams.map((team) => (
          <li key={team.id} className="flex items-center gap-2 border rounded px-3 py-2">
            <img src={team.flag} alt={team.name} className="w-6 h-4 object-cover" />
            <span>{team.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TeamList