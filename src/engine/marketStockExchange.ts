/**
 * Town & Interstellar Stock Exchange Engine
 * Bridges Market Dynamics Trends with Town Economy, Prosperity, and Guild Investments.
 */

import type { MarketTrendType } from './types';

export interface ListedCompany {
    id: string;
    symbol: string;
    name: string;
    sector: 'industry' | 'agriculture' | 'maritime' | 'liminal' | 'cosmic';
    currentPrice: number;
    previousPrice: number;
    basePrice: number;
    volatility: number; // e.g. 0.05 for 5% swing standard deviation
    dividendYield: number; // 0.02 = 2% dividend per cycle
    description: string;
}

export interface StockHolding {
    shares: number;
    totalCost: number; // For average buy price calculation
}

export interface PlayerStockPortfolio {
    cash: number;
    holdings: Record<string, StockHolding>; // companyId -> holding
    totalDividendsEarned: number;
}

export const INITIAL_COMPANIES: ListedCompany[] = [
    {
        id: 'corp_ironworks',
        symbol: 'IRON',
        name: 'Siderúrgica Imperial da Vila',
        sector: 'industry',
        currentPrice: 100,
        previousPrice: 100,
        basePrice: 100,
        volatility: 0.08,
        dividendYield: 0.03,
        description: 'Líder na fundição de ferro e ligas de aço para a vila.'
    },
    {
        id: 'corp_aetheria',
        symbol: 'AETH',
        name: 'Aetheria Botânica & Alquimia',
        sector: 'agriculture',
        currentPrice: 50,
        previousPrice: 50,
        basePrice: 50,
        volatility: 0.12,
        dividendYield: 0.04,
        description: 'Cultivo de ervas arcanas e produção em massa de elixires.'
    },
    {
        id: 'corp_deepsea',
        symbol: 'FISH',
        name: 'Companhia Pesqueira Mar Profundo',
        sector: 'maritime',
        currentPrice: 30,
        previousPrice: 30,
        basePrice: 30,
        volatility: 0.06,
        dividendYield: 0.05,
        description: 'Operações marítimas e frotas de arrasto na doca.'
    },
    {
        id: 'corp_liminal',
        symbol: 'MEGL',
        name: 'M.E.G. Logística Liminar',
        sector: 'liminal',
        currentPrice: 200,
        previousPrice: 200,
        basePrice: 200,
        volatility: 0.25,
        dividendYield: 0.01,
        description: 'Extração de sucatas de alto risco nas Backrooms.'
    },
    {
        id: 'corp_cosmic',
        symbol: 'STAR',
        name: 'Consórcio Forja Estelar',
        sector: 'cosmic',
        currentPrice: 500,
        previousPrice: 500,
        basePrice: 500,
        volatility: 0.18,
        dividendYield: 0.02,
        description: 'Mineração e refino de ligas exóticas em órbita.'
    }
];

export const createInitialPortfolio = (startingCash: number = 0): PlayerStockPortfolio => ({
    cash: Math.max(0, startingCash),
    holdings: {},
    totalDividendsEarned: 0
});

/**
 * Simulates a stock market tick, reacting to global market trends.
 */
export const tickStockMarket = (
    companies: ListedCompany[],
    marketTrend: MarketTrendType,
    rng: () => number = Math.random
): ListedCompany[] => {
    let trendMultiplier = 1.0;
    if (marketTrend === 'boom') trendMultiplier = 1.05;
    else if (marketTrend === 'bull') trendMultiplier = 1.02;
    else if (marketTrend === 'bear') trendMultiplier = 0.98;
    else if (marketTrend === 'crash') trendMultiplier = 0.93;
    else if (marketTrend === 'volatile') trendMultiplier = rng() > 0.5 ? 1.08 : 0.92;

    return companies.map(company => {
        // Random normal-like noise between -1 and +1
        const randomFactor = (rng() - 0.5) * 2;
        const changePercent = (company.volatility * randomFactor) + (trendMultiplier - 1.0);

        const newPrice = Math.max(5, Math.floor(company.currentPrice * (1 + changePercent)));

        return {
            ...company,
            previousPrice: company.currentPrice,
            currentPrice: newPrice
        };
    });
};

