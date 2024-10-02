import { useState } from "react";

import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";

interface TextInputModalProps {
  error: string | null;
  enabled: boolean;
  dialogTitle: string;
  onDismiss: () => void;
  dismissButtonTitle: string;
  onSubmit: (value: string) => void;
  submitButtonTitle: string;
  placeholder: string;
}

export const TextInputModal: React.FC<TextInputModalProps> = ({
  error,
  enabled,
  dialogTitle,
  onDismiss,
  dismissButtonTitle,
  onSubmit,
  submitButtonTitle,
  placeholder,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = () => {
    onSubmit(inputValue);
    setInputValue(""); // Clear input on submit
  };

  return (
    <Dialog open={enabled} onOpenChange={onDismiss}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div>
          <Input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder={placeholder}
          />
          {/* Display error if exists */}
          {error && <p className="mt-1 text-destructive">{error}</p>}{" "}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onDismiss}>
            {dismissButtonTitle}
          </Button>
          <Button onClick={handleSubmit}>{submitButtonTitle}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
