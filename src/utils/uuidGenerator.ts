import { v1 as uuidv1, v4 as uuidv4, v7 as uuidv7, validate } from 'uuid'

export type UuidVersion = 'v1' | 'v4' | 'v7'

export interface UuidResult {
  uuid: string
  version: UuidVersion
  timestamp?: Date
}

/**
 * Generate a single UUID
 */
export function generateUuid(version: UuidVersion = 'v4'): UuidResult {
  let uuid: string
  let timestamp: Date | undefined

  switch (version) {
    case 'v1':
      uuid = uuidv1()
      // Extract timestamp from v1 UUID
      timestamp = extractV1Timestamp(uuid)
      break
    case 'v7':
      uuid = uuidv7()
      // Extract timestamp from v7 UUID
      timestamp = extractV7Timestamp(uuid)
      break
    case 'v4':
    default:
      uuid = uuidv4()
      break
  }

  return { uuid, version, timestamp }
}

/**
 * Generate multiple UUIDs
 */
export function generateUuids(count: number, version: UuidVersion = 'v4'): UuidResult[] {
  const results: UuidResult[] = []
  for (let i = 0; i < count; i++) {
    results.push(generateUuid(version))
  }
  return results
}

/**
 * Validate UUID
 */
export function isValidUuid(uuid: string): boolean {
  return validate(uuid)
}

/**
 * Extract timestamp from v1 UUID
 * v1 UUIDs embed a 60-bit timestamp
 */
function extractV1Timestamp(uuid: string): Date {
  // Remove dashes and convert to buffer
  const hex = uuid.replace(/-/g, '')

  // v1 timestamp is stored in the first 12 hex chars (time_hi, time_mid, time_low)
  // This is a simplified extraction
  const timeLow = parseInt(hex.substring(0, 8), 16)
  const timeMid = parseInt(hex.substring(8, 12), 16)
  const timeHi = parseInt(hex.substring(12, 16), 16) & 0x0fff

  // Convert to Gregorian timestamp (1582-10-15 epoch)
  const timestamp = ((timeHi & 0x0fff) << 48) | (timeMid << 32) | timeLow
  const unixTimestamp = timestamp / 10000 - 12219292800000

  return new Date(unixTimestamp)
}

/**
 * Extract timestamp from v7 UUID
 * v7 UUIDs embed a Unix timestamp in milliseconds
 */
function extractV7Timestamp(uuid: string): Date {
  const hex = uuid.replace(/-/g, '')

  // v7 timestamp is stored in the first 12 hex chars (48 bits)
  const timestampHex = hex.substring(0, 12)
  const timestamp = parseInt(timestampHex, 16)

  return new Date(timestamp)
}

/**
 * Get UUID version info
 */
export function getVersionInfo(version: UuidVersion): {
  name: string
  description: string
  features: string[]
} {
  const info = {
    v1: {
      name: 'UUID v1',
      description: 'Time-based UUID with MAC address',
      features: [
        'Generated from timestamp and MAC address',
        'Unique per machine',
        'Can leak machine info',
        'Timestamp embedded',
      ],
    },
    v4: {
      name: 'UUID v4',
      description: 'Random UUID',
      features: [
        'Cryptographically random',
        'No identifying information',
        'Most common version',
        '122 random bits',
      ],
    },
    v7: {
      name: 'UUID v7',
      description: 'Time-sorted UUID (RFC 4122)',
      features: [
        'Time-ordered for better DB performance',
        'Random for uniqueness',
        'No MAC address',
        'Best for distributed systems',
      ],
    },
  }

  return info[version]
}

/**
 * Format UUID for display
 */
export function formatUuid(uuid: string, format: 'standard' | 'upper' | 'compact' = 'standard'): string {
  switch (format) {
    case 'upper':
      return uuid.toUpperCase()
    case 'compact':
      return uuid.replace(/-/g, '')
    case 'standard':
    default:
      return uuid
  }
}
