import { loremIpsum } from 'lorem-ipsum'

export type FieldType = 'string' | 'number' | 'boolean' | 'email' | 'date' | 'url' | 'uuid' | 'lorem'

export interface Field {
  name: string
  type: FieldType
  isArray?: boolean
  nestedFields?: Field[]
}

export interface GenerationOptions {
  count: number
  fields: Field[]
}

/**
 * Generate random email
 */
function generateEmail(): string {
  const domains = ['example.com', 'test.com', 'sample.org', 'demo.net']
  const usernames = ['user', 'admin', 'test', 'demo', 'john', 'jane', 'bob', 'alice']
  const username = usernames[Math.floor(Math.random() * usernames.length)]
  const domain = domains[Math.floor(Math.random() * domains.length)]
  const num = Math.floor(Math.random() * 1000)
  return `${username}${num}@${domain}`
}

/**
 * Generate random UUID
 */
function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Generate random date
 */
function generateDate(): string {
  const start = new Date(2020, 0, 1)
  const end = new Date(2025, 11, 31)
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return date.toISOString().split('T')[0]
}

/**
 * Generate random URL
 */
function generateUrl(): string {
  const paths = ['api', 'v1', 'users', 'posts', 'comments']
  const path = paths.slice(0, Math.floor(Math.random() * 3) + 1).join('/')
  return `https://example.com/${path}`
}

/**
 * Generate field value
 */
function generateFieldValue(field: Field): any {
  const value = generateSingleValue(field)

  if (field.isArray) {
    const arrayLength = Math.floor(Math.random() * 5) + 1
    return Array.from({ length: arrayLength }, () => generateSingleValue(field))
  }

  return value
}

/**
 * Generate single value for a field type
 */
function generateSingleValue(field: Field): any {
  switch (field.type) {
    case 'string':
      return Math.random().toString(36).substring(7)
    case 'number':
      return Math.floor(Math.random() * 1000)
    case 'boolean':
      return Math.random() > 0.5
    case 'email':
      return generateEmail()
    case 'date':
      return generateDate()
    case 'url':
      return generateUrl()
    case 'uuid':
      return generateUuid()
    case 'lorem':
      return loremIpsum({
        count: Math.floor(Math.random() * 3) + 1,
        units: 'sentences',
      })
    default:
      return null
  }
}

/**
 * Generate object from field definition
 */
function generateObject(fields: Field[]): Record<string, any> {
  const obj: Record<string, any> = {}

  for (const field of fields) {
    if (field.nestedFields && field.nestedFields.length > 0) {
      // Nested object
      if (field.isArray) {
        const arrayLength = Math.floor(Math.random() * 3) + 1
        obj[field.name] = Array.from({ length: arrayLength }, () =>
          generateObject(field.nestedFields!)
        )
      } else {
        obj[field.name] = generateObject(field.nestedFields)
      }
    } else {
      obj[field.name] = generateFieldValue(field)
    }
  }

  return obj
}

/**
 * Generate API payload
 */
export function generatePayload(options: GenerationOptions): any[] {
  const { count, fields } = options

  if (fields.length === 0) {
    return []
  }

  return Array.from({ length: count }, () => generateObject(fields))
}

/**
 * Generate preset template
 */
export function generatePreset(preset: 'user' | 'post' | 'product' | 'comment'): any[] {
  const presets: Record<string, Field[]> = {
    user: [
      { name: 'id', type: 'number' },
      { name: 'name', type: 'string' },
      { name: 'email', type: 'email' },
      { name: 'active', type: 'boolean' },
      { name: 'createdAt', type: 'date' },
    ],
    post: [
      { name: 'id', type: 'number' },
      { name: 'title', type: 'lorem' },
      { name: 'content', type: 'lorem' },
      { name: 'authorId', type: 'number' },
      { name: 'published', type: 'boolean' },
    ],
    product: [
      { name: 'id', type: 'number' },
      { name: 'name', type: 'string' },
      { name: 'price', type: 'number' },
      { name: 'inStock', type: 'boolean' },
      { name: 'tags', type: 'string', isArray: true },
    ],
    comment: [
      { name: 'id', type: 'number' },
      { name: 'postId', type: 'number' },
      { name: 'author', type: 'string' },
      { name: 'text', type: 'lorem' },
      { name: 'createdAt', type: 'date' },
    ],
  }

  return generatePayload({ count: 5, fields: presets[preset] })
}

/**
 * Format JSON
 */
export function formatJson(data: any, indent: number = 2): string {
  return JSON.stringify(data, null, indent)
}
