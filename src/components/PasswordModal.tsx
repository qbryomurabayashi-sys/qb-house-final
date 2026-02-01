
import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';

interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUnlock: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, onUnlock }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === '0712') { // Hardcoded password from original
            onUnlock();
            onClose();
            setPassword('');
            setError('');
        } else {
            setError('パスワードが違います');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 print:hidden">
            <div className="bg-white rounded-lg p-6 w-80 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                    <X size={20} />
                </button>
                <div className="text-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-full inline-block mb-2">
                        <Lock className="text-blue-600" size={24} />
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">店長評価ロック解除</h3>
                    <p className="text-xs text-gray-500">パスワードを入力してください</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-lg p-2 text-center text-lg mb-2 focus:border-blue-500 outline-none"
                        placeholder="****"
                        autoFocus
                    />
                    {error && <p className="text-red-500 text-xs text-center mb-2">{error}</p>}
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        解除
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PasswordModal;
