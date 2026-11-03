import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Landing from './Landing.tsx'
import LoginPage from './auth/LoginPage.tsx'
import RegisterPage from './auth/RegisterPage.tsx'
import CompanyDashboard from './dashboard/CompanyDashboard.tsx'
import ProfilePage from './profile/ProfilePage.tsx'
import { hasDashboardAccess, isAuthenticated } from './api/auth.ts'

const path = window.location.pathname.replace(/\/+$/, '') || '/'
const isAuthorized = isAuthenticated()
const canOpenDashboard = hasDashboardAccess()

if (path === '/dashboard') {
  if (!isAuthorized) {
    window.location.replace('/login')
  } else if (!canOpenDashboard) {
    window.location.replace('/')
  }
}

if (path === '/profile' && !isAuthorized) {
  window.location.replace('/login')
}

const page =
  path === '/login' ? (
    <LoginPage />
  ) : path === '/register' ? (
    <RegisterPage />
  ) : path === '/dashboard' ? (
    isAuthorized && canOpenDashboard ? <CompanyDashboard /> : null
  ) : path === '/profile' ? (
    isAuthorized ? <ProfilePage /> : null
  ) : (
    <Landing />
  )

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {page}
  </StrictMode>,
)
