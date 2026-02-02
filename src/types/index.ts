import { EvaluationItem } from '../data/constants';

export interface PerformanceData {
    monthlyCuts: number[];
    excludedFromAverage: boolean[];
    goalCuts: number;
    goalScore: number;
    monthlyHolidays: number;
}

export interface Metadata {
    id: string;
    store: string;
    name: string;
    employeeId: string;
    evaluator: string;
    date: string;
    updatedAt: number;
    performance: PerformanceData;
}

export interface EvaluationData {
    metadata: Metadata;
    items: EvaluationItem[];
    performanceScore: number;
    comparison?: EvaluationData; // For comparison view
}

export interface StaffSummary {
    id: string;
    name: string;
    store: string;
    date: string;
    updatedAt: number;
}

export interface HistoryRecord extends StaffSummary {
    performanceScore: number;
    relationScore: number;
    serviceScore: number;
    techScore: number;
    managerScore: number;
    totalScore: number;
    isManager: boolean;
    evaluator: string;
    employeeId: string;
}
