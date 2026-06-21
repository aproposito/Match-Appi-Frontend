import { useEffect, useState } from 'react'
import { get } from '../api/client'
import PageLayout from './PageLayout'

const TOP_THREE_STYLES = {
  1: { bg: 'bg-red-50', border: 'border-red-200', color: '#dc2626' },
  2: { bg: 'bg-blue-50', border: 'border-blue-200', color: '#1e40af' },
  3: { bg: 'bg-green-50', border: 'border-green-200', color: '#166534' },
}

function Ranking() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    get('/ranking')
      .then((data) => {
        const sorted = [...data.data].sort((a, b) => b.total_points - a.total_points)
        setUsers(sorted)
      })
      .catch((err) => setError(err.message))
  }, [])

  if (error) {
    return <p className="text-red-600">{error}</p>
  }

  return (
    <PageLayout>
      <div className="max-w-md mx-auto border rounded overflow-hidden">
        <div className="bg-[#0a0e1a] px-5 py-3 flex justify-between items-center">
          <span className="font-display text-sm font-bold uppercase tracking-wide text-gray-400">Jugador</span>
          <span className="font-display text-sm font-bold uppercase tracking-wide text-gray-400">Pts</span>
        </div>
        {users.map((user, index) => {
          const position = index + 1
          const isLeader = position === 1
          const topStyle = TOP_THREE_STYLES[position]

          return (
            <div
              key={user.id}
              className={`flex items-center justify-between px-5 border-b last:border-b-0 ${
                topStyle ? `${topStyle.bg} ${topStyle.border}` : ''
              } ${isLeader ? 'py-4' : 'py-3'}`}
            >
              <div className="flex items-center gap-4">
                <span
                  className="font-display"
                  style={{
                    fontWeight: 900,
                    fontSize: isLeader ? '26px' : topStyle ? '22px' : '14px',
                    color: topStyle ? topStyle.color : '#9ca3af',
                    width: '28px',
                  }}
                >
                  {position}
                </span>
                <span
                  className="font-display uppercase"
                  style={{ fontWeight: isLeader ? 700 : 600, fontSize: isLeader ? '18px' : topStyle ? '16px' : '14px' }}
                >
                  {user.name}
                </span>
                {isLeader && (
                  <span className="text-xs font-bold bg-[#dc2626] text-white px-2 py-0.5 rounded uppercase tracking-wide">
                    Líder
                  </span>
                )}
              </div>
              <span
                className="font-display"
                style={{
                  fontWeight: isLeader ? 700 : 600,
                  fontSize: isLeader ? '20px' : topStyle ? '16px' : '14px',
                  color: topStyle ? topStyle.color : undefined,
                }}
              >
                {user.total_points}
              </span>
            </div>
          )
        })}
      </div>
    </PageLayout>
  )
}

export default Ranking