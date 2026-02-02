import React, { useState, useEffect } from 'react';
// import { X } from 'lucide-react';

interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUnlock: () => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, onUnlock }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setPassword('');
            setError(false);
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple hardcoded password as in the original code
        if (password === 'ammd') {
            onUnlock();
            onClose();
        } else {
            setError(true);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">店長評価ロック解除</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold">
                        [X]
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(false); }}
                            className={`w-full p-3 border rounded-lg outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                            placeholder="パスワードを入力"
                            autoFocus
                        />
                        {error && <p className="text-red-500 text-sm mt-1">パスワードが間違っています</p>}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#002C5F] hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        解除する
                    </button>
                </form>
            </div>
        </div>
    );
};
