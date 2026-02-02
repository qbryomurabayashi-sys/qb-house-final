import { useState } from 'react';
import { MinusCircle, PlusCircle, ChevronDown } from 'lucide-react';

export const CriteriaGuide = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="mx-2 sm:mx-4 mb-4 rounded-xl overflow-hidden print-break-inside-avoid shadow-sm print:hidden">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full p-4 flex justify-between items-center text-sm sm:text-base font-bold transition-all duration-200 border-2 ${isOpen
                    ? 'bg-blue-800 text-white border-blue-900'
                    : 'bg-white text-[#002C5F] border-dashed border-blue-300 hover:border-blue-50 hover:bg-[#F0F5FA]'
                    }`}
            >
                <span className="flex items-center gap-2">
                    {isOpen ? <MinusCircle size={20} /> : <PlusCircle size={20} />}
                    <span>4段階評価基準ガイド{isOpen ? 'を閉じる' : 'を開く'}</span>
                </span>
                <ChevronDown size={20} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="p-4 text-xs sm:text-sm text-gray-800 space-y-4 bg-white border-x border-b border-gray-200 rounded-b-xl">
                    <div className="flex gap-3 items-start">
                        <span className="font-bold text-white bg-blue-700 px-2 py-1 rounded shrink-0 h-fit">3 優秀</span>
                        <div className="text-gray-700">
                            <ul className="list-disc list-inside space-y-1">
                                <li>非常に高い成果を達成している。期待を大きく上回るパフォーマンス。</li>
                                <li>新しいアイデアを提案し、周囲にも良い影響を及ぼす。</li>
                            </ul>
                        </div>
                    </div>
                    <hr className="border-gray-100" />
                    <div className="flex gap-3 items-start">
                        <span className="font-bold text-white bg-sky-500 px-2 py-1 rounded shrink-0 h-fit">2 良好</span>
                        <div className="text-gray-700">
                            <ul className="list-disc list-inside space-y-1">
                                <li>期待される成果を達成している。定められた目標を満たしている。</li>
                                <li>定期的に安定したパフォーマンスを発揮。</li>
                            </ul>
                        </div>
                    </div>
                    <hr className="border-gray-100" />
                    <div className="flex gap-3 items-start">
                        <span className="font-bold text-white bg-orange-500 px-2 py-1 rounded shrink-0 h-fit">1 改善</span>
                        <div className="text-gray-700">
                            <ul className="list-disc list-inside space-y-1">
                                <li>基準に達していない。時折目標を達成するが、一貫性が欠ける。</li>
                                <li>追加のサポートやトレーニングが必要。</li>
                            </ul>
                        </div>
                    </div>
                    <hr className="border-gray-100" />
                    <div className="flex gap-3 items-start">
                        <span className="font-bold text-white bg-red-500 px-2 py-1 rounded shrink-0 h-fit">0 不可</span>
                        <div className="text-gray-700">
                            <ul className="list-disc list-inside space-y-1">
                                <li>期待される成果を達成していない。明確な努力が見られない。</li>
                                <li>継続的なパフォーマンスの低下が見られる。</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
