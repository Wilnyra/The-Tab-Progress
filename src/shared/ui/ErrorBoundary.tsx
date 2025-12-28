import { AlertCircle, RefreshCw } from 'lucide-react'
import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'
import { Button } from './Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './Card'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, resetError: () => void) => ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render(): ReactNode {
    const { hasError, error } = this.state
    const { children, fallback } = this.props

    if (hasError && error) {
      if (fallback) {
        return fallback(error, this.handleReset)
      }

      return (
        <div
          className="flex min-h-screen items-center justify-center p-4 bg-background"
          role="alert"
          aria-live="assertive"
        >
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle
                  className="h-8 w-8 text-destructive"
                  aria-hidden="true"
                />
              </div>
              <CardTitle className="text-2xl">Something went wrong</CardTitle>
              <CardDescription>
                An unexpected error occurred. Please try refreshing the page.
              </CardDescription>
            </CardHeader>

            {import.meta.env.DEV ? (
              <CardContent>
                <details className="rounded-lg bg-muted p-4">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                    Error details
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">
                        Message:
                      </p>
                      <p className="text-sm font-mono break-words">
                        {error.message}
                      </p>
                    </div>
                    {error.stack ? (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">
                          Stack trace:
                        </p>
                        <pre className="mt-1 overflow-auto text-xs font-mono">
                          {error.stack}
                        </pre>
                      </div>
                    ) : null}
                  </div>
                </details>
              </CardContent>
            ) : null}

            <CardFooter className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={this.handleReset}
                className="w-full sm:w-auto"
                aria-label="Try again"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto"
                aria-label="Reload page"
              >
                Reload Page
              </Button>
            </CardFooter>
          </Card>
        </div>
      )
    }

    return children
  }
}
