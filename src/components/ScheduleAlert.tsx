
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ScheduleAlertProps {
    date: string;
}

const ScheduleAlert: React.FC<ScheduleAlertProps> = ({ date }) => {
    const month = new Date(date).getMonth() + 1;
    let message = '';

    // Logic from original code:
    // 11月: 店長評価実施月
    // 5月: 昇格・昇給の査定、店長評価、年間表彰の対象月
    if (month === 11) {
        message = '11月は「店長評価」の実施月です。店長項目の入力をお忘れなく。';
    } else if (month === 5) {
        message = '5月は「昇格・昇給査定」「店長評価」「年間表彰」の対象月です。全項目の漏れがないか確認してください。';
    }

    if (!message) return null;

    return (
        <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-2 text-sm flex items-start gap-2 mb-0 print:hidden">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <p>{message}</p>
        </div>
    );
};

export default ScheduleAlert;
