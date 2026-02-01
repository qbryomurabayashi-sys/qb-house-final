
import React from 'react';
import { User, Plus, Trash2, Calendar, Store } from 'lucide-react';
import { StaffSummary } from '../types';

interface TopPageProps {
    staffList: StaffSummary[];
    onSelect: (id: string) => void;
    onCreate: () => void;
    onDelete: (id: string) => void;
}

const TopPage: React.FC<TopPageProps> = ({ staffList, onSelect, onCreate, onDelete }) => {
    // Group staff by store for better organization? Original was just a list.
    // Keeping simple list for now as per original.

    return (
        <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
            <header className="bg-blue-900 text-white p-6 shadow-md">
                <h1 className="text-2xl font-bold mb-1">QB House</h1>
                <p className="text-blue-200 text-sm">Evaluation Sheet System</p>
            </header>

            <div className="p-4 space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                    <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User size={32} className="text-blue-600" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800 mb-2">スタッフ評価管理</h2>
                    <p className="text-sm text-gray-500 mb-6">新しい評価シートを作成するか、既存のスタッフを選択してください。</p>

                    <button onClick={onCreate} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-200">
                        <Plus size={20} />
                        新規スタッフ登録・評価作成
                    </button>
                </div>

                <div className="space-y-3">
                    <h3 className="font-bold text-gray-700 ml-1 flex items-center gap-2"><Calendar size={16} /> 最近の評価履歴</h3>
                    {staffList.length === 0 ? (
                        <p className="text-center text-gray-400 py-8 text-sm">履歴が見つかりません</p>
                    ) : (
                        staffList.map((staff) => (
                            <div key={staff.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group relative">
                                <div onClick={() => onSelect(staff.id)} className="cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-bold text-lg text-gray-800">{staff.name || '名称未設定'}</h4>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Store size={10} /> {staff.store || '店舗未設定'}
                                            </p>
                                        </div>
                                        <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded">{staff.date}</span>
                                    </div>
                                    <div className="text-[10px] text-gray-400 pt-2 border-t border-gray-100 mt-2">
                                        最終更新: {new Date(staff.updatedAt).toLocaleString()}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(staff.id); }}
                                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="削除"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <footer className="p-6 text-center text-gray-400 text-xs">
                &copy; 2024 QB House Evaluation System
            </footer>
        </div>
    );
};

export default TopPage;
