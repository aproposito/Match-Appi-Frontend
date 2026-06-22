import { useEffect, useState } from 'react'
import { get, post, put } from '../api/client'
import PageLayout from './PageLayout'
import MatchCard from './MatchCard'

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

  const selectClass = "border rounded px-3 py-2 font-display text-sm bg-white w-full"

  return (
    <PageLayout>
      <div className="max-w-md mx-auto flex flex-col gap-6">
        <section className="border rounded overflow-hidden">
          <div className="bg-[#0a0e1a] px-5 py-3">
            <span className="font-display text-sm font-bold uppercase tracking-wide text-gray-400">Crear partido</span>
          </div>
          <form onSubmit={handleCreateMatch} className="flex flex-col gap-3 px-5 py-4">
            <select value={homeTeamId} onChange={(e) => setHomeTeamId(e.target.value)} className={selectClass} required>
              <option value="">Equipo local</option>
              {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
            <select value={awayTeamId} onChange={(e) => setAwayTeamId(e.target.value)} className={selectClass} required>
              <option value="">Equipo visitante</option>
              {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
            <select value={phase} onChange={(e) => setPhase(e.target.value)} className={selectClass}>
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
              className={selectClass}
              required
            />
            <button type="submit" className="bg-[#166534] text-white rounded px-3 py-2 font-display text-sm font-bold uppercase">
              Crear partido
            </button>
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </form>
        </section>

        <ul className="flex flex-col gap-3">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match}>
              <MatchResultRow match={match} onSetResult={handleSetResult} />
            </MatchCard>
          ))}
        </ul>
      </div>
    </PageLayout>
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
    <form onSubmit={handleSubmit} className="flex items-center justify-center gap-3">
      <span className="text-xs font-bold uppercase text-gray-500 font-display" style={{ fontWeight: 600 }}>Resultado</span>
      <input type="number" min="0" value={homeGoals} onChange={(e) => setHomeGoals(e.target.value)} className="border rounded w-14 px-2 py-1 text-center" required />
      <span className="text-gray-400">—</span>
      <input type="number" min="0" value={awayGoals} onChange={(e) => setAwayGoals(e.target.value)} className="border rounded w-14 px-2 py-1 text-center" required />
      <button type="submit" className="bg-[#1e40af] text-white rounded px-3 py-1 text-xs font-bold uppercase">
        Guardar
      </button>
    </form>
  )
}

export default AdminMatches