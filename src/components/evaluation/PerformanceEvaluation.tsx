import React, { useEffect } from 'react';
// import { CheckSquare, Square, Calculator } from 'lucide-react';
import { LuSquareCheck, LuSquare, LuCalculator } from 'react-icons/lu';
import { MONTHS } from '../../data/constants';
import { calculatePerformanceMetrics } from '../../utils/evaluationUtils';
import { PerformanceData } from '../../types';

interface PerformanceEvaluationProps {
    data: PerformanceData;
    onChange: (data: PerformanceData) => void;
    onScoreUpdate: (score: number) => void;
    readOnly?: boolean;
}

export const PerformanceEvaluation: React.FC<PerformanceEvaluationProps> = ({
    data,
    onChange,
    onScoreUpdate,
    readOnly
}) => {
    const monthlyCuts = data.monthlyCuts && data.monthlyCuts.length === 12
        ? data.monthlyCuts
        : new Array(12).fill(0);

    const excludedFromAverage = data.excludedFromAverage && data.excludedFromAverage.length === 12
        ? data.excludedFromAverage
        : new Array(12).fill(false);

    const { currentTotal, average, predictedTotal } = calculatePerformanceMetrics(monthlyCuts, excludedFromAverage);

    const calculateCutScore = (cuts: number) => {
        if (cuts < 6000) return 5;
        const base = 15;
        const extra = Math.floor((cuts - 6000) / 100);
        const total = base + extra;
        return Math.min(total, 50);
    };

    const predictionScore = calculateCutScore(predictedTotal);
    // Calculate goal score based on goal cuts automatically
    const goalScoreCalculated = calculateCutScore(data.goalCuts);

    useEffect(() => {
        // Only trigger update if score changes to avoid loops?
        // The parent determines if it should update state.
        onScoreUpdate(predictionScore);
    }, [predictionScore, onScoreUpdate]);

    const handleMonthlyChange = (index: number, val: number) => {
        const newCuts = [...monthlyCuts];
        newCuts[index] = val;
        onChange({ ...data, monthlyCuts: newCuts });
    };

    const toggleExclusion = (index: number) => {
        const newExcluded = [...excludedFromAverage];
        newExcluded[index] = !newExcluded[index];
        onChange({ ...data, excludedFromAverage: newExcluded });
    };

    const handleInputChange = (field: keyof PerformanceData, value: any) => {
        onChange({ ...data, [field]: value });
    };

    const monthDays = 30.5;
    const workDays = monthDays - (data.monthlyHolidays || 0);
    const monthlyAvgCuts = average > 0 ? average : (data.goalCuts / 12);
    const cutsPerDay = workDays > 0 ? (monthlyAvgCuts / workDays).toFixed(1) : "0";

    return (
        <div className="space-y-4 sm:space-y-6 print-break-inside-avoid">
            <div className="bg-white p-3 sm:p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-base sm:text-lg text-[#002C5F] mb-4 flex items-center gap-2">
                    📊 年間カット人数評価
                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded">実績評価</span>
                </h3>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3 mb-6 no-print print:hidden">
                    {MONTHS.map((m) => {
                        const isExcluded = excludedFromAverage[m.index];
                        const hasValue = monthlyCuts[m.index] > 0;

                        return (
                            <div key={m.index} className="flex flex-col bg-gray-50 p-1.5 sm:p-2 rounded border border-gray-100">
                                <label className="text-xs text-gray-500 text-center mb-1 font-bold">{m.label}</label>
                                <input
                                    type="number"
                                    pattern="\d*"
                                    value={monthlyCuts[m.index] || ''}
                                    onChange={(e) => !readOnly && handleMonthlyChange(m.index, parseInt(e.target.value) || 0)}
                                    placeholder={hasValue ? "" : `${average}`}
                                    disabled={readOnly}
                                    className={`p-2 border rounded text-center outline-none focus:ring-2 focus:ring-blue-400 w-full mb-1 text-base ${hasValue ? 'bg-white border-gray-300 font-bold text-gray-900' : 'bg-gray-100 border-gray-200 text-gray-400'}`}
                                />

                                <button
                                    type="button"
                                    onClick={() => !readOnly && toggleExclusion(m.index)}
                                    disabled={readOnly}
                                    className={`flex items-center justify-center gap-1 text-[10px] py-1 px-1 rounded transition-colors ${!isExcluded ? 'bg-[#E6F0FA] text-[#002C5F] font-bold border border-[#BFD8F2]' : 'bg-gray-200 text-gray-500 border border-gray-300'}`}
                                >
                                    {!isExcluded ? <span><LuSquareCheck size={14} /></span> : <span><LuSquare size={14} /></span>}
                                    {isExcluded ? '除外' : '平均計算'}
                                </button>
                            </div>
                        )
                    })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div>
                        <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">目標年間カット人数</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                pattern="\d*"
                                value={data.goalCuts || ''}
                                onChange={(e) => !readOnly && handleInputChange('goalCuts', parseInt(e.target.value) || 0)}
                                disabled={readOnly}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#002C5F] outline-none text-right font-mono text-lg"
                                placeholder="7000"
                            />
                            <span className="text-gray-600 text-sm">人</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 text-right flex items-center justify-end gap-1">
                            <span>目標スコア:</span>
                            <span className="font-bold text-[#002C5F] bg-[#F0F5FA] px-2 py-1 rounded min-w-[2rem] text-center inline-block">{goalScoreCalculated}</span>
                            <span>点 (自動算出)</span>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">現在の実績合計 (入力分)</div>
                        <div className="text-xl font-bold text-gray-800 text-right">{currentTotal.toLocaleString()} 人</div>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                            <span className="text-xs text-gray-500">算出用平均</span>
                            <span className="text-sm font-bold text-gray-700">{average.toLocaleString()} 人/月</span>
                        </div>
                    </div>

                    <div className="bg-[#F0F5FA] p-3 rounded border border-[#BFD8F2]">
                        <div className="text-xs text-blue-800 mb-1 font-bold">年間着地予想 (実数+仮定)</div>
                        <div className="text-2xl font-bold text-[#002C5F] text-right">{Math.round(predictedTotal).toLocaleString()} 人</div>
                        <div className="flex justify-between items-center mt-2 border-t border-[#BFD8F2] pt-2">
                            <span className="text-xs font-bold text-blue-800">予想スコア</span>
                            <span className="text-xl font-bold text-red-600">{predictionScore} 点</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-3 sm:p-5 rounded-xl border border-gray-200 shadow-sm no-print print:hidden">
                <h3 className="font-bold text-base sm:text-lg text-gray-700 mb-4 flex items-center gap-2">
                    <span><LuCalculator size={20} /></span> 勤務・生産性試算
                </h3>
                <div className="flex items-end gap-4 mb-4">
                    <div className="flex-grow">
                        <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">月契約公休数</label>
                        <input
                            type="number"
                            pattern="\d*"
                            value={data.monthlyHolidays || ''}
                            onChange={(e) => !readOnly && handleInputChange('monthlyHolidays', parseInt(e.target.value) || 0)}
                            disabled={readOnly}
                            className="w-full p-2 border border-gray-300 rounded text-right text-lg"
                            placeholder="例: 8"
                        />
                    </div>
                    <div className="pb-2 text-gray-400 text-xs">
                        ※月30.5日で計算
                    </div>
                </div>

                <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-2 sm:p-3 rounded">
                        <div className="text-xs text-gray-500">実働日数 (月)</div>
                        <div className="text-lg font-bold text-gray-800">{workDays}日</div>
                    </div>
                    <div className="bg-green-50 p-2 sm:p-3 rounded border border-green-100">
                        <div className="text-xs text-green-800">1日あたり平均(予)</div>
                        <div className="text-lg font-bold text-green-900">{cutsPerDay}人/日</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
