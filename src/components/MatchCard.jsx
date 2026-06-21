function formatMatchDate(dateString) {
  const utcDate = new Date(dateString.replace(' ', 'T') + 'Z')
  return new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(utcDate)
}

const PHASE_LABELS = {
  groups: 'Grupos',
  round_of_16: 'Octavos',
  quarters: 'Cuartos',
  semis: 'Semifinal',
  final: 'Final',
}

function MatchCard({ match, children, headerColor, footer }) {
  const isResolved = match.final_home_goals !== null
  const defaultColor = isResolved ? 'bg-gray-500' : 'bg-[#15803d]'

  return (
    <li className="border rounded overflow-hidden">
      <div
        className={`flex items-center justify-between px-3 py-1 font-display text-sm font-bold uppercase tracking-wide text-white ${
          headerColor ?? defaultColor
        }`}
      >
        <span>{isResolved ? 'Terminado' : 'Por jugar'}</span>
        <span className="font-normal normal-case">{formatMatchDate(match.match_date_time)}</span>
        <span>{PHASE_LABELS[match.phase] ?? match.phase}</span>
      </div>
      <div className="flex items-center justify-center gap-8 px-5 py-4">
        <div className="flex flex-col items-center gap-2 w-28">
          <img src={match.home_team.flag} alt={match.home_team.name} className="w-9 h-6 object-cover shadow-sm" />
          <span className="font-display text-lg uppercase text-center" style={{ fontWeight: 600 }}>{match.home_team.name}</span>
        </div>
        {isResolved ? (
          <span className="text-3xl font-bold">
            {match.final_home_goals} — {match.final_away_goals}
          </span>
        ) : (
          <span className="text-xs text-gray-500 font-bold">vs</span>
        )}
        <div className="flex flex-col items-center gap-2 w-28">
          <img src={match.away_team.flag} alt={match.away_team.name} className="w-9 h-6 object-cover shadow-sm" />
          <span className="font-display text-lg uppercase text-center" style={{ fontWeight: 600 }}>{match.away_team.name}</span>
        </div>
      </div>
      <div className="border-t px-4 py-2">
        {children}
      </div>
      {footer}
    </li>
  )
}

export default MatchCard