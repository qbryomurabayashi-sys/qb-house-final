
import React from 'react';

const CriteriaGuide: React.FC = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-xs text-blue-900 print:hidden">
        <h3 className="font-bold mb-1">評価基準ガイド (0-3点)</h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li><span className="font-bold bg-blue-200 px-1 rounded">3点 (優秀)</span>: 常に期待以上の行動・成果。他の模範。</li>
            <li><span className="font-bold bg-blue-200 px-1 rounded">2点 (良好)</span>: 通常業務で期待される水準を満たしている。</li>
            <li><span className="font-bold bg-blue-200 px-1 rounded">1点 (改善)</span>: 期待される水準に達していない場合がある。</li>
            <li><span className="font-bold bg-blue-200 px-1 rounded">0点 (不足)</span>: 頻繁に問題がある、または全くできていない。</li>
        </ul>
        <p className="mt-2 text-[10px] text-blue-700">* マイナス評価項目は、問題の程度に応じて減点されます。</p>
    </div>
);

export default CriteriaGuide;
