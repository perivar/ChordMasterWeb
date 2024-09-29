import React from "react";
import { X } from "lucide-react";

import { cn } from "~/lib/utils";

import { Button } from "./ui/button";

interface MyDrawerProps {
  open: boolean;
  onOpenChange: () => void;
  children: React.ReactNode;
  className?: string | undefined;
}

// This is a non-locking drawer
// meaning the background can still be scrolled while the drawer is open
const MyDrawer: React.FC<MyDrawerProps> = ({
  open,
  onOpenChange,
  children,
  className,
}) => {
  if (!open) return null;

  return (
    <>
      {/* Backdrop (optional, non-blocking scroll) */}
      <div
        className="fixed inset-0 z-50 bg-black/25 transition-opacity duration-300"
        onClick={onOpenChange}
        role="none"
      />

      {/* Custom Drawer */}
      <div
        className={cn(
          "fixed inset-x-0 z-50 bottom-0 w-full translate-y-0 rounded-t-xl border-t bg-background shadow-lg transition-transform duration-300 ease-in-out",
          className
        )}
        role="tab"
        tabIndex={-1}
        onKeyDown={
          /* Close on Esc */
          (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key === "Escape") {
              onOpenChange();
            }
          }
        }>
        <div className="flex h-full flex-col font-sans">
          <div className="grow overflow-y-auto">
            <div className="flex flex-col items-end border-b">
              <Button variant="ghost" size="icon" onClick={onOpenChange}>
                <X className="size-6" />
              </Button>
            </div>
          </div>
          {/* Content */}
          {children}
        </div>
      </div>
    </>
  );
};

export { MyDrawer };
