import React, { useState, useMemo, useEffect } from 'react';
import { LuArrowLeft, LuFileText, LuSearch, LuPlus, LuTrash2 } from 'react-icons/lu';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    flexRender,
    ColumnDef,
    SortingState
} from '@tanstack/react-table';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { MeetingForm, MeetingRecord, MEETING_TYPES, STATUSES } from "@/components/interview/MeetingForm";

export type InterviewPageProps = {
    onBack: () => void;
    context: {
        employeeId: string;
        name: string;
        store: string;
    };
};

const DATA_KEY = 'qb_interview_records';
const MOCK_DATA: MeetingRecord[] = [
    {
        id: '1', importance: 'High', date: '2024-02-01', storeName: '横浜駅北口店',
        employeeName: '田中 レイナ', employeeId: 'EMP001', interviewer: '菊川',
        type: '評価面談や個人キャリアプランについて', status: 'Completed',
        details: { mainContent: '今期の目標達成状況の確認と来期の目標設定。特に接客面での改善が見られた。', concerns: '特になし', nextAction: '3ヶ月後に進捗確認', impression: '非常に前向きに取り組んでいる' }
    },
    {
        id: '2', importance: 'Middle', date: '2024-01-28', storeName: '横浜市役所店',
        employeeName: '佐藤 健太', employeeId: 'EMP002', interviewer: '菊川',
        type: '店舗環境での改善について', status: 'NextActionRequired',
        details: { mainContent: 'バックヤードの清掃ルールについての提案があった。', concerns: '一部スタッフの協力が得られていない', nextAction: '店長会議で共有', impression: '具体的な改善案を持ってきてくれた' }
    }
];

