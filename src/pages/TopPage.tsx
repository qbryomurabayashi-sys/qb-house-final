import React from 'react';
import { StaffSummary } from '../types';

// Simple placeholder to isolate crash
interface TopPageProps {
    staffList: StaffSummary[];
    onSelect: (id: string) => void;
    onCreate: () => void;
    onDelete: (id: string) => void;
}

export const TopPage: React.FC<TopPageProps> = ({ staffList }) => {
    return (
        <div className="p-10 text-center">
            <h1 className="text-2xl font-bold text-purple-600">V9: Top Page Debug</h1>
            <p className="mt-4">TopPage loaded safely (content hidden).</p>
            <p className="mt-2 text-gray-500">Staff Count: {staffList.length}</p>
        </div>
    );
};
