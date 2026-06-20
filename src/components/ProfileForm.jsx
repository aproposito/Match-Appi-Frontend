import { useState } from 'react'
import { put, del } from '../api/client'

function ProfileForm({ userId, currentName, currentEmail, onAccountDeleted, onLogout }) {
  const [name, setName] = useState(currentName)
  const [email, setEmail] = useState(currentEmail)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  async function handleProfileSubmit(e) {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')
    try {
      await put(`/users/${userId}`, { name, email })
      setProfileSuccess('Perfil actualizado.')
    } catch (err) {
      setProfileError(err.message)
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')
    try {
      await put(`/users/${userId}`, { password, password_confirmation: passwordConfirmation })
      setPassword('')
      setPasswordConfirmation('')
      setPasswordSuccess('Contraseña actualizada.')
    } catch (err) {
      setPasswordError(err.message)
    }
  }

  async function handleDelete() {
    setDeleteError('')
    try {
      await del(`/users/${userId}`)
      onAccountDeleted()
    } catch (err) {
      setDeleteError(err.message)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-sm w-full">
      <section>
        <h2 className="font-bold mb-2">Mis datos</h2>
        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-2">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="border rounded px-3 py-2" required />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="border rounded px-3 py-2" required />
          <button type="submit" className="bg-blue-600 text-white rounded px-3 py-2">Guardar datos</button>
          {profileError && <p className="text-red-600 text-sm">{profileError}</p>}
          {profileSuccess && <p className="text-green-600 text-sm">{profileSuccess}</p>}
        </form>
      </section>

      <section>
        <h2 className="font-bold mb-2">Cambiar contraseña</h2>
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-2">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nueva contraseña" className="border rounded px-3 py-2" required />
          <input type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} placeholder="Confirmar contraseña" className="border rounded px-3 py-2" required />
          <button type="submit" className="bg-blue-600 text-white rounded px-3 py-2">Cambiar contraseña</button>
          {passwordError && <p className="text-red-600 text-sm">{passwordError}</p>}
          {passwordSuccess && <p className="text-green-600 text-sm">{passwordSuccess}</p>}
        </form>
      </section>

      <section>
        <h2 className="font-bold mb-2 text-red-700">Eliminar cuenta</h2>
        {confirmingDelete ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-red-700">Esta acción no se puede deshacer. ¿Seguro que quieres eliminar tu cuenta?</p>
            <div className="flex gap-2">
              <button onClick={handleDelete} className="bg-red-600 text-white rounded px-3 py-2">Sí, eliminar</button>
              <button onClick={() => setConfirmingDelete(false)} className="bg-gray-300 rounded px-3 py-2">Cancelar</button>
            </div>
            {deleteError && <p className="text-red-600 text-sm">{deleteError}</p>}
          </div>
        ) : (
          <button onClick={() => setConfirmingDelete(true)} className="text-red-700 underline text-sm">
            Eliminar mi cuenta
          </button>
        )}
      </section>

      <button onClick={onLogout} className="bg-gray-600 text-white rounded px-3 py-2 self-start">
        Cerrar sesión
      </button>
    </div>
  )
}

export default ProfileForm