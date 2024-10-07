import { useState } from "react";

import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface JsonUploadDialogProps {
  dialogTitle: string;
  dialogDescription: string;
  openButtonLabel: string;
  closeButtonLabel: string;
  handleFileContent: (parsedJson: string) => void; // Method to handle the parsed JSON
}

export default function FileUploadDialog({
  dialogTitle,
  dialogDescription,
  openButtonLabel,
  closeButtonLabel,
  handleFileContent,
}: JsonUploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = e => {
      try {
        const content = e.target?.result as string;
        const parsedJson = JSON.parse(content); // Parse JSON
        handleFileContent(parsedJson); // Call the method with parsed JSON
        setError(""); // Clear any previous errors
        setIsOpen(false);
      } catch (err) {
        console.error("Failed to parse JSON:", err);
        setError("Invalid JSON file. Please upload a valid file.");
      }
    };

    reader.readAsText(file); // Read file content as text
  };

  return (
    <>
      {/* Trigger to open the dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="ml-4">
            {openButtonLabel}
          </Button>
        </DialogTrigger>

        {/* Dialog Content */}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>

          {/* File input */}
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="mt-4"
          />

          {/* Display error if exists */}
          {error && (
            <p className="mt-1 text-red-600 dark:text-red-400">{error}</p>
          )}

          <Button onClick={() => setIsOpen(false)} className="mt-4">
            {closeButtonLabel}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
