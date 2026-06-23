import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate, NavLink } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import MatchList from './components/MatchList'
import Ranking from './components/Ranking'
import BettingHistory from './components/BettingHistory'
import AdminLayout from './components/AdminLayout'
import AdminTeams from './components/AdminTeams'
import AdminMatches from './components/AdminMatches'
import ProfileForm from './components/ProfileForm'
import AdminUsers from './components/AdminUsers'
import AdminPredictions from './components/AdminPredictions'

const navLinkClass = ({ isActive }) =>
  `font-display text-sm font-bold uppercase tracking-wide pb-1 border-b-2 ${isActive ? 'text-white border-[#dc2626]' : 'text-gray-400 border-transparent'
  }`

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))
  const isAdmin = localStorage.getItem('role') === 'admin'
  const userId = Number(localStorage.getItem('userId'))
  const userName = localStorage.getItem('userName')
  const userEmail = localStorage.getItem('userEmail')
  const navigate = useNavigate()

  function handleLoginSuccess() {
    setIsLoggedIn(true)
    navigate(isAdmin ? '/admin/teams' : '/matches')
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    setIsLoggedIn(false)
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col items-center gap-4">
      {isLoggedIn && (
        <nav className="w-full bg-[#0a0e1a] border-b-2 border-[#dc2626]">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-lg font-logo tracking-wide">
              <span className="text-white">MATCH</span>
              <span className="text-[#dc2626]">APP</span>
            </span>
            <div className="flex items-center gap-3 pb-1 border-b-2 border-transparent">
              <NavLink to="/profile" className="text-xs font-bold uppercase tracking-wide text-white">
                {userName}
              </NavLink>
              <div className="w-px h-3.5 bg-gray-600" />
              <button onClick={handleLogout} aria-label="Cerrar sesión" className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4 pb-2 overflow-x-auto">
            {!isAdmin && (
              <NavLink to="/matches" className={navLinkClass}>Próximos partidos</NavLink>
            )}
            {isAdmin ? (
              <>
                <NavLink to="/admin/teams" className={navLinkClass}>Equipos</NavLink>
                <NavLink to="/admin/matches" className={navLinkClass}>Partidos</NavLink>
                <NavLink to="/admin/users" className={navLinkClass}>Usuarios</NavLink>
                <NavLink to="/admin/predictions" className={navLinkClass}>Apuestas</NavLink>
              </>
            ) : (
              <NavLink to="/history" className={navLinkClass}>Mis apuestas</NavLink>
            )}
            <NavLink to="/ranking" className={navLinkClass}>Ranking</NavLink>
          </div>
        </nav>
      )}
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to={isAdmin ? '/admin/teams' : '/matches'} />
            ) : (
              <LoginForm onLoginSuccess={handleLoginSuccess} />
            )
          }
        />
        <Route
          path="/matches"
          element={isLoggedIn && !isAdmin ? <MatchList /> : <Navigate to="/" />}
        />
        <Route
          path="/history"
          element={isLoggedIn ? <BettingHistory /> : <Navigate to="/" />}
        />
        <Route
          path="/ranking"
          element={isLoggedIn ? <Ranking /> : <Navigate to="/" />}
        />
        <Route
          path="/profile"
          element={
            isLoggedIn ? (
              <ProfileForm
                userId={userId}
                currentName={userName}
                currentEmail={userEmail}
                onAccountDeleted={handleLogout}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/admin"
          element={isLoggedIn && isAdmin ? <AdminLayout /> : <Navigate to="/" />}
        >
          <Route path="teams" element={<AdminTeams />} />
          <Route path="matches" element={<AdminMatches />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="predictions" element={<AdminPredictions />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App