import { EvaluationItem, PerformanceData } from '../../types';

interface ScoreDashboardProps {
    items: EvaluationItem[];
    performanceScore: number;
    performanceData: PerformanceData;
    isManagerUnlocked: boolean;
}

export const ScoreDashboard: React.FC<ScoreDashboardProps> = ({
    items,
    performanceScore,
    isManagerUnlocked
}) => {
    const getScore = (i: EvaluationItem) => i.score ?? 0;

    // Calculate category scores
    const relationshipScore = items.filter(i => i.category === '関係性').reduce((sum, i) => sum + getScore(i), 0);
    const customerServiceScore = items.filter(i => i.category === '接客').reduce((sum, i) => sum + getScore(i), 0);
    const technicalScore = items.filter(i => i.category === '技術').reduce((sum, i) => sum + getScore(i), 0);

    // Total score calculation (stylist only)
    const totalScore200 = relationshipScore + customerServiceScore + technicalScore + performanceScore;

    const managerItems = items.filter(i => i.category === '店長');
    const managerTotal = managerItems.reduce((sum, i) => sum + getScore(i), 0);

    // Group manager scores for display
    const mgrOps = managerItems.filter(i => i.subCategory === '運営管理スキル').reduce((sum, i) => sum + getScore(i), 0);
    const mgrCust = managerItems.filter(i => i.subCategory === '顧客サービススキル').reduce((sum, i) => sum + getScore(i), 0);
    const mgrTeam = managerItems.filter(i => i.subCategory === 'チームマネジメントスキル').reduce((sum, i) => sum + getScore(i), 0);
    const mgrStrat = managerItems.filter(i => i.subCategory === '戦略思考スキル').reduce((sum, i) => sum + getScore(i), 0);
    const mgrProb = managerItems.filter(i => i.subCategory === '問題解決スキル').reduce((sum, i) => sum + getScore(i), 0);
    const mgrPersonal = managerItems.filter(i => i.subCategory === '個人の属性').reduce((sum, i) => sum + getScore(i), 0);
    const mgrComp = managerItems.filter(i => i.subCategory === '管理責任・コンプライアンス').reduce((sum, i) => sum + getScore(i), 0);

    const mgrCol1 = mgrOps + mgrCust; // 運営・顧客
    const mgrCol2 = mgrTeam + mgrStrat; // チーム・戦略
    const mgrCol3 = mgrProb; // 問題解決
    const mgrCol4 = mgrPersonal + mgrComp; // その他(行動・コンプラ)

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 font-sans text-gray-800 print:hidden">
            {/* --- SCREEN ONLY DASHBOARD --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">

                {/* スタッフ評価 */}
                <div className="mb-2">
                    <h3 className="text-sm font-bold text-gray-500 mb-2 pl-1">スタッフ評価</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-0 border border-gray-300 rounded overflow-hidden">
                        {/* 関係性 */}
                        <div className="flex flex-col items-center justify-center p-3 border-b md:border-b-0 border-r border-gray-300 bg-gray-50">
                            <span className="font-bold text-gray-500 text-xs mb-1">関係性<br />(51点)</span>
                            <span className="font-bold text-2xl text-gray-800">{relationshipScore}</span>
                        </div>
                        {/* 接客 */}
                        <div className="flex flex-col items-center justify-center p-3 border-b md:border-b-0 border-r border-gray-300 bg-gray-50">
                            <span className="font-bold text-gray-500 text-xs mb-1">接客<br />(49点)</span>
                            <span className="font-bold text-2xl text-gray-800">{customerServiceScore}</span>
                        </div>
                        {/* 技術 */}
                        <div className="flex flex-col items-center justify-center p-3 border-b md:border-b-0 border-r border-gray-300 bg-gray-50">
                            <span className="font-bold text-gray-500 text-xs mb-1">技術(日常)<br />(50点)</span>
                            <span className="font-bold text-2xl text-gray-800">{technicalScore}</span>
                        </div>
                        {/* カット人数 */}
                        <div className="flex flex-col items-center justify-center p-3 border-b md:border-b-0 border-r border-gray-300 bg-gray-50">
                            <span className="font-bold text-gray-500 text-xs mb-1">カット人数<br />(50点)</span>
                            <span className="font-bold text-2xl text-gray-800">{performanceScore}</span>
                        </div>
                        {/* 合計 */}
                        <div className="flex flex-col items-center justify-center p-3 bg-[#F0F5FA] md:col-span-1 col-span-2">
                            <span className="font-bold text-blue-800 text-xs mb-1">評価合計<br />(200点)</span>
                            <span className="font-bold text-3xl text-[#002C5F]">{totalScore200}</span>
                        </div>
                    </div>
                </div>

                {/* 店長評価 */}
                {isManagerUnlocked && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 mb-2 pl-1">店長評価</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-0 border border-gray-300 rounded overflow-hidden">
                            {/* 運営・顧客 */}
                            <div className="flex flex-col items-center justify-center p-3 border-b md:border-b-0 border-r border-gray-300 bg-gray-50">
                                <span className="font-bold text-gray-500 text-xs mb-1 text-center">運営・顧客<br />(32点)</span>
                                <span className="font-bold text-2xl text-gray-800">{mgrCol1}</span>
                            </div>
                            {/* チーム・戦略 */}
                            <div className="flex flex-col items-center justify-center p-3 border-b md:border-b-0 border-r border-gray-300 bg-gray-50">
                                <span className="font-bold text-gray-500 text-xs mb-1 text-center">チーム・戦略<br />(28点)</span>
                                <span className="font-bold text-2xl text-gray-800">{mgrCol2}</span>
                            </div>
                            {/* 問題解決 */}
                            <div className="flex flex-col items-center justify-center p-3 border-b md:border-b-0 border-r border-gray-300 bg-gray-50">
                                <span className="font-bold text-gray-500 text-xs mb-1 text-center">問題解決<br />(24点)</span>
                                <span className="font-bold text-2xl text-gray-800">{mgrCol3}</span>
                            </div>
                            {/* 行動・他 */}
                            <div className="flex flex-col items-center justify-center p-3 border-b md:border-b-0 border-r border-gray-300 bg-gray-50">
                                <span className="font-bold text-gray-500 text-xs mb-1 text-center">行動・他<br />(56点)</span>
                                <span className="font-bold text-2xl text-gray-800">{mgrCol4}</span>
                            </div>
                            {/* 店長合計 */}
                            <div className="flex flex-col items-center justify-center p-3 bg-[#F0F5FA] md:col-span-1 col-span-2">
                                <span className="font-bold text-blue-800 text-xs mb-1 text-center">店長合計<br />(140点)</span>
                                <span className="font-bold text-3xl text-[#002C5F]">{managerTotal}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
