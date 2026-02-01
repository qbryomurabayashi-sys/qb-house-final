
import React from 'react';
import { User, Plus, History, ChevronRight, ArrowLeft, Store } from 'lucide-react';
import { StaffSummary } from '../types';

interface MenuPageProps {
    staff: StaffSummary;
    onResume: () => void;
    onNew: () => void;
    onHistory: () => void;
    onBack: () => void;
}

const MenuPage: React.FC<MenuPageProps> = ({ staff, onResume, onNew, onHistory, onBack }) => {
    return (
        <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col">
            <header className="bg-gray-900 text-white p-4 shadow-md sticky top-0 z-10">
                <button onClick={onBack} className="flex items-center gap-1 text-gray-300 hover:text-white mb-4">
                    <ArrowLeft size={16} /> 戻る
                </button>
                <h1 className="text-xl font-bold truncate">{staff.name || '名称未設定'}</h1>
                <p className="text-gray-400 text-sm flex items-center gap-1">
                    <Store size={14} /> {staff.store || '店舗未設定'}
                </p>
            </header>

            <main className="flex-1 p-6 flex flex-col justify-center space-y-4 bg-gray-50">
                <button onClick={onResume} className="w-full bg-white hover:bg-blue-50 text-blue-900 p-6 rounded-2xl shadow-sm hover:shadow-md flex items-center gap-4 transition-all group border border-blue-100">
                    <div className="bg-blue-600 text-white p-4 rounded-full group-hover:scale-110 transition-transform shadow-lg shadow-blue-200">
                        <User size={28} />
                    </div>
                    <div className="text-left flex-1">
                        <h3 className="font-bold text-xl mb-1">続きから編集</h3>
                        <p className="text-xs text-gray-500">前回の保存データを編集または確認します</p>
                    </div>
                    <ChevronRight className="ml-auto text-blue-300 group-hover:text-blue-500" />
                </button>

                <button onClick={onNew} className="w-full bg-white hover:bg-green-50 text-green-900 p-6 rounded-2xl shadow-sm hover:shadow-md flex items-center gap-4 transition-all group border border-green-100">
                    <div className="bg-green-600 text-white p-4 rounded-full group-hover:scale-110 transition-transform shadow-lg shadow-green-200">
                        <Plus size={28} />
                    </div>
                    <div className="text-left flex-1">
                        <h3 className="font-bold text-xl mb-1">新規評価を作成</h3>
                        <p className="text-xs text-gray-500">このスタッフの新しい評価シートを作成します</p>
                    </div>
                    <ChevronRight className="ml-auto text-green-300 group-hover:text-green-500" />
                </button>

                <button onClick={onHistory} className="w-full bg-white hover:bg-purple-50 text-purple-900 p-6 rounded-2xl shadow-sm hover:shadow-md flex items-center gap-4 transition-all group border border-purple-100">
                    <div className="bg-purple-600 text-white p-4 rounded-full group-hover:scale-110 transition-transform shadow-lg shadow-purple-200">
                        <History size={28} />
                    </div>
                    <div className="text-left flex-1">
                        <h3 className="font-bold text-xl mb-1">履歴一覧を確認</h3>
                        <p className="text-xs text-gray-500">過去の評価履歴を表示・比較します</p>
                    </div>
                    <ChevronRight className="ml-auto text-purple-300 group-hover:text-purple-500" />
                </button>
            </main>
        </div>
    );
};

export default MenuPage;
