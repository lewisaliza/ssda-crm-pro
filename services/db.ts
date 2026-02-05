
import { Contribution, ContributionType } from '../types';
import { MOCK_CONTRIBUTIONS } from '../mockData';

const STORAGE_KEY = 'crm_contributions';

export const db = {
    contributions: {
        getAll: async (): Promise<Contribution[]> => {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 800));

            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
            return MOCK_CONTRIBUTIONS;
        },

        add: async (contribution: Contribution): Promise<Contribution> => {
            await new Promise(resolve => setTimeout(resolve, 500));

            const current = await db.contributions.getAll();
            const updated = [contribution, ...current];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return contribution;
        }
    }
};
