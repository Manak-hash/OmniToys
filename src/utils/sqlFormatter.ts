import { format } from 'sql-formatter'

export type SupportedDialect = 'mysql' | 'postgresql' | 'sqlite' | 'mariadb' | 'tsql' | 'plsql'
export type KeywordCase = 'upper' | 'lower' | 'preserve'

export interface FormatOptions {
  dialect: SupportedDialect
  keywordCase: KeywordCase
  indent: string
  linesBetweenQueries: number
}

export interface FormatResult {
  success: boolean
  result?: string
  error?: string
}

const defaultOptions: FormatOptions = {
  dialect: 'mysql',
  keywordCase: 'upper',
  indent: '  ',
  linesBetweenQueries: 1,
}

/**
 * Format SQL query
 */
export function formatSql(sql: string, options: Partial<FormatOptions> = {}): FormatResult {
  if (!sql.trim()) {
    return {
      success: false,
      error: 'Input is empty',
    }
  }

  try {
    const opts = { ...defaultOptions, ...options }
    const formatted = format(sql, {
      language: opts.dialect,
      keywordCase: opts.keywordCase,
      linesBetweenQueries: opts.linesBetweenQueries,
    })
    return {
      success: true,
      result: formatted,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Formatting failed',
    }
  }
}

/**
 * Minify SQL (remove extra whitespace)
 */
export function minifySql(sql: string): FormatResult {
  if (!sql.trim()) {
    return {
      success: false,
      error: 'Input is empty',
    }
  }

  try {
    const minified = sql
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\s*([(),;])\s*/g, '$1') // Remove spaces around punctuation
      .replace(/\s*--.*$/gm, '') // Remove comments
      .trim()
    return {
      success: true,
      result: minified,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Minification failed',
    }
  }
}

/**
 * Get dialect display name
 */
export function getDialectName(dialect: SupportedDialect): string {
  const names: Record<SupportedDialect, string> = {
    mysql: 'MySQL',
    postgresql: 'PostgreSQL',
    sqlite: 'SQLite',
    mariadb: 'MariaDB',
    tsql: 'T-SQL',
    plsql: 'PL/SQL',
  }
  return names[dialect]
}
