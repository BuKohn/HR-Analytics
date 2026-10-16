const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

export type RegisterFieldName =
  | 'company_name'
  | 'inn'
  | 'company_id'
  | 'department_id'
  | 'full_name'
  | 'email'
  | 'password'
  | 'password_confirmation'
  | 'agreement'

export type RegisterFieldErrors = Partial<Record<RegisterFieldName, string>>

export class RegistrationApiError extends Error {
  fieldErrors: RegisterFieldErrors

  constructor(message: string, fieldErrors: RegisterFieldErrors = {}) {
    super(message)
    this.name = 'RegistrationApiError'
    this.fieldErrors = fieldErrors
  }
}

export interface RegisterResponse {
  message: string
  user: {
    id: string
    email: string
    full_name: string
    role: string
  }
  company?: {
    id: string
    name: string
    inn?: string
  }
}

export interface CompanyRegistrationData {
  company: {
    name: string
    inn?: string
    description?: string
  }
  owner: {
    full_name: string
    email: string
    password: string
  }
}

export interface EmployeeRegistrationData {
  employee: {
    full_name: string
    email: string
    password: string
  }
  company_id: string
  department_id: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export const AUTH_TOKEN_KEY = 'hr_access_token'

export function setAuthToken(token: string, remember: boolean) {
  const primary = remember ? localStorage : sessionStorage
  const secondary = remember ? sessionStorage : localStorage

  primary.setItem(AUTH_TOKEN_KEY, token)
  secondary.removeItem(AUTH_TOKEN_KEY)
}

export function getAuthToken() {
  return (
    localStorage.getItem(AUTH_TOKEN_KEY) ||
    sessionStorage.getItem(AUTH_TOKEN_KEY)
  )
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  sessionStorage.removeItem(AUTH_TOKEN_KEY)
}

export function isAuthenticated() {
  const token = getAuthToken()

  if (!token) {
    return false
  }

  const payload = decodeTokenPayload(token)

  if (!payload || typeof payload.exp !== 'number') {
    return true
  }

  return payload.exp * 1000 > Date.now()
}

export class LoginApiError extends Error {
  fieldErrors: Partial<Record<'email' | 'password', string>>

  constructor(
    message: string,
    fieldErrors: Partial<Record<'email' | 'password', string>> = {},
  ) {
    super(message)
    this.name = 'LoginApiError'
    this.fieldErrors = fieldErrors
  }
}

const backendPathToField: Record<string, RegisterFieldName> = {
  'company.name': 'company_name',
  'company.inn': 'inn',
  'owner.full_name': 'full_name',
  'owner.email': 'email',
  'owner.password': 'password',
  'employee.full_name': 'full_name',
  'employee.email': 'email',
  'employee.password': 'password',
  company_id: 'company_id',
  department_id: 'department_id',
}

function cleanValidationMessage(message: string) {
  return message.replace(/^Value error,\s*/i, '')
}

function parseFieldErrors(detail: unknown): RegisterFieldErrors {
  if (!Array.isArray(detail)) {
    return {}
  }

  return detail.reduce<RegisterFieldErrors>((errors, item) => {
    if (!item || typeof item !== 'object') {
      return errors
    }

    const location = Array.isArray(item.loc)
      ? item.loc.filter((part: unknown) => part !== 'body').join('.')
      : ''
    const field = backendPathToField[location]

    if (field && typeof item.msg === 'string' && !errors[field]) {
      errors[field] = cleanValidationMessage(item.msg)
    }

    return errors
  }, {})
}

function inferFieldError(detail: unknown): RegisterFieldErrors {
  if (typeof detail !== 'string') {
    return {}
  }

  const message = detail.toLowerCase()

  if (message.includes('email')) {
    return { email: detail }
  }
  if (
    message.includes('company_id') ||
    message.includes('компания не найдена')
  ) {
    return { company_id: detail }
  }
  if (
    message.includes('department_id') ||
    message.includes('отдел не найден')
  ) {
    return { department_id: detail }
  }

  return {}
}

async function postRegistration<T>(
  path: string,
  data: T,
): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  const result = await response.json().catch(() => null)

  if (!response.ok) {
    const detail = result?.detail
    const fieldErrors = Array.isArray(detail)
      ? parseFieldErrors(detail)
      : inferFieldError(detail)
    const message = Array.isArray(detail)
      ? detail
          .map((item) =>
            typeof item?.msg === 'string'
              ? cleanValidationMessage(item.msg)
              : '',
          )
          .filter(Boolean)
          .join('. ')
      : detail

    throw new RegistrationApiError(
      message || 'Не удалось выполнить регистрацию',
      fieldErrors,
    )
  }

  return result as RegisterResponse
}

export function registerCompany(data: CompanyRegistrationData) {
  return postRegistration('/api/v1/register/company', data)
}

export function registerEmployee(data: EmployeeRegistrationData) {
  return postRegistration('/api/v1/register/employee', data)
}

const loginPathToField: Record<string, 'email' | 'password'> = {
  email: 'email',
  password: 'password',
}

