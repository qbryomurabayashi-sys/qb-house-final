
import React, { useState } from 'react';
import { Info, AlertTriangle, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { EvaluationItem, Incident } from '../types';
import { CLAIM_DEDUCTIONS, IMPROVEMENT_OPTS } from '../data/constants';

interface EvaluationCardProps {
    item: EvaluationItem;
    onUpdate: (no: number, score: number | null) => void;
    onUpdateMemo: (no: number, memo: string) => void;
    onUpdateIncidents: (no: number, incidents: Incident[]) => void;
    readOnly: boolean;
}

const EvaluationCard: React.FC<EvaluationCardProps> = ({ item, onUpdate, onUpdateMemo, onUpdateIncidents, readOnly }) => {
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isMemoOpen, setIsMemoOpen] = useState(!!item.memo);

    // Incident State
    const [newIncidentDesc, setNewIncidentDesc] = useState('');
    const [newIncidentDate, setNewIncidentDate] = useState(new Date().toISOString().split('T')[0]);
    const [newIncidentDeduction, setNewIncidentDeduction] = useState(0);
    const [newIncidentImprovement, setNewIncidentImprovement] = useState(0);
    const [isAddingIncident, setIsAddingIncident] = useState(false);

    const isNegative = item.max < 0 && !item.validScores;
    const isClaimOrAccident = item.subCategory === 'クレーム' || item.subCategory === '事故';

    const availableScores = item.validScores
        ? item.validScores
        : item.max < 0
            ? [0, -1, -2, -3, -4, -5, -10, -15].filter(s => s >= item.max)
            : Array.from({ length: item.max + 1 }, (_, n) => n).reverse();

    // Range Slider Logic (Normal 0-Max)
    const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate(item.no, parseInt(e.target.value));
    };

    // Incident Handlers
    const addIncident = () => {
        if (!newIncidentDesc) return;
        const newIncident: Incident = {
            id: Date.now().toString(),
            date: newIncidentDate,
            desc: newIncidentDesc,
            deduction: newIncidentDeduction,
            improvement: newIncidentImprovement
        };
        const currentIncidents = item.incidents || [];
        onUpdateIncidents(item.no, [...currentIncidents, newIncident]);
        setNewIncidentDesc('');
        setNewIncidentDeduction(0);
        setNewIncidentImprovement(0);
        setIsAddingIncident(false);
    };

    const removeIncident = (id: string) => {
        const currentIncidents = item.incidents || [];
        onUpdateIncidents(item.no, currentIncidents.filter(inc => inc.id !== id));
    };


    const renderInput = () => {
        if (readOnly) {
            return <div className="font-bold text-2xl text-gray-800">{item.score !== null ? item.score : '-'} <span className="text-sm font-normal text-gray-500">/ {item.max}</span></div>
        }

        if (isClaimOrAccident) {
            return (
                <div className="flex flex-col items-end">
                    <span className={`text-2xl font-bold ${item.score && item.score < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                        {item.score || 0}
                    </span>
                    <button onClick={() => setIsAddingIncident(true)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 mt-1 flex items-center gap-1">
                        <AlertTriangle size={12} /> 発生記録を追加
                    </button>
                </div>
            );
        }

        // Special handling for negative items that are not claims (e.g. technique claim simple score) - fallback to select if logic needed, but here simple range or buttons
        // Logic says: isNegative = item.max < 0 && !validScores.
        // Existing app used select for negatives? "availableScores" mapping implies buttons or select.
        // Let's us buttons for consistency if small range, or select.

        if (item.validScores) {
            return (
                <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                    {availableScores.map(s => (
                        <button
                            key={s}
                            onClick={() => onUpdate(item.no, s)}
                            className={`px-3 py-2 rounded-md font-bold text-sm transition-all ${item.score === s ? 'bg-white text-blue-600 shadow-sm border border-blue-200' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            );
        }

        // Standard Slider for positive scores
        if (item.max > 0) {
            return (
                <div className="w-48 flex flex-col items-center">
                    <div className="relative w-full h-8 flex items-center">
                        {/* Custom Track Background */}
                        <div className="absolute w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-100" style={{ width: '100%' }}></div>
                            {item.score !== null && (
                                <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(item.score / item.max) * 100}%` }}></div>
                            )}
                        </div>
                        <input
                            type="range"
                            min="0"
                            max={item.max}
                            step="1"
                            value={item.score ?? 0}
                            onChange={handleRangeChange}
                            className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        {/* Thumb Visual (Simplification: Just rely on standard webkit styles or custom css class) */}
                        <div
                            className="pointer-events-none absolute h-5 w-5 bg-white border-2 border-blue-500 rounded-full shadow transition-all duration-150 transform"
                            style={{ left: `calc(${((item.score ?? 0) / item.max) * 100}% - 10px)` }}
                        ></div>
                    </div>
                    <div className="flex justify-between w-full text-[10px] text-gray-400 font-bold px-1 mt-1">
                        <span>0</span>
                        <span>{item.max}</span>
                    </div>
                    {/* Current Value Display */}
                    <div className="text-center mt-[-2px]">
                        <span className={`text-2xl font-bold ${item.score === null ? 'text-gray-300' : 'text-blue-600'}`}>
                            {item.score ?? '-'}
                        </span>
                    </div>
                </div>
            );
        }

        // Fallback
        return null;
    };


    return (
        <div className={`bg-white rounded-xl p-4 shadow-sm border transition-all ${item.score === null ? 'border-gray-200' : item.score === item.max ? 'border-blue-200 bg-blue-50/10' : 'border-gray-200'}`}>
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-gray-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{item.no}</span>
                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{item.subCategory}</span>
                        {item.max < 0 && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded border border-red-200 font-bold">減点項目</span>}
                    </div>
                    <h4 className="font-bold text-gray-800 text-lg leading-tight mb-1">{item.item}</h4>
                    <p className="text-xs text-gray-500 mb-2">{item.desc}</p>

                    <button onClick={() => setIsDetailOpen(!isDetailOpen)} className="text-[10px] flex items-center gap-1 text-blue-500 hover:text-blue-700 font-bold">
                        <Info size={12} />
                        {isDetailOpen ? "詳細を閉じる" : "評価基準・詳細を見る"}
                    </button>
                    {!isMemoOpen && !readOnly && (
                        <button onClick={() => setIsMemoOpen(true)} className="ml-3 text-[10px] flex items-center gap-1 text-gray-400 hover:text-gray-600 inline-flex">
                            <MessageSquare size={12} /> メモを追加
                        </button>
                    )}
                </div>

                <div className="flex-shrink-0">
                    {renderInput()}
                </div>
            </div>

            {/* DETAIL ACCORDION */}
            {isDetailOpen && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 border border-gray-100 animation-expand">
                    <p className="font-bold mb-2 text-blue-900 border-b border-blue-100 pb-1">{item.pointDesc}</p>
                    <div className="space-y-1.5">
                        {item.criteria && Object.entries(item.criteria).sort((a, b) => Number(b[0]) - Number(a[0])).map(([key, text]) => (
                            <div key={key} className={`flex gap-2 p-1.5 rounded ${item.score === Number(key) ? 'bg-blue-100 border border-blue-200' : ''}`}>
                                <span className={`font-bold flex-shrink-0 w-8 text-center ${Number(key) === item.max ? 'text-blue-600' : Number(key) === 0 ? 'text-red-500' : 'text-gray-500'}`}>{key}点</span>
                                <span className={item.score === Number(key) ? 'text-blue-900 font-bold' : ''}>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* INCIDENT LIST */}
            {item.incidents && item.incidents.length > 0 && (
                <div className="mt-3 space-y-2">
                    {item.incidents.map((inc) => (
                        <div key={inc.id} className="bg-red-50 border border-red-100 p-2 rounded text-xs flex justify-between items-start">
                            <div className="flex-1">
                                <div className="font-bold text-red-800 flex items-center gap-2">
                                    <span>{inc.date}</span>
                                    <span className="bg-red-200 px-1 rounded text-[10px]">減点 {inc.deduction}</span>
                                    {inc.improvement > 0 && <span className="bg-green-200 text-green-800 px-1 rounded text-[10px]">改善 +{inc.improvement}</span>}
                                </div>
                                <p className="text-red-700 mt-1">{inc.desc}</p>
                            </div>
                            {!readOnly && (
                                <button onClick={() => removeIncident(inc.id)} className="text-red-400 hover:text-red-600 bg-white p-1 rounded shadow-sm">
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* INCIDENT FORM */}
            {isAddingIncident && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg shadow-inner">
                    <h5 className="font-bold text-red-800 text-xs mb-2 flex items-center gap-1"><AlertTriangle size={12} /> 発生記録の追加</h5>
                    <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                            <input type="date" value={newIncidentDate} onChange={e => setNewIncidentDate(e.target.value)} className="text-xs border p-1 rounded" />
                            <select className="col-span-2 text-xs border p-1 rounded" value={newIncidentDeduction} onChange={e => setNewIncidentDeduction(Number(e.target.value))}>
                                <option value={0}>事象の選択...</option>
                                {CLAIM_DEDUCTIONS[item.subCategory === '事故' ? 'accident' : item.category === '技術' ? 'tech' : 'service']?.map(opt => (
                                    <option key={opt.label} value={opt.score}>{opt.label} : {opt.desc}</option>
                                ))}
                            </select>
                        </div>
                        <textarea
                            placeholder="詳細な状況、原因、再発防止策など..."
                            value={newIncidentDesc}
                            onChange={e => setNewIncidentDesc(e.target.value)}
                            className="w-full text-xs border p-2 rounded h-16"
                        />
                        <div className="flex items-center gap-2 bg-white p-2 rounded border border-red-100">
                            <span className="text-xs font-bold text-green-700">改善行動:</span>
                            <div className="flex gap-1">
                                {IMPROVEMENT_OPTS.map(opt => (
                                    <label key={opt.score} className={`cursor-pointer text-xs px-2 py-1 rounded border ${newIncidentImprovement === opt.score ? 'bg-green-100 border-green-300 text-green-900 font-bold' : 'bg-gray-50 border-gray-200'}`}>
                                        <input type="radio" className="hidden" name="improvement" checked={newIncidentImprovement === opt.score} onChange={() => setNewIncidentImprovement(opt.score)} />
                                        {opt.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setIsAddingIncident(false)} className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50">キャンセル</button>
                            <button onClick={addIncident} className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 font-bold shadow-sm">追加する (合計: {Math.min(0, newIncidentDeduction + newIncidentImprovement)}点)</button>
                        </div>
                    </div>
                </div>
            )}


            {/* MEMO FIELD */}
            {(isMemoOpen || (item.memos && item.memos.length > 0) || item.memo) && (
                <div className="mt-3">
                    <textarea
                        value={item.memo || ''}
                        onChange={(e) => onUpdateMemo(item.no, e.target.value)}
                        placeholder="フィードバックやメモを入力..."
                        className="w-full text-xs p-2 bg-yellow-50 border border-yellow-200 rounded focus:ring-1 focus:ring-yellow-400 outline-none text-gray-700"
                        rows={2}
                        readOnly={readOnly}
                    />
                </div>
            )}
        </div>
    );
};

export default EvaluationCard;

// Simple Check Icon for Incident removed for now as X used from lucide
// Need to add X import
