import TeamList from './TeamList'

function AdminTeams() {
  return (
    <div>
      <h2 className="font-bold mb-2">Equipos</h2>
      <TeamList showCreateForm />
    </div>
  )
}

export default AdminTeams