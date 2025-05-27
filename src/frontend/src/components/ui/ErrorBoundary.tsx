import React, { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  text-align: center;
  background-color: #1a1b1e;
  border: 1px solid #e53e3e40;
  border-radius: 0.5rem;
  margin: 1rem;
  color: #e2e8f0;
`;

const ErrorIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background-color: #e53e3e20;
  border-radius: 9999px;
  color: #e53e3e;
  margin-bottom: 1rem;
`;

const ErrorTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #e53e3e;
  margin-bottom: 0.5rem;
`;

const ErrorMessage = styled.p`
  font-size: 1rem;
  color: #a0aec0;
  margin-bottom: 1.5rem;
  max-width: 500px;
`;

const ErrorDetails = styled.details`
  margin-top: 1rem;
  text-align: left;
  background-color: #0f1419;
  border-radius: 0.375rem;
  padding: 1rem;
`;

const ErrorSummary = styled.summary`
  cursor: pointer;
  font-weight: 500;
  color: #e2e8f0;
  margin-bottom: 0.5rem;
`;

const ErrorStack = styled.pre`
  font-size: 0.875rem;
  color: #a0aec0;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
  background-color: #1a1b1e;
  padding: 0.5rem;
  border-radius: 0.25rem;
  margin-top: 0.5rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorContainer>
          <ErrorIcon>
            <AlertTriangle size={32} />
          </ErrorIcon>
          
          <ErrorTitle>Something went wrong</ErrorTitle>
          
          <ErrorMessage>
            We encountered an unexpected error. This usually happens due to a temporary issue. 
            Try refreshing the page or resetting the component.
          </ErrorMessage>

          <ActionButtons>
            <Button
              variant="outline"
              onClick={this.handleReset}
              leftIcon={<RefreshCw size={16} />}
            >
              Try Again
            </Button>
            <Button
              variant="primary"
              onClick={this.handleReload}
              leftIcon={<RefreshCw size={16} />}
            >
              Reload Page
            </Button>
          </ActionButtons>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <ErrorDetails>
              <ErrorSummary>Error Details (Development)</ErrorSummary>
              <div>
                <strong>Error:</strong> {this.state.error.message}
              </div>
              {this.state.errorInfo && (
                <ErrorStack>{this.state.errorInfo.componentStack}</ErrorStack>
              )}
              <ErrorStack>{this.state.error.stack}</ErrorStack>
            </ErrorDetails>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;