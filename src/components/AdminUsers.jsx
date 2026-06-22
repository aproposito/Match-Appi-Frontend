import { useEffect, useState } from 'react'
import { get, put, del } from '../api/client'
import PageLayout from './PageLayout'

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
    <PageLayout>
      <div className="max-w-lg mx-auto border rounded overflow-hidden">
        <div className="bg-[#0a0e1a] px-5 py-3 grid grid-cols-[1fr_1fr_80px_120px] items-center gap-4">
          <span className="font-display text-sm font-bold uppercase tracking-wide text-gray-400">Nombre</span>
          <span className="font-display text-sm font-bold uppercase tracking-wide text-gray-400">Email</span>
          <span className="font-display text-sm font-bold uppercase tracking-wide text-gray-400">Rol</span>
          <span></span>
        </div>
        <ul>
          {users.map((user) => (
            <UserRow key={user.id} user={user} onUpdated={handleUpdated} onDeleted={handleDeleted} />
          ))}
        </ul>
      </div>
    </PageLayout>
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
      <li className="border-t px-5 py-3">
        <form onSubmit={handleSave} className="grid grid-cols-[1fr_1fr_80px_120px] items-center gap-4">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="border rounded px-2 py-1 text-sm" required />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="border rounded px-2 py-1 text-sm" required />
          <span className="font-display text-sm uppercase text-gray-500" style={{ fontWeight: 600 }}>{user.role}</span>
          <div className="flex gap-2">
            <button type="submit" className="bg-[#1e40af] text-white rounded px-2 py-1 text-xs font-bold uppercase">Guardar</button>
            <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-700 rounded px-2 py-1 text-xs font-bold uppercase">Cancelar</button>
          </div>
        </form>
        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
      </li>
    )
  }

  return (
    <li className="border-t px-5 py-3 grid grid-cols-[1fr_1fr_80px_120px] items-center gap-4">
      <span className="font-display text-sm uppercase" style={{ fontWeight: 600 }}>{user.name}</span>
      <span className="text-sm text-gray-500 truncate">{user.email}</span>
      <span className="font-display text-xs uppercase text-gray-400" style={{ fontWeight: 600 }}>{user.role}</span>
      <div className="flex gap-3 items-center">
        <button onClick={() => setIsEditing(true)} className="text-[#1e40af] text-sm font-bold uppercase font-display" style={{ fontWeight: 700 }}>Editar</button>
        {confirmingDelete ? (
          <>
            <button onClick={handleDelete} className="text-[#dc2626] text-sm font-bold uppercase font-display" style={{ fontWeight: 700 }}>Confirmar</button>
            <button onClick={() => setConfirmingDelete(false)} className="text-gray-400 text-sm">✕</button>
          </>
        ) : (
          <button onClick={() => setConfirmingDelete(true)} className="text-[#dc2626] text-sm font-bold uppercase font-display" style={{ fontWeight: 700 }}>Eliminar</button>
        )}
      </div>
      {error && <p className="text-red-600 text-xs col-span-4">{error}</p>}
    </li>
  )
}

export default AdminUsers