import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed pointer-events-none z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:left-auto sm:max-w-[420px]",
      className,
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={cn(
      "group relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border border-border bg-background py-3 px-4 pr-8 shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-value)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-value)] data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full sm:data-[state=closed]:slide-out-to-bottom-full sm:data-[state=open]:slide-in-from-bottom-full",
      className,
    )}
    {...props}
  />
))
Toast.displayName = ToastPrimitives.Root.displayName

// ToastTrigger is not available in @radix-ui/react-toast
// const ToastTrigger = ToastPrimitives.Trigger

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md opacity-0 focus:shadow-none group-hover:opacity-100 transition-opacity hover:bg-secondary focus:bg-secondary focus:ring-0",
      className,
    )}
    aria-label="Close"
    {...props}
  />
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn(
      "text-sm font-semibold [&[data-state=open]]:animate-in [&[data-state=closed]]:animate-out [&[data-state=closed]]:fade-out-80 [&[data-state=open]]:fade-in-80",
      className,
    )}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn(
      "text-sm opacity-70 [&[data-state=open]]:animate-in [&[data-state=closed]]:animate-out [&[data-state=closed]]:fade-out-80 [&[data-state=open]]:fade-in-80",
      className,
    )}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastActionProps = React.ComponentProps<typeof ToastPrimitives.Action>
type ToastActionElement = React.ReactElement<typeof ToastAction>
type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

const ToastAction = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Action>, ToastActionProps>(
  ({ className, ...props }, ref) => (
    <ToastPrimitives.Action
      ref={ref}
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-md bg-transparent px-3 text-sm font-medium transition-colors focus:shadow-none hover:bg-secondary focus:bg-secondary focus:ring-0 [&:disabled]:pointer-events-none [&:disabled]:opacity-50 [&[data-state=open]]:animate-in [&[data-state=closed]]:animate-out [&[data-state=closed]]:fade-out-80 [&[data-state=open]]:fade-in-80",
        className,
      )}
      {...props}
    />
  ),
)
ToastAction.displayName = ToastPrimitives.Action.displayName

export { 
  ToastProvider, 
  ToastViewport, 
  Toast, 
  ToastTitle, 
  ToastDescription, 
  ToastClose, 
  ToastAction,
  type ToastActionElement,
  type ToastProps
}
