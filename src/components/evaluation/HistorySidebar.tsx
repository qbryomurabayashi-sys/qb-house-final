import React, { useMemo, useState, useEffect } from 'react';
// import { History, X, Folder, FolderOpen, FileText, Layers } from 'lucide-react';
import { HistoryRecord, Metadata } from '../../types';

interface HistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    historyList: HistoryRecord[];
    currentId: string | null;
    onSelect: (id: string) => void;
    onCompare: (record: HistoryRecord) => void;
    metadata: Metadata;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
    isOpen,
    onClose,
    historyList,
    currentId,
    onSelect,
    onCompare,
    metadata
}) => {
    // Grouping Logic
    const groupedHistory = useMemo(() => {
        const groups: Record<string, Record<string, HistoryRecord[]>> = {};

        historyList.forEach(record => {
            const date = new Date(record.date);
            const year = date.getFullYear();
            const month = date.getMonth() + 1; // 1-12

            // Fiscal Year Logic: July (7) starts new period.
            // e.g., 2024/07 -> 2025 June Period. 2025/06 -> 2025 June Period.
            const fiscalYear = month >= 7 ? year + 1 : year;
            const termLabel = `${fiscalYear}年6月期`;
            const monthLabel = `${year}年${month}月`;

            if (!groups[termLabel]) groups[termLabel] = {};
            if (!groups[termLabel][monthLabel]) groups[termLabel][monthLabel] = [];
            groups[termLabel][monthLabel].push(record);
        });
        return groups;
    }, [historyList]);

    // Sort terms descending (newest fiscal year first) using string comparison is fine for "YYYY..."
    const sortedTerms = Object.keys(groupedHistory).sort((a, b) => b.localeCompare(a));

    // State for toggling folders
    const [openTerms, setOpenTerms] = useState<Record<string, boolean>>({});
    const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({});

    // Auto-open logic on load
    useEffect(() => {
        if (isOpen && sortedTerms.length > 0) {
            // Default: open the most recent term and its most recent month
            const latestTerm = sortedTerms[0];
            setOpenTerms(prev => ({ ...prev, [latestTerm]: true }));

            if (groupedHistory[latestTerm]) {
                const months = Object.keys(groupedHistory[latestTerm]);
                if (months.length > 0) {
                    const sortedM = months.sort((a, b) => {
                        // parse "YYYY年M月"
                        const pa = a.match(/(\d+)年(\d+)月/);
                        const pb = b.match(/(\d+)年(\d+)月/);
                        if (!pa || !pb) return 0;
                        const da = new Date(parseInt(pa[1]), parseInt(pa[2]) - 1);
                        const db = new Date(parseInt(pb[1]), parseInt(pb[2]) - 1);
                        return db.getTime() - da.getTime();
                    });
                    setOpenMonths(prev => ({ ...prev, [sortedM[0]]: true }));
                }
            }
        }
    }, [isOpen, groupedHistory, sortedTerms]);


    const toggleTerm = (term: string) => {
        setOpenTerms(prev => ({ ...prev, [term]: !prev[term] }));
    };

    const toggleMonth = (month: string) => {
        setOpenMonths(prev => ({ ...prev, [month]: !prev[month] }));
    };

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm transition-opacity" onClick={onClose} />}
            <div className={`fixed inset-y-0 right-0 z-[70] w-80 sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
                <div className="p-4 bg-gray-50 border-b flex-shrink-0">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            [Hist] 評価履歴
                        </h3>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors font-bold">
                            [X]
                        </button>
                    </div>
                    {metadata && (
                        <div className="text-xs text-gray-600 bg-white p-2 rounded border border-blue-100 shadow-sm">
                            <div className="flex justify-between border-b border-gray-100 pb-1 mb-1">
                                <span className="font-bold">{metadata.store}</span>
                                <span className="font-bold">{metadata.name}</span>
                            </div>
                            <div className="text-gray-400 text-[10px] text-right">ID: {metadata.employeeId}</div>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-2 bg-white">
                    {historyList.length === 0 ? (
                        <div className="text-center text-gray-400 py-10">
                            <p>履歴がありません</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {sortedTerms.map(term => {
                                const isTermOpen = openTerms[term];
                                const monthsObj = groupedHistory[term];
                                // Sort months descending
                                const sortedMonths = Object.keys(monthsObj).sort((a, b) => {
                                    const pa = a.match(/(\d+)年(\d+)月/);
                                    const pb = b.match(/(\d+)年(\d+)月/);
                                    if (!pa || !pb) return 0;
                                    return new Date(parseInt(pb[1]), parseInt(pb[2]) - 1).getTime() - new Date(parseInt(pa[1]), parseInt(pa[2]) - 1).getTime();
                                });

                                return (
                                    <div key={term} className="select-none">
                                        {/* Fiscal Year Folder */}
                                        <div
                                            onClick={() => toggleTerm(term)}
                                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer text-sm font-bold text-gray-700"
                                        >
                                            {isTermOpen ? <span>[-]</span> : <span>[+]</span>}
                                            <span>{term}</span>
                                        </div>

                                        {isTermOpen && (
                                            <div className="ml-2 pl-2 border-l border-dashed border-gray-300 space-y-1">
                                                {sortedMonths.map(month => {
                                                    const isMonthOpen = openMonths[month];
                                                    const records = monthsObj[month];
                                                    // Sort records by date desc
                                                    const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                                                    return (
                                                        <div key={month}>
                                                            {/* Month Folder */}
                                                            <div
                                                                onClick={() => toggleMonth(month)}
                                                                className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer text-sm text-gray-600"
                                                            >
                                                                {isMonthOpen ? <span>[-]</span> : <span>[+]</span>}
                                                                <span>{month} <span className="text-xs text-gray-400">({records.length})</span></span>
                                                            </div>

                                                            {isMonthOpen && (
                                                                <div className="ml-2 pl-4 border-l border-dashed border-gray-300 space-y-2 py-1">
                                                                    {sortedRecords.map(record => (
                                                                        <div
                                                                            key={record.id}
                                                                            onClick={() => onSelect(record.id)}
                                                                            className={`relative p-3 rounded-lg border transition-all cursor-pointer group ${record.id === currentId ? 'border-[#002C5F] bg-[#F0F5FA] shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                                                        >
                                                                            <div className="flex justify-between items-start mb-2">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="font-bold">{new Date(record.date).getDate()}日</span>
                                                                                </div>
                                                                                {record.id === currentId && <span className="bg-[#002C5F] text-white text-[9px] px-1.5 py-0.5 rounded ml-auto">表示中</span>}
                                                                            </div>

                                                                            <div className="text-[10px] text-gray-500 mb-2 pl-5">
                                                                                評価者: {record.evaluator || '未設定'}
                                                                            </div>

                                                                            {/* Score Breakdown Grid */}
                                                                            <div className="pl-1">
                                                                                <div className="grid grid-cols-5 gap-1 text-center bg-gray-50 rounded p-1">
                                                                                    <div className="flex flex-col">
                                                                                        <span className="text-[8px] text-gray-400 font-bold scale-90">関係</span>
                                                                                        <span className="text-[10px] font-bold text-gray-700">{record.relationScore}</span>
                                                                                    </div>
                                                                                    <div className="flex flex-col">
                                                                                        <span className="text-[8px] text-gray-400 font-bold scale-90">接客</span>
                                                                                        <span className="text-[10px] font-bold text-gray-700">{record.serviceScore}</span>
                                                                                    </div>
                                                                                    <div className="flex flex-col">
                                                                                        <span className="text-[8px] text-gray-400 font-bold scale-90">技術</span>
                                                                                        <span className="text-[10px] font-bold text-gray-700">{record.techScore}</span>
                                                                                    </div>
                                                                                    <div className="flex flex-col">
                                                                                        <span className="text-[8px] text-gray-400 font-bold scale-90">実績</span>
                                                                                        <span className="text-[10px] font-bold text-gray-700">{record.performanceScore}</span>
                                                                                    </div>
                                                                                    <div className="flex flex-col border-l border-gray-200">
                                                                                        <span className="text-[8px] text-[#002C5F] font-bold scale-90">合計</span>
                                                                                        <span className="text-xs font-bold text-[#002C5F]">{record.totalScore}</span>
                                                                                    </div>
                                                                                </div>
                                                                                {record.isManager && (
                                                                                    <div className="mt-1 flex justify-end gap-2 text-[10px] text-gray-600 px-1">
                                                                                        <span>店長評価: <span className="font-bold">{record.managerScore}</span></span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex justify-end mt-2">
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); onCompare(record); }}
                                                                                    className="text-[10px] px-2 py-1 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity font-bold"
                                                                                >
                                                                                    [Comp] 比較
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
