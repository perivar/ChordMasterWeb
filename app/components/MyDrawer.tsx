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
        className="fixed inset-0 bg-black/25 transition-opacity duration-300"
        style={{ zIndex: 999 }}
        onClick={onOpenChange}
        role="none"
      />

      {/* Custom Drawer */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 w-full translate-y-0 rounded-t-xl border-t bg-background shadow-lg transition-transform duration-300 ease-in-out",
          className
        )}
        style={{
          zIndex: 1000,
          // height: "calc(50%)",
          maxHeight: "vh",
        }}
        role="tab"
        tabIndex={-1}
        onKeyDown={
          (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key === "Escape") {
              onOpenChange();
            }
          } /* Close on Esc */
        }>
        <div className="flex h-full flex-col">
          <div className="grow overflow-y-auto">
            <div className="flex items-center justify-between border-b p-4">
              <div>{children}</div>
              <Button variant="ghost" size="icon" onClick={onOpenChange}>
                <X className="size-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const MyDrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
);
MyDrawerHeader.displayName = "DrawerHeader";

const MyDrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
);
MyDrawerFooter.displayName = "DrawerFooter";

export { MyDrawer, MyDrawerHeader, MyDrawerFooter };
