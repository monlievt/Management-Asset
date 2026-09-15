import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./Button"

const Modal = ({ isOpen, onClose, title, children, className }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in zoom-in-95">
            <div
                className={cn(
                    "relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl sm:p-8 dark:bg-secondary-900 dark:border dark:border-secondary-800 dark:text-white",
                    className
                )}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold leading-none tracking-tight text-secondary-900 dark:text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none text-secondary-500 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white"
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Tutup</span>
                    </button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    )
}

export { Modal }
