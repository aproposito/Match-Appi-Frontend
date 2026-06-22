import { useEffect, useState } from 'react'
import { get, post, put, del } from '../api/client'
import PageLayout from './PageLayout'

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

  function handleUpdated(updatedTeam) {
    setTeams((current) => current.map((t) => (t.id === updatedTeam.id ? updatedTeam : t)))
  }

  function handleDeleted(teamId) {
    setTeams((current) => current.filter((t) => t.id !== teamId))
  }

  if (error) {
    return <p className="text-red-600">{error}</p>
  }

  return (
    <PageLayout>
      <div className="max-w-md mx-auto flex flex-col gap-4">
        {showCreateForm && (
          <section className="border rounded overflow-hidden">
            <div className="bg-[#0a0e1a] px-5 py-3">
              <span className="font-display text-sm font-bold uppercase tracking-wide text-gray-400">Crear equipo</span>
            </div>
            <form onSubmit={handleCreate} className="flex gap-2 px-5 py-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del equipo"
                className="border rounded px-3 py-2 text-sm flex-1"
                required
              />
              <input
                type="text"
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                placeholder="URL bandera (opcional)"
                className="border rounded px-3 py-2 text-sm flex-1"
              />
              <button type="submit" className="bg-[#166534] text-white rounded px-3 py-2 font-display text-sm font-bold uppercase whitespace-nowrap">
                Crear
              </button>
            </form>
          </section>
        )}
        <div className="border rounded overflow-hidden">
          <div className="bg-[#0a0e1a] px-5 py-3 grid grid-cols-[40px_1fr_100px] items-center gap-4">
            <span className="font-display text-sm font-bold uppercase tracking-wide text-gray-400">Flag</span>
            <span className="font-display text-sm font-bold uppercase tracking-wide text-gray-400">Nombre</span>
            <span></span>
          </div>
          <ul>
            {teams.map((team) => (
              <TeamRow key={team.id} team={team} onUpdated={handleUpdated} onDeleted={handleDeleted} />
            ))}
          </ul>
        </div>
      </div>
    </PageLayout>
  )
}

function TeamRow({ team, onUpdated, onDeleted }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(team.name)
  const [flag, setFlag] = useState(team.flag || '')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    try {
      const updated = await put(`/teams/${team.id}`, { name, flag: flag || null })
      onUpdated(updated)
      setIsEditing(false)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete() {
    setError('')
    try {
      await del(`/teams/${team.id}`)
      onDeleted(team.id)
    } catch (err) {
      setError(err.message)
    }
  }

  if (isEditing) {
    return (
      <li className="border-t px-5 py-3">
        <form onSubmit={handleSave} className="grid grid-cols-[40px_1fr_100px] items-center gap-4">
          <img src={flag || team.flag} alt={name} className="w-8 h-5 object-cover" />
          <div className="flex flex-col gap-1">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="border rounded px-2 py-1 text-sm" required />
            <input type="text" value={flag} onChange={(e) => setFlag(e.target.value)} placeholder="URL bandera" className="border rounded px-2 py-1 text-xs text-gray-500" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-[#1e40af] text-white rounded px-2 py-1 text-xs font-bold uppercase">Guardar</button>
            <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-700 rounded px-2 py-1 text-xs font-bold uppercase">✕</button>
          </div>
        </form>
        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
      </li>
    )
  }

  return (
    <li className="border-t px-5 py-3 grid grid-cols-[40px_1fr_100px] items-center gap-4">
      <img src={team.flag} alt={team.name} className="w-8 h-5 object-cover" />
      <span className="font-display text-sm uppercase" style={{ fontWeight: 600 }}>{team.name}</span>
      <div className="flex gap-3">
        <button onClick={() => setIsEditing(true)} className="text-[#1e40af] text-sm font-bold uppercase font-display" style={{ fontWeight: 700 }}>Editar</button>
        {confirmingDelete ? (
          <>
            <button onClick={handleDelete} className="text-[#dc2626] text-sm font-bold uppercase font-display" style={{ fontWeight: 700 }}>OK</button>
            <button onClick={() => setConfirmingDelete(false)} className="text-gray-400 text-sm">✕</button>
          </>
        ) : (
          <button onClick={() => setConfirmingDelete(true)} className="text-[#dc2626] text-sm font-bold uppercase font-display" style={{ fontWeight: 700 }}>Eliminar</button>
        )}
      </div>
      {error && <p className="text-red-600 text-xs col-span-3">{error}</p>}
    </li>
  )
}

export default TeamList