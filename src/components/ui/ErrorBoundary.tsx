import React, { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary component with cyberpunk-style fallback UI.
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs them, and displays a fallback UI instead of crashing.
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 *
 * // With custom fallback
 * <ErrorBoundary
 *   fallback={<div>Custom error UI</div>}
 *   onError={(error, info) => console.error(error)}
 * >
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console
    console.error('[ErrorBoundary] Caught error:', error)
    console.error('[ErrorBoundary] Error info:', errorInfo)

    // Store error info in state
    this.setState({
      errorInfo,
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReload = () => {
    // Reload the page
    window.location.reload()
  }

  handleReset = () => {
    // Reset the error boundary state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default cyberpunk-style error UI
      const errorMessage = this.state.error?.message || 'Unknown error occurred'
      const errorStack = this.state.error?.stack
      const componentStack = this.state.errorInfo?.componentStack

      return (
        <div className="min-h-screen flex items-center justify-center p-4 mesh-bg">
          {/* Background elements */}
          <div className="mesh-circle w-96 h-96 bg-omni-primary/20 top-20 -left-20"></div>
          <div className="mesh-circle w-80 h-80 bg-omni-accent/10 bottom-20 -right-20"></div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl w-full"
          >
            {/* Error Card */}
            <div className="glass-card rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-omni-text/10 bg-omni-primary/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-omni-primary/20 rounded-full neon-glow-primary">
                    <AlertTriangle className="w-6 h-6 text-omni-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-black font-mono text-omni-primary neon-text">
                      SYSTEM ERROR
                    </h1>
                    <p className="text-sm text-omni-text/60 font-mono">
                      Critical failure in component tree
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              <div className="px-6 py-5">
                <div className="bg-omni-bg/60 rounded-lg p-4 border border-omni-text/10 mb-4">
                  <p className="text-omni-text font-mono text-sm break-all">
                    {errorMessage}
                  </p>
                </div>

                {/* Error Stack (collapsible in production) */}
                {import.meta.env.DEV && errorStack && (
                  <details className="mb-4">
                    <summary className="cursor-pointer text-sm font-mono text-omni-text/60 hover:text-omni-text transition-colors mb-2">
                      Error Stack (Dev Mode)
                    </summary>
                    <pre className="bg-[#0f1115] rounded-lg p-3 text-xs font-mono text-omni-text/70 overflow-x-auto border border-omni-text/10">
                      {errorStack}
                    </pre>
                  </details>
                )}

                {/* Component Stack (collapsible in production) */}
                {import.meta.env.DEV && componentStack && (
                  <details className="mb-4">
                    <summary className="cursor-pointer text-sm font-mono text-omni-text/60 hover:text-omni-text transition-colors mb-2">
                      Component Stack (Dev Mode)
                    </summary>
                    <pre className="bg-[#0f1115] rounded-lg p-3 text-xs font-mono text-omni-text/70 overflow-x-auto border border-omni-text/10">
                      {componentStack}
                    </pre>
                  </details>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={this.handleReload}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-4 py-3",
                      "bg-omni-primary hover:bg-omni-primary-hover text-white",
                      "rounded-lg font-bold text-sm uppercase tracking-wider",
                      "transition-all duration-200 shadow-lg shadow-omni-primary/20 hover:shadow-xl hover:shadow-omni-primary/30",
                      "hover:scale-[1.02] active:scale-[0.98]"
                    )}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reload Application
                  </button>

                  <button
                    onClick={this.handleReset}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-4 py-3",
                      "bg-omni-text/10 hover:bg-omni-text/20 text-omni-text",
                      "rounded-lg font-bold text-sm uppercase tracking-wider",
                      "transition-all duration-200 border border-omni-text/10",
                      "hover:scale-[1.02] active:scale-[0.98]"
                    )}
                  >
                    <Bug className="w-4 h-4" />
                    Try Again
                  </button>
                </div>

                {/* Help Text */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-omni-text/50 font-mono">
                    If this error persists, please clear your browser cache and try again.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 text-center"
            >
              <p className="text-xs text-omni-text/40 font-mono">
                Error Boundary v1.0 • OmniToys PWA
              </p>
            </motion.div>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Functional wrapper for ErrorBoundary with hooks support.
 * Use this if you need to use hooks in your error fallback.
 *
 * @example
 * ```tsx
 * function FallbackComponent({ error, resetError }) {
 *   const [count, setCount] = useState(0)
 *   return <div onClick={resetError}>Error: {error.message}</div>
 * }
 *
 * <ErrorBoundaryFallback fallback={FallbackComponent}>
 *   <YourComponent />
 * </ErrorBoundaryFallback>
 * ```
 */
export function ErrorBoundaryFallback({ children, fallback }: ErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  )
}
