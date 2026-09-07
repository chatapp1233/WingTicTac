import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import calendar from 'dayjs/plugin/calendar'

dayjs.extend(relativeTime)
dayjs.extend(calendar)

/** Chat-list style timestamp: "2:42 PM" today, "Mon" this week, "12/03/25" older. */
export function shortTimestamp(iso: string): string {
  const d = dayjs(iso)
  const now = dayjs()
  if (d.isSame(now, 'day')) return d.format('h:mm A')
  if (d.isAfter(now.subtract(6, 'day'))) return d.format('ddd')
  return d.format('DD/MM/YY')
}

/** In-bubble timestamp, always just the time. */
export function bubbleTimestamp(iso: string): string {
  return dayjs(iso).format('h:mm A')
}

export function lastSeenLabel(iso: string | null): string {
  if (!iso) return 'offline'
  return `last seen ${dayjs(iso).calendar(null, {
    sameDay: '[today at] h:mm A',
    lastDay: '[yesterday at] h:mm A',
    lastWeek: '[last] dddd',
    sameElse: 'DD/MM/YYYY',
  })}`
}

export function dateSeparatorLabel(iso: string): string {
  const d = dayjs(iso)
  const now = dayjs()
  if (d.isSame(now, 'day')) return 'Today'
  if (d.isSame(now.subtract(1, 'day'), 'day')) return 'Yesterday'
  return d.format('MMMM D, YYYY')
}
