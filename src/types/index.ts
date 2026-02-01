
export interface EvaluationItem {
    no: number;
    category: string;
    subCategory: string;
    item: string;
    axis: string;
    max: number;
    score: number | null;
    desc: string;
    pointDesc?: string;
    criteria?: { [key: number]: string };
    validScores?: number[];
    memo?: string;
    memos?: string[];
    incidents?: Incident[];
}

export interface Incident {
    id: string;
    date: string;
    desc: string;
    deduction: number;
    improvement: number;
}

export interface PerformanceData {
    monthlyCuts: number[];
    excludedFromAverage: boolean[];
    goalCuts: number;
    goalScore: number;
    monthlyHolidays: number;
}

export interface StaffMetadata {
    id: string;
    store: string;
    name: string;
    employeeId: string;
    evaluator: string;
    date: string;
    updatedAt: number;
    performance: PerformanceData;
}

export interface StaffData {
    metadata: StaffMetadata;
    items: EvaluationItem[];
    performanceScore: number;
    comparison?: StaffData; // Recursive for comparison
}

export interface StaffSummary {
    id: string;
    name: string;
    store: string;
    date: string;
    updatedAt: number;
}
