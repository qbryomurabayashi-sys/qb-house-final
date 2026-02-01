
import { useState, useEffect, useMemo, useCallback } from 'react'
import { Store, Download, Layers, Printer, Save, Users, Lock, ChevronDown, ChevronUp, History, RefreshCw, BarChart3, ArrowUp } from 'lucide-react'
import { INITIAL_ITEMS, AXES, MONTH_LABELS, CATEGORIES } from './data/constants'
import { StaffSummary, StaffData, StaffMetadata, EvaluationItem, PerformanceData } from './types'

// Components
import CriteriaGuide from './components/CriteriaGuide'
import ScheduleAlert from './components/ScheduleAlert'
import PasswordModal from './components/PasswordModal'
import ScoreDashboard from './components/ScoreDashboard'
import PrintChartSection from './components/PrintChartSection'
import ChartSection from './components/ChartSection'
import EvaluationCard from './components/EvaluationCard'
import PerformanceEvaluation from './components/PerformanceEvaluation'
import TopPage from './components/TopPage'
import MenuPage from './components/MenuPage'
import HistorySidebar from './components/HistorySidebar'

const STAFF_INDEX_KEY = 'qb_staff_index_v1';
const DATA_PREFIX = 'qb_data_';

const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

const ScrollToTopButton = () => {
    const scrollToTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); };
    return (
        <button onClick={scrollToTop} className="fixed bottom-6 right-4 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-40 no-print opacity-80">
            <ArrowUp size={20} />
        </button>
    );
}

