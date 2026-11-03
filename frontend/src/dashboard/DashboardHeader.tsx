import { LineChart, LogOut } from 'lucide-react'

interface DashboardHeaderProps {
  userName: string
  companyName: string
  roleLabel: string
  onLogout: () => void
}

export function DashboardHeader({
  userName,
  companyName,
  roleLabel,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <header className="dashboard-header">
      <div className="dashboard-header-inner">
        <a className="dashboard-logo" href="/" aria-label="HR Analytics">
          <span className="dashboard-logo-icon">
            <LineChart size={18} />
          </span>
          HR Analytics
        </a>

        <div className="dashboard-header-meta">
          <a className="dashboard-user dashboard-user-link" href="/profile">
            {userName}
          </a>
          {companyName && (
            <span className="dashboard-company">{companyName}</span>
          )}
          <span className="dashboard-role">{roleLabel}</span>
          <a className="dashboard-exit" href="/login" onClick={onLogout}>
            <LogOut size={15} />
            Выйти
          </a>
        </div>
      </div>
    </header>
  )
}
