import React from 'react';
import { StaffSummary } from '../types';
import { LuArrowLeft, LuUser, LuPlus, LuHistory, LuStore, LuChevronRight } from 'react-icons/lu';

interface MenuPageProps {
    staff: StaffSummary | null;
    onResume: () => void;
    onNew: () => void;
    onHistory: () => void;
    onBack: () => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({ staff, onResume, onNew, onHistory, onBack }) => {
    if (!staff) return null;
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
                <div className="bg-[#002C5F] p-6 text-white relative">
                    <button onClick={onBack} className="absolute left-4 top-4 hover:bg-[#001a3f] p-2 rounded-full transition-colors font-bold">
                        <LuArrowLeft size={24} />
                    </button>
                    <div className="mt-8 text-center">
                        <h2 className="text-2xl font-bold mb-1">{staff.name}</h2>
                        <p className="text-blue-200 text-sm flex items-center justify-center gap-1">
                            <LuStore size={14} /> {staff.store}
                        </p>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <button onClick={onResume} className="w-full bg-[#F0F5FA] hover:bg-[#E6F0FA] text-[#002C5F] p-4 rounded-xl flex items-center gap-4 transition-all group border border-[#BFD8F2]">
                        <div className="bg-[#002C5F] text-white p-3 rounded-full group-hover:scale-110 transition-transform">
                            <LuUser size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-lg">続きから編集</h3>
                            <p className="text-xs text-gray-500">前回のデータを編集または確認します</p>
                        </div>
                        <span className="ml-auto text-[#004BB1]"><LuChevronRight size={24} /></span>
                    </button>

                    <button onClick={onNew} className="w-full bg-green-50 hover:bg-green-100 text-green-900 p-4 rounded-xl flex items-center gap-4 transition-all group border border-green-200">
                        <div className="bg-green-600 text-white p-3 rounded-full group-hover:scale-110 transition-transform">
                            <LuPlus size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-lg">新規評価を作成</h3>
                            <p className="text-xs text-gray-500">このスタッフの新しい評価を作成します</p>
                        </div>
                        <span className="ml-auto text-green-400"><LuChevronRight size={24} /></span>
                    </button>

                    <button onClick={onHistory} className="w-full bg-purple-50 hover:bg-purple-100 text-purple-900 p-4 rounded-xl flex items-center gap-4 transition-all group border border-purple-200">
                        <div className="bg-purple-600 text-white p-3 rounded-full group-hover:scale-110 transition-transform">
                            <LuHistory size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-lg">履歴一覧を確認</h3>
                            <p className="text-xs text-gray-500">過去の評価履歴を表示・比較します</p>
                        </div>
                        <span className="ml-auto text-purple-400"><LuChevronRight size={24} /></span>
                    </button>
                </div>
            </div>
        </div>
    );
};
