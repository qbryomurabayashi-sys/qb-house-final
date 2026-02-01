
import React, { useMemo } from 'react';
import { EvaluationItem, PerformanceData } from '../types';
import { AXES } from '../data/constants';

interface ScoreDashboardProps {
    items: EvaluationItem[];
    performanceScore: number;
    performanceData: PerformanceData;
    isManagerUnlocked: boolean;
}

const ScoreDashboard: React.FC<ScoreDashboardProps> = ({ items, performanceScore, performanceData, isManagerUnlocked }) => {
    // Helper to safely get score
    const getScore = (i: EvaluationItem) => i.score ?? 0;

    // Calculate category scores
    const relationshipScore = useMemo(() => items.filter(i => i.category === '関係性').reduce((sum, i) => sum + getScore(i), 0), [items]);
    const customerServiceScore = useMemo(() => items.filter(i => i.category === '接客').reduce((sum, i) => sum + getScore(i), 0), [items]);
    const technicalScore = useMemo(() => items.filter(i => i.category === '技術').reduce((sum, i) => sum + getScore(i), 0), [items]);

    // Total score calculation (stylist only)
    const totalScore200 = relationshipScore + customerServiceScore + technicalScore + performanceScore;

    const managerItems = useMemo(() => items.filter(i => i.category === '店長'), [items]);
    const managerTotal = useMemo(() => managerItems.reduce((sum, i) => sum + getScore(i), 0), [managerItems]);

    // Group manager scores for display
    const mgrOps = managerItems.filter(i => i.subCategory === '運営管理スキル').reduce((sum, i) => sum + getScore(i), 0);
    const mgrCust = managerItems.filter(i => i.subCategory === '顧客サービススキル').reduce((sum, i) => sum + getScore(i), 0);
    const mgrTeam = managerItems.filter(i => i.subCategory === 'チームマネジメントスキル').reduce((sum, i) => sum + getScore(i), 0);
    const mgrStrat = managerItems.filter(i => i.subCategory === '戦略思考スキル').reduce((sum, i) => sum + getScore(i), 0);
    const mgrProb = managerItems.filter(i => i.subCategory === '問題解決スキル').reduce((sum, i) => sum + getScore(i), 0);
    const mgrPersonal = managerItems.filter(i => i.subCategory === '個人の属性').reduce((sum, i) => sum + getScore(i), 0);
    const mgrComp = managerItems.filter(i => i.subCategory === '管理責任・コンプライアンス').reduce((sum, i) => sum + getScore(i), 0);

    const mgrCol1 = mgrOps + mgrCust; // 運営・顧客
    const mgrCol2 = mgrTeam + mgrStrat; // チーム・戦略
    const mgrCol3 = mgrProb; // 問題解決
    const mgrCol4 = mgrPersonal + mgrComp; // その他(行動・コンプラ)

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 font-sans text-gray-800">
            {/* --- SCREEN ONLY DASHBOARD --- */}
            <div className={`bg-white rounded-xl shadow-sm border border-gray-200 screen-view-container p-2 ${isManagerUnlocked ? 'hidden print:block' : ''}`}> {/* Hide simplified if manager unlocked for complex view? Original code didn't hide, but maybe intended layout differs */}
                <div className="mb-2">
                    <h3 className="text-sm font-bold text-gray-500 mb-2 pl-1">スタッフ評価</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-0 border border-gray-300 rounded overflow-hidden">
                        {/* 関係性 */}
                        <div className="flex flex-col items-center justify-center p-3 border-b md:border-b-0 border-r border-gray-300 bg-gray-50">
                            <span className="font-bold text-gray-500 text-xs mb-1">関係性<br />(51点)</span>
                            <span className="font-bold text-2xl text-gray-800">{relationshipScore}</span>
                        </div>
                        {/* 接客 */}
                        <div className="flex flex-col items-center justify-center p-3 border-b md:border-b-0 border-r border-gray-300 bg-gray-50">
                            <span className="font-bold text-gray-500 text-xs mb-1">接客<br />(49点)</span>
                            <span className="font-bold text-2xl text-gray-800">{customerServiceScore}</span>
                        </div>
                        {/* 技術 */}
                        <div className="flex flex-col items-center justify-center p-3 border-r border-gray-300 bg-gray-50">
                            <span className="font-bold text-gray-500 text-xs mb-1">技術<br />(50点)</span>
                            <span className="font-bold text-2xl text-gray-800">{technicalScore}</span>
                        </div>
                        {/* 実績 */}
                        <div className="flex flex-col items-center justify-center p-3 border-r md:border-r-0 border-gray-300 bg-gray-50">
                            <span className="font-bold text-gray-500 text-xs mb-1">実績<br />(50点)</span>
                            <span className="font-bold text-2xl text-gray-800">{performanceScore}</span>
                        </div>
                        {/* 総合 - Full width on mobile/tablet if needed, or col 5 */}
                        <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center p-3 bg-blue-50">
                            <span className="font-bold text-blue-800 text-xs mb-1">総合<br />(200点)</span>
                            <span className="font-bold text-3xl text-blue-900">{totalScore200}</span>
                        </div>
                    </div>
                </div>

                {isManagerUnlocked && (
                    <div className="mt-4 border-t border-dashed border-gray-300 pt-4">
                        <h3 className="text-sm font-bold text-gray-500 mb-2 pl-1">店長評価</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-0 border border-gray-300 rounded overflow-hidden">
                            <div className="flex flex-col items-center justify-center p-2 border-r border-b lg:border-b-0 border-gray-300 bg-orange-50">
                                <span className="text-[10px] text-gray-500 font-bold mb-1 text-center">運営・顧客<br />(24点)</span>
                                <span className="font-bold text-xl text-gray-800">{mgrCol1}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-2 border-r border-b lg:border-b-0 border-gray-300 bg-orange-50">
                                <span className="text-[10px] text-gray-500 font-bold mb-1 text-center">チーム・戦略<br />(24点)</span>
                                <span className="font-bold text-xl text-gray-800">{mgrCol2}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-2 border-r border-gray-300 bg-orange-50">
                                <span className="text-[10px] text-gray-500 font-bold mb-1 text-center">問題解決<br />(12点)</span>
                                <span className="font-bold text-xl text-gray-800">{mgrCol3}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-2 border-r border-gray-300 bg-orange-50">
                                <span className="text-[10px] text-gray-500 font-bold mb-1 text-center">属性・責任<br />(44点)</span>
                                <span className="font-bold text-xl text-gray-800">{mgrCol4}</span>
                            </div>
                            <div className="col-span-2 lg:col-span-1 flex flex-col items-center justify-center p-2 bg-orange-100">
                                <span className="text-[10px] text-orange-800 font-bold mb-1 text-center">店長合計<br />(104点)</span>
                                <span className="font-bold text-2xl text-orange-900">{managerTotal}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* PRINT VIEW is handled in renderBatchPrintContent inside App mainly, or here as simplified */}
            <div className="hidden print:block border border-gray-300 rounded p-1">
                <div className="grid grid-cols-5 gap-px bg-gray-300 text-[8pt]">
                    <div className="bg-gray-50 p-1 text-center flex flex-col justify-center">
                        <span className="font-bold text-gray-500 text-[6pt]">関係性(51)</span>
                        <span className="font-bold text-gray-800">{relationshipScore}</span>
                    </div>
                    <div className="bg-gray-50 p-1 text-center flex flex-col justify-center">
                        <span className="font-bold text-gray-500 text-[6pt]">接客(49)</span>
                        <span className="font-bold text-gray-800">{customerServiceScore}</span>
                    </div>
                    <div className="bg-gray-50 p-1 text-center flex flex-col justify-center">
                        <span className="font-bold text-gray-500 text-[6pt]">技術(50)</span>
                        <span className="font-bold text-gray-800">{technicalScore}</span>
                    </div>
                    <div className="bg-gray-50 p-1 text-center flex flex-col justify-center">
                        <span className="font-bold text-gray-500 text-[6pt]">実績(50)</span>
                        <span className="font-bold text-gray-800">{performanceScore}</span>
                    </div>
                    <div className="bg-gray-100 p-1 text-center flex flex-col justify-center">
                        <span className="font-bold text-gray-500 text-[6pt]">合計(200)</span>
                        <span className="font-bold text-gray-900">{totalScore200}</span>
                    </div>
                </div>
                {isManagerUnlocked && (
                    <div className="grid grid-cols-5 gap-px bg-gray-300 text-[8pt] mt-px">
                        <div className="bg-orange-50 p-1 text-center flex flex-col justify-center">
                            <span className="font-bold text-gray-500 text-[6pt]">運営客(24)</span>
                            <span className="font-bold text-gray-800">{mgrCol1}</span>
                        </div>
                        <div className="bg-orange-50 p-1 text-center flex flex-col justify-center">
                            <span className="font-bold text-gray-500 text-[6pt]">チー戦(24)</span>
                            <span className="font-bold text-gray-800">{mgrCol2}</span>
                        </div>
                        <div className="bg-orange-50 p-1 text-center flex flex-col justify-center">
                            <span className="font-bold text-gray-500 text-[6pt]">問解決(12)</span>
                            <span className="font-bold text-gray-800">{mgrCol3}</span>
                        </div>
                        <div className="bg-orange-50 p-1 text-center flex flex-col justify-center">
                            <span className="font-bold text-gray-500 text-[6pt]">属責任(44)</span>
                            <span className="font-bold text-gray-800">{mgrCol4}</span>
                        </div>
                        <div className="bg-orange-100 p-1 text-center flex flex-col justify-center">
                            <span className="font-bold text-gray-500 text-[6pt]">店長計(104)</span>
                            <span className="font-bold text-gray-900">{managerTotal}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScoreDashboard;
