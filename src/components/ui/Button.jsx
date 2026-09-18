import * as React from "react"
import { cn } from "../../lib/utils"
import { Loader2 } from "lucide-react"

const Button = React.forwardRef(({ className, variant = "primary", size = "default", isLoading, children, ...props }, ref) => {
    const variants = {
        primary: "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-xs focus:ring-primary-500",
        secondary: "bg-secondary-100 text-secondary-900 hover:bg-secondary-200 focus:ring-secondary-500 dark:bg-secondary-800 dark:text-secondary-100 dark:hover:bg-secondary-700",
        outline: "border border-secondary-300 bg-white hover:bg-secondary-50 text-secondary-700 focus:ring-primary-500 dark:border-secondary-700 dark:bg-secondary-900 dark:text-secondary-200 dark:hover:bg-secondary-800 shadow-xs",
        ghost: "bg-transparent hover:bg-secondary-100 text-secondary-700 focus:ring-secondary-500 dark:text-secondary-300 dark:hover:bg-secondary-800 dark:hover:text-white",
        danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-xs focus:ring-red-500",
        success: "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-xs focus:ring-emerald-500",
    }

    const sizes = {
        xs: "h-7 px-2.5 text-[11px] font-semibold gap-1",
        sm: "h-8.5 px-3 text-xs font-semibold gap-1.5",
        default: "h-10 px-4 py-2 text-xs sm:text-sm font-medium gap-2",
        lg: "h-11 px-6 text-sm sm:text-base font-semibold gap-2.5",
        icon: "h-9 w-9 p-0 flex items-center justify-center shrink-0",
        "icon-sm": "h-8 w-8 p-0 flex items-center justify-center shrink-0",
    }

    return (
        <button
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
            {children}
        </button>
    )
})
Button.displayName = "Button"

export { Button }
