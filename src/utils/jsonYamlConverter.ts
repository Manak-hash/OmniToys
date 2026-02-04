import yaml from 'js-yaml'

export type ConversionDirection = 'json-to-yaml' | 'yaml-to-json'

export interface ConversionResult {
  success: boolean
  result?: string
  error?: string
}

/**
 * Convert JSON to YAML
 */
export function jsonToYaml(jsonString: string): ConversionResult {
  try {
    const parsed = JSON.parse(jsonString)
    const yamlString = yaml.dump(parsed, {
      indent: 2,
      lineWidth: -1, // No line width limit
      noRefs: true, // Don't use anchors/aliases
      sortKeys: false, // Preserve key order
    })
    return {
      success: true,
      result: yamlString,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid JSON',
    }
  }
}

/**
 * Convert YAML to JSON
 */
export function yamlToJson(yamlString: string): ConversionResult {
  try {
    const parsed = yaml.load(yamlString)
    if (parsed === undefined || parsed === null) {
      return {
        success: false,
        error: 'Empty or invalid YAML',
      }
    }
    const jsonString = JSON.stringify(parsed, null, 2)
    return {
      success: true,
      result: jsonString,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid YAML',
    }
  }
}

/**
 * Convert based on direction
 */
export function convert(input: string, direction: ConversionDirection): ConversionResult {
  if (!input.trim()) {
    return {
      success: false,
      error: 'Input is empty',
    }
  }

  if (direction === 'json-to-yaml') {
    return jsonToYaml(input)
  } else {
    return yamlToJson(input)
  }
}

/**
 * Validate JSON
 */
export function validateJson(jsonString: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(jsonString)
    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid JSON',
    }
  }
}

/**
 * Validate YAML
 */
export function validateYaml(yamlString: string): { valid: boolean; error?: string } {
  try {
    yaml.load(yamlString)
    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid YAML',
    }
  }
}
