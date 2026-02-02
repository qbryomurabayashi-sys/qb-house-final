import { EvaluationItem as EvaluationItemType, IMPROVEMENT_OPTS, CLAIM_DEDUCTIONS } from '../../data/constants';
import { Select } from '@/components/ui/Select';
// Assuming Select is a compatible drop-in or I need to adapt. 
// The original code used standard <select>. I'll stick to standard <select> inside the loop for now to match the original logic 
// or use the new Select component if it's compatible.
// Actually, for the incidents/claim logic, it is complex.
// Let's implement the simpler parts first.

import { generateUUID } from '../../utils/evaluationUtils';
import { MessageSquare, AlertTriangle, Check, BookOpen, AlertCircle, X } from 'lucide-react';

interface EvaluationItemProps {
    item: EvaluationItemType;
    isManager: boolean;
    onUpdateScore: (score: number) => void;
    onUpdateMemo: (memo: string) => void;
    onUpdateIncidents: (incidents: any[]) => void; // Define Incident type better if possible
    readOnly?: boolean;
}

export const EvaluationItem: React.FC<EvaluationItemProps> = ({
    item,
    isManager,
    onUpdateScore,
    onUpdateMemo,
    onUpdateIncidents,
    readOnly
}) => {
    // Determine input type based on item definition
    // Logic from index.html EvaluationItem component

    // Check if it is a claim/incident item (negative max score usually)
    const isClaimItem = item.subCategory === 'クレーム' || item.subCategory === '事故';

    // Memo change handler
    const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onUpdateMemo(e.target.value);
    };

    // Incident handlers
    const addIncident = () => {
        const newIncidents = [...(item.incidents || []), { id: generateUUID(), date: new Date().toISOString().split('T')[0], desc: '', deduction: 0, improvement: 0 }];
        onUpdateIncidents(newIncidents);
    };

    const removeIncident = (id: string) => {
        const newIncidents = (item.incidents || []).filter(inc => inc.id !== id);
        onUpdateIncidents(newIncidents);
    };

    const updateIncident = (id: string, field: string, value: any) => {
        const newIncidents = (item.incidents || []).map(inc =>
            inc.id === id ? { ...inc, [field]: value } : inc
        );
        onUpdateIncidents(newIncidents);
    };

    // Valid scores for radio/button selection
    // If validScores is defined, use that. Else if max > 0, assume 0-max or similar?
    // The original code has specific logic for 'validScores'.

    let scoreOptions: number[] = [];
    if (item.validScores) {
        scoreOptions = item.validScores;
    } else if (item.max > 0) {
        // Default 0 to max
        for (let i = item.max; i >= 0; i--) {
            scoreOptions.push(i);
        }
    }

    return (
        <div className={`p-4 rounded-xl border-2 transition-all duration-200 hover:border-blue-200 ${item.score !== null ? 'bg-white border-blue-100 shadow-sm' : 'bg-gray-50 border-gray-100'}`}>
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-wider">{item.subCategory}</span>
                        <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded ml-auto sm:ml-0">{item.axis}</span>
                    </div>
                    <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#002C5F] text-white text-xs shrink-0">{item.no}</span>
                        {item.item}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed pl-8">{item.desc}</p>

                    {/* Point Description / Hover Help */}
                    {item.pointDesc && (
                        <div className="mt-2 pl-8 text-xs text-blue-600 flex items-start gap-1">
                            <BookOpen size={12} className="mt-0.5 shrink-0" />
                            <span>{item.pointDesc}</span>
                        </div>
                    )}
                </div>

                <div className="w-full sm:w-32 shrink-0">
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-bold text-gray-400">スコア / {Math.abs(item.max)}</span>
                        <div className={`text-3xl font-bold ${item.score !== null ? (item.score < 0 ? 'text-red-500' : 'text-[#002C5F]') : 'text-gray-300'}`}>
                            {item.score !== null ? item.score : '-'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Input Section */}
            <div className="pl-0 sm:pl-8 mt-4 space-y-4">

                {/* 1. Claim / Accident Input Logic */}
                {isClaimItem ? (
                    <div className="space-y-3">
                        {(!item.incidents || item.incidents.length === 0) && (
                            <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded border border-dashed text-center">
                                記録なし (0点)
                            </div>
                        )}

                        {(item.incidents || []).map((inc, idx) => (
                            <div key={inc.id} className="p-3 bg-red-50 rounded border border-red-100 relative">
                                {!readOnly && (
                                    <button onClick={() => removeIncident(inc.id)} className="absolute top-2 right-2 text-red-400 hover:text-red-600">
                                        <X size={16} />
                                    </button>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                                    <div>
                                        <label className="text-xs font-bold text-red-800 block mb-1">発生日</label>
                                        <input
                                            type="date"
                                            value={inc.date}
                                            onChange={(e) => updateIncident(inc.id, 'date', e.target.value)}
                                            className="w-full text-sm p-1.5 border rounded"
                                            disabled={readOnly}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-red-800 block mb-1">減点対象</label>
                                        <select
                                            value={inc.deduction}
                                            onChange={(e) => updateIncident(inc.id, 'deduction', parseInt(e.target.value))}
                                            className="w-full text-sm p-1.5 border rounded"
                                            disabled={readOnly}
                                        >
                                            {/* Determine which options to show based on subCategory/Technical vs Service */}
                                            {/* In the original code, this was hardcoded or passed. 
                                                 I imported CLAIM_DEDUCTIONS. 
                                                 Need to know which key to use: 'tech', 'accident', 'service' */}
                                            {(() => {
                                                const key = item.category === '技術'
                                                    ? (item.subCategory === '事故' ? 'accident' : 'tech')
                                                    : 'service';
                                                return CLAIM_DEDUCTIONS[key]?.map((opt: any) => (
                                                    <option key={opt.label} value={opt.score}>{opt.label} : {opt.desc}</option>
                                                ));
                                            })()}
                                        </select>
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="text-xs font-bold text-red-800 block mb-1">内容</label>
                                    <input
                                        type="text"
                                        value={inc.desc}
                                        onChange={(e) => updateIncident(inc.id, 'desc', e.target.value)}
                                        className="w-full text-sm p-1.5 border rounded"
                                        placeholder="詳細を入力..."
                                        disabled={readOnly}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-green-800 block mb-1">改善加点</label>
                                    <select
                                        value={inc.improvement}
                                        onChange={(e) => updateIncident(inc.id, 'improvement', parseInt(e.target.value))}
                                        className="w-full text-sm p-1.5 border rounded bg-green-50"
                                        disabled={readOnly}
                                    >
                                        {IMPROVEMENT_OPTS.map(opt => (
                                            <option key={opt.label} value={opt.score}>{opt.label} {opt.desc}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ))}

                        {!readOnly && (
                            <button
                                type="button"
                                onClick={addIncident}
                                className="w-full py-2 bg-red-100 text-red-700 font-bold rounded hover:bg-red-200 transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                <AlertTriangle size={16} /> 事案を追加
                            </button>
                        )}
                    </div>

                ) : (
                    /* 2. Standard Score Selection */
                    <div className="flex flex-wrap gap-2">
                        {scoreOptions.map((score) => {
                            const isSelected = item.score === score;
                            // Styling Logic
                            let colorClass = 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50';
                            let selectedClass = 'bg-[#002C5F] text-white border-[#002C5F] ring-2 ring-blue-200';
                            let badgeClass = 'bg-gray-100 text-gray-500';

                            if (score === 4) { // Perfect
                                badgeClass = isSelected ? 'bg-yellow-400 text-[#002C5F]' : 'bg-yellow-100 text-yellow-700';
                            } else if (score === 3) { // Good
                                badgeClass = isSelected ? 'bg-blue-400 text-white' : 'bg-blue-100 text-blue-700';
                            } else if (score === 0) { // Bad
                                colorClass = 'bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:bg-red-50';
                                selectedClass = 'bg-red-600 text-white border-red-600 ring-2 ring-red-200';
                                badgeClass = isSelected ? 'bg-red-500 text-white' : 'bg-red-100 text-red-500';
                            }

                            return (
                                <button
                                    type="button"
                                    key={score}
                                    onClick={() => !readOnly && onUpdateScore(score)}
                                    disabled={readOnly}
                                    className={`flex-1 min-w-[3.5rem] p-2 rounded-lg border-2 transition-all duration-100 flex flex-col items-center justify-center gap-1 ${!readOnly && 'active:scale-95'} ${isSelected ? selectedClass : colorClass} ${readOnly ? 'opacity-80 cursor-default' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${badgeClass}`}>
                                        {score}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* 3. Description of selected score (for standard items) */}
                {!isClaimItem && (
                    <div className={`mt-2 p-2 rounded-lg border min-h-[2.5rem] transition-all duration-300 ${item.score !== null ? 'bg-gray-50 border-gray-200' : 'bg-gray-50/50 border-dashed border-gray-200'}`}>
                        <p className={`text-xs leading-relaxed ${item.score !== null ? 'text-gray-800 font-medium' : 'text-gray-400 text-center italic'}`}>
                            {item.score !== null
                                ? (item.criteria?.[item.score] || (item.score === 0 ? "不十分 / なし" : "評価基準なし/または記述"))
                                : "点数を選択してください"}
                        </p>
                    </div>
                )}

                {/* 4. Memo Area */}
                <div className="relative">
                    <textarea
                        value={item.memo || ''}
                        onChange={handleMemoChange}
                        placeholder="メモ・フィードバック..."
                        className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all resize-y min-h-[60px]"
                        disabled={readOnly}
                    />
                    <MessageSquare className="absolute bottom-3 right-3 text-gray-300 pointer-events-none" size={16} />
                </div>
            </div>
        </div>
    );
};
