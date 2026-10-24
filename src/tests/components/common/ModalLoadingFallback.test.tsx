import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModalLoadingFallback } from '../../../components/common/ModalLoadingFallback';

describe('ModalLoadingFallback Component', () => {
    // -------------------------------------------------------------
    // Happy Path: Default Values
    // -------------------------------------------------------------
    it('should render default fallback with spinner and default message', () => {
        // Arrange & Act
        render(<ModalLoadingFallback />);

        // Assert
        const container = screen.getByTestId('modal-loading-fallback');
        expect(container).toBeInTheDocument();
        expect(container).toHaveAttribute('role', 'status');
        expect(container).toHaveAttribute('aria-live', 'polite');

        const spinner = screen.getByTestId('modal-loading-spinner');
        expect(spinner).toBeInTheDocument();

        const message = screen.getByTestId('modal-loading-message');
        expect(message).toHaveTextContent('Carregando interface...');

        expect(screen.queryByTestId('modal-loading-title')).not.toBeInTheDocument();
    });

    // -------------------------------------------------------------
    // Happy Path: Custom Title & Custom Message
    // -------------------------------------------------------------
    it('should display custom title and message when provided', () => {
        // Arrange
        const customTitle = 'Vila da Aliança';
        const customMessage = 'Sincronizando estruturas medievais...';

        // Act
        render(<ModalLoadingFallback title={customTitle} message={customMessage} />);

        // Assert
        const titleEl = screen.getByTestId('modal-loading-title');
        expect(titleEl).toHaveTextContent(customTitle);

        const messageEl = screen.getByTestId('modal-loading-message');
        expect(messageEl).toHaveTextContent(customMessage);
    });

    // -------------------------------------------------------------
    // Edge Cases: Empty or Undefined Values
    // -------------------------------------------------------------
    it('should not render title element when title is undefined or empty', () => {
        // Arrange & Act
        const { rerender } = render(<ModalLoadingFallback title={undefined} />);

        // Assert
        expect(screen.queryByTestId('modal-loading-title')).toBeNull();

        // Edge case: empty string
        rerender(<ModalLoadingFallback title="" />);
        expect(screen.queryByTestId('modal-loading-title')).toBeNull();
    });

    it('should handle custom empty message without crashing', () => {
        // Arrange & Act
        render(<ModalLoadingFallback message="" />);

        // Assert
        const messageEl = screen.getByTestId('modal-loading-message');
        expect(messageEl).toHaveTextContent('');
    });
});
