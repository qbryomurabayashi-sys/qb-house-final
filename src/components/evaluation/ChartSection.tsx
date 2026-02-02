import { useMemo } from 'react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { AXES, MANAGER_AXES, MONTH_LABELS } from '../../data/constants';
import { EvaluationItem, PerformanceData } from '../../types';

interface ChartSectionProps {
    items: EvaluationItem[];
    performanceData: PerformanceData;
    performanceScore: number;
    comparisonItems?: EvaluationItem[];
    comparisonPerformanceScore?: number;
}

export const ChartSection: React.FC<ChartSectionProps> = ({
    items,
    performanceData,
    performanceScore,
    comparisonItems,
    comparisonPerformanceScore
}) => {

    // --- Radar Chart Data Logic ---
    const radarData = useMemo(() => {
        return AXES.map((axis) => {
            // Current Data (A)
            let percentageA = 0;
            if (axis === '実績') {
                percentageA = Math.min(100, Math.round((performanceScore / 50) * 100));
            } else {
                const axisItems = items.filter((i) => i.axis === axis && i.max > 0);
                if (axisItems.length > 0) {
                    const currentSum = axisItems.reduce((sum, i) => sum + (i.score ?? 0), 0);
                    const maxSum = axisItems.reduce((sum, i) => sum + i.max, 0);
                    percentageA = maxSum === 0 ? 0 : Math.round((currentSum / maxSum) * 100);
                }
            }

            // Comparison Data (B)
            let percentageB = 0;
            if (comparisonItems) {
                if (axis === '実績') {
                    percentageB = Math.min(100, Math.round(((comparisonPerformanceScore || 0) / 50) * 100));
                } else {
                    const axisItems = comparisonItems.filter((i) => i.axis === axis && i.max > 0);
                    if (axisItems.length > 0) {
                        const currentSum = axisItems.reduce((sum, i) => sum + (i.score ?? 0), 0);
                        const maxSum = axisItems.reduce((sum, i) => sum + i.max, 0);
                        percentageB = maxSum === 0 ? 0 : Math.round((currentSum / maxSum) * 100);
                    }
                }
            }

            return { subject: axis, A: percentageA, B: percentageB, fullMark: 100 };
        });
    }, [items, performanceScore, comparisonItems, comparisonPerformanceScore]);

    // --- Line Chart Data Logic ---
    const lineChartData = useMemo(() => {
        const monthlyGoal = performanceData.goalCuts > 0 ? Math.round(performanceData.goalCuts / 12) : 0;
        return MONTH_LABELS.map((label, index) => ({
            name: label,
            cuts: performanceData.monthlyCuts[index] > 0 ? performanceData.monthlyCuts[index] : null,
            goal: monthlyGoal
        }));
    }, [performanceData]);

    // --- Manager Radar Data Logic ---
    const managerRadarData = useMemo(() => {
        return MANAGER_AXES.map((subCat) => {
            const subCatItems = items.filter((i) => i.category === '店長' && i.subCategory === subCat && i.max > 0);
            if (subCatItems.length === 0) {
                return { subject: subCat, A: 0, fullMark: 100 };
            }
            const currentSum = subCatItems.reduce((sum, i) => sum + (i.score ?? 0), 0);
            const maxSum = subCatItems.reduce((sum, i) => sum + i.max, 0);
            const percentage = maxSum === 0 ? 0 : Math.round((currentSum / maxSum) * 100);
            const data: any = { subject: subCat, A: percentage, fullMark: 100 };

            // Comparison Data
            if (comparisonItems) {
                const compSubCatItems = comparisonItems.filter((i) => i.category === '店長' && i.subCategory === subCat && i.max > 0);
                if (compSubCatItems.length === 0) data.B = 0;
                else {
                    const compSum = compSubCatItems.reduce((sum, i) => sum + (i.score ?? 0), 0);
                    const compMax = compSubCatItems.reduce((sum, i) => sum + i.max, 0);
                    data.B = compMax === 0 ? 0 : Math.round((compSum / compMax) * 100);
                }
            }
            return data;
        });
    }, [items, comparisonItems]);

    const hasManagerItems = useMemo(() => items.some(i => i.category === '店長' && i.score !== null), [items]);

    return (
        <div className={`grid grid-cols-1 ${hasManagerItems ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6 w-full print-break-inside-avoid print:hidden`}>
            {/* Staff Radar */}
            <div className="bg-white p-2 rounded-lg h-[300px] relative border border-gray-100 shadow-sm">
                <h3 className="absolute top-2 left-4 text-xs font-bold text-gray-400">スタッフ評価</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#111827', fontSize: 10, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="今回"
                            dataKey="A"
                            stroke="#002C5F"
                            strokeWidth={2}
                            fill="#002C5F"
                            fillOpacity={0.4}
                        />
                        {comparisonItems && (
                            <Radar
                                name="比較"
                                dataKey="B"
                                stroke="#E60012"
                                strokeWidth={2}
                                fill="#E60012"
                                fillOpacity={0.1}
                                strokeDasharray="4 4"
                            />
                        )}
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Manager Radar */}
            {hasManagerItems && (
                <div className="bg-white p-2 rounded-lg h-[300px] relative border border-gray-100 shadow-sm">
                    <h3 className="absolute top-2 left-4 text-xs font-bold text-gray-400">店長スキル評価</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="60%" data={managerRadarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#111827', fontSize: 8, fontWeight: 'bold' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="店長スキル"
                                dataKey="A"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                fill="#8b5cf6"
                                fillOpacity={0.4}
                            />
                            {comparisonItems && (
                                <Radar
                                    name="前回"
                                    dataKey="B"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    fill="#ef4444"
                                    fillOpacity={0.1}
                                    strokeDasharray="4 4"
                                />
                            )}
                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Line Chart */}
            <div className="bg-white p-2 rounded-lg h-[300px] relative border border-gray-100 shadow-sm">
                <h3 className="absolute top-2 left-4 text-xs font-bold text-gray-400">月別カット人数推移</h3>
                <div className="h-full pt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lineChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={35} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', paddingTop: '5px' }} />
                            <Line type="monotone" dataKey="cuts" name="実績" stroke="#002C5F" strokeWidth={3} dot={{ r: 3, fill: '#002C5F', strokeWidth: 2, stroke: '#fff' }} connectNulls />
                            <Line type="monotone" dataKey="goal" name="月平均目標" stroke="#9ca3af" strokeDasharray="5 5" dot={false} strokeWidth={1} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
