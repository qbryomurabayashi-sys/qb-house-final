import React, { useRef } from 'react';
import { StaffSummary } from '../types';
import { LuUsers, LuPlus, LuDownload, LuUpload, LuUser, LuStore, LuCalendar, LuChevronRight, LuTrash } from 'react-icons/lu';

interface TopPageProps {
    staffList: StaffSummary[];
    onSelect: (id: string) => void;
    onCreate: () => void;
    onDelete: (id: string) => void;
}

export const TopPage: React.FC<TopPageProps> = ({ staffList, onSelect, onCreate, onDelete }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const json = ev.target?.result as string;
                const data = JSON.parse(json);
                if (Array.isArray(data)) {
                    localStorage.setItem('qb_staff_index_v1', JSON.stringify(data));
                    window.location.reload();
                } else {
                    alert("形式が正しくありません");
                }
            } catch (err) {
                alert("読み込みに失敗しました");
            }
        };
        reader.readAsText(file);
    };

    const handleExport = () => {
        const dataToExport = localStorage.getItem('qb_staff_index_v1');
        if (!dataToExport) return;
        const blob = new Blob([dataToExport], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_qb_eval_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-[#002C5F] text-white pt-safe sticky top-0 z-10 shadow-md">
                <div className="px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-lg font-bold">QBハウス 評価シート (V10: No Icons)</h1>
                        <p className="text-xs text-blue-200 mt-1">スタッフ一覧</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleExport} className="p-2 bg-blue-800 rounded text-xs hover:bg-blue-700 flex items-center gap-1">
                            <LuDownload size={14} /> <span>JSON出力</span>
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-blue-800 rounded text-xs hover:bg-blue-700 flex items-center gap-1">
                            <LuUpload size={14} /> <span>JSON読込</span>
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".json"
                            onChange={handleImport}
                        />
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <LuUsers className="text-[#002C5F]" /> <span>スタッフリスト</span>
                    </h2>
                    <button
                        onClick={onCreate}
                        className="bg-[#E60012] text-white px-6 py-3 rounded-full shadow-lg font-bold flex items-center gap-2 hover:bg-red-600 transition-all hover:scale-105 active:scale-95"
                    >
                        <LuPlus size={20} /> <span>新規作成</span>
                    </button>
                </div>

                {staffList.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="text-gray-300 mb-4 text-4xl flex justify-center"><LuUser size={48} /></div>
                        <p className="text-gray-500 font-bold mb-2">スタッフが登録されていません</p>
                        <p className="text-sm text-gray-400">「新規作成」ボタンから評価を開始してください</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {staffList.map((staff) => (
                            <div
                                key={staff.id}
                                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                                onClick={() => onSelect(staff.id)}
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-[#002C5F] group-hover:bg-[#E60012] transition-colors"></div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-[#002C5F] font-bold text-lg group-hover:bg-red-50 group-hover:text-[#E60012] transition-colors">
                                            {staff.name.charAt(0) || 'S'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800 group-hover:text-[#002C5F] transition-colors">
                                                {staff.name || '未設定'}
                                            </h3>
                                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <LuStore size={12} /> {staff.store || '店舗未設定'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <LuCalendar size={12} /> {new Date(staff.updatedAt).toLocaleDateString('ja-JP')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-300">[ChevronRight]</span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('本当に削除しますか？')) onDelete(staff.id);
                                    }}
                                    className="absolute top-1/2 -translate-y-1/2 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
                                >
                                    <LuTrash size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};
