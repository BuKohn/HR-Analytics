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

export function loadDepartments(fallback: DepartmentRow[]) {
  return readStored(DEPARTMENTS_KEY, toDepartment) ?? fallback
}

export function loadCourses(fallback: CourseRow[]) {
  return readStored(COURSES_KEY, toCourse) ?? fallback
}

export function loadAssignments(fallback: AssignmentRow[]) {
  return readStored(ASSIGNMENTS_KEY, toAssignment) ?? fallback
}

export function saveDepartments(departments: DepartmentRow[]) {
  writeList(DEPARTMENTS_KEY, departments)
}

export function saveCourses(courses: CourseRow[]) {
  writeList(COURSES_KEY, courses)
}

export function saveAssignments(assignments: AssignmentRow[]) {
  writeList(ASSIGNMENTS_KEY, assignments)
}
