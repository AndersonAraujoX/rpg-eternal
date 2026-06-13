import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateMarketStock } from '../../engine/market';

describe('Market Engine', () => {
    describe('generateMarketStock', () => {
        beforeEach(() => {
            vi.spyOn(Math, 'random');
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('should generate between 3 and 5 items', () => {
            // Test lower bound (Math.random() near 0 -> stockSize 3)
            vi.mocked(Math.random).mockReturnValue(0.01);
            let stock = generateMarketStock();
            expect(stock.length).toBe(3);

            // Test upper bound (Math.random() near 1 -> stockSize 5)
            vi.mocked(Math.random).mockReturnValue(0.99);
            stock = generateMarketStock();
            expect(stock.length).toBe(5);
        });

        it('should generate valid market items with expected properties', () => {
            // Use a fixed random value so we get predictable results
            vi.mocked(Math.random).mockReturnValue(0.5);
            const stock = generateMarketStock();

            expect(stock.length).toBeGreaterThan(0);

            stock.forEach((item, index) => {
                // Ensure required fields exist
                expect(item).toHaveProperty('id');
                expect(item).toHaveProperty('name');
                expect(item).toHaveProperty('description');
                expect(item).toHaveProperty('cost');
                expect(item).toHaveProperty('currency');
                expect(item).toHaveProperty('stock');
                expect(item).toHaveProperty('type');
                expect(item).toHaveProperty('emoji');

                // Ensure the stock value is within bounds (1 to 3)
                // With mock returning 0.5, Math.floor(0.5 * 3) + 1 = 1 + 1 = 2
                expect(item.stock).toBe(2);

                // Ensure id is correctly appended
                // template id is something like 'gambit_pack', index is the array position
                expect(item.id).toMatch(/_[0-9]+$/);
                expect(item.id.endsWith(`_${index}`)).toBe(true);
            });
        });

        it('should randomize item stock between 1 and 3', () => {
            // To properly test stock, we need to return specific values for specific random calls
            // generateMarketStock calls Math.random for:
            // 1. stockSize (1 call)
            // For each item:
            // 2. template index (1 call)
            // 3. item stock (1 call)

            // Generate exactly 1 item for simplicity:
            // stockSize = Math.floor(0 * 3) + 3 = 3
            // So we need:
            // call 1: 0 (stockSize 3)
            // loop 1: call 2: 0 (template), call 3: 0.1 (stock = 1)
            // loop 2: call 4: 0 (template), call 5: 0.5 (stock = 2)
            // loop 3: call 6: 0 (template), call 7: 0.9 (stock = 3)

            vi.mocked(Math.random)
                .mockReturnValueOnce(0)   // stockSize = 3
                .mockReturnValueOnce(0)   // item 1 template
                .mockReturnValueOnce(0.1) // item 1 stock = 1
                .mockReturnValueOnce(0)   // item 2 template
                .mockReturnValueOnce(0.5) // item 2 stock = 2
                .mockReturnValueOnce(0)   // item 3 template
                .mockReturnValueOnce(0.9);// item 3 stock = 3

            const stock = generateMarketStock();

            expect(stock.length).toBe(3);
            expect(stock[0].stock).toBe(1);
            expect(stock[1].stock).toBe(2);
            expect(stock[2].stock).toBe(3);
        });
    });
});