export default function InterviewPage({ onBack, context }: InterviewPageProps) {
    // Load all data from localStorage or use Mock if empty
    const [allData, setAllData] = useState<MeetingRecord[]>(() => {
        const saved = localStorage.getItem(DATA_KEY);
        // Note: For real usage, we should filter by ID here or in the render to avoid leaking data, 
        // but for now we trust filtered 'data' memo.
        // Also, load mock data only if absolutely empty? Or always load mock if empty?
        return saved ? JSON.parse(saved) : MOCK_DATA;
    });

    // Filter data for current view
    const data = useMemo(() => {
        if (!context.employeeId) return allData;
        return allData.filter((d) => d.employeeId === context.employeeId);
    }, [allData, context.employeeId]);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<MeetingRecord | null>(null);

    // Persist whenever allData changes
    useEffect(() => {
        localStorage.setItem(DATA_KEY, JSON.stringify(allData));
    }, [allData]);

    const handleEdit = (record: MeetingRecord) => {
        setEditingRecord(record);
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setEditingRecord({
            importance: 'Middle',
            date: new Date().toISOString().split('T')[0],
            // Pre-fill from context
            storeName: context.store,
            employeeName: context.name,
            employeeId: context.employeeId,
            interviewer: '',
            type: MEETING_TYPES[0],
            status: 'Completed',
            details: { mainContent: '', concerns: '', nextAction: '', impression: '' },
            id: '' // Will be generated
        });
        setIsFormOpen(true);
    };

    const handleSave = (newRecord: MeetingRecord) => {
        setAllData(prev => {
            const exists = prev.find(r => r.id === newRecord.id);
            if (exists) {
                return prev.map(r => r.id === newRecord.id ? newRecord : r);
            } else {
                return [newRecord, ...prev];
            }
        });
    };

    const handleDelete = (id: string | undefined) => {
        if (!id) return;
        if (window.confirm('この面談記録を削除してもよろしいですか？')) {
            setAllData(prev => prev.filter(r => r.id !== id));
        }
    };

    const columns = useMemo<ColumnDef<MeetingRecord>[]>(() => [
        {
            accessorKey: "importance", header: "", size: 10, cell: ({ row }) => {
                const c: Record<string, string> = { High: "bg-red-500", Middle: "bg-yellow-500", Low: "bg-blue-500" };
                const imp = row.original.importance;
                return <div className={`w-1.5 h-full absolute left-0 top-0 bottom-0 ${c[imp] || 'bg-gray-300'}`} />
            }
        },
        { accessorKey: "date", header: "日付", cell: i => <span className="font-medium whitespace-nowrap">{i.getValue() as string}</span> },
        { accessorKey: "storeName", header: "店舗", cell: i => <span className="text-xs">{i.getValue() as string}</span> },
        { accessorKey: "employeeName", header: "氏名", cell: ({ row }) => <div><div className="font-bold">{row.original.employeeName}</div><div className="text-xs text-slate-500">{row.original.employeeId}</div></div> },
        { accessorKey: "type", header: "種類", cell: i => <Badge variant="outline" className="font-normal text-[10px] whitespace-normal text-left h-auto py-1">{i.getValue() as string}</Badge> },
        {
            accessorKey: "status", header: "状態", cell: ({ row }) => {
                const s = STATUSES.find(x => x.value === row.original.status) || { label: 'Unknown', color: 'default' };
                // @ts-ignore
                return <Badge variant={s.color}>{s.label}</Badge>
            }
        },
        { accessorKey: "details.mainContent", header: "内容", cell: ({ row }) => <div className="truncate max-w-[200px] text-slate-500 text-xs">{row.original.details.mainContent}</div> },
        {
            id: "actions", cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(row.original)}>詳細</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(row.original.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 font-bold"><LuTrash2 size={16} /></Button>
                </div>
            )
        }
    ], []);

    const table = useReactTable({
        data, columns, state: { globalFilter, sorting }, onGlobalFilterChange: setGlobalFilter, onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getSortedRowModel: getSortedRowModel()
    });

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header with Premium Blue Theme */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-500 hover:text-[#002C5F] font-bold hover:bg-blue-50">
                            <LuArrowLeft className="mr-2 h-4 w-4" /> 評価へ戻る
                        </Button>
                        <div className="flex items-center gap-2 text-[#002C5F] font-bold text-lg">
                            <LuFileText className="h-6 w-6" /> 面談報告書・記録
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <span className="absolute left-2.5 top-2.5 text-xs text-gray-400"><LuSearch size={14} /></span>
                            <Input
                                className="pl-9 w-64 bg-gray-50 border-gray-200 focus:ring-[#002C5F] focus:border-[#002C5F]"
                                placeholder="報告書を検索..."
                                value={globalFilter}
                                onChange={e => setGlobalFilter(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleCreate} className="bg-[#002C5F] hover:bg-[#001F45] text-white font-bold shadow-sm">
                            <LuPlus className="mr-2 h-4 w-4" /> 新規作成
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-6">
                {/* Staff Context Banner */}
                <div className="bg-[#002C5F] text-white rounded-lg p-4 mb-6 shadow-md flex items-center justify-between">
                    <div>
                        <div className="text-xs opacity-80">対象スタッフ</div>
                        <div className="text-xl font-bold flex items-end gap-2">
                            {context.name} <span className="text-sm font-normal opacity-80">({context.store})</span>
                        </div>
                    </div>
                    <div className="bg-white/10 px-4 py-2 rounded text-sm text-center">
                        <div className="text-xs opacity-70">社員番号</div>
                        <div className="font-mono font-bold">{context.employeeId}</div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#f8fafc] border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-xs">
                            {table.getHeaderGroups().map(hg => (
                                <tr key={hg.id}>
                                    {hg.headers.map(h => <th key={h.id} className="h-12 px-6 align-middle">{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</th>)}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-blue-50/30 transition-colors relative group">
                                        {row.getVisibleCells().map(cell => <td key={cell.id} className="p-4 px-6 align-middle relative">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="p-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <LuFileText size={48} className="opacity-20" />
                                            <p>表示できる面談記録がありません</p>
                                            <Button variant="outline" size="sm" onClick={handleCreate}>新規作成する</Button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
            <MeetingForm isOpen={isFormOpen} initialData={editingRecord} onClose={() => setIsFormOpen(false)} onSave={handleSave} />
        </div>
    );
}
