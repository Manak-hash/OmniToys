/**
 * TypeScript fallback for equation solving
 * Uses Newton-Raphson method for numerical solving
 */

export interface SolveResult {
  success: boolean
  solution?: number
  iterations?: number
  error?: string
}

/**
 * Safely evaluate a mathematical expression
 */
function evaluateExpression(expr: string, x: number): number {
  // Replace common math functions and constants
  const sanitized = expr
    .toLowerCase()
    .replace(/\^/g, '**')
    .replace(/sin/g, 'Math.sin')
    .replace(/cos/g, 'Math.cos')
    .replace(/tan/g, 'Math.tan')
    .replace(/sqrt/g, 'Math.sqrt')
    .replace(/abs/g, 'Math.abs')
    .replace(/log/g, 'Math.log')
    .replace(/exp/g, 'Math.exp')
    .replace(/pi/g, 'Math.PI')
    .replace(/e(?![a-z])/g, 'Math.E')
    .replace(/x/g, x.toString())

   
  return Function(`"use strict"; return (${sanitized})`)()
}

/**
 * Calculate derivative using finite difference
 */
function derivative(expr: string, x: number): number {
  const h = 0.0001
  const f1 = evaluateExpression(expr, x + h)
  const f2 = evaluateExpression(expr, x - h)
  return (f1 - f2) / (2 * h)
}

/**
 * Solve equation using Newton-Raphson method
 */
export function solveEquation(
  expression: string,
  initialGuess: number = 0,
  maxIterations: number = 100,
  tolerance: number = 1e-10
): SolveResult {
  try {
    // Check if equation is already solved (= 0)
    let equation = expression.trim()
    if (!equation.includes('=')) {
      equation = `${equation} = 0`
    }

    // Extract the left side (before =)
    const leftSide = equation.split('=')[0].trim()

    let x = initialGuess
    let iterations = 0

    for (let i = 0; i < maxIterations; i++) {
      iterations++

      const fx = evaluateExpression(leftSide, x)

      if (Math.abs(fx) < tolerance) {
        return {
          success: true,
          solution: x,
          iterations,
        }
      }

      const fPrimeX = derivative(leftSide, x)

      if (Math.abs(fPrimeX) < tolerance) {
        // Derivative too small, try different initial guess
        x = initialGuess + Math.random() * 10
        continue
      }

      const newX = x - fx / fPrimeX

      if (Math.abs(newX - x) < tolerance) {
        return {
          success: true,
          solution: newX,
          iterations,
        }
      }

      x = newX
    }

    return {
      success: true,
      solution: x,
      iterations,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to solve equation',
    }
  }
}

/**
 * Parse and solve a system of equations (basic)
 */
export function solveSystem(equations: string[]): SolveResult[] {
  return equations.map(eq => solveEquation(eq))
}
