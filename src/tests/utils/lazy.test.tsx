import { describe, it, expect, vi } from 'vitest';
import React, { Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { lazyNamed } from '../../utils/lazy';

describe('lazyNamed Utility', () => {
    // -------------------------------------------------------------
    // Happy Path
    // -------------------------------------------------------------
    it('should lazily load a named export component and render it inside Suspense', async () => {
        // Arrange
        const TestComponent: React.FC<{ message: string }> = ({ message }) => (
            <div data-testid="lazy-target">{message}</div>
        );
        const factory = vi.fn().mockResolvedValue({ TestComponent });

        // Act
        const LazyComponent = lazyNamed(factory, 'TestComponent');
        render(
            <Suspense fallback={<div>Loading test...</div>}>
                <LazyComponent message="Hello from Lazy" />
            </Suspense>
        );

        // Assert
        expect(screen.getByText('Loading test...')).toBeInTheDocument();
        const loadedElement = await screen.findByTestId('lazy-target');
        expect(loadedElement).toHaveTextContent('Hello from Lazy');
        expect(factory).toHaveBeenCalledTimes(1);
    });

    // -------------------------------------------------------------
    // Edge Cases: Argument Validation
    // -------------------------------------------------------------
    it('should throw a TypeError if factory is not a function', () => {
        // Arrange
        const invalidFactory = 'not-a-function' as unknown as () => Promise<any>;

        // Act & Assert
        expect(() => {
            lazyNamed(invalidFactory, 'AnyExport');
        }).toThrow(TypeError);
    });

    it('should throw a TypeError if name is an empty string or invalid', () => {
        // Arrange
        const dummyFactory = async () => ({ Dummy: () => null });

        // Act & Assert
        expect(() => {
            lazyNamed(dummyFactory, '' as any);
        }).toThrow(TypeError);
    });

    // -------------------------------------------------------------
    // Exception / Error Handling: Missing Named Export
    // -------------------------------------------------------------
    it('should reject when the named export does not exist in the module', async () => {
        // Arrange
        const factory = vi.fn().mockResolvedValue({ OtherExport: () => null });
        const LazyComponent = lazyNamed(factory, 'NonExistentComponent' as any);

        class ErrorBoundary extends React.Component<
            { children: React.ReactNode },
            { error: Error | null }
        > {
            constructor(props: { children: React.ReactNode }) {
                super(props);
                this.state = { error: null };
            }
            static getDerivedStateFromError(error: Error) {
                return { error };
            }
            render() {
                if (this.state.error) {
                    return <div data-testid="error-message">{this.state.error.message}</div>;
                }
                return this.props.children;
            }
        }

        // Act
        render(
            <ErrorBoundary>
                <Suspense fallback={<div>Loading...</div>}>
                    <LazyComponent />
                </Suspense>
            </ErrorBoundary>
        );

        // Assert
        const errorContainer = await screen.findByTestId('error-message');
        expect(errorContainer).toHaveTextContent(
            "[lazyNamed] Named export 'NonExistentComponent' was not found in the imported module."
        );
    });

    // -------------------------------------------------------------
    // Exception / Error Handling: Factory Promise Rejection
    // -------------------------------------------------------------
    it('should propagate module loading errors if factory rejects', async () => {
        // Arrange
        const factory = vi.fn().mockRejectedValue(new Error('Network error loading chunk'));
        const LazyComponent = lazyNamed(factory, 'TestComponent' as any);

        class ErrorBoundary extends React.Component<
            { children: React.ReactNode },
            { error: Error | null }
        > {
            constructor(props: { children: React.ReactNode }) {
                super(props);
                this.state = { error: null };
            }
            static getDerivedStateFromError(error: Error) {
                return { error };
            }
            render() {
                if (this.state.error) {
                    return <div data-testid="network-error">{this.state.error.message}</div>;
                }
                return this.props.children;
            }
        }

        // Act
        render(
            <ErrorBoundary>
                <Suspense fallback={<div>Loading...</div>}>
                    <LazyComponent />
                </Suspense>
            </ErrorBoundary>
        );

        // Assert
        const errorContainer = await screen.findByTestId('network-error');
        expect(errorContainer).toHaveTextContent('Network error loading chunk');
    });
});
