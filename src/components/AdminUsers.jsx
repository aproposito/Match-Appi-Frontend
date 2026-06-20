import { useEffect, useState } from 'react'
import { get, put, del } from '../api/client'

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    get('/users')
      .then((data) => setUsers(data.data))
      .catch((err) => setError(err.message))
  }, [])

  function handleUpdated(updatedUser) {
    setUsers((current) => current.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
  }

  function handleDeleted(userId) {
    setUsers((current) => current.filter((u) => u.id !== userId))
  }

  if (error) {
    return <p className="text-red-600">{error}</p>
  }

  return (
    <div>
      <h2 className="font-bold mb-2">Usuarios</h2>
      <ul className="flex flex-col gap-2 max-w-lg">
        {users.map((user) => (
          <UserRow key={user.id} user={user} onUpdated={handleUpdated} onDeleted={handleDeleted} />
        ))}
      </ul>
    </div>
  )
}

function UserRow({ user, onUpdated, onDeleted }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    try {
      const updated = await put(`/users/${user.id}`, { name, email })
      onUpdated(updated)
      setIsEditing(false)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete() {
    setError('')
    try {
      await del(`/users/${user.id}`)
      onDeleted(user.id)
    } catch (err) {
      setError(err.message)
    }
  }

  if (isEditing) {
    return (
      <li className="border rounded px-3 py-2">
        <form onSubmit={handleSave} className="flex flex-col gap-2">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="border rounded px-2 py-1" required />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="border rounded px-2 py-1" required />
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white rounded px-2 py-1 text-sm">Guardar</button>
            <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-300 rounded px-2 py-1 text-sm">Cancelar</button>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>
      </li>
    )
  }

  return (
    <li className="border rounded px-3 py-2 flex items-center justify-between">
      <div className="text-sm">
        <span className="font-medium">{user.name}</span> · {user.email} · <span className="text-gray-500">{user.role}</span>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setIsEditing(true)} className="text-blue-600 underline text-sm">Editar</button>
        {confirmingDelete ? (
          <>
            <button onClick={handleDelete} className="text-red-700 text-sm">Confirmar</button>
            <button onClick={() => setConfirmingDelete(false)} className="text-gray-500 text-sm">Cancelar</button>
          </>
        ) : (
          <button onClick={() => setConfirmingDelete(true)} className="text-red-700 underline text-sm">Eliminar</button>
        )}
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </li>
  )
}

export default AdminUsers