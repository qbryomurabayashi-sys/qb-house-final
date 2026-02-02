import { useState, useEffect, useMemo } from 'react';
import { generateUUID } from './utils/evaluationUtils';
import { TopPage } from './pages/TopPage';
import { MenuPage } from './pages/MenuPage';
import { SheetPage } from './pages/SheetPage';
import InterviewPage from './pages/InterviewPage';
import { StaffSummary, EvaluationData } from './types';

// Storage Keys
const STAFF_INDEX_KEY = 'qb_staff_index_v1';
const DATA_PREFIX = 'qb_data_';

type ViewMode = 'top' | 'menu' | 'sheet' | 'interview';

function App() {
    const [viewMode, setViewMode] = useState<ViewMode>('top');
    const [staffList, setStaffList] = useState<StaffSummary[]>([]);

    // Selection State
    const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
    const [sheetInitialData, setSheetInitialData] = useState<EvaluationData | null>(null);
    const [currentSheetId, setCurrentSheetId] = useState<string | null>(null);

    // Interview Context
    const [interviewContext, setInterviewContext] = useState<{ employeeId: string, name: string, store: string } | null>(null);

    // Initial Load & URL Check
    useEffect(() => {
        // Load Staff Index
        const loadIndex = () => {
            const raw = localStorage.getItem(STAFF_INDEX_KEY);
            if (raw) {
                try {
                    setStaffList(JSON.parse(raw));
                } catch (e) { console.error("Failed to load staff index", e); }
            }
        };
        loadIndex();

        // Check URL for Interview Mode (Direct Link)
        // Format: /?mode=interview&employeeId=...&name=...&store=... or just /interview (if hash router or path)
        // Since we are likely on a simple server, let's check search params
        const params = new URLSearchParams(window.location.search);
        const path = window.location.pathname;

        if (path === '/interview' || params.get('mode') === 'interview') {
            const eid = params.get('employeeId') || '';
            const name = params.get('name') || '';
            const store = params.get('store') || '';
            if (eid && name && store) {
                setInterviewContext({ employeeId: eid, name, store });
                setViewMode('interview');
            }
        }

        // Listen for storage events to update list across tabs (optional but nice)
        const handleStorage = (e: StorageEvent) => {
            if (e.key === STAFF_INDEX_KEY) loadIndex();
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Derived helpers
    const selectedStaff = useMemo(() => {
        return staffList.find(s => s.id === selectedStaffId) || null;
    }, [staffList, selectedStaffId]);

    // --- Actions ---

    const goTop = () => {
        setViewMode('top');
        setSelectedStaffId(null);
        setSheetInitialData(null);
        setCurrentSheetId(null);
        // Clean URL if we were in interview mode
        if (window.location.pathname === '/interview' || window.location.search.includes('mode=interview')) {
            window.history.pushState({}, '', '/');
        }
        // Reload list to be fresh
        const raw = localStorage.getItem(STAFF_INDEX_KEY);
        if (raw) setStaffList(JSON.parse(raw));
    };

    const handleSelectStaff = (id: string) => {
        setSelectedStaffId(id);
        setViewMode('menu');
    };

    const handleCreateNew = () => {
        // Start completely new
        const newId = generateUUID();
        setCurrentSheetId(newId);
        setSheetInitialData(null); // Will default to empty in SheetPage
        setViewMode('sheet');
    };

    const handleDeleteStaff = (id: string) => {
        // Delete index entry and data
        const newIndex = staffList.filter(s => s.id !== id);
        setStaffList(newIndex);
        localStorage.setItem(STAFF_INDEX_KEY, JSON.stringify(newIndex));
        localStorage.removeItem(DATA_PREFIX + id);
    };

    // Menu Actions
    const handleMenuBack = () => {
        setViewMode('top');
        setSelectedStaffId(null);
    };

    const handleResume = () => {
        if (!selectedStaffId) return;
        // Load data
        const raw = localStorage.getItem(DATA_PREFIX + selectedStaffId);
        if (raw) {
            try {
                const data = JSON.parse(raw);
                setSheetInitialData(data);
                setCurrentSheetId(selectedStaffId);
                setViewMode('sheet');
            } catch (e) {
                alert("データの読み込みに失敗しました");
            }
        } else {
            alert("保存されたデータが見つかりません");
        }
    };

    const handleCreateNewForStaff = () => {
        if (!selectedStaff) return;
        // Create new ID but pre-fill name/store info?
        // SheetPage takes initialData. 
        // We can pass partial initialData (metadata only)
        const newId = generateUUID();
        setCurrentSheetId(newId);
        setSheetInitialData({
            items: undefined, // default
            performanceScore: undefined,
            metadata: {
                id: newId,
                name: selectedStaff.name,
                store: selectedStaff.store,
                employeeId: '',
                evaluator: '',
                date: new Date().toISOString().split('T')[0],
                updatedAt: Date.now(),
                performance: undefined
            }
        });

        // Attempt to pre-fill employeeId from previous record if exists
        const raw = localStorage.getItem(DATA_PREFIX + selectedStaffId);
        if (raw) {
            const prev = JSON.parse(raw);
            if (prev.metadata?.employeeId) {
                setSheetInitialData(prevData => ({
                    ...prevData!, // It was just set above
                    metadata: {
                        ...prevData!.metadata!,
                        employeeId: prev.metadata.employeeId,
                        store: prev.metadata.store, // ensure store is sync
                        name: prev.metadata.name
                    }
                }));
            }
        }

        setViewMode('sheet');
    };

    const handleHistory = () => {
        // Just go to sheet, maybe trigger history open?
        // Or "Resume" is basically history view?
        // Let's just Resume for now, user can open history sidebar there.
        handleResume();
    };

    const handleInterviewLink = (eid: string, name: string, store: string) => {
        // Switch to interview view
        setInterviewContext({ employeeId: eid, name, store });
        setViewMode('interview');
        window.history.pushState({}, '', `/interview?employeeId=${eid}&name=${encodeURIComponent(name)}&store=${encodeURIComponent(store)}`);
    };

    // --- Render ---

    if (viewMode === 'interview' && interviewContext) {
        return (
            <InterviewPage
                onBack={() => {
                    if (currentSheetId) {
                        setViewMode('sheet');
                        window.history.pushState({}, '', '/');
                    } else {
                        goTop();
                    }
                }}
                context={interviewContext}
            />
        );
    }

    if (viewMode === 'sheet' && currentSheetId) {
        return (
            <SheetPage
                currentId={currentSheetId}
                initialData={sheetInitialData}
                onBack={() => {
                    const raw = localStorage.getItem(STAFF_INDEX_KEY);
                    if (raw) setStaffList(JSON.parse(raw));

                    if (selectedStaffId) {
                        setViewMode('menu');
                    } else {
                        goTop();
                    }
                }}
            />
        );
    }

    if (viewMode === 'menu') {
        return (
            <MenuPage
                staff={selectedStaff}
                onResume={handleResume}
                onNew={handleCreateNewForStaff}
                onHistory={handleHistory}
                onBack={handleMenuBack}
            />
        );
    }

    return (
        <TopPage
            staffList={staffList}
            onSelect={handleSelectStaff}
            onCreate={handleCreateNew}
            onDelete={handleDeleteStaff}
        />
    );
}

export default App;