function parseLoginFieldErrors(detail: unknown) {
  if (!Array.isArray(detail)) {
    return {}
  }

  return detail.reduce<Partial<Record<'email' | 'password', string>>>(
    (errors, item) => {
      if (!item || typeof item !== 'object') {
        return errors
      }

      const location = Array.isArray(item.loc)
        ? item.loc.filter((part: unknown) => part !== 'body').join('.')
        : ''
      const field = loginPathToField[location]

      if (field && typeof item.msg === 'string' && !errors[field]) {
        errors[field] = cleanValidationMessage(item.msg)
      }

      return errors
    },
    {},
  )
}

export async function login(data: LoginRequest): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  const result = await response.json().catch(() => null)

  if (!response.ok) {
    const detail = result?.detail
    const fieldErrors = Array.isArray(detail)
      ? parseLoginFieldErrors(detail)
      : {}
    const message = Array.isArray(detail)
      ? detail
          .map((item) =>
            typeof item?.msg === 'string'
              ? cleanValidationMessage(item.msg)
              : '',
          )
          .filter(Boolean)
          .join('. ')
      : typeof detail === 'string'
        ? detail
        : 'Не удалось выполнить вход'

    if (
      response.status === 401 &&
      typeof detail === 'string' &&
      Object.keys(fieldErrors).length === 0
    ) {
      throw new LoginApiError(detail, { password: detail })
    }

    throw new LoginApiError(message, fieldErrors)
  }

  return result as TokenResponse
}

export const AUTH_PROFILE_KEY = 'hr_profile'
export const AUTH_PROFILES_KEY = 'hr_profiles'

export interface StoredProfile {
  userId: string
  email: string
  fullName: string
  role: string
  companyId: string | null
  companyName: string
  companyInn: string
}

function toStoredProfile(value: unknown): StoredProfile | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as Record<string, unknown>
  const email = typeof record.email === 'string' ? record.email : ''

  if (!email) {
    return null
  }

  return {
    userId: typeof record.userId === 'string' ? record.userId : '',
    email,
    fullName: typeof record.fullName === 'string' ? record.fullName : '',
    role: typeof record.role === 'string' ? record.role : '',
    companyId: typeof record.companyId === 'string' ? record.companyId : null,
    companyName:
      typeof record.companyName === 'string' ? record.companyName : '',
    companyInn: typeof record.companyInn === 'string' ? record.companyInn : '',
  }
}

function profileKey(profile: StoredProfile) {
  return profile.userId || profile.email.trim().toLowerCase()
}

function readKnownProfiles() {
  const raw = localStorage.getItem(AUTH_PROFILES_KEY)

  if (!raw) {
    return []
  }

  try {
    const parsed: unknown = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .map(toStoredProfile)
      .filter((profile): profile is StoredProfile => profile !== null)
  } catch {
    return []
  }
}

export function saveProfile(profile: StoredProfile, remember: boolean) {
  const primary = remember ? localStorage : sessionStorage
  const secondary = remember ? sessionStorage : localStorage

  primary.setItem(AUTH_PROFILE_KEY, JSON.stringify(profile))
  secondary.removeItem(AUTH_PROFILE_KEY)
}

export function getProfile(): StoredProfile | null {
  const raw =
    localStorage.getItem(AUTH_PROFILE_KEY) ||
    sessionStorage.getItem(AUTH_PROFILE_KEY)

  if (!raw) {
    return null
  }

  try {
    return toStoredProfile(JSON.parse(raw))
  } catch {
    return null
  }
}

export function rememberProfile(profile: StoredProfile) {
  if (!profile.fullName && !profile.companyName) {
    return
  }

  const key = profileKey(profile)
  const rest = readKnownProfiles().filter((item) => profileKey(item) !== key)

  try {
    localStorage.setItem(AUTH_PROFILES_KEY, JSON.stringify([...rest, profile]))
  } catch {
    return
  }
}

export function findKnownProfile(userId: string, email: string) {
  const known = readKnownProfiles()

  if (userId) {
    const byId = known.find((profile) => profile.userId === userId)

    if (byId) {
      return byId
    }
  }

  const normalizedEmail = email.trim().toLowerCase()

  return (
    known.find(
      (profile) => profile.email.trim().toLowerCase() === normalizedEmail,
    ) ?? null
  )
}

export function clearProfile() {
  localStorage.removeItem(AUTH_PROFILE_KEY)
  sessionStorage.removeItem(AUTH_PROFILE_KEY)
}

function decodeTokenPayload(token: string) {
  const payload = token.split('.')[1]

  if (!payload) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
    )

    if (!parsed || typeof parsed !== 'object') {
      return null
    }

    return parsed as Record<string, unknown>
  } catch {
    return null
  }
}

export function readTokenClaims(token: string) {
  const payload = decodeTokenPayload(token)

  return {
    userId: typeof payload?.sub === 'string' ? payload.sub : '',
    role: typeof payload?.role === 'string' ? payload.role : '',
  }
}

const DASHBOARD_ROLES = ['owner', 'hr']

export function hasDashboardAccess() {
  const token = getAuthToken()

  if (!token) {
    return false
  }

  const claims = readTokenClaims(token)

  return DASHBOARD_ROLES.includes(claims.role)
}
