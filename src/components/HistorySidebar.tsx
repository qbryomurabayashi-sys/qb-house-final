
import React from 'react';
import { X, Calendar, User, Search, FileText } from 'lucide-react';
import { StaffSummary } from '../types';

interface HistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    historyList: StaffSummary[];
    currentId: string | null;
    onSelect: (id: string) => void;
    onCompare: (summary: StaffSummary) => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, onClose, historyList, currentId, onSelect, onCompare }) => {
    // Sort logic handled in parent usually, or we can sort here.
    // Assuming passed list is already filtered for the current person.

    return (
        <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'} print:hidden flex flex-col`}>
            <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
                <h2 className="font-bold text-lg flex items-center gap-2"><Calendar size={20} /> 評価履歴</h2>
                <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded transition-colors"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {historyList.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        <User size={48} className="mx-auto mb-2 opacity-30" />
                        <p>履歴はありません</p>
                    </div>
                ) : (
                    historyList.map((record) => (
                        <div key={record.id} className={`bg-white p-4 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer group ${record.id === currentId ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300 hover:border-blue-300'}`} onClick={() => onSelect(record.id)}>
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-gray-800 text-lg">{record.date}</span>
                                {record.id === currentId && <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold">表示中</span>}
                            </div>
                            <div className="text-xs text-gray-500 space-y-1">
                                <p className="flex items-center gap-1"><User size={12} /> {record.name}</p>
                                <p className="text-[10px] text-gray-400">ID: {record.id.substring(0, 8)}...</p>
                                <p className="text-[10px] text-gray-400">Updated: {new Date(record.updatedAt).toLocaleString()}</p>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                                <button onClick={(e) => { e.stopPropagation(); onCompare(record); }} className="flex-1 bg-white border border-blue-200 text-blue-600 text-xs py-1.5 rounded hover:bg-blue-50 transition-colors flex items-center justify-center gap-1">
                                    <Search size={12} /> 比較する
                                </button>
                                <button className="flex-1 bg-blue-50 text-blue-700 text-xs py-1.5 rounded group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center gap-1">
                                    <FileText size={12} /> 詳細
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HistorySidebar;
