import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { SendHorizonal, Paperclip, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";
import { useI18n } from "../../lib/i18n";
import { AuthModal } from "../chat/AuthModal";
import { useResponsiveDensity } from "../../hooks/useMediaQuery";
import { ChatLimitIndicator } from "../chat/ChatLimitIndicator";
import { FilePreviewChip } from "../chat/FilePreviewChip";
import { useFileUpload } from "../../hooks/useFileUpload";
import type { ChatLimitInfo, FileAttachment } from "../../hooks/useChat";

const FONT = "'Inter', sans-serif";

export interface DesktopChatInputProps {
  onSend: (message: string, attachment?: FileAttachment) => void;
  disabled?: boolean;
  placeholder?: string;
  limitInfo: ChatLimitInfo;
  onClear?: () => void;
  onFileUploaded?: (publicId: string) => void;
}

export function DesktopChatInput({
  onSend,
  disabled = false,
  placeholder,
  limitInfo,
  onClear,
  onFileUploaded,
}: DesktopChatInputProps) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useI18n();
  const density = useResponsiveDensity();
  const contentWidth =
    density === "expanded" ? "1040px" : density === "compact" ? "860px" : "920px";
  const shellPadding =
    density === "compact" ? "var(--spacing-lg)" : "var(--spacing-xl)";

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

  const resolvedPlaceholder = placeholder ?? t.chat.inputPlaceholderDesktop;
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
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
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
    return <ChatLimitIndicator limitInfo={limitInfo} onClear={onClear} />;
  }

  const showFilePreview = !!uploadedFile || isUploading || !!uploadError;
  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div
      className="shrink-0"
      style={{
        paddingLeft: shellPadding,
        paddingRight: shellPadding,
        paddingTop: "var(--spacing-sm)",
        paddingBottom: "var(--spacing-lg)",
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={wrappedFileChange}
      />

      <div className="mx-auto w-full" style={{ maxWidth: contentWidth }}>
        <div
          className={cn("flex flex-col", "transition-all duration-200")}
          style={{
            borderRadius: "20px",
            padding: "var(--spacing-xs) var(--spacing-sm)",
            background: "var(--background)",
            boxShadow: isFocused
              ? "0 0 0 3px color-mix(in srgb, var(--secondary) 8%, transparent), 0 8px 24px rgba(15,23,42,0.06)"
              : "0 12px 28px rgba(15,23,42,0.05)",
          }}
        >
          <AnimatePresence>
            {showFilePreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  paddingLeft: "var(--spacing-xs)",
                  paddingRight: "var(--spacing-xs)",
                  paddingBottom: "var(--spacing-xs)",
                }}
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
              size="icon"
              className="size-9 shrink-0 rounded-full text-muted-foreground hover:text-secondary"
              style={{ marginBottom: "2px" }}
              aria-label={t.chat.attachFile}
              onClick={handleAttachFile}
              disabled={isUploading || (!!uploadedFile && !requiresAuth)}
            >
              {isUploading ? (
                <Loader2 className="size-[18px] animate-spin" />
              ) : (
                <Paperclip className="size-[18px]" />
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
                "min-h-[40px] max-h-[160px]",
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

            <div
              className="flex items-center shrink-0"
              style={{ gap: "var(--spacing-xs)", marginBottom: "2px" }}
            >
              {!canSend && (
                <span
                  className="text-muted-foreground/40 hidden lg:block"
                  style={{
                    fontFamily: FONT,
                    fontSize: "var(--font-size-caption)",
                    fontWeight: "var(--font-weight-normal)" as unknown as number,
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.common.enterHint}
                </span>
              )}

              <motion.div
                animate={canSend ? { scale: [0.96, 1] } : { scale: 1 }}
                transition={{ duration: 0.15 }}
              >
                <Button
                  type="button"
                  size="icon"
                  onClick={handleSend}
                  disabled={disabled || !value.trim()}
                  className={cn(
                    "shrink-0 rounded-full size-9",
                    "text-primary-foreground",
                    "disabled:opacity-20",
                    "transition-all duration-200",
                  )}
                  style={{
                    background: canSend ? "var(--primary)" : "color-mix(in srgb, var(--primary) 82%, var(--background))",
                    boxShadow: canSend
                      ? "0 6px 16px color-mix(in srgb, var(--primary) 20%, transparent)"
                      : "none",
                  }}
                  aria-label={t.chat.sendMessage}
                >
                  <SendHorizonal className="size-[18px]" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        <div
          className="flex items-center justify-between"
          style={{
            marginTop: "var(--spacing-xs)",
            paddingLeft: "var(--spacing-2xs)",
            paddingRight: "var(--spacing-2xs)",
          }}
        >
          <p
            className="text-muted-foreground/40 flex-1"
            style={{
              fontFamily: FONT,
              fontSize: "var(--font-size-caption)",
              fontWeight: "var(--font-weight-normal)" as unknown as number,
              margin: 0,
            }}
          >
            {t.chat.disclaimer}
          </p>
          <ChatLimitIndicator limitInfo={limitInfo} compact />
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
