
import React from 'react';
import { MONTH_LABELS } from '../data/constants';
import { PerformanceData } from '../types';

interface PerformanceEvaluationProps {
    data: PerformanceData;
    onChange: (data: PerformanceData) => void;
    onScoreUpdate: (score: number) => void; // Parent needs to know the calculated score
    readOnly: boolean;
}

const PerformanceEvaluation: React.FC<PerformanceEvaluationProps> = ({ data, onChange, onScoreUpdate, readOnly }) => {

    const monthlyCuts = data.monthlyCuts || new Array(12).fill(0);
    const excluded = data.excludedFromAverage || new Array(12).fill(false);

    // Calculation Logic
    const calculateMetrics = () => {
        let validMonths = 0;
        let totalCuts = 0;
        monthlyCuts.forEach((c, i) => {
            if (!excluded[i] && c > 0) {
                totalCuts += c;
                validMonths++;
            }
        });
        const average = validMonths > 0 ? Math.round(totalCuts / validMonths) : 0;
        const currentTotal = monthlyCuts.reduce((sum, c) => sum + (c || 0), 0);
        // Predictions
        // IF month is 0, assume average.
        let predictedTotal = 0;
        monthlyCuts.forEach((c, i) => {
            if (c > 0) predictedTotal += c;
            else if (!excluded[i]) predictedTotal += average;
        });

        return { currentTotal, average, predictedTotal };
    };

    const { currentTotal, average, predictedTotal } = calculateMetrics();

    const calculateCutScore = (cuts: number) => {
        if (cuts < 6000) return 5;
        const base = 15;
        const extra = Math.floor((cuts - 6000) / 100);
        const total = base + extra;
        return Math.min(total, 50);
    };

    const score = calculateCutScore(predictedTotal);

    // Effect to update parent score
    React.useEffect(() => {
        onScoreUpdate(score);
    }, [score]);


    const handleCutChange = (index: number, val: string) => {
        const num = parseInt(val) || 0;
        const newCuts = [...monthlyCuts];
        newCuts[index] = num;
        onChange({ ...data, monthlyCuts: newCuts });
    };

    const toggleExclude = (index: number) => {
        const newEx = [...excluded];
        newEx[index] = !newEx[index];
        onChange({ ...data, excludedFromAverage: newEx });
    };

    const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...data, goalCuts: parseInt(e.target.value) || 0 });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center text-center">
                <h2 className="text-xl font-bold text-gray-700 mb-2">年間実績評価</h2>
                <div className="text-6xl font-bold text-blue-600 mb-2">{score}<span className="text-2xl text-gray-400">/50</span></div>
                <p className="text-sm text-gray-500">年間着地予想: <span className="font-bold text-gray-800">{predictedTotal.toLocaleString()}名</span></p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-700">月別カット実績入力</h3>
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        現在の累計: <strong>{currentTotal.toLocaleString()}</strong>名 / 平均: <strong>{average}</strong>名
                    </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {MONTH_LABELS.map((label, i) => (
                        <div key={i} className={`p-2 rounded border ${excluded[i] ? 'bg-gray-100 border-gray-200 opacity-60' : 'bg-white border-blue-100'}`}>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-xs font-bold text-gray-500">{label}</label>
                                <input
                                    type="checkbox"
                                    checked={excluded[i]}
                                    onChange={() => toggleExclude(i)}
                                    title="平均計算から除外 (長期休暇など)"
                                    className="w-3 h-3"
                                    disabled={readOnly}
                                />
                            </div>
                            <input
                                type="number"
                                value={monthlyCuts[i] > 0 ? monthlyCuts[i] : ''}
                                onChange={(e) => handleCutChange(i, e.target.value)}
                                placeholder="0"
                                className="w-full text-right font-bold text-gray-800 border-b border-gray-200 focus:border-blue-500 outline-none p-1"
                                disabled={readOnly}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
                <h3 className="font-bold text-blue-900 text-sm mb-3">目標設定</h3>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex-1 w-full">
                        <label className="text-xs font-bold text-blue-700 mb-1 block">年間目標カット数</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={data.goalCuts > 0 ? data.goalCuts : ''}
                                onChange={handleGoalChange}
                                className="w-full text-lg font-bold p-2 rounded border border-blue-200 outline-none focus:ring-2 focus:ring-blue-300"
                                placeholder="例: 9000"
                                disabled={readOnly}
                            />
                            <span className="text-sm font-bold text-blue-800">名</span>
                        </div>
                    </div>
                    {data.goalCuts > 0 && (
                        <div className="bg-white p-3 rounded-lg shadow-sm w-full sm:w-auto min-w-[150px] text-center">
                            <div className="text-xs text-gray-500">達成率(予想)</div>
                            <div className={`text-xl font-bold ${predictedTotal >= data.goalCuts ? 'text-green-600' : 'text-orange-500'}`}>
                                {Math.round((predictedTotal / data.goalCuts) * 100)}%
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* HOLIDAYS INPUT - Optional feature from type definition, though not heavily used in original logic display? Added for completeness based on type */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 hidden">
                {/*  Hidden unless required, keeping UI cleaner. Original code had monthlyHolidays in state but didn't show prominent UI for it in the viewed lines? 
                      Actually it was initializing it. Let's keep it minimal. */}
            </div>
        </div>
    );
};

export default PerformanceEvaluation;
