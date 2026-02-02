import { EvaluationItem as EvaluationItemType } from '../../data/constants';
import { EvaluationItem } from './EvaluationItem';

interface EvaluationSectionProps {
    items: EvaluationItemType[];
    activeTab: string;
    isManager: boolean;
    onUpdateScore: (no: number, score: number) => void;
    onUpdateMemo: (no: number, memo: string) => void;
    onUpdateIncidents: (no: number, incidents: any[]) => void;
    readOnly?: boolean;
}

export const EvaluationSection: React.FC<EvaluationSectionProps> = ({
    items,
    activeTab,
    isManager,
    onUpdateScore,
    onUpdateMemo,
    onUpdateIncidents,
    readOnly
}) => {
    // Filter items by active category
    const filteredItems = items.filter(item => item.category === activeTab);

    return (
        <div className="space-y-4 print-break-inside-avoid">
            {filteredItems.map((item) => (
                <EvaluationItem
                    key={item.no}
                    item={item}
                    isManager={isManager} // Logic: Check if manager category unlocked? Or just pass bool? 
                    // Actually `isManager` in `EvaluationItem` prop was not used in my implementation of `EvaluationItem` except maybe for styling or logic I missed? 
                    // Re-checking EvaluationItem.tsx... I see `isManager` prop but didn't explicitly use it for hiding/showing. 
                    // In index.html, `EvaluationItem` didn't take `isManager`. 
                    // It used `item.subCategory` to determine logic.
                    // `ChartSection` used `isManagerUnlocked`.
                    // I'll keep passing it just in case, or refine later.
                    onUpdateScore={(score) => onUpdateScore(item.no, score)}
                    onUpdateMemo={(memo) => onUpdateMemo(item.no, memo)}
                    onUpdateIncidents={(incidents) => onUpdateIncidents(item.no, incidents)}
                    readOnly={readOnly}
                />
            ))}

            {filteredItems.length === 0 && (
                <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    このカテゴリには項目がありません
                </div>
            )}
        </div>
    );
};
