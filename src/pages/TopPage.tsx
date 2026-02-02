import { useState, useMemo } from 'react';
import { Store, Plus, Search, Upload, Download, User, X, History } from 'lucide-react';
import { StaffSummary } from '../../types';

interface TopPageProps {
    staffList: StaffSummary[];
    onSelect: (id: string) => void;
    onCreate: () => void;
    onDelete: (id: string) => void;
}

export const TopPage: React.FC<TopPageProps> = ({ staffList, onSelect, onCreate, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Deduplicate staff list by Name + Store, keeping the latest (list is already sorted by date desc)
    // Also filter by search term
    const filteredStaffList = useMemo(() => {
        const seen = new Set();
        const unique = staffList.filter(staff => {
            const key = `${staff.store}_${staff.name}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        if (!searchTerm) return unique;

        const lowerTerm = searchTerm.toLowerCase();
        return unique.filter(staff =>
            (staff.name && staff.name.toLowerCase().includes(lowerTerm)) ||
            (staff.store && staff.store.toLowerCase().includes(lowerTerm))
        );
    }, [staffList, searchTerm]);

    const handleBackup = () => {
        const dataToExport: Record<string, string | null> = {};
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('qb_')) {
                dataToExport[key] = localStorage.getItem(key);
            }
        });
        const blob = new Blob([JSON.stringify(dataToExport)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `backup_qb_eval_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const result = ev.target?.result as string;
                    const importedData = JSON.parse(result);
                    if (window.confirm('現在のデータを上書きしてデータを復元しますか？（この操作は取り消せません）')) {
                        Object.keys(importedData).forEach(key => {
                            if (key.startsWith('qb_')) {
                                localStorage.setItem(key, importedData[key]);
                            }
                        });
                        alert('データの復元が完了しました。ページをリロードします。');
                        window.location.reload();
                    }
                } catch (err) {
                    alert('ファイルの読み込みに失敗しました。');
                }
            };
            reader.readAsText(e.target.files[0]);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Store className="text-[#002C5F]" size={32} />
                            QB House Evaluation Sheet
                        </h1>
                        <p className="text-gray-500 mt-1">スタッフ評価管理システム</p>
                    </div>
                    <button
                        onClick={onCreate}
                        className="bg-[#002C5F] hover:bg-[#001a3f] text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
                    >
                        <Plus size={24} /> 新規評価を作成
                    </button>
                </div>

                {/* Search and Actions Bar */}
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="名前または店舗名で検索..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002C5F] focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                        <label className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-2">
                            <Upload size={16} /> 復元
                            <input type="file" accept=".json" className="hidden" onChange={handleRestore} />
                        </label>
                        <button
                            onClick={handleBackup}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                        >
                            <Download size={16} /> バックアップ
                        </button>
                    </div>
                </div>

                {filteredStaffList.length === 0 ? (
                    <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
                        <div className="bg-[#F0F5FA] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                            <User size={48} className="text-[#002C5F]" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            {searchTerm ? '該当するスタッフが見つかりません' : '評価データがありません'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm ? '検索条件を変更してみてください。' : '「新規評価を作成」ボタンから新しいスタッフの評価を開始してください。'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {filteredStaffList.map((staff) => (
                            <div
                                key={staff.id}
                                onClick={() => onSelect(staff.id)}
                                className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-[#002C5F] transition-all group relative flex flex-col items-center text-center"
                            >
                                <button
                                    onClick={(e) => { e.stopPropagation(); if (window.confirm('本当にこのスタッフの評価データを削除しますか？')) onDelete(staff.id); }}
                                    className="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                    title="削除"
                                >
                                    <X size={16} />
                                </button>

                                <div className="w-20 h-20 rounded-full bg-[#F0F5FA] flex items-center justify-center mb-3 mt-2 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                                    <User size={32} className="text-[#002C5F]" />
                                </div>

                                <h3 className="text-base font-bold text-gray-900 truncate w-full px-2 mb-1">
                                    {staff.name || '名称未設定'}
                                </h3>

                                <div className="text-xs font-bold text-[#002C5F] bg-[#F0F5FA] px-2 py-0.5 rounded-full mb-2 max-w-full truncate">
                                    {staff.store || '店舗未入力'}
                                </div>

                                <div className="text-[10px] text-gray-400 mt-auto pt-2 w-full border-t border-gray-50 flex justify-center gap-1">
                                    <History size={10} />
                                    <span>{new Date(staff.updatedAt).toLocaleDateString('ja-JP')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
