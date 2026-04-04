import { X, FileText, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "../ui/button";
import { useI18n } from "../../lib/i18n";
import type { FileAttachment } from "../../hooks/useChat";

interface FilePreviewChipProps {
  file?: FileAttachment | null;
  isUploading?: boolean;
  error?: string | null;
  onRemove: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilePreviewChip({
  file,
  isUploading,
  error,
  onRemove,
}: FilePreviewChipProps) {
  const { t } = useI18n();

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        className="flex items-center gap-[var(--spacing-xs)] bg-destructive/10 border border-destructive/20 rounded-[var(--radius)]"
        style={{
          paddingLeft: "var(--spacing-sm)",
          paddingRight: "var(--spacing-xs)",
          paddingTop: "var(--spacing-xs)",
          paddingBottom: "var(--spacing-xs)",
        }}
      >
        <FileText className="size-4 text-destructive shrink-0" />
        <span
          className="text-destructive flex-1 min-w-0"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "var(--font-size-caption)",
            fontWeight: "var(--font-weight-medium)" as unknown as number,
          }}
        >
          {error === "fileTooLarge"
            ? t.fileUpload.fileTooLarge
            : error === "invalidType"
              ? t.fileUpload.invalidType
              : t.fileUpload.uploadFailed}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="file-preview-remove-button size-6 shrink-0 rounded-full"
          onClick={onRemove}
          aria-label={t.fileUpload.remove}
        >
          <X className="size-3" />
        </Button>
      </motion.div>
    );
  }

  if (isUploading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-[var(--spacing-xs)] bg-muted border border-border/50 rounded-[var(--radius)]"
        style={{
          paddingLeft: "var(--spacing-sm)",
          paddingRight: "var(--spacing-sm)",
          paddingTop: "var(--spacing-xs)",
          paddingBottom: "var(--spacing-xs)",
        }}
      >
        <Loader2 className="size-4 text-secondary shrink-0 animate-spin" />
        <span
          className="text-muted-foreground"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "var(--font-size-caption)",
            fontWeight: "var(--font-weight-medium)" as unknown as number,
          }}
        >
          {t.fileUpload.uploading}
        </span>
      </motion.div>
    );
  }

  if (!file) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      className="flex items-center gap-[var(--spacing-xs)] bg-secondary/10 border border-secondary/20 rounded-[var(--radius)]"
      style={{
        paddingLeft: "var(--spacing-sm)",
        paddingRight: "var(--spacing-xs)",
        paddingTop: "var(--spacing-xs)",
        paddingBottom: "var(--spacing-xs)",
      }}
    >
      <FileText className="size-4 text-secondary shrink-0" />
      <div className="flex-1 min-w-0">
        <span
          className="text-foreground block truncate"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "var(--font-size-caption)",
            fontWeight: "var(--font-weight-medium)" as unknown as number,
          }}
        >
          {file.name}
        </span>
        <span
          className="text-muted-foreground"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "10px",
            fontWeight: "var(--font-weight-normal)" as unknown as number,
          }}
        >
          {formatFileSize(file.size)}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="file-preview-remove-button size-6 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
        onClick={onRemove}
        aria-label={t.fileUpload.remove}
      >
        <X className="size-3" />
      </Button>
    </motion.div>
  );
}
