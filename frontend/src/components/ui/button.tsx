import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: [
          "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl",
          "hover:from-blue-700 hover:to-purple-700",
          "focus-visible:ring-blue-500 focus-visible:ring-offset-white",
          "active:from-blue-800 active:to-purple-800"
        ],
        destructive: [
          "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl",
          "hover:from-red-700 hover:to-red-800",
          "focus-visible:ring-red-500 focus-visible:ring-offset-white",
          "active:from-red-800 active:to-red-900"
        ],
        outline: [
          "border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50",
          "hover:border-gray-400 focus-visible:ring-gray-500 focus-visible:ring-offset-white",
          "active:bg-gray-100"
        ],
        secondary: [
          "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 shadow-md hover:shadow-lg",
          "hover:from-gray-200 hover:to-gray-300",
          "focus-visible:ring-gray-500 focus-visible:ring-offset-white",
          "active:from-gray-300 active:to-gray-400"
        ],
        ghost: [
          "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
          "focus-visible:ring-gray-500 focus-visible:ring-offset-white",
          "active:bg-gray-200"
        ],
        link: [
          "text-blue-600 underline-offset-4 hover:underline",
          "focus-visible:ring-blue-500 focus-visible:ring-offset-white",
          "active:text-blue-700"
        ],
        gradient: [
          "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-lg hover:shadow-xl",
          "hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600",
          "focus-visible:ring-purple-500 focus-visible:ring-offset-white",
          "active:from-pink-700 active:via-purple-700 active:to-indigo-700"
        ],
        neon: [
          "bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg hover:shadow-cyan-500/25",
          "hover:from-cyan-500 hover:to-blue-600",
          "focus-visible:ring-cyan-500 focus-visible:ring-offset-white",
          "active:from-cyan-600 active:to-blue-700"
        ],
        glass: [
          "bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg hover:shadow-xl",
          "hover:bg-white/20 focus-visible:ring-white/50 focus-visible:ring-offset-transparent",
          "active:bg-white/30"
        ]
      },
      size: {
        default: "h-11 px-6 py-2 text-base",
        sm: "h-9 px-4 py-1.5 text-sm",
        lg: "h-14 px-8 py-3 text-lg",
        xl: "h-16 px-10 py-4 text-xl",
        icon: "h-10 w-10 p-2"
      },
      shape: {
        default: "rounded-lg",
        pill: "rounded-full",
        square: "rounded-none",
        smooth: "rounded-xl"
      },
      loading: {
        true: "cursor-wait opacity-75"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default"
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shape, loading, loadingText, asChild = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, shape, loading, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {loading && loadingText ? loadingText : children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }