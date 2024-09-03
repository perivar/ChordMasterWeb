import React, { createContext, useCallback, useContext, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

// Type definition for dialog options
interface DialogOptions {
  title: string;
  description: string;
  alert?: boolean; // if alert is true, this is a simple alert dialog
  cancelLabel?: string; // Label for the cancel button
  confirmLabel?: string; // Label for the confirm button
  closeLabel?: string; // Label for the close button
}

// Default options for the dialog
const DEFAULT_OPTIONS: DialogOptions = {
  title: "",
  description: "",
  alert: false,
  cancelLabel: "Cancel", // Default cancel button label
  confirmLabel: "Continue", // Default confirm button label
  closeLabel: "Close", // Default close button label
};

// Type definition for Confirm context
interface ConfirmContextProps {
  confirm: (options: DialogOptions) => Promise<void>;
}

// Create Confirm context
const ConfirmContext = createContext<ConfirmContextProps | undefined>(
  undefined
);

export const ConfirmProvider = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  // State to manage dialog options
  const [options, setOptions] = useState<DialogOptions>({ ...DEFAULT_OPTIONS });

  // State to manage resolve and reject for dialog
  const [resolveReject, setResolveReject] = useState<
    [() => void, () => void] | []
  >([]);

  const [resolve, reject] = resolveReject;

  // Confirm function: Shows the dialog and returns a Promise
  const confirm = useCallback((options: DialogOptions): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      setOptions({ ...DEFAULT_OPTIONS, ...options });
      setResolveReject([resolve, reject]);
    });
  }, []);

  // Handler to close the dialog
  const handleClose = useCallback(() => {
    setResolveReject([]);
  }, []);

  // Handler for the cancel button
  const handleCancel = useCallback(() => {
    if (reject) reject();
    handleClose();
  }, [reject, handleClose]);

  // Handler for the confirm button
  const handleConfirm = useCallback(() => {
    if (resolve) resolve();
    handleClose();
  }, [resolve, handleClose]);

  return (
    <>
      {/* Render the dialog */}
      <AlertDialog open={resolveReject.length === 2}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{options.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {options.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {options.alert ? options.closeLabel : options.cancelLabel}
            </AlertDialogCancel>
            {!options.alert && (
              <AlertDialogAction onClick={handleConfirm}>
                {options.confirmLabel}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Provide the Confirm context */}
      <ConfirmContext.Provider value={{ confirm }}>
        {children}
      </ConfirmContext.Provider>
    </>
  );
};

// useConfirm hook: A hook to use Confirm context
export const useConfirm = (): ((options: DialogOptions) => Promise<void>) => {
  const context = useContext(ConfirmContext);

  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }

  return context.confirm;
};

export default ConfirmProvider;