/**
 * Buys shares of a company, updating player portfolio.
 */
export const buyShares = (
    portfolio: PlayerStockPortfolio,
    company: ListedCompany,
    sharesToBuy: number
): PlayerStockPortfolio => {
    if (sharesToBuy <= 0) {
        throw new Error('Number of shares to buy must be positive.');
    }

    const totalCost = sharesToBuy * company.currentPrice;
    if (portfolio.cash < totalCost) {
        throw new Error(`Insufficient funds: requires ${totalCost} gold, player has ${portfolio.cash}.`);
    }

    const currentHolding = portfolio.holdings[company.id] || { shares: 0, totalCost: 0 };
    const newShares = currentHolding.shares + sharesToBuy;
    const newTotalCost = currentHolding.totalCost + totalCost;

    return {
        ...portfolio,
        cash: portfolio.cash - totalCost,
        holdings: {
            ...portfolio.holdings,
            [company.id]: {
                shares: newShares,
                totalCost: newTotalCost
            }
        }
    };
};

/**
 * Sells shares of a company, adding cash to portfolio.
 */
export const sellShares = (
    portfolio: PlayerStockPortfolio,
    company: ListedCompany,
    sharesToSell: number
): { updatedPortfolio: PlayerStockPortfolio; proceeds: number; profitOrLoss: number } => {
    if (sharesToSell <= 0) {
        throw new Error('Number of shares to sell must be positive.');
    }

    const currentHolding = portfolio.holdings[company.id];
    if (!currentHolding || currentHolding.shares < sharesToSell) {
        throw new Error('Insufficient shares to sell.');
    }

    const proceeds = sharesToSell * company.currentPrice;
    const avgCostPerShare = currentHolding.totalCost / currentHolding.shares;
    const costBasis = avgCostPerShare * sharesToSell;
    const profitOrLoss = proceeds - costBasis;

    const remainingShares = currentHolding.shares - sharesToSell;
    const remainingCost = remainingShares > 0 ? currentHolding.totalCost - costBasis : 0;

    const updatedHoldings = { ...portfolio.holdings };
    if (remainingShares > 0) {
        updatedHoldings[company.id] = {
            shares: remainingShares,
            totalCost: remainingCost
        };
    } else {
        delete updatedHoldings[company.id];
    }

    return {
        updatedPortfolio: {
            ...portfolio,
            cash: portfolio.cash + proceeds,
            holdings: updatedHoldings
        },
        proceeds,
        profitOrLoss
    };
};

/**
 * Distributes dividend payouts based on town prosperity and shares owned.
 */
export const distributeDividends = (
    portfolio: PlayerStockPortfolio,
    companies: ListedCompany[],
    townProsperity: number = 50
): { updatedPortfolio: PlayerStockPortfolio; totalDividendsPaid: number } => {
    let totalDividendsPaid = 0;
    const prosperityBonus = 1 + Math.max(0, townProsperity) / 100;

    for (const company of companies) {
        const holding = portfolio.holdings[company.id];
        if (holding && holding.shares > 0) {
            const dividendPerShare = company.currentPrice * company.dividendYield * prosperityBonus;
            const payout = Math.floor(holding.shares * dividendPerShare);
            totalDividendsPaid += payout;
        }
    }

    if (totalDividendsPaid <= 0) {
        return { updatedPortfolio: portfolio, totalDividendsPaid: 0 };
    }

    return {
        updatedPortfolio: {
            ...portfolio,
            cash: portfolio.cash + totalDividendsPaid,
            totalDividendsEarned: portfolio.totalDividendsEarned + totalDividendsPaid
        },
        totalDividendsPaid
    };
};
