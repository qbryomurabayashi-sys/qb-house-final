
import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EvaluationItem, PerformanceData } from '../types';
import { AXES, MONTH_LABELS } from '../data/constants';

interface ChartSectionProps {
    items: EvaluationItem[];
    performanceData: PerformanceData;
    performanceScore: number;
    comparisonItems?: EvaluationItem[];
    comparisonPerformanceScore?: number;
}

const ChartSection: React.FC<ChartSectionProps> = ({ items, performanceData, performanceScore, comparisonItems, comparisonPerformanceScore }) => {

    // STAFF RADAR DATA
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
                    const compAxisItems = comparisonItems.filter((i) => i.axis === axis && i.max > 0);
                    if (compAxisItems.length > 0) {
                        const currentSum = compAxisItems.reduce((sum, i) => sum + (i.score ?? 0), 0);
                        const maxSum = compAxisItems.reduce((sum, i) => sum + i.max, 0);
                        percentageB = maxSum === 0 ? 0 : Math.round((currentSum / maxSum) * 100);
                    }
                }
            }
            return { subject: axis, A: percentageA, B: percentageB, fullMark: 100 };
        });
    }, [items, performanceScore, comparisonItems, comparisonPerformanceScore]);

    // MANAGER RADAR DATA
    const managerRadarData = useMemo(() => {
        const managerAxes = ['運営管理スキル', '顧客サービススキル', 'チームマネジメントスキル', '戦略思考スキル', '問題解決スキル', '個人の属性', '管理責任・コンプライアンス'];
        return managerAxes.map((axis) => {
            const axisItems = items.filter((i) => i.subCategory === axis && i.max > 0);
            let percentage = 0;
            if (axisItems.length > 0) {
                const currentSum = axisItems.reduce((sum, i) => sum + (i.score ?? 0), 0);
                const maxSum = axisItems.reduce((sum, i) => sum + i.max, 0);
                percentage = maxSum === 0 ? 0 : Math.round((currentSum / maxSum) * 100);
            }
            return { subject: axis, A: percentage, fullMark: 100 };
        });
    }, [items]);

    const isManagerUnlocked = items.some(i => i.category === '店長' && i.score !== null);


    // LINE CHART DATA
    const lineChartData = useMemo(() => {
        const monthlyGoal = performanceData.goalCuts > 0 ? Math.round(performanceData.goalCuts / 12) : 0;
        return MONTH_LABELS.map((label, index) => ({
            name: label,
            cuts: performanceData.monthlyCuts[index] > 0 ? performanceData.monthlyCuts[index] : null,
            goal: monthlyGoal
        }));
    }, [performanceData]);

    return (
        <div className={`grid grid-cols-1 ${isManagerUnlocked ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6`}>
            {/* Staff Radar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
                <h3 className="font-bold text-gray-700 mb-2">スタッフ評価分析</h3>
                <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 'bold' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} tickCount={6} />
                            <Radar name="今回" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                            {comparisonItems && <Radar name="前回" dataKey="B" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeDasharray="5 5" />}
                            <Legend />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Manager Radar */}
            {isManagerUnlocked && (
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
                    <h3 className="font-bold text-gray-700 mb-2">店長スキル分析</h3>
                    <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={managerRadarData}>
                                <PolarGrid stroke="#e5e7eb" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} tickCount={6} />
                                <Radar name="店長スキル" dataKey="A" stroke="#f97316" fill="#f97316" fillOpacity={0.4} />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Line Chart */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
                <h3 className="font-bold text-gray-700 mb-2">月別カット実績推移</h3>
                <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                            <Legend />
                            <Line type="monotone" name="実績" dataKey="cuts" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                            <Line type="monotone" name="目標ペース" dataKey="goal" stroke="#9ca3af" strokeDasharray="3 3" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ChartSection;