function App() {
    const [staffList, setStaffList] = useState<StaffSummary[]>([]);
    const [currentId, setCurrentId] = useState<string | null>(null);

    // View Mode State: 'TOP', 'MENU', 'FORM'
    const [viewMode, setViewMode] = useState<'TOP' | 'MENU' | 'FORM'>('TOP');
    const [selectedStaffSummary, setSelectedStaffSummary] = useState<StaffSummary | null>(null);

    const [items, setItems] = useState<EvaluationItem[]>(INITIAL_ITEMS);
    const [metadata, setMetadata] = useState<StaffMetadata>({
        id: '', store: '', name: '', employeeId: '', evaluator: '',
        date: new Date().toISOString().split('T')[0],
        updatedAt: Date.now(),
        performance: { monthlyCuts: new Array(12).fill(0), excludedFromAverage: new Array(12).fill(false), goalCuts: 0, goalScore: 0, monthlyHolidays: 0 }
    });
    const [performanceScore, setPerformanceScore] = useState(0);

    const [activeTab, setActiveTab] = useState('関係性');
    const [isStoreManagerUnlocked, setIsStoreManagerUnlocked] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [isDashboardCollapsed, setIsDashboardCollapsed] = useState(true);
    const [isChartCollapsed, setIsChartCollapsed] = useState(false);

    const [isBatchPrinting, setIsBatchPrinting] = useState(false);
    const [batchPrintData, setBatchPrintData] = useState<any[]>([]);

    // History & Comparison
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [comparisonData, setComparisonData] = useState<StaffData | null>(null); // Uses simplified type for now
    const [isReadOnly, setIsReadOnly] = useState(false);

    const historyList = useMemo(() => {
        if (!metadata.name || !metadata.store) return [];
        return staffList.filter(s => s.name === metadata.name && s.store === metadata.store);
    }, [staffList, metadata.name, metadata.store]);

    useEffect(() => {
        try {
            const rawIndex = localStorage.getItem(STAFF_INDEX_KEY);
            let index = rawIndex ? JSON.parse(rawIndex) : [];
            // Sort descending by date
            index.sort((a: StaffSummary, b: StaffSummary) => b.updatedAt - a.updatedAt);
            setStaffList(index);
        } catch (e) {
            console.error("Init failed", e);
        }
    }, []);

    // 一括印刷のトリガー
    useEffect(() => {
        if (isBatchPrinting && batchPrintData.length > 0) {
            const timer = setTimeout(() => {
                window.print();
                const cleanup = () => {
                    setIsBatchPrinting(false);
                    setBatchPrintData([]);
                    window.removeEventListener('afterprint', cleanup);
                };
                window.addEventListener('afterprint', cleanup);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isBatchPrinting, batchPrintData]);

    const createNewStaff = () => {
        const newId = generateId();
        const newMeta: StaffMetadata = {
            id: newId, store: '', name: '', employeeId: '', evaluator: '',
            date: new Date().toISOString().split('T')[0],
            updatedAt: Date.now(),
            performance: { monthlyCuts: new Array(12).fill(0), excludedFromAverage: new Array(12).fill(false), goalCuts: 0, goalScore: 0, monthlyHolidays: 0 }
        };
        // Reset Item scores correctly based on logic (some scores are 0 by default? No, mostly null)
        const newItems = JSON.parse(JSON.stringify(INITIAL_ITEMS));
        setMetadata(newMeta);
        setItems(newItems);
        setPerformanceScore(5);
        setCurrentId(newId);
        // When creating new, go directly to form
        setViewMode('FORM');
        setIsReadOnly(false);

        setIsStoreManagerUnlocked(false);
        setActiveTab('関係性');
        const newSummary: StaffSummary = { id: newId, name: '', store: '', date: newMeta.date, updatedAt: Date.now() };
        const newList = [newSummary, ...staffList];
        setStaffList(newList);
        localStorage.setItem(STAFF_INDEX_KEY, JSON.stringify(newList));
        saveToStorage(newId, newMeta, newItems, 5);
    };

    // Copy New: Create a new evaluation based on existing staff profile
    const createNewFromSummary = (summary: StaffSummary) => {
        const newId = generateId();
        const newMeta: StaffMetadata = {
            id: newId, store: summary.store, name: summary.name, employeeId: '', evaluator: '',
            date: new Date().toISOString().split('T')[0],
            updatedAt: Date.now(),
            performance: { monthlyCuts: new Array(12).fill(0), excludedFromAverage: new Array(12).fill(false), goalCuts: 0, goalScore: 0, monthlyHolidays: 0 }
        };
        const newItems = JSON.parse(JSON.stringify(INITIAL_ITEMS));
        setMetadata(newMeta);
        setItems(newItems);
        setPerformanceScore(5);
        setCurrentId(newId);
        setViewMode('FORM');
        setIsReadOnly(false);

        setIsStoreManagerUnlocked(false);
        setActiveTab('関係性');
        const newSummary: StaffSummary = { id: newId, name: summary.name, store: summary.store, date: newMeta.date, updatedAt: Date.now() };
        const newList = [newSummary, ...staffList];
        setStaffList(newList);
        localStorage.setItem(STAFF_INDEX_KEY, JSON.stringify(newList));
        saveToStorage(newId, newMeta, newItems, 5);
    };

    const loadStaffData = (id: string) => {
        try {
            const raw = localStorage.getItem(DATA_PREFIX + id);
            if (raw) {
                const data: StaffData = JSON.parse(raw);
                setMetadata({
                    ...data.metadata,
                    performance: {
                        monthlyCuts: new Array(12).fill(0),
                        excludedFromAverage: new Array(12).fill(false),
                        goalCuts: 0,
                        goalScore: 0,
                        monthlyHolidays: 0,
                        ...data.metadata?.performance
                    }
                });
                setItems(data.items);
                setPerformanceScore(data.performanceScore || 5);
                setCurrentId(id);
                setIsStoreManagerUnlocked(data.items.some(i => i.category === '店長' && i.score !== null));
                setViewMode('FORM'); // Ensure we switch to form view
                setIsReadOnly(false);
            }
        } catch (e) {
            console.error("Load failed", e);
        }
    };

    const deleteStaff = (id: string) => {
        if (!window.confirm("本当にこのスタッフのデータを削除しますか？")) return;
        const newList = staffList.filter(s => s.id !== id);
        setStaffList(newList);
        localStorage.setItem(STAFF_INDEX_KEY, JSON.stringify(newList));
        localStorage.removeItem(DATA_PREFIX + id);
        if (currentId === id) {
            setCurrentId(null);
            setViewMode('TOP');
        }
    };

    const saveToStorage = (id: string, meta: StaffMetadata, currentItems: EvaluationItem[], pScore: number) => {
        const dataToSave: StaffData = {
            metadata: { ...meta, updatedAt: Date.now() },
            items: currentItems,
            performanceScore: pScore
        };
        localStorage.setItem(DATA_PREFIX + id, JSON.stringify(dataToSave));
        setStaffList(prev => {
            const newList = prev.map(s => s.id === id ? {
                ...s, name: meta.name, store: meta.store, date: meta.date, updatedAt: Date.now()
            } : s).sort((a, b) => b.updatedAt - a.updatedAt);
            localStorage.setItem(STAFF_INDEX_KEY, JSON.stringify(newList));
            return newList;
        });
    };

    useEffect(() => {
        if (currentId) {
            const timer = setTimeout(() => {
                saveToStorage(currentId, metadata, items, performanceScore);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [items, metadata, performanceScore, currentId]);

    const filteredItems = useMemo(() => {
        return items.filter((item) => item.category === activeTab);
    }, [items, activeTab]);

    const handleUpdateScore = useCallback((no: number, newScore: number | null) => {
        setItems((prev) =>
            prev.map((item) => (item.no === no ? { ...item, score: newScore } : item))
        );
    }, []);

    const handleUpdateMemo = useCallback((no: number, newMemoString: string) => {
        setItems((prev) =>
            prev.map((item) => (item.no === no ? { ...item, memo: newMemoString, memos: undefined } : item))
        );
    }, []);

    const handleUpdateIncidents = useCallback((no: number, newIncidents: any[]) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.no !== no) return item;

                // Recalculate score based on incidents
                let total = 0;
                if (newIncidents && newIncidents.length > 0) {
                    total = newIncidents.reduce((sum, inc) => sum + (inc.deduction || 0) + (inc.improvement || 0), 0);
                }
                const finalScore = Math.min(0, total);

                return { ...item, incidents: newIncidents, score: finalScore };
            })
        );
    }, []);

    const handlePerformanceUpdate = useCallback((newData: PerformanceData) => {
        setMetadata(prev => ({ ...prev, performance: newData }));
    }, []);

    const handleTabChange = (cat: string) => {
        if (cat === '店長' && !isStoreManagerUnlocked) {
            setShowPasswordModal(true);
        } else {
            setActiveTab(cat);
        }
    };

    const handleDownloadCSV = useCallback(() => {
        let csvContent = '\uFEFF';
        csvContent += `店舗名: ${metadata.store}, スタッフ氏名: ${metadata.name}, 社員番号: ${metadata.employeeId}, 日付: ${metadata.date}\n\n`;
        csvContent += 'No,大項目,小項目,評価内容,点数,最大点,メモ\n';
        items.forEach((row) => {
            const scoreDisplay = row.score !== null ? row.score : "未記入";
            const memoContent = (row.memos && row.memos.length > 0) ? row.memos.join(" / ") : (row.memo || "");
            const memoText = memoContent ? `"${memoContent.replace(/"/g, '""')}"` : "";
            csvContent += `${row.no},${row.category},${row.subCategory} - ${row.item},"${row.desc.replace(/"/g, '""')}",${scoreDisplay},${row.max},${memoText}\n`;
        });
        const totalScore = items.reduce((sum, item) => sum + (item.score ?? 0), 0) + performanceScore;
        csvContent += `,,,,,,合計スコア: ${totalScore}\n`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${metadata.name || 'スタッフ'}_評価_${metadata.date}.csv`;
        link.click();
    }, [items, metadata, performanceScore]);

    const handleDownloadAllCSV = useCallback(() => {
        let csvContent = '\uFEFF';

        // Header Row: 項目名 + 各スタッフ名
        let headerRow = '"項目/スタッフ"';
        staffList.forEach(staff => {
            headerRow += `,"${staff.store} ${staff.name}"`;
        });
        csvContent += headerRow + '\n';

        // Data Loading
        const allStaffData = staffList.map(staff => {
            const rawData = localStorage.getItem(DATA_PREFIX + staff.id);
            if (!rawData) return null;
            return JSON.parse(rawData) as StaffData;
        }).filter((d): d is StaffData => d !== null);

        // Basic Info Rows
        const basicRows: { label: string, key: keyof StaffMetadata }[] = [
            { label: '店舗名', key: 'store' },
            { label: '氏名', key: 'name' },
            { label: '社員番号', key: 'employeeId' },
            { label: '評価日', key: 'date' },
            { label: '評価者', key: 'evaluator' }
        ];

        basicRows.forEach(rowInfo => {
            let rowStr = `"${rowInfo.label}"`;
            allStaffData.forEach(d => {
                rowStr += `,"${d.metadata[rowInfo.key] || ''}"`;
            });
            csvContent += rowStr + '\n';
        });

        // Summary Scores
        let totalRow = '"総合スコア"';
        let perfRow = '"実績評価点"';
        let mgrRow = '"店長評価点"';

        allStaffData.forEach(d => {
            const items = d.items;
            const pScore = d.performanceScore || 0;
            const itemTotal = items.reduce((sum, i) => sum + (i.score ?? 0), 0);
            const total = itemTotal + pScore;
            const mgrTotal = items.filter(i => i.category === '店長').reduce((sum, i) => sum + (i.score ?? 0), 0);

            totalRow += `,${total}`;
            perfRow += `,${pScore}`;
            mgrRow += `,${mgrTotal}`;
        });

        csvContent += totalRow + '\n';
        csvContent += perfRow + '\n';
        csvContent += mgrRow + '\n';
        csvContent += '\n'; // Spacer

        // Detail Items Rows
        INITIAL_ITEMS.forEach(initItem => {
            let itemRow = `"No.${initItem.no} ${initItem.category}-${initItem.item}"`;
            allStaffData.forEach(d => {
                const target = d.items.find(i => i.no === initItem.no);
                const score = target && target.score !== null ? target.score : '';
                itemRow += `,${score}`;
            });
            csvContent += itemRow + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const dateStr = new Date().toISOString().split('T')[0];
        link.download = `QB_全スタッフ評価一覧_縦列_${dateStr}.csv`;
        link.click();
    }, [staffList]);

    // 単一印刷も一括印刷のロジックに流す
    const handlePrint = useCallback(() => {
        const currentData = {
            metadata: { ...metadata, updatedAt: Date.now() },
            items: items,
            performanceScore: performanceScore,
            comparison: comparisonData // Pass comparison data
        };
        setBatchPrintData([currentData]);
        setIsBatchPrinting(true);
    }, [metadata, items, performanceScore, comparisonData]);

    const handleBatchPrint = useCallback(() => {
        if (staffList.length === 0) {
            alert("印刷するデータがありません");
            return;
        }
        if (!confirm(`登録されている全${staffList.length}名分のデータを一括印刷しますか？\n（1人につきA4用紙2枚で出力されます）`)) {
            return;
        }

        const allData = staffList.map(staff => {
            const rawData = localStorage.getItem(DATA_PREFIX + staff.id);
            if (!rawData) return null;
            return JSON.parse(rawData);
        }).filter(d => d !== null);

        setBatchPrintData(allData);
        setIsBatchPrinting(true);
    }, [staffList]);


    // Helper for batch print calculate logic
    const calculatePerformanceMetrics = (monthlyCuts: number[], excluded: boolean[]) => {
        let validMonths = 0;
        let totalCuts = 0;
        monthlyCuts.forEach((c, i) => {
            if (!excluded[i] && c > 0) {
                totalCuts += c;
                validMonths++;
            }
        });
        const average = validMonths > 0 ? Math.round(totalCuts / validMonths) : 0;
        const currentTotal = monthlyCuts.reduce((sum, c) => sum + (c || 0), 0);
        let predictedTotal = 0;
        monthlyCuts.forEach((c, i) => {
            if (c > 0) predictedTotal += c;
            else if (!excluded[i]) predictedTotal += average;
        });

        return { currentTotal, average, predictedTotal };
    }


    const renderBatchPrintContent = () => {
        return batchPrintData.map((data, index) => {
            const m = data.metadata;
            const its: EvaluationItem[] = data.items;
            const pScore = data.performanceScore || 0;
            const comp = data.comparison;

            const relScore = its.filter(i => i.category === '関係性').reduce((sum, i) => sum + (i.score || 0), 0);
            const csScore = its.filter(i => i.category === '接客').reduce((sum, i) => sum + (i.score || 0), 0);
            const techScore = its.filter(i => i.category === '技術').reduce((sum, i) => sum + (i.score || 0), 0);
            const totScore = relScore + csScore + techScore + pScore;

            const mgrUnlocked = its.some(i => i.category === '店長' && i.score !== null);
            // const mgrScore = its.filter(i => i.category === '店長').reduce((sum, i) => sum + (i.score || 0), 0);

            const pf = m.performance || { monthlyCuts: [], excludedFromAverage: [], goalCuts: 0 };
            const { currentTotal, predictedTotal } = calculatePerformanceMetrics(pf.monthlyCuts, pf.excludedFromAverage);
            const mCuts = pf.monthlyCuts || new Array(12).fill(0);

            return (
                <div key={index} className="page-break">
                    <div className="print-view-container">
                        <div className="border-b-2 border-gray-800 pb-2 mb-2 flex justify-between items-end">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">評価フィードバックシート</h1>
                                <p className="text-gray-500 text-xs">QB House Evaluation Sheet</p>
                            </div>
                            <div className="text-right text-xs">
                                <p>店舗: <span className="font-bold border-b border-gray-400 px-2">{m.store}</span> / 氏名: <span className="font-bold border-b border-gray-400 px-2">{m.name}</span></p>
                                <p>評価日: {m.date}</p>
                            </div>
                        </div>

                        <div className="mb-4 border border-gray-300 rounded p-3 bg-gray-50">
                            <div className="flex justify-between items-center">
                                <div className="text-center px-6 border-r border-gray-300 min-w-[140px]">
                                    <p className="text-[9pt] text-gray-500 font-bold">総合スコア</p>
                                    <p className="text-4xl font-bold text-gray-900 leading-none mt-1">{totScore}<span className="text-sm font-normal ml-1">点</span></p>
                                    {comp && (
                                        <div className="mt-1 text-xs text-gray-500">
                                            (前回: <span className="font-bold text-gray-700">{comp.performanceScore + (comp.items?.reduce((s: number, i: any) => s + (i.score ?? 0), 0) || 0)}</span>点)
                                        </div>
                                    )}
                                </div>
                                <div className="text-center px-4 flex-grow">
                                    <div className="flex justify-around items-center h-full">
                                        <div>
                                            <p className="text-[8pt] text-gray-500">カット実績累計</p>
                                            <p className="text-xl font-bold">{currentTotal.toLocaleString()}名</p>
                                        </div>
                                        <div className="border-l border-gray-200 pl-6">
                                            <p className="text-[8pt] text-gray-500">年間着地予想</p>
                                            <p className="text-xl font-bold text-blue-700">{predictedTotal.toLocaleString()}名</p>
                                        </div>
                                        <div className="border-l border-gray-200 pl-6">
                                            <p className="text-[8pt] text-gray-500">目標達成率(予)</p>
                                            <p className="text-xl font-bold text-gray-700">
                                                {pf.goalCuts > 0 ? Math.round((predictedTotal / pf.goalCuts) * 100) : 0}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ScoreDashboard items={its} performanceScore={pScore} performanceData={pf} isManagerUnlocked={mgrUnlocked} />

                        <div className="mb-4 border rounded-lg p-2 bg-white print-break-inside-avoid mt-4">
                            <p className="text-[8pt] font-bold text-gray-500 mb-1">月別実績データ</p>
                            <div className="grid grid-cols-12 gap-0 text-[8pt] border-t border-l border-gray-300">
                                {MONTH_LABELS.map((mon) => (
                                    <div key={mon} className="col-span-1 border-r border-b border-gray-300 text-center bg-gray-100 font-bold py-1">{mon}</div>
                                ))}
                                {mCuts.map((c: number, idx: number) => (
                                    <div key={idx} className="col-span-1 border-r border-b border-gray-300 text-center py-1">{c || '-'}</div>
                                ))}
                            </div>
                        </div>

                        {/* Charts */}
                        <div className={`grid ${mgrUnlocked ? 'grid-cols-3' : 'grid-cols-2'} gap-2 mb-4 mt-4`}>
                            <div className="border border-gray-300 rounded p-2 bg-white flex flex-col items-center print-chart-box">
                                <h3 className="text-[9pt] font-bold text-gray-600 text-center mb-1">スタッフ評価</h3>
                                <div className="print-chart-container flex justify-center items-center">
                                    <PrintChartSection
                                        items={its}
                                        performanceData={pf}
                                        performanceScore={pScore}
                                        type="radar"
                                        comparisonItems={comp?.items}
                                        comparisonPerformanceScore={comp?.performanceScore}
                                    />
                                </div>
                            </div>
                            {mgrUnlocked && (
                                <div className="border border-gray-300 rounded p-2 bg-white flex flex-col items-center print-chart-box">
                                    <h3 className="text-[9pt] font-bold text-gray-600 text-center mb-1">店長スキル</h3>
                                    <div className="print-chart-container flex justify-center items-center">
                                        <PrintChartSection items={its} performanceData={pf} performanceScore={pScore} type="manager-radar" />
                                    </div>
                                </div>
                            )}
                            <div className="border border-gray-300 rounded p-2 bg-white flex flex-col items-center print-chart-box">
                                <h3 className="text-[9pt] font-bold text-gray-600 text-center mb-1">月別カット推移</h3>
                                <div className="print-chart-container flex justify-center items-center">
                                    <PrintChartSection items={its} performanceData={pf} performanceScore={pScore} type="line" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 mb-2">
                        <div className="border-b border-gray-800 pb-1 mb-2 flex justify-between items-end">
                            <h2 className="text-lg font-bold text-gray-800">評価詳細 & メモ</h2>
                        </div>
                        <div className="print-grid-cols-3 text-[7pt]">
                            {its.filter(item => item.score !== null).map((item) => (
                                <div key={item.no} className="detail-item-box">
                                    <div className="flex justify-between items-start">
                                        <div className="w-[85%] detail-item-text">
                                            <span className="font-bold text-gray-500 mr-1 text-[7pt]">{item.no}.</span>
                                            <span className="font-bold text-gray-800">{item.item}</span>
                                            <span className="text-[6pt] text-gray-500 ml-1">({item.subCategory})</span>
                                        </div>
                                        <div className="font-bold text-blue-800 detail-item-score">{item.score}/{item.max}</div>
                                    </div>
                                    {((item.memos && item.memos.length > 0) || item.memo) && (
                                        <div className="mt-1 p-1 bg-gray-50 border border-gray-200 rounded text-[6pt] text-gray-800 break-words">
                                            <span className="font-bold mr-1 text-gray-600">Memo:</span>
                                            {item.memos && item.memos.length > 0 ? item.memos.join(" / ") : item.memo}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-3 h-32 break-inside-avoid">
                        <p className="text-[8pt] font-bold text-gray-500 mb-1">メモ・総評</p>
                    </div>
                </div>
            );
        });
    };

    const handleHistorySelect = (id: string) => {
        const raw = localStorage.getItem(DATA_PREFIX + id);
        if (raw) {
            const data: StaffData = JSON.parse(raw);
            setMetadata({ ...data.metadata });
            setItems(data.items);
            setPerformanceScore(data.performanceScore || 5);
            setCurrentId(id);
            setIsStoreManagerUnlocked(data.items.some(i => i.category === '店長' && i.score !== null));
            setIsReadOnly(true);
            setViewMode('FORM');
            setIsHistoryOpen(false);
        }
    };

    const handleCompare = (record: StaffSummary) => {
        const raw = localStorage.getItem(DATA_PREFIX + record.id);
        if (raw) {
            const data: StaffData = JSON.parse(raw);
            setComparisonData(data);
            alert("比較データをロードしました。チャート上に前回のデータが赤色で表示されます。");
        }
    };

    const handleEditMode = () => {
        if (confirm('閲覧専用モードを解除して編集しますか？\n（注意: 過去のデータの書き換えとなります）')) {
            setIsReadOnly(false);
        }
    };


    // --- VIEW DISPATCH ---
    if (viewMode === 'TOP') {
        return (
            <TopPage
                staffList={staffList}
                onSelect={(id) => {
                    const staff = staffList.find(s => s.id === id);
                    if (staff) {
                        setSelectedStaffSummary(staff);
                        setViewMode('MENU');
                    }
                }}
                onCreate={createNewStaff}
                onDelete={deleteStaff}
            />
        );
    }

    if (viewMode === 'MENU' && selectedStaffSummary) {
        return (
            <MenuPage
                staff={selectedStaffSummary}
                onResume={() => loadStaffData(selectedStaffSummary.id)}
                onNew={() => createNewFromSummary(selectedStaffSummary)}
                onHistory={() => {
                    loadStaffData(selectedStaffSummary.id);
                    setIsHistoryOpen(true);
                }}
                onBack={() => setViewMode('TOP')}
            />
        );
    }

    // FORM VIEW
    return (
        <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg sm:max-w-2xl flex flex-col relative">
            <ScrollToTopButton />

            {/* --- HEADER --- */}
            <div className="bg-white sticky top-0 z-50 shadow-md print:hidden">
                <div className="p-3 flex justify-between items-center bg-blue-900 text-white gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <button onClick={() => setViewMode('TOP')} className="flex flex-col sm:flex-row items-center gap-1 p-2 hover:bg-blue-800 rounded-lg transition-colors flex-shrink-0">
                            <Store size={24} />
                            <span className="text-[10px] sm:text-xs font-bold leading-tight">TOPへ<br className="sm:hidden" />戻る</span>
                        </button>
                        <h1 className="text-sm sm:text-lg font-bold truncate">Evaluation Sheet</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        {isReadOnly && (
                            <button onClick={handleEditMode} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1">
                                <Lock size={14} /> 閲覧中(解除)
                            </button>
                        )}
                        <button onClick={() => setIsHistoryOpen(true)} className="p-2 hover:bg-blue-800 rounded transition-colors" title="履歴">
                            <History size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 bg-blue-50 p-2 overflow-x-auto">
                    <div className="flex items-center gap-1 sm:gap-2 mx-auto">
                        <button onClick={() => { if (currentId) saveToStorage(currentId, metadata, items, performanceScore); alert("保存しました"); }} className="flex flex-col items-center justify-center text-[10px] hover:bg-blue-100 p-1.5 rounded min-w-[40px] transition-colors text-blue-900">
                            <Save size={18} />
                            <span>保存</span>
                        </button>
                        <div className="w-px h-8 bg-blue-200 mx-1"></div>
                        <button onClick={handleDownloadCSV} className="flex flex-col items-center justify-center text-[10px] hover:bg-blue-100 p-1.5 rounded min-w-[40px] transition-colors text-blue-900">
                            <Download size={18} />
                            <span>CSV</span>
                        </button>
                        <button onClick={handleDownloadAllCSV} className="flex flex-col items-center justify-center text-[10px] hover:bg-blue-100 p-1.5 rounded min-w-[40px] transition-colors text-blue-900">
                            <Users size={18} />
                            <span>一覧CSV</span>
                        </button>
                        <div className="w-px h-8 bg-blue-200 mx-1"></div>
                        <button onClick={handleBatchPrint} className="flex flex-col items-center justify-center text-[10px] hover:bg-blue-100 p-1.5 rounded min-w-[40px] transition-colors text-blue-900">
                            <Layers size={18} />
                            <span>一括印刷</span>
                        </button>
                        <button onClick={handlePrint} className="flex flex-col items-center justify-center text-[10px] hover:bg-blue-100 p-1.5 rounded min-w-[40px] transition-colors text-blue-900">
                            <Printer size={18} />
                            <span>印刷</span>
                        </button>
                    </div>
                </div>
            </div>

            <ScheduleAlert date={metadata.date} />

            <div className="bg-gray-50 border-b">
                <div className={`overflow-hidden transition-all duration-300 ${isDashboardCollapsed ? 'max-h-0' : 'max-h-[500px]'}`}>
                    <div className="p-2 sm:p-4">
                        <ScoreDashboard items={items} performanceScore={performanceScore} performanceData={metadata.performance} isManagerUnlocked={isStoreManagerUnlocked} />
                    </div>
                </div>
                <button onClick={() => setIsDashboardCollapsed(!isDashboardCollapsed)} className="w-full flex justify-center items-center py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 border-t border-b border-gray-300 font-bold text-xs transition-all">
                    {isDashboardCollapsed ? "スコア内訳・詳細を表示 ↓" : "閉じる ↑"}
                </button>
            </div>


            {/* --- METADATA FORM --- */}
            <section className="p-3 sm:p-5 border-b bg-white print:hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-1">店舗名</label>
                            <input type="text" value={metadata.store} onChange={(e) => setMetadata({ ...metadata, store: e.target.value })} className="w-full border-b-2 border-gray-100 p-1 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500" placeholder="店舗名" disabled={isReadOnly} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-1">スタッフ氏名</label>
                            <input type="text" value={metadata.name} onChange={(e) => setMetadata({ ...metadata, name: e.target.value })} className="w-full border-b-2 border-gray-100 p-1 text-sm font-bold outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500" placeholder="氏名" disabled={isReadOnly} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-1">社員番号 (半角英数)</label>
                            <input type="text" value={metadata.employeeId} onChange={(e) => { const v = e.target.value; if (/^[a-zA-Z0-9]*$/.test(v)) setMetadata({ ...metadata, employeeId: v }); }} className="w-full border-b-2 border-gray-100 p-1 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500" disabled={isReadOnly} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-1">評価者</label>
                            <input type="text" value={metadata.evaluator} onChange={(e) => setMetadata({ ...metadata, evaluator: e.target.value })} className="w-full border-b-2 border-gray-100 p-1 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500" disabled={isReadOnly} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1">日付</label>
                        <input type="date" value={metadata.date} onChange={(e) => setMetadata({ ...metadata, date: e.target.value })} className="w-full border-b-2 border-gray-100 p-1 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500" disabled={isReadOnly} />
                    </div>
                </div>
            </section>

            {/* --- CHART --- */}
            <section className="bg-gray-50 border-b print:hidden">
                <button onClick={() => setIsChartCollapsed(!isChartCollapsed)} className="w-full flex justify-between items-center p-3 bg-white border-b border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors">
                    <span className="flex items-center gap-2"><BarChart3 size={20} className="text-blue-600" />評価分析チャート</span>
                    {isChartCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isChartCollapsed ? 'max-h-0' : 'max-h-[800px]'}`}>
                    <div className="p-2 sm:p-4">
                        <ChartSection
                            items={items}
                            performanceData={metadata.performance}
                            performanceScore={performanceScore}
                            comparisonItems={comparisonData?.items}
                            comparisonPerformanceScore={comparisonData?.performanceScore}
                        />
                    </div>
                </div>
            </section>

            {/* --- TABS --- */}
            <div className="flex z-40 bg-white shadow-sm overflow-x-auto no-print border-b">
                {CATEGORIES.map((cat) => (
                    <button key={cat} onClick={() => handleTabChange(cat)} className={`flex-1 py-3 px-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center justify-center gap-1 ${activeTab === cat ? 'border-blue-800 text-blue-900 bg-blue-50/50' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                        {cat}{cat === '店長' && !isStoreManagerUnlocked && <Lock size={12} />}
                    </button>
                ))}
            </div>

            {/* --- MAIN CONTENT --- */}
            <main className="p-2 sm:p-4 pb-4 flex-grow bg-gray-50 print:bg-white print:p-0">
                {/* DISPLAY MODE (INPUT FORM) */}
                <div className="print:hidden">
                    <CriteriaGuide />
                    <div className="flex justify-end mb-4">
                        <button onClick={() => {
                            if (window.confirm(`${activeTab}評価をリセットしますか？`)) {
                                if (activeTab === '実績') {
                                    setMetadata(p => ({ ...p, performance: { ...p.performance, monthlyCuts: new Array(12).fill(0) } })); setPerformanceScore(5);
                                } else {
                                    setItems(p => p.map(i => i.category === activeTab ? { ...i, score: [34, 58, 59].includes(i.no) ? 0 : null, memos: [], memo: '', incidents: [] } : i));
                                }
                            }
                        }} className="text-xs flex items-center gap-1 text-gray-400 hover:text-red-500 bg-white px-2 py-1 rounded shadow-sm border"><RefreshCw size={12} /> この項目をリセット</button>
                    </div>
                    {activeTab === '実績' ? (
                        <PerformanceEvaluation data={metadata.performance} onChange={handlePerformanceUpdate} onScoreUpdate={setPerformanceScore} readOnly={isReadOnly} />
                    ) : (
                        filteredItems.map((item) => (
                            <EvaluationCard key={item.no} item={item} onUpdate={handleUpdateScore} onUpdateMemo={handleUpdateMemo} onUpdateIncidents={handleUpdateIncidents} readOnly={isReadOnly} />
                        ))
                    )}
                </div>

                {/* --- ENHANCED PRINT LAYOUT --- */}
                {isBatchPrinting && batchPrintData.length > 0 && (
                    <div className="batch-print-container">
                        {renderBatchPrintContent()}
                    </div>
                )}
            </main>

            {/* --- SIDEBAR & MODALS --- */}
            <HistorySidebar
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                historyList={historyList}
                currentId={currentId}
                onSelect={handleHistorySelect}
                onCompare={handleCompare}
            />
            <PasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} onUnlock={() => { setIsStoreManagerUnlocked(true); setActiveTab('店長'); }} />
        </div >
    );
}

export default App
