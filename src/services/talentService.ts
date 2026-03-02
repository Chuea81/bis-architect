
import { ClassName, ItemStats } from '../types';
import { talentData } from '../data';
import { TALENT_STATS } from '../data/talentStats';

export const calculateTalentStats = (talentPoints: Record<string, number>, currentClass: ClassName): ItemStats => {
    const total: ItemStats = {};
    const key = currentClass.toLowerCase();
    // @ts-ignore
    const trees = talentData[key];
    if (!trees) return total;

    Object.values(trees).forEach((tree: any) => {
        if (!tree.talents) return;
        Object.entries(tree.talents).forEach(([name, talent]: [string, any]) => {
            const rank = talentPoints[name] || 0;
            if (rank <= 0) return;

            // Try inline stats first, then fall back to TALENT_STATS lookup
            const statFn = talent.stats || TALENT_STATS[name];
            if (statFn) {
                let bonuses = typeof statFn === 'function' ? statFn(rank) : statFn;
                if (bonuses) {
                    Object.entries(bonuses).forEach(([k, v]) => {
                        // @ts-ignore
                        total[k] = (total[k] || 0) + (v as number);
                    });
                }
            }
        });
    });
    return total;
};

export const TalentService = {
    calculateTalentStats
};
