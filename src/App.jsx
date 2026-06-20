import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom'
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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))
  const isAdmin = localStorage.getItem('role') === 'admin'
  const userId = Number(localStorage.getItem('userId'))
  const userName = localStorage.getItem('userName')
  const userEmail = localStorage.getItem('userEmail')
  const navigate = useNavigate()

  function handleLoginSuccess() {
    setIsLoggedIn(true)
    navigate('/matches')
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
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      {isLoggedIn && (
        <nav className="flex gap-4 flex-wrap justify-center">
          <Link to="/matches" className="text-blue-600 underline">Próximos partidos</Link>
          {isAdmin ? (
            <>
              <Link to="/admin/teams" className="text-blue-600 underline">Equipos</Link>
              <Link to="/admin/matches" className="text-blue-600 underline">Gestión partidos</Link>
              <Link to="/admin/users" className="text-blue-600 underline">Usuarios</Link>
              <Link to="/admin/predictions" className="text-blue-600 underline">Apuestas</Link>
            </>
          ) : (
            <Link to="/history" className="text-blue-600 underline">Mis apuestas</Link>
          )}
          <Link to="/ranking" className="text-blue-600 underline">Ranking</Link>
          <Link to="/profile" className="text-blue-600 underline">Perfil</Link>
        </nav>
      )}
      <Routes>
        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/matches" /> : <LoginForm onLoginSuccess={handleLoginSuccess} />}
        />
        <Route
          path="/matches"
          element={isLoggedIn ? <MatchList /> : <Navigate to="/" />}
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