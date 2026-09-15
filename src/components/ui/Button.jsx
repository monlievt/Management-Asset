import * as React from "react"
import { cn } from "../../lib/utils"
import { Loader2 } from "lucide-react"

const Button = React.forwardRef(({ className, variant = "primary", size = "default", isLoading, children, ...props }, ref) => {
    const variants = {
        primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
        secondary: "bg-secondary-100 text-secondary-900 hover:bg-secondary-200 focus:ring-secondary-500 dark:bg-secondary-800 dark:text-secondary-100 dark:hover:bg-secondary-700",
        outline: "border border-secondary-300 bg-transparent hover:bg-secondary-50 text-secondary-700 focus:ring-secondary-500 dark:border-secondary-700 dark:text-secondary-200 dark:hover:bg-secondary-800",
        ghost: "bg-transparent hover:bg-secondary-100 text-secondary-700 focus:ring-secondary-500 dark:text-secondary-300 dark:hover:bg-secondary-800 dark:hover:text-white",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    }

    const sizes = {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-8 text-lg",
        icon: "h-10 w-10 p-0 flex items-center justify-center",
    }

    return (
        <button
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    )
})
Button.displayName = "Button"

export { Button }
