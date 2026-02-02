import { useState, useMemo, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form'; // Might not need full form lib for this custom logic yet
import {
    Calculator, Calendar, User, Store, Lock, Unlock,
    Printer, Save, ArrowLeft, ArrowUp, FileText,
    MessageSquare, AlertTriangle, Layers
} from 'lucide-react';

import {
    EvaluationItem as EvaluationItemType,
    INITIAL_ITEMS,
    CATEGORIES,
    AXES, MONTH_LABELS
} from '../data/constants';
import {
    EvaluationData,
    Metadata,
    PerformanceData,
    HistoryRecord
} from '../types';
import { calculatePerformanceMetrics } from '../utils/evaluationUtils';

import { EvaluationSection } from '../components/evaluation/EvaluationSection';
import { ChartSection } from '../components/evaluation/ChartSection';
import { ScoreDashboard } from '../components/evaluation/ScoreDashboard';
import { PerformanceEvaluation } from '../components/evaluation/PerformanceEvaluation';
import { CriteriaGuide } from '../components/evaluation/CriteriaGuide';
import { ScheduleAlert } from '../components/evaluation/ScheduleAlert';
import { PasswordModal } from '../components/evaluation/PasswordModal';
import { HistorySidebar } from '../components/evaluation/HistorySidebar';

const STAFF_INDEX_KEY = 'qb_staff_index_v1';
const DATA_PREFIX = 'qb_data_';

interface SheetPageProps {
    currentId: string;
    onBack: () => void;
    initialData?: EvaluationData | null;
}

export const SheetPage: React.FC<SheetPageProps> = ({ currentId, onBack, initialData }) => {
    // --- State Initialization ---
    const [items, setItems] = useState<EvaluationItemType[]>(initialData?.items || JSON.parse(JSON.stringify(INITIAL_ITEMS)));
    const [metadata, setMetadata] = useState<Metadata>(initialData?.metadata || {
        id: currentId, store: '', name: '', employeeId: '', evaluator: '',
        date: new Date().toISOString().split('T')[0],
        updatedAt: Date.now(),
        performance: { monthlyCuts: new Array(12).fill(0), excludedFromAverage: new Array(12).fill(false), goalCuts: 0, goalScore: 0, monthlyHolidays: 0 }
    });
    const [performanceScore, setPerformanceScore] = useState(initialData?.performanceScore || 5);

    // Determines if we are in "Read Only" mode (e.g. browsing history)
    // For now, assume always editable if opened unless explicitly set. 
    // In migration, simpler to start with editable.
    const [readOnly, setReadOnly] = useState(false);

    // UI State
    const [activeTab, setActiveTab] = useState('関係性');
    const [isStoreManagerUnlocked, setIsStoreManagerUnlocked] = useState(() => {
        return items.some(i => i.category === '店長' && i.score !== null);
    });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // Comparison State
    const [comparisonData, setComparisonData] = useState<EvaluationData | null>(initialData?.comparison || null);

    // --- History Loading Logic ---
    // Fetch summary list for sidebar
    const [historyList, setHistoryList] = useState<HistoryRecord[]>([]);
    useEffect(() => {
        if (!metadata.name || !metadata.store) return;
        const rawIndex = localStorage.getItem(STAFF_INDEX_KEY);
        if (!rawIndex) return;

        try {
            const index = JSON.parse(rawIndex);
            const matches = index.filter((s: any) => s.name === metadata.name && s.store === metadata.store);

            const detailedList = matches.map((s: any) => {
                const raw = localStorage.getItem(DATA_PREFIX + s.id);
                if (raw) {
                    const d = JSON.parse(raw);
                    const its = d.items || [];
                    const pScore = d.performanceScore || 0;
                    const relScore = its.filter((i: any) => i.category === '関係性').reduce((sum: number, i: any) => sum + (i.score || 0), 0);
                    const srvScore = its.filter((i: any) => i.category === '接客').reduce((sum: number, i: any) => sum + (i.score || 0), 0);
                    const tchScore = its.filter((i: any) => i.category === '技術').reduce((sum: number, i: any) => sum + (i.score || 0), 0);
                    const mgrScore = its.filter((i: any) => i.category === '店長').reduce((sum: number, i: any) => sum + (i.score || 0), 0);
                    const totScore = relScore + srvScore + tchScore + pScore;
                    const isMgr = its.some((i: any) => i.category === '店長' && i.score !== null);

                    return {
                        ...s,
                        performanceScore: pScore,
                        relationScore: relScore,
                        serviceScore: srvScore,
                        techScore: tchScore,
                        managerScore: mgrScore,
                        totalScore: totScore,
                        isManager: isMgr,
                        evaluator: d.metadata?.evaluator,
                        employeeId: d.metadata?.employeeId,
                    };
                }
                return s;
            }).filter((r: any) => r.totalScore !== undefined); // Filter out broken records

            setHistoryList(detailedList);
        } catch (e) { console.error(e); }
    }, [metadata.name, metadata.store]);

    // --- Auto Save ---
    useEffect(() => {
        if (readOnly) return;
        const timer = setTimeout(() => {
            const dataToSave = {
                metadata: { ...metadata, updatedAt: Date.now() },
                items: items,
                performanceScore: performanceScore
            };
            localStorage.setItem(DATA_PREFIX + currentId, JSON.stringify(dataToSave));

            // Update Index
            const rawIndex = localStorage.getItem(STAFF_INDEX_KEY);
            let index = rawIndex ? JSON.parse(rawIndex) : [];
            const summary = {
                id: currentId,
                name: metadata.name,
                store: metadata.store,
                date: metadata.date,
                updatedAt: Date.now()
            };

            const existingIdx = index.findIndex((s: any) => s.id === currentId);
            if (existingIdx >= 0) {
                index[existingIdx] = summary;
            } else {
                index.unshift(summary);
            }
            // Sort
            index.sort((a: any, b: any) => b.updatedAt - a.updatedAt);
            localStorage.setItem(STAFF_INDEX_KEY, JSON.stringify(index));
        }, 500);
        return () => clearTimeout(timer);
    }, [items, metadata, performanceScore, currentId, readOnly]);


    // --- Handlers ---
    const handleScoreUpdate = useCallback((no: number, score: number) => {
        setItems(prev => prev.map(item => item.no === no ? { ...item, score } : item));
    }, []);

    const handleMemoUpdate = useCallback((no: number, memo: string) => {
        setItems(prev => prev.map(item => item.no === no ? { ...item, memo } : item));
    }, []);

    const handleIncidentsUpdate = useCallback((no: number, incidents: any[]) => {
        setItems(prev => prev.map(item => {
            if (item.no !== no) return item;
            let total = 0;
            if (incidents && incidents.length > 0) {
                total = incidents.reduce((sum, inc) => sum + (inc.deduction || 0) + (inc.improvement || 0), 0);
            }
            const finalScore = Math.min(0, total);
            return { ...item, incidents, score: finalScore };
        }));
    }, []);

    const handleTabChange = (cat: string) => {
        if (cat === '店長' && !isStoreManagerUnlocked) {
            setShowPasswordModal(true);
        } else {
            setActiveTab(cat);
        }
    };

    const handleUnlockManager = () => {
        setIsStoreManagerUnlocked(true);
        setActiveTab('店長');
    };

    const handleMetadataChange = (field: keyof Metadata, value: any) => {
        setMetadata(prev => ({ ...prev, [field]: value }));
    };

    // Print
    const handlePrint = () => {
        window.print();
    };

    // History Actions
    const handleSelectHistory = (id: string) => {
        if (id === currentId) return;
        // Load history item as READ ONLY or EDITABLE?
        // Original app allowed "Resume" or "History View".
        // Let's just load it.
        const raw = localStorage.getItem(DATA_PREFIX + id);
        if (raw) {
            const d = JSON.parse(raw);
            // If we want to switch context entirely, we might need to tell App.tsx
            // But if we just want to view it here:
            // Warn user if unsaved? (Auto-save handles it)
            if (confirm("この履歴データを表示しますか？\n(現在の画面内容は保存されています)")) {
                // Determine if we should navigate or just replace state.
                // Navigation is cleaner to keep URL/ID sync.
                // For now, let's just reload page with new ID? 
                // Using window.location.search params would be best if App supports it.
                // Or call a prop onSwitchId(id)
                window.location.reload(); // Quickest way if we don't have router setup yet
                // But wait, I can just update state here if I want.
                // But props.currentId won't match.
                // Ideally default trigger a callback.
                // For this implementation, I'll update local state and set ReadOnly = true?
                setItems(d.items);
                setMetadata(d.metadata);
                setPerformanceScore(d.performanceScore);
                setReadOnly(true); // Viewing history is usually read-only unless "Resume"
                setIsHistoryOpen(false);
            }
        }
    };

    const handleCompare = (record: HistoryRecord) => {
        // Load comparison data
        const raw = localStorage.getItem(DATA_PREFIX + record.id);
        if (raw) {
            const d = JSON.parse(raw);
            setComparisonData({
                metadata: d.metadata,
                items: d.items,
                performanceScore: d.performanceScore
            });
            setIsHistoryOpen(false);
        }
    };

    const clearComparison = () => setComparisonData(null);

    // Scroll To Top
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <div className="min-h-screen bg-gray-50 pb-20 print:bg-white print:p-0">
            {/* Header / Meta Input */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40 print:relative print:border-none">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-600 print:hidden">
                                <ArrowLeft size={24} />
                            </button>
                            <h1 className="text-xl font-bold text-[#002C5F] hidden sm:block">評価シート編集</h1>
                        </div>

                        <div className="flex items-center gap-2 print:hidden">
                            <button onClick={() => setIsHistoryOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-2">
                                <History size={20} /> <span className="hidden sm:inline">履歴</span>
                            </button>
                            <button onClick={handlePrint} className="p-2 text-[#002C5F] hover:bg-blue-50 rounded-lg flex items-center gap-2">
                                <Printer size={20} /> <span className="hidden sm:inline">印刷</span>
                            </button>
                            {/* Comparison Indicator */}
                            {comparisonData && (
                                <button onClick={clearComparison} className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-200 hover:bg-red-100">
                                    <Layers size={14} /> 比較中: {comparisonData.metadata.date} <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Meta Fields Grid */}
                    <div className="py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-2">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">店舗名</label>
                            <div className="relative">
                                <Store className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    value={metadata.store}
                                    onChange={e => handleMetadataChange('store', e.target.value)}
                                    className="pl-9 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#002C5F] outline-none"
                                    placeholder="店舗名"
                                    disabled={readOnly}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">氏名</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    value={metadata.name}
                                    onChange={e => handleMetadataChange('name', e.target.value)}
                                    className="pl-9 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#002C5F] outline-none"
                                    placeholder="スタッフ氏名"
                                    disabled={readOnly}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">社員番号</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    value={metadata.employeeId}
                                    onChange={e => handleMetadataChange('employeeId', e.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
                                    className="pl-9 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#002C5F] outline-none font-mono"
                                    placeholder="半角英数"
                                    disabled={readOnly}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">評価日</label>
                                <input
                                    type="date"
                                    value={metadata.date}
                                    onChange={e => handleMetadataChange('date', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#002C5F] outline-none"
                                    disabled={readOnly}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">評価者</label>
                                <input
                                    type="text"
                                    value={metadata.evaluator}
                                    onChange={e => handleMetadataChange('evaluator', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#002C5F] outline-none"
                                    placeholder="評価者名"
                                    disabled={readOnly}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

                {/* 1. Schedule Alert */}
                <ScheduleAlert date={metadata.date} />

                {/* 2. Charts & Dashboard */}
                <div className="space-y-6">
                    <ChartSection
                        items={items}
                        performanceData={metadata.performance}
                        performanceScore={performanceScore}
                        comparisonItems={comparisonData?.items}
                        comparisonPerformanceScore={comparisonData?.performanceScore}
                    />

                    <ScoreDashboard
                        items={items}
                        performanceData={metadata.performance}
                        performanceScore={performanceScore}
                        isManagerUnlocked={isStoreManagerUnlocked}
                    />
                </div>

                {/* 3. Performance Evaluation Input */}
                <PerformanceEvaluation
                    data={metadata.performance}
                    onChange={data => setMetadata(prev => ({ ...prev, performance: data }))}
                    onScoreUpdate={setPerformanceScore}
                    readOnly={readOnly}
                />

                {/* 4. Category Tabs */}
                <div className="sticky top-16 z-30 bg-gray-50 pt-2 pb-4 print:hidden">
                    <div className="flex space-x-1 overflow-x-auto bg-gray-200/50 p-1 rounded-xl">
                        {CATEGORIES.map(cat => {
                            const isActive = activeTab === cat;
                            const isLocked = cat === '店長' && !isStoreManagerUnlocked;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => handleTabChange(cat)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm sm:text-base font-bold transition-all whitespace-nowrap
                                        ${isActive
                                            ? 'bg-white text-[#002C5F] shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {isLocked && <Lock size={14} className="mb-0.5" />}
                                    {!isLocked && cat === '店長' && <Unlock size={14} className="mb-0.5 text-blue-500" />}
                                    {cat}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 5. Evaluation Items */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 min-h-[500px]">
                    <CriteriaGuide />

                    <div className="mb-6 flex justify-between items-center print:hidden">
                        <h2 className="text-xl font-bold text-gray-800 border-l-4 border-[#002C5F] pl-3 py-1">
                            {activeTab}評価
                        </h2>
                    </div>

                    <EvaluationSection
                        items={items}
                        activeTab={activeTab}
                        isManager={isStoreManagerUnlocked}
                        onUpdateScore={handleScoreUpdate}
                        onUpdateMemo={handleMemoUpdate}
                        onUpdateIncidents={handleIncidentsUpdate}
                        readOnly={readOnly}
                    />
                </div>

                {/* 6. Interview Proto Link (Optional integration point) */}
                <div className="flex justify-center mt-8 print:hidden">
                    <a
                        href={`/interview?employeeId=${metadata.employeeId}&name=${encodeURIComponent(metadata.name)}&store=${encodeURIComponent(metadata.store)}`}
                        className="flex items-center gap-2 text-[#002C5F] px-6 py-3 border border-[#002C5F] rounded-lg hover:bg-blue-50 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <MessageSquare size={20} /> 面談記録シートを開く (別タブ)
                    </a>
                </div>

            </div>

            {/* Modals & Tools */}
            <PasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onUnlock={handleUnlockManager}
            />

            <HistorySidebar
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                historyList={historyList}
                currentId={currentId}
                onSelect={handleSelectHistory}
                onCompare={handleCompare}
                metadata={metadata}
            />

            <button
                onClick={scrollToTop}
                className="fixed bottom-6 right-4 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-40 no-print opacity-80 print:hidden"
            >
                <ArrowUp size={20} />
            </button>
        </div>
    );
};
