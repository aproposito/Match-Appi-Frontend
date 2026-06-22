import { useState } from 'react'
import { put, del } from '../api/client'
import PageLayout from './PageLayout'

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

  const inputClass = "border rounded px-3 py-2 text-sm w-full"
  const sectionHeaderClass = "bg-[#0a0e1a] px-5 py-3"
  const sectionLabelClass = "font-display text-sm font-bold uppercase tracking-wide text-gray-400"

  return (
    <PageLayout>
      <div className="max-w-sm mx-auto flex flex-col gap-4">

        <section className="border rounded overflow-hidden">
          <div className={sectionHeaderClass}>
            <span className={sectionLabelClass}>Mis datos</span>
          </div>
          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-3 px-5 py-4">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
            <button type="submit" className="bg-[#1e40af] text-white rounded px-3 py-2 font-display text-sm font-bold uppercase">
              Guardar datos
            </button>
            {profileError && <p className="text-red-600 text-sm">{profileError}</p>}
            {profileSuccess && <p className="text-[#166534] text-sm">{profileSuccess}</p>}
          </form>
        </section>

        <section className="border rounded overflow-hidden">
          <div className={sectionHeaderClass}>
            <span className={sectionLabelClass}>Cambiar contraseña</span>
          </div>
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3 px-5 py-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nueva contraseña" className={inputClass} required />
            <input type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} placeholder="Confirmar contraseña" className={inputClass} required />
            <button type="submit" className="bg-[#1e40af] text-white rounded px-3 py-2 font-display text-sm font-bold uppercase">
              Cambiar contraseña
            </button>
            {passwordError && <p className="text-red-600 text-sm">{passwordError}</p>}
            {passwordSuccess && <p className="text-[#166534] text-sm">{passwordSuccess}</p>}
          </form>
        </section>

        <section className="border border-red-200 rounded overflow-hidden">
          <div className="bg-[#dc2626] px-5 py-3">
            <span className="font-display text-sm font-bold uppercase tracking-wide text-white">Eliminar cuenta</span>
          </div>
          <div className="px-5 py-4">
            {confirmingDelete ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-600">Esta acción no se puede deshacer. ¿Seguro que quieres eliminar tu cuenta?</p>
                <div className="flex gap-2">
                  <button onClick={handleDelete} className="bg-[#dc2626] text-white rounded px-3 py-2 font-display text-sm font-bold uppercase">
                    Sí, eliminar
                  </button>
                  <button onClick={() => setConfirmingDelete(false)} className="bg-gray-200 text-gray-700 rounded px-3 py-2 font-display text-sm font-bold uppercase">
                    Cancelar
                  </button>
                </div>
                {deleteError && <p className="text-red-600 text-sm">{deleteError}</p>}
              </div>
            ) : (
              <button onClick={() => setConfirmingDelete(true)} className="text-[#dc2626] text-sm font-bold uppercase font-display underline">
                Eliminar mi cuenta
              </button>
            )}
          </div>
        </section>

        <button onClick={onLogout} className="self-start text-gray-400 text-sm font-display uppercase font-bold hover:text-white" style={{ fontWeight: 600 }}>
          Cerrar sesión
        </button>

      </div>
    </PageLayout>
  )
}

export default ProfileForm