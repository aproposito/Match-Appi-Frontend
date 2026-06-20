import { Outlet } from 'react-router-dom'

function AdminLayout() {
  return (
    <div className="flex flex-col gap-4 max-w-2xl w-full">
      <Outlet />
    </div>
  )
}

export default AdminLayout