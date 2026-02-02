import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Dialog } from "@/components/ui/Dialog";

// Types
export const MEETING_TYPES = [
    "評価面談や個人キャリアプランについて", "店舗環境での改善について", "接客態度スキルについて",
    "仕事のモチベーションとやりがいについて", "業務進捗や目標設定や達成度", "技術力と研修の必要性について",
    "ワークバランスとストレス管理について", "チーム内コミュニケーションと協力について", "その他"
];

export const STATUSES = [
    { value: 'Completed', label: '完了', color: 'success' },
    { value: 'FollowUpRequired', label: '上長フォロー必要', color: 'destructive' },
    { value: 'NextActionRequired', label: '次回対応必要', color: 'warning' }
];

export const formSchema = z.object({
    id: z.string().optional(),
    importance: z.enum(['High', 'Middle', 'Low']),
    date: z.string().min(1, "必須"),
    storeName: z.string().min(1, "必須"),
    employeeName: z.string().min(1, "必須"),
    employeeId: z.string().min(1, "必須"),
    interviewer: z.string().min(1, "必須"),
    type: z.string().min(1, "必須"),
    status: z.enum(['Completed', 'FollowUpRequired', 'NextActionRequired']),
    details: z.object({
        mainContent: z.string().min(1, "必須"),
        concerns: z.string().optional(),
        nextAction: z.string().optional(),
        impression: z.string().optional(),
    }),
});

export type MeetingRecord = z.infer<typeof formSchema>;

interface MeetingFormProps {
    initialData: MeetingRecord | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: MeetingRecord) => void;
}

export const MeetingForm: React.FC<MeetingFormProps> = ({ initialData, isOpen, onClose, onSave }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<MeetingRecord>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            importance: 'Middle', date: new Date().toISOString().split('T')[0],
            storeName: '', employeeName: '', employeeId: '', interviewer: '',
            type: MEETING_TYPES[0], status: 'Completed',
            details: { mainContent: '', concerns: '', nextAction: '', impression: '' }
        }
    });

    useEffect(() => {
        if (isOpen) {
            reset(initialData || {
                importance: 'Middle', date: new Date().toISOString().split('T')[0],
                storeName: '', employeeName: '', employeeId: '', interviewer: '',
                type: MEETING_TYPES[0], status: 'Completed',
                details: { mainContent: '', concerns: '', nextAction: '', impression: '' }
            });
        }
    }, [isOpen, initialData, reset]);

    const onSubmit = (data: MeetingRecord) => {
        onSave({ ...data, id: initialData?.id || crypto.randomUUID() });
        onClose();
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title={initialData ? "報告書を編集" : "新規報告書作成"}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>重要度</Label>
                        <Select {...register('importance')}>
                            <option value="High">High (高)</option>
                            <option value="Middle">Middle (中)</option>
                            <option value="Low">Low (低)</option>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>ステータス</Label>
                        <Select {...register('status')}>
                            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </Select>
                    </div>
                </div>
                {/* Dates & Names */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2"><Label>日付</Label><Input type="date" {...register('date')} /></div>
                    <div className="space-y-2"><Label>対応者</Label><Input {...register('interviewer')} placeholder="例: 菊川" /></div>
                    <div className="space-y-2"><Label>店舗名</Label><Input {...register('storeName')} placeholder="店舗名" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>氏名</Label><Input {...register('employeeName')} placeholder="スタッフ氏名" /></div>
                    <div className="space-y-2"><Label>社員番号</Label><Input {...register('employeeId')} placeholder="EMP000" /></div>
                </div>
                <div className="space-y-2">
                    <Label>面談種類</Label>
                    <Select {...register('type')}>
                        {MEETING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </Select>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-4">
                    <div className="space-y-2">
                        <Label>主な内容 <span className="text-red-500">*</span></Label>
                        <Textarea {...register('details.mainContent')} placeholder="面談内容の詳細" />
                        {errors.details?.mainContent && <span className="text-red-500 text-xs">必須項目です</span>}
                    </div>
                    <div className="space-y-2"><Label>懸念事項</Label><Textarea {...register('details.concerns')} placeholder="懸念点があれば" /></div>
                    <div className="space-y-2"><Label>次回アクション</Label><Textarea {...register('details.nextAction')} placeholder="次回の目標など" /></div>
                    <div className="space-y-2"><Label>所感</Label><Textarea {...register('details.impression')} placeholder="所感など" /></div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>キャンセル</Button>
                    <Button type="submit">保存する</Button>
                </div>
            </form>
        </Dialog>
    );
};
