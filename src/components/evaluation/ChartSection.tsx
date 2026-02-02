import React, { useMemo } from 'react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { EvaluationItem, AXES, MANAGER_AXES, MONTH_LABELS } from '../../data/constants';
import { PerformanceData } from '../../types';

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
    // --- Data Preparation ---
    const radarData = useMemo(() => {
        return AXES.map((axis) => {
            const data: any = { subject: axis, fullMark: 100 };

            // Current Data (A)
            if (axis === '実績') {
                data.A = Math.min(100, Math.round((performanceScore / 50) * 100));
            } else {
                const axisItems = items.filter((i) => i.axis === axis && i.max > 0);
                if (axisItems.length === 0) data.A = 0;
                else {
                    const currentSum = axisItems.reduce((sum, i) => sum + (i.score ?? 0), 0);
                    const maxSum = axisItems.reduce((sum, i) => sum + i.max, 0);
                    data.A = maxSum === 0 ? 0 : Math.round((currentSum / maxSum) * 100);
                }
            }

            // Comparison Data (B)
            if (comparisonItems) {
                if (axis === '実績') {
                    data.B = Math.min(100, Math.round(((comparisonPerformanceScore || 0) / 50) * 100));
                } else {
                    const compAxisItems = comparisonItems.filter((i) => i.axis === axis && i.max > 0);
                    if (compAxisItems.length === 0) data.B = 0;
                    else {
                        const compSum = compAxisItems.reduce((sum, i) => sum + (i.score ?? 0), 0);
                        const maxSum = compAxisItems.reduce((sum, i) => sum + i.max, 0);
                        data.B = maxSum === 0 ? 0 : Math.round((compSum / maxSum) * 100);
                    }
                }
            }
            return data;
        });
    }, [items, performanceScore, comparisonItems, comparisonPerformanceScore]);

    const lineChartData = useMemo(() => {
        const monthlyGoal = performanceData.goalCuts > 0 ? Math.round(performanceData.goalCuts / 12) : 0;
        return MONTH_LABELS.map((label, index) => ({
            name: label,
            cuts: performanceData.monthlyCuts[index] > 0 ? performanceData.monthlyCuts[index] : null,
            goal: monthlyGoal
        }));
    }, [performanceData]);

    const managerRadarData = useMemo(() => {
        return MANAGER_AXES.map((subCat) => {
            const subCatItems = items.filter((i) => i.category === '店長' && i.subCategory === subCat && i.max > 0);
            const data: any = { subject: subCat, fullMark: 100 };

            if (subCatItems.length === 0) {
                data.A = 0;
            } else {
                const currentSum = subCatItems.reduce((sum, i) => sum + (i.score ?? 0), 0);
                const maxSum = subCatItems.reduce((sum, i) => sum + i.max, 0);
                data.A = maxSum === 0 ? 0 : Math.round((currentSum / maxSum) * 100);
            }

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

    const isManagerUnlocked = items.some(i => i.category === '店長' && i.score !== null);

    // Custom Tooltip for Radar
    const CustomRadarTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 border border-gray-200 shadow-lg rounded text-xs opacity-95">
                    <p className="font-bold mb-1">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.stroke }}>
                            {entry.name}: {entry.value}%
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:hidden">
            {/* 1. Staff Radar Chart */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="text-xl">📊</span> スタッフ評価チャート
                </h3>
                <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 'bold' }} />
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
                                    name="前回"
                                    dataKey="B"
                                    stroke="#E60012"
                                    strokeWidth={2}
                                    fill="#E60012"
                                    fillOpacity={0.1}
                                    strokeDasharray="3 3"
                                />
                            )}
                            <RechartsTooltip content={<CustomRadarTooltip />} />
                            <Legend />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 2. Performance Line Chart */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="text-xl">📈</span> 実績推移
                </h3>
                <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                            <RechartsTooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="cuts"
                                name="実績"
                                stroke="#002C5F"
                                strokeWidth={3}
                                dot={{ r: 4, fill: '#002C5F', strokeWidth: 0 }}
                                activeDot={{ r: 6 }}
                                connectNulls
                            />
                            <Line
                                type="monotone"
                                dataKey="goal"
                                name="目標"
                                stroke="#9ca3af"
                                strokeDasharray="4 4"
                                dot={false}
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 3. Manager Radar Chart (Conditional) */}
            {isManagerUnlocked && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                    <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <span className="text-xl">🛡️</span> 店長スキルチャート
                    </h3>
                    <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={managerRadarData}>
                                <PolarGrid stroke="#e5e7eb" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 'bold' }} />
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
                                        strokeDasharray="3 3"
                                    />
                                )}
                                <RechartsTooltip content={<CustomRadarTooltip />} />
                                <Legend />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};
