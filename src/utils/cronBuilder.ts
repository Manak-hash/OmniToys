// Simple cron parser implementation without external dependency
export interface CronField {
  minute: string
  hour: string
  dayOfMonth: string
  month: string
  dayOfWeek: string
}

export interface CronResult {
  valid: boolean
  expression?: string
  error?: string
  nextRuns?: string[]
  humanReadable?: string
}

/**
 * Parse cron expression and get next execution times
 */
export function parseCron(expression: string, nextRunsCount: number = 5): CronResult {
  if (!expression.trim()) {
    return {
      valid: false,
      error: 'Expression is empty',
    }
  }

  try {
    // Parse cron expression (5 parts: minute hour dayOfMonth month dayOfWeek)
    const parts = expression.trim().split(/\s+/)
    if (parts.length !== 5) {
      throw new Error('Invalid cron format. Expected 5 parts separated by spaces.')
    }

    // Validate each part
    const minute = parts[0]
    const hour = parts[1]
    const dayOfMonth = parts[2]
    const month = parts[3]
    const dayOfWeek = parts[4]

    // Simple validation
    if (minute !== '*' && (parseInt(minute) < 0 || parseInt(minute) > 59)) {
      throw new Error('Invalid minute value (0-59)')
    }
    if (hour !== '*' && (parseInt(hour) < 0 || parseInt(hour) > 23)) {
      throw new Error('Invalid hour value (0-23)')
    }

    // Generate next run times
    const nextRuns: string[] = []
    const baseDate = new Date()

    for (let i = 0; i < nextRunsCount; i++) {
      const nextTime = new Date(baseDate)

      // Set next time based on cron parts
      if (hour !== '*') nextTime.setHours(parseInt(hour))
      if (minute !== '*') nextTime.setMinutes(parseInt(minute))

      // Add i days
      nextTime.setDate(nextTime.getDate() + i)

      nextRuns.push(nextTime.toISOString())
    }

    // Generate human-readable description
    const desc: string[] = []

    if (minute !== '*' && hour !== '*') {
      desc.push(`at ${hour}:${minute}`)
    } else if (hour !== '*') {
      desc.push(`at ${hour}:00`)
    } else if (minute !== '*') {
      desc.push(`at :${minute}`)
    }

    if (dayOfMonth !== '*') {
      desc.push(`on day ${dayOfMonth}`)
    }

    if (month !== '*') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      desc.push(`of ${monthNames[parseInt(month) - 1]}`)
    }

    if (dayOfWeek !== '*') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      desc.push(`on ${days[parseInt(dayOfWeek)]}`)
    }

    const humanReadable = desc.length > 0
      ? desc.join(' ')
      : (minute === '*' && hour === '*' ? 'Every minute' : 'Run schedule')

    return {
      valid: true,
      expression,
      nextRuns,
      humanReadable,
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid cron expression',
    }
  }
}

/**
 * Build cron expression from individual fields
 */
export function buildCron(fields: Partial<CronField>): string {
  const minute = fields.minute || '*'
  const hour = fields.hour || '*'
  const dayOfMonth = fields.dayOfMonth || '*'
  const month = fields.month || '*'
  const dayOfWeek = fields.dayOfWeek || '*'

  return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`
}

/**
 * Get common cron presets
 */
export const cronPresets: Record<string, string> = {
  'Every minute': '* * * * *',
  'Every hour': '0 * * * *',
  'Every day at midnight': '0 0 * * *',
  'Every day at noon': '0 12 * * *',
  'Every Sunday': '0 0 * * 0',
  'Every Monday': '0 0 * * 1',
  'Every weekday': '0 0 * * 1-5',
  'Every month': '0 0 1 * *',
  'Every year': '0 0 1 1 *',
  'Every 5 minutes': '*/5 * * * *',
  'Every 15 minutes': '*/15 * * * *',
  'Every 30 minutes': '*/30 * * * *',
  'Every 6 hours': '0 */6 * * *',
  'Every 12 hours': '0 */12 * * *',
  'Twice a day': '0 0,12 * * *',
  'Business hours (9-5)': '0 9-17 * * 1-5',
}

/**
 * Validate individual cron field
 */
export function validateField(field: string, fieldType: 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek'): boolean {
  if (!field) return false

  const ranges: Record<string, [number, number]> = {
    minute: [0, 59],
    hour: [0, 23],
    dayOfMonth: [1, 31],
    month: [1, 12],
    dayOfWeek: [0, 6],
  }

  try {
    const [min, max] = ranges[fieldType]

    // Check wildcard
    if (field === '*') return true

    // Check ranges with ranges
    if (field.includes('-')) {
      const [start, end] = field.split('-').map(Number)
      return !isNaN(start) && !isNaN(end) && start >= min && end <= max && start <= end
    }

    if (field.includes('/')) {
      const [base, step] = field.split('/')
      const baseNum = base === '*' ? min : parseInt(base)
      const stepNum = parseInt(step)
      return !isNaN(baseNum) && !isNaN(stepNum) && baseNum >= min && baseNum <= max && stepNum > 0
    }

    if (field.includes(',')) {
      return field.split(',').every(val => {
        const num = parseInt(val.trim())
        return !isNaN(num) && num >= min && num <= max
      })
    }

    const num = parseInt(field)
    return !isNaN(num) && num >= min && num <= max
  } catch {
    return false
  }
}

/**
 * Get field description
 */
export function getFieldDescription(fieldType: string): string {
  const descriptions: Record<string, string> = {
    minute: 'Minute (0-59)',
    hour: 'Hour (0-23)',
    dayOfMonth: 'Day of Month (1-31)',
    month: 'Month (1-12)',
    dayOfWeek: 'Day of Week (0-6, 0=Sunday)',
  }
  return descriptions[fieldType] || fieldType
}
