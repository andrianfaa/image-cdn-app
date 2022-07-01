/* eslint-disable react/require-default-props */
import type { ReactNode } from "react";
import { Notyf } from "notyf";

interface DropUploaderProps {
  onDrop: (files: File[]) => void;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
  onDragOver?: () => void;
  children?: ReactNode;
  className?: string;
}

const allowedFileTypes = ["image/jpeg", "image/png", "image/webp"];

export default function DropUploader({
  onDrop,
  onDragEnter,
  onDragLeave,
  onDragOver,
  className,
  children,
}: DropUploaderProps) {
  const notyf = new Notyf({
    position: {
      x: "center",
      y: "top",
    },
  });

  const handleOnDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const isAllowed = allowedFileTypes.some((type) => {
      const file = e.dataTransfer.files[0];
      return file.type === type;
    });

    if (isAllowed) {
      // Get the files from the event
      const files = Array.from(e.dataTransfer.files);
      return onDrop(files);
    }

    return notyf.error("Only images are allowed");
  };

  const handleOnDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (onDragEnter) {
      onDragEnter();
    }
  };

  const handleOnDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (onDragLeave) {
      onDragLeave();
    }
  };

  const handleOnDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (onDragOver) {
      onDragOver();
    }
  };

  return (
    <div
      className={className || ""}
      onDrop={handleOnDrop}
      onDragEnter={handleOnDragEnter}
      onDragLeave={handleOnDragLeave}
      onDragOver={handleOnDragOver}
    >
      {children}
    </div>
  );
}
