import { useEffect, useState } from 'react'
import { get, post, put } from '../api/client'

function AdminMatches() {
  const [teams, setTeams] = useState([])
  const [matches, setMatches] = useState([])
  const [homeTeamId, setHomeTeamId] = useState('')
  const [awayTeamId, setAwayTeamId] = useState('')
  const [phase, setPhase] = useState('groups')
  const [matchDateTime, setMatchDateTime] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([get('/teams'), get('/matches')])
      .then(([teamsData, matchesData]) => {
        setTeams(teamsData.data)
        setMatches(matchesData.data)
      })
      .catch((err) => setError(err.message))
  }, [])

  async function handleCreateMatch(e) {
    e.preventDefault()
    setError('')
    try {
      const newMatch = await post('/matches', {
        home_team_id: Number(homeTeamId),
        away_team_id: Number(awayTeamId),
        phase,
        match_date_time: matchDateTime,
      })
      setMatches((current) => [...current, newMatch])
      setHomeTeamId('')
      setAwayTeamId('')
      setMatchDateTime('')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleSetResult(matchId, homeGoals, awayGoals) {
    setError('')
    try {
      const updated = await put(`/matches/${matchId}`, {
        final_home_goals: Number(homeGoals),
        final_away_goals: Number(awayGoals),
      })
      setMatches((current) => current.map((m) => (m.id === matchId ? updated : m)))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="font-bold mb-2">Crear partido</h2>
        <form onSubmit={handleCreateMatch} className="flex flex-col gap-2 max-w-sm">
          <select value={homeTeamId} onChange={(e) => setHomeTeamId(e.target.value)} className="border rounded px-3 py-2" required>
            <option value="">Equipo local</option>
            {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
          <select value={awayTeamId} onChange={(e) => setAwayTeamId(e.target.value)} className="border rounded px-3 py-2" required>
            <option value="">Equipo visitante</option>
            {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
          <select value={phase} onChange={(e) => setPhase(e.target.value)} className="border rounded px-3 py-2">
            <option value="groups">Grupos</option>
            <option value="round_of_16">Octavos</option>
            <option value="quarters">Cuartos</option>
            <option value="semis">Semis</option>
            <option value="final">Final</option>
          </select>
          <input
            type="datetime-local"
            value={matchDateTime}
            onChange={(e) => setMatchDateTime(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
          <button type="submit" className="bg-blue-600 text-white rounded px-3 py-2">
            Crear partido
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-bold mb-2">Partidos</h2>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <ul className="flex flex-col gap-2 max-w-md">
          {matches.map((match) => (
            <MatchResultRow key={match.id} match={match} onSetResult={handleSetResult} />
          ))}
        </ul>
      </section>
    </div>
  )
}

function MatchResultRow({ match, onSetResult }) {
  const [homeGoals, setHomeGoals] = useState(match.final_home_goals ?? '')
  const [awayGoals, setAwayGoals] = useState(match.final_away_goals ?? '')

  function handleSubmit(e) {
    e.preventDefault()
    onSetResult(match.id, homeGoals, awayGoals)
  }

  return (
    <li className="border rounded px-3 py-2 flex items-center justify-between gap-2">
      <span className="text-sm">{match.home_team.name} vs {match.away_team.name}</span>
      <form onSubmit={handleSubmit} className="flex items-center gap-1">
        <input type="number" min="0" value={homeGoals} onChange={(e) => setHomeGoals(e.target.value)} className="border rounded w-12 px-1 text-center" required />
        <span>-</span>
        <input type="number" min="0" value={awayGoals} onChange={(e) => setAwayGoals(e.target.value)} className="border rounded w-12 px-1 text-center" required />
        <button type="submit" className="bg-gray-600 text-white rounded px-2 py-1 text-xs">Guardar</button>
      </form>
    </li>
  )
}

export default AdminMatches