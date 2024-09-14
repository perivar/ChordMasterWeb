import { useCallback, useState } from "react";

import { useToast } from "~/components/ui/use-toast";

interface ToastProps {
  title: string;
  description: string;
  autoCloseDelay?: number; // in milliseconds
  [key: string]: unknown; // Allow other props like variant, etc.
}

export function useAutoCloseToast() {
  const { toast, dismiss } = useToast();
  const [toastId, setToastId] = useState<string | undefined>();

  const autoCloseToast = useCallback(
    ({ title, description, autoCloseDelay = 10000, ...rest }: ToastProps) => {
      // Dismiss the previous toast if it exists
      if (toastId) {
        dismiss(toastId);
      }

      // Show the new toast
      const toastInstance = toast({
        title,
        description,
        ...rest, // Other props can be passed like variant, etc.
      });

      // Set the new toast ID
      setToastId(toastInstance.id);

      // Automatically close the toast after the specified delay
      setTimeout(() => {
        dismiss(toastInstance.id);
      }, autoCloseDelay);

      // Return the toastInstance for further use
      return toastInstance;
    },
    [toast, dismiss, toastId]
  );

  return { autoCloseToast };
}
