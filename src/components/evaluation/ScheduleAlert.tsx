import { Bell } from 'lucide-react';

interface ScheduleAlertProps {
    date: string;
}

export const ScheduleAlert: React.FC<ScheduleAlertProps> = ({ date }) => {
    const month = new Date(date).getMonth() + 1;
    let alert: { title: string; text: string; type: 'info' | 'warn' } | null = null;

    if (month === 7) alert = { title: "期初", text: "第4四半期評価 / 期末評価", type: "info" };
    else if (month === 10) alert = { title: "第1四半期", text: "第1四半期評価", type: "info" };
    else if (month === 1) alert = { title: "第2四半期", text: "第2四半期評価", type: "info" };
    else if (month === 4) alert = { title: "第3四半期", text: "第3四半期評価", type: "info" };
    else if (month === 6) alert = { title: "期末", text: "次期目標設定", type: "warn" };

    if (!alert) return null;

    const bgClass = alert.type === 'warn' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-[#F0F5FA] border-[#BFD8F2] text-[#002C5F]';
    const iconClass = alert.type === 'warn' ? 'text-amber-600' : 'text-[#002C5F]';

    return (
        <div className={`mx-3 sm:mx-5 mt-4 p-3 rounded-lg border flex items-start gap-3 shadow-sm ${bgClass} print:hidden`}>
            <Bell className={`shrink-0 mt-0.5 ${iconClass}`} size={20} />
            <div>
                <div className="font-bold flex items-center gap-2">
                    <span>{month}月: {alert.title}</span>
                </div>
                <div className="text-sm font-bold mt-1">
                    {alert.text} <span className="font-normal">の時期です。面談を実施してください。</span>
                </div>
            </div>
        </div>
    );
};
