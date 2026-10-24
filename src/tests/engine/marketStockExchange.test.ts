import { describe, it, expect } from 'vitest';
import {
    createInitialPortfolio,
    tickStockMarket,
    buyShares,
    sellShares,
    distributeDividends,
    INITIAL_COMPANIES,
    type ListedCompany,
    type PlayerStockPortfolio
} from '../../engine/marketStockExchange';

describe('Market Stock Exchange Engine (Market Dynamics + Town)', () => {
    const testCompany: ListedCompany = {
        id: 'corp_test',
        symbol: 'TEST',
        name: 'Test Mining Corp',
        sector: 'industry',
        currentPrice: 100,
        previousPrice: 100,
        basePrice: 100,
        volatility: 0.1,
        dividendYield: 0.05,
        description: 'Test company.'
    };

    describe('createInitialPortfolio', () => {
        it('should initialize empty portfolio with given cash (Happy Path)', () => {
            // Arrange & Act
            const portfolio = createInitialPortfolio(1000);

            // Assert
            expect(portfolio.cash).toBe(1000);
            expect(portfolio.holdings).toEqual({});
            expect(portfolio.totalDividendsEarned).toBe(0);
        });

        it('should clamp negative starting cash to zero (Edge Case)', () => {
            // Arrange & Act
            const portfolio = createInitialPortfolio(-500);

            // Assert
            expect(portfolio.cash).toBe(0);
        });
    });

    describe('tickStockMarket', () => {
        it('should apply market trend impact to prices and preserve floor price (Happy Path)', () => {
            // Arrange
            const mockRng = () => 0.5; // neutral noise

            // Act (Boom trend)
            const updated = tickStockMarket([testCompany], 'boom', mockRng);

            // Assert
            expect(updated[0].previousPrice).toBe(100);
            expect(updated[0].currentPrice).toBeGreaterThan(100);
        });

        it('should never drop share prices below minimum threshold (Edge Case)', () => {
            // Arrange
            const cheapCompany: ListedCompany = { ...testCompany, currentPrice: 5 };
            const mockCrashRng = () => 0.0; // Worst possible roll

            // Act
            const updated = tickStockMarket([cheapCompany], 'crash', mockCrashRng);

            // Assert
            expect(updated[0].currentPrice).toBeGreaterThanOrEqual(5);
        });
    });

    describe('buyShares & sellShares', () => {
        it('should deduct cash, register shares and compute profit on sale (Happy Path)', () => {
            // Arrange
            let portfolio = createInitialPortfolio(1000);

            // Act 1: Buy 5 shares @ 100 gold
            portfolio = buyShares(portfolio, testCompany, 5);

            // Assert 1
            expect(portfolio.cash).toBe(500);
            expect(portfolio.holdings['corp_test'].shares).toBe(5);
            expect(portfolio.holdings['corp_test'].totalCost).toBe(500);

            // Act 2: Sell 2 shares @ higher price 150 gold
            const companyIncreased: ListedCompany = { ...testCompany, currentPrice: 150 };
            const { updatedPortfolio, proceeds, profitOrLoss } = sellShares(portfolio, companyIncreased, 2);

            // Assert 2
            expect(proceeds).toBe(300); // 2 * 150
            expect(profitOrLoss).toBe(100); // (150 - 100) * 2
            expect(updatedPortfolio.cash).toBe(800); // 500 + 300
            expect(updatedPortfolio.holdings['corp_test'].shares).toBe(3);
        });

        it('should remove company from holdings when all shares are sold (Edge Case)', () => {
            // Arrange
            const portfolio = buyShares(createInitialPortfolio(500), testCompany, 5);

            // Act (Sell all 5)
            const { updatedPortfolio } = sellShares(portfolio, testCompany, 5);

            // Assert
            expect(updatedPortfolio.holdings['corp_test']).toBeUndefined();
        });

        it('should throw error when buying with insufficient funds (Exception handling)', () => {
            // Arrange
            const poorPortfolio = createInitialPortfolio(50);

            // Act & Assert
            expect(() => buyShares(poorPortfolio, testCompany, 1)).toThrow('Insufficient funds');
            expect(() => buyShares(poorPortfolio, testCompany, 0)).toThrow('must be positive');
        });

        it('should throw error when selling more shares than owned (Exception handling)', () => {
            // Arrange
            const portfolio = createInitialPortfolio(1000);

            // Act & Assert
            expect(() => sellShares(portfolio, testCompany, 1)).toThrow('Insufficient shares to sell');
            expect(() => sellShares(portfolio, testCompany, -1)).toThrow('must be positive');
        });
    });

    describe('distributeDividends', () => {
        it('should compute dividend payout scaled with town prosperity (Happy Path)', () => {
            // Arrange
            let portfolio = createInitialPortfolio(1000);
            portfolio = buyShares(portfolio, testCompany, 10); // 10 shares @ 100 gold, dividend 5%
            const companies = [testCompany];

            // Act (Town prosperity 100% -> bonus 2.0x -> 100 * 0.05 * 2.0 = 10 gold/share * 10 = 100 gold)
            const { updatedPortfolio, totalDividendsPaid } = distributeDividends(portfolio, companies, 100);

            // Assert
            expect(totalDividendsPaid).toBe(100);
            expect(updatedPortfolio.cash).toBe(100); // 0 + 100
            expect(updatedPortfolio.totalDividendsEarned).toBe(100);
        });

        it('should return 0 dividends when player owns no shares (Edge Case)', () => {
            // Arrange
            const emptyPortfolio = createInitialPortfolio(500);

            // Act
            const { totalDividendsPaid } = distributeDividends(emptyPortfolio, INITIAL_COMPANIES, 50);

            // Assert
            expect(totalDividendsPaid).toBe(0);
        });
    });
});
