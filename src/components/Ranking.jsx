import { useEffect, useState } from 'react'
import { get } from '../api/client'

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
    <table className="w-full max-w-md border-collapse">
      <thead>
        <tr className="border-b">
          <th className="text-left py-2">Usuario</th>
          <th className="text-right py-2">Puntos</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user, index) => (
          <tr key={user.id} className="border-b">
            <td className="py-2">{index + 1}. {user.name}</td>
            <td className="text-right py-2">{user.total_points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default Ranking