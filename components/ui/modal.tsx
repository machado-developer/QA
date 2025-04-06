import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";

const modalVariants = cva(
  "fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm", // Fundo mais transparente e desfoque sutil
  {
    variants: {
      variant: {
        default: "text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Modal = ({
  isOpen,
  onClose,
  children,
  className,
  variant,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: VariantProps<typeof modalVariants>["variant"];
}) => {
  if (!isOpen) return null;

  return (
    <div className={cn(modalVariants({ variant }))}>
      <div className="relative w-full max-w-md rounded-lg bg-white/90 dark:bg-gray-900/90 p-6 shadow-xl">
        <button
          className="absolute right-4 top-4 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
};

const ModalTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
));
ModalTitle.displayName = "ModalTitle";

const ModalDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-gray-600 dark:text-gray-300", className)} {...props} />
));
ModalDescription.displayName = "ModalDescription";

export { Modal, ModalDescription, ModalTitle };

