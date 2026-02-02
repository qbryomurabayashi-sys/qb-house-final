import * as React from "react"
// import { X } from 'lucide-react'
import { cn } from "@/lib/utils"

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 my-8">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h3 className="text-xl font-bold tracking-tight text-slate-900">{title}</h3>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100 transition-colors font-bold">
                        [X]
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};
