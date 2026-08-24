import {
  format,
  parseISO,
  isToday,
  isSameDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addDays,
  subDays,
  differenceInDays,
  isAfter,
  isBefore,
  isValid,
  getDay,
} from 'date-fns'

export const TODAY = (): Date => new Date()

export const toDateString = (date: Date): string =>
  format(date, 'yyyy-MM-dd')

export const fromDateString = (str: string): Date =>
  parseISO(str)

export const isDateToday = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return isToday(d)
}

export const isSameDateDay = (a: Date | string, b: Date | string): boolean => {
  const da = typeof a === 'string' ? parseISO(a) : a
  const db = typeof b === 'string' ? parseISO(b) : b
  return isSameDay(da, db)
}

export const getWeekDays = (date: Date, weekStartsOn: 0 | 1 = 1): Date[] => {
  const start = startOfWeek(date, { weekStartsOn })
  const end = endOfWeek(date, { weekStartsOn })
  return eachDayOfInterval({ start, end })
}

export const getMonthDays = (date: Date): Date[] => {
  const start = startOfMonth(date)
  const end = endOfMonth(date)
  return eachDayOfInterval({ start, end })
}

export const formatDate = (date: Date | string, fmt: string = 'MMM d, yyyy'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt)
}

export const formatShort = (date: Date): string =>
  format(date, 'EEE')

export const formatDayNum = (date: Date): string =>
  format(date, 'd')

export const formatMonthYear = (date: Date): string =>
  format(date, 'MMMM yyyy')

export const formatFullDate = (date: Date): string =>
  format(date, 'EEEE, MMMM d')

export const daysBetween = (a: Date | string, b: Date | string): number => {
  const da = typeof a === 'string' ? parseISO(a) : a
  const db = typeof b === 'string' ? parseISO(b) : b
  return Math.abs(differenceInDays(da, db))
}

export const isDateAfter = (date: Date | string, ref: Date | string): boolean => {
  const d = typeof date === 'string' ? parseISO(date) : date
  const r = typeof ref === 'string' ? parseISO(ref) : ref
  return isAfter(d, r)
}

export const isDateBefore = (date: Date | string, ref: Date | string): boolean => {
  const d = typeof date === 'string' ? parseISO(date) : date
  const r = typeof ref === 'string' ? parseISO(ref) : ref
  return isBefore(d, r)
}

export { addDays, subDays, getDay, isValid, isSameDay, eachDayOfInterval, startOfMonth, endOfMonth, startOfWeek, endOfWeek, parseISO, format, differenceInDays }
