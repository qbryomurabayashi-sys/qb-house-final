
import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { EvaluationItem, PerformanceData } from '../types';
import { AXES, MONTH_LABELS } from '../data/constants';

interface PrintChartSectionProps {
    items: EvaluationItem[];
    performanceData: PerformanceData;
    performanceScore: number;
    type: 'radar' | 'manager-radar' | 'line';
    comparisonItems?: EvaluationItem[];
    comparisonPerformanceScore?: number;
}

const PrintChartSection: React.FC<PrintChartSectionProps> = ({ items, performanceData, performanceScore, type, comparisonItems, comparisonPerformanceScore }) => {

    // STAFF RADAR DATA
    const radarData = useMemo(() => {
        if (type !== 'radar') return [];
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
    }, [items, performanceScore, comparisonItems, comparisonPerformanceScore, type]);

    // MANAGER RADAR DATA
    const managerRadarData = useMemo(() => {
        if (type !== 'manager-radar') return [];
        const managerAxes = ['運営管理スキル', '顧客サービススキル', 'チームマネジメントスキル', '戦略思考スキル', '問題解決スキル', '個人の属性', '管理責任・コンプライアンス'];

        return managerAxes.map((axis) => {
            const axisItems = items.filter((i) => i.subCategory === axis && i.max > 0);
            let percentage = 0;
            if (axisItems.length > 0) {
                const currentSum = axisItems.reduce((sum, i) => sum + (i.score ?? 0), 0);
                const maxSum = axisItems.reduce((sum, i) => sum + i.max, 0);
                percentage = maxSum === 0 ? 0 : Math.round((currentSum / maxSum) * 100);
            }
            return { subject: axis.length > 5 ? axis.substring(0, 5) + '...' : axis, A: percentage, fullMark: 100, fullSubject: axis };
        });
    }, [items, type]);

    // LINE CHART DATA
    const lineChartData = useMemo(() => {
        if (type !== 'line') return [];
        const monthlyGoal = performanceData.goalCuts > 0 ? Math.round(performanceData.goalCuts / 12) : 0;
        return MONTH_LABELS.map((label, index) => ({
            name: label,
            cuts: performanceData.monthlyCuts[index] > 0 ? performanceData.monthlyCuts[index] : null,
            goal: monthlyGoal
        }));
    }, [performanceData, type]);


    if (type === 'radar') {
        return (
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
                    <PolarGrid gridType="polygon" stroke="#9ca3af" strokeWidth={0.5} />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fill: '#374151', fontWeight: 'bold' }} stroke="#9ca3af" />
                    <Radar name="今回" dataKey="A" stroke="#2563eb" strokeWidth={2} fill="#3b82f6" fillOpacity={0.1} />
                    {comparisonItems && <Radar name="前回" dataKey="B" stroke="#ef4444" strokeWidth={1.5} fill="#ef4444" fillOpacity={0.0} strokeDasharray="3 3" />}
                </RadarChart>
            </ResponsiveContainer>
        );
    }

    if (type === 'manager-radar') {
        return (
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="60%" data={managerRadarData}>
                    <PolarGrid gridType="polygon" stroke="#9ca3af" strokeWidth={0.5} />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 7, fill: '#374151' }} stroke="#9ca3af" tickFormatter={(val, idx) => {
                        // Shorten names for print readability
                        const map: any = { '運営管理スキル': '運営', '顧客サービススキル': '顧客', 'チームマネジメントスキル': 'チーム', '戦略思考スキル': '戦略', '問題解決スキル': '解決', '個人の属性': '属性', '管理責任・コンプライアンス': '管理' };
                        return map[managerRadarData[idx]?.fullSubject] || val;
                    }} />
                    <Radar name="店長" dataKey="A" stroke="#f97316" strokeWidth={2} fill="#f97316" fillOpacity={0.1} />
                </RadarChart>
            </ResponsiveContainer>
        );
    }

    // Line Chart
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 7 }} tickLine={false} axisLine={{ stroke: '#9ca3af' }} interval={0} />
                <YAxis tick={{ fontSize: 7 }} tickLine={false} axisLine={false} />
                <Line type="monotone" dataKey="cuts" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} isAnimationActive={false} />
                <Line type="monotone" dataKey="goal" stroke="#9ca3af" strokeDasharray="3 3" strokeWidth={1} dot={false} isAnimationActive={false} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default PrintChartSection;
