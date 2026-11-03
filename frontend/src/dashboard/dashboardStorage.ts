export interface DepartmentRow {
  id: string
  name: string
  head: string
  employees: number
  parentId: string | null
}

export interface CourseRow {
  id: string
  title: string
}

export interface AssignmentRow {
  id: string
  course: string
  target: string
  deadline: string
  status: 'active' | 'pending'
}

const DEPARTMENTS_KEY = 'hr_dashboard_departments'
const COURSES_KEY = 'hr_dashboard_courses'
const ASSIGNMENTS_KEY = 'hr_dashboard_assignments'
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isDepartmentId(id: string) {
  return UUID_PATTERN.test(id)
}

function readRecord(value: unknown) {
  if (!value || typeof value !== 'object') {
    return null
  }

  return value as Record<string, unknown>
}

function readText(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function toDepartment(value: unknown): DepartmentRow | null {
  const record = readRecord(value)

  if (!record) {
    return null
  }

  const id = readText(record.id)

  if (!id) {
    return null
  }

  return {
    id,
    name: readText(record.name),
    head: readText(record.head),
    employees: typeof record.employees === 'number' ? record.employees : 0,
    parentId: typeof record.parentId === 'string' ? record.parentId : null,
  }
}

function toCourse(value: unknown): CourseRow | null {
  const record = readRecord(value)

  if (!record) {
    return null
  }

  const id = readText(record.id)

  if (!id) {
    return null
  }

  return {
    id,
    title: readText(record.title),
  }
}

function toAssignment(value: unknown): AssignmentRow | null {
  const record = readRecord(value)

  if (!record) {
    return null
  }

  const id = readText(record.id)

  if (!id) {
    return null
  }

  return {
    id,
    course: readText(record.course),
    target: readText(record.target),
    deadline: readText(record.deadline),
    status: record.status === 'pending' ? 'pending' : 'active',
  }
}

function readStored<T>(key: string, map: (value: unknown) => T | null) {
  const raw = localStorage.getItem(key)

  if (!raw) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return null
    }

    return parsed.map(map).filter((item): item is T => item !== null)
  } catch {
    return null
  }
}

function writeList<T>(key: string, items: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(items))
  } catch {
    return
  }
}

export function loadDepartments(companyId: string | null) {
  const stored = readStored(
    companyId ? `${DEPARTMENTS_KEY}:${companyId}` : DEPARTMENTS_KEY,
    toDepartment,
  )

  if (!stored) {
    return []
  }

  return stored.filter((department) => isDepartmentId(department.id))
}

const OWNER_DEPARTMENT = 'руководство'

export function resolveProfileDepartments(profile: {
  companyId: string | null
  fullName: string
  role: string
  departmentNames: string[]
  departmentIds?: string[]
}) {
  const cached = loadDepartments(profile.companyId)
  const names = new Set<string>()
  const fullName = profile.fullName.trim().toLowerCase()
  const cachedByName = new Map(
    cached.map((department) => [department.name.trim().toLowerCase(), department.name]),
  )

  for (const name of profile.departmentNames) {
    const match = cachedByName.get(name.trim().toLowerCase())

    if (match) {
      names.add(match)
    }
  }

  for (const id of profile.departmentIds ?? []) {
    const match = cached.find((department) => department.id === id)

    if (match?.name) {
      names.add(match.name)
    }
  }

  for (const department of cached) {
    if (fullName && department.head.trim().toLowerCase() === fullName) {
      names.add(department.name)
    }
  }

  if (profile.role === 'owner') {
    names.add(cachedByName.get(OWNER_DEPARTMENT) ?? 'руководство')
  }

  return [...names]
}

export function loadCourses(fallback: CourseRow[]) {
  return readStored(COURSES_KEY, toCourse) ?? fallback
}

export function loadAssignments(fallback: AssignmentRow[]) {
  return readStored(ASSIGNMENTS_KEY, toAssignment) ?? fallback
}

export function saveDepartments(
  companyId: string | null,
  departments: DepartmentRow[],
) {
  writeList(
    companyId ? `${DEPARTMENTS_KEY}:${companyId}` : DEPARTMENTS_KEY,
    departments,
  )
}

export function saveCourses(courses: CourseRow[]) {
  writeList(COURSES_KEY, courses)
}

export function saveAssignments(assignments: AssignmentRow[]) {
  writeList(ASSIGNMENTS_KEY, assignments)
}
