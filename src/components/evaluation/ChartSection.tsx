import React from 'react';
import { EvaluationItem } from '../../data/constants';

interface ChartSectionProps {
    items: EvaluationItem[];
    performanceData: any;
    isManagerUnlocked: boolean;
}

export const ChartSection: React.FC<ChartSectionProps> = ({ items, performanceData, isManagerUnlocked }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-center text-gray-500 py-10">
                <p>現在、チャート機能はデバッグのため一時的に無効化されています。</p>
                <p>(Illegal constructor エラーの調査中)</p>
            </div>
        </div>
    );
};
