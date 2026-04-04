import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { SendHorizonal, Paperclip, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";
import { useI18n } from "../../lib/i18n";
import { AuthModal } from "../chat/AuthModal";
import { ChatLimitIndicator } from "../chat/ChatLimitIndicator";
import { FilePreviewChip } from "../chat/FilePreviewChip";
import { useFileUpload } from "../../hooks/useFileUpload";
import type { ChatLimitInfo, FileAttachment } from "../../hooks/useChat";

const FONT = "'Inter', sans-serif";

export interface MobileChatInputProps {
  onSend: (message: string, attachment?: FileAttachment) => void;
  disabled?: boolean;
  placeholder?: string;
  limitInfo: ChatLimitInfo;
  onClear?: () => void;
  onFileUploaded?: (publicId: string) => void;
}

export function MobileChatInput({
  onSend,
  disabled = false,
  placeholder,
  limitInfo,
  onClear,
  onFileUploaded,
}: MobileChatInputProps) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useI18n();

  const authRequest = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  const {
    requiresAuth,
    uploadedFile,
    isUploading,
    uploadError,
    openFilePicker,
    clear: clearFile,
    handleFileChange,
    fileInputRef,
  } = useFileUpload(authRequest);

  const resolvedPlaceholder = placeholder ?? t.chat.inputPlaceholderMobile;
  const isDisabledByLimit = limitInfo.isLimitReached;

  const handleAttachFile = useCallback(() => {
    if (requiresAuth) {
      setShowAuthModal(true);
      return;
    }
    openFilePicker();
  }, [openFilePicker, requiresAuth]);

  const handleSend = () => {
    if (!value.trim() || disabled || isDisabledByLimit) return;
    onSend(value, uploadedFile || undefined);
    setValue("");
    clearFile();
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  const wrappedFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleFileChange(e);
  };

  const prevUploadedRef = useRef<string | null>(null);
  if (
    uploadedFile &&
    uploadedFile.publicId !== prevUploadedRef.current &&
    onFileUploaded
  ) {
    prevUploadedRef.current = uploadedFile.publicId;
    onFileUploaded(uploadedFile.publicId);
  }

  if (isDisabledByLimit) {
    return (
      <div
        className="shrink-0"
        style={{
          marginBottom: "calc(var(--spacing-md) + env(safe-area-inset-bottom))",
        }}
      >
        <ChatLimitIndicator limitInfo={limitInfo} onClear={onClear} compact />
      </div>
    );
  }

  const showFilePreview = !!uploadedFile || isUploading || !!uploadError;
  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div
      className="shrink-0"
      style={{
        marginBottom: "calc(var(--spacing-md) + env(safe-area-inset-bottom))",
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={wrappedFileChange}
      />

      <ChatLimitIndicator limitInfo={limitInfo} compact />

      <div
        style={{
          paddingLeft: "var(--spacing-md)",
          paddingRight: "var(--spacing-md)",
          paddingBottom: "var(--spacing-md)",
          paddingTop: limitInfo.used > 0 ? "0" : "var(--spacing-sm)",
        }}
      >
        <div
          className={cn("flex flex-col", "transition-all duration-200")}
          style={{
            borderRadius: "18px",
            padding: "var(--spacing-xs) var(--spacing-sm)",
            background: "var(--background)",
            boxShadow: isFocused
              ? "0 0 0 3px color-mix(in srgb, var(--secondary) 8%, transparent), 0 8px 18px rgba(15,23,42,0.06)"
              : "0 10px 20px rgba(15,23,42,0.05)",
          }}
        >
          <AnimatePresence>
            {showFilePreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{ paddingBottom: "var(--spacing-xs)" }}
              >
                <FilePreviewChip
                  file={uploadedFile}
                  isUploading={isUploading}
                  error={uploadError}
                  onRemove={clearFile}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end" style={{ gap: "var(--spacing-xs)" }}>
            <Button
              type="button"
              variant="ghost"
              size="touch"
              className="shrink-0 rounded-full text-muted-foreground hover:text-secondary"
              aria-label={t.chat.attachFile}
              onClick={handleAttachFile}
              disabled={isUploading || (!!uploadedFile && !requiresAuth)}
            >
              {isUploading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Paperclip className="size-5" />
              )}
            </Button>

            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={resolvedPlaceholder}
              disabled={disabled}
              rows={1}
              className={cn(
                "flex-1 bg-transparent border-none outline-none resize-none",
                "min-h-[var(--touch-target-min)] max-h-[120px]",
                "placeholder:text-muted-foreground/50",
                "disabled:opacity-50",
              )}
              style={{
                fontFamily: FONT,
                fontSize: "var(--font-size-body)",
                fontWeight: "var(--font-weight-normal)" as unknown as number,
                lineHeight: 1.5,
                paddingTop: "var(--spacing-xs)",
                paddingBottom: "var(--spacing-xs)",
              }}
            />

            <motion.div
              animate={canSend ? { scale: [0.95, 1] } : { scale: 1 }}
              transition={{ duration: 0.15 }}
              className="shrink-0"
            >
              <Button
                type="button"
                size="touch"
                onClick={handleSend}
                disabled={disabled || !value.trim()}
                className={cn(
                  "shrink-0 rounded-full",
                  "text-primary-foreground",
                  "disabled:opacity-20",
                  "transition-all duration-200",
                )}
                style={{
                  background: canSend ? "var(--primary)" : "color-mix(in srgb, var(--primary) 82%, var(--background))",
                  boxShadow: canSend
                    ? "0 6px 16px color-mix(in srgb, var(--primary) 22%, transparent)"
                    : "none",
                }}
                aria-label={t.chat.sendMessage}
              >
                <SendHorizonal className="size-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        initialMode="register"
        feature="chat-file-upload"
      />
    </div>
  );
}
