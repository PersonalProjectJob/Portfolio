import { useState, useCallback, useRef, useEffect } from "react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import type { FileAttachment } from "./useChat";
import { buildSessionHeaders, useSessionIdentity } from "../lib/sessionScope";

const UPLOAD_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4ab11b6d/upload-cv`;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt", ".jpg", ".jpeg", ".png", ".webp"];

export function useFileUpload(onRequireAuth?: () => void) {
  const identity = useSessionIdentity();
  const [uploadedFile, setUploadedFile] = useState<FileAttachment | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const requiresAuth = !identity.isAuthenticated || !identity.userId;

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const clear = useCallback(() => {
    setUploadedFile(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  useEffect(() => {
    clear();
  }, [clear, identity.scopeKey]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Reset input so same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (requiresAuth) {
        clear();
        onRequireAuth?.();
        return;
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        setUploadError("fileTooLarge");
        return;
      }

      // Validate type
      const ext = "." + (file.name.split(".").pop()?.toLowerCase() || "");
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setUploadError("invalidType");
        return;
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(UPLOAD_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            ...buildSessionHeaders(identity),
          },
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          console.error("[useFileUpload] Upload error:", errData);

          if (response.status === 401) {
            clear();
            onRequireAuth?.();
            return;
          }

          setUploadError("uploadFailed");
          return;
        }

        const data = await response.json();
        const attachment: FileAttachment = {
          name: data.name,
          url: data.url,
          publicId: data.publicId,
          size: data.size,
        };
        setUploadedFile(attachment);
      } catch (err) {
        console.error("[useFileUpload] Error:", err);
        setUploadError("uploadFailed");
      } finally {
        setIsUploading(false);
      }
    },
    [clear, identity.scopeKey, onRequireAuth, requiresAuth],
  );

  return {
    requiresAuth,
    uploadedFile,
    isUploading,
    uploadError,
    openFilePicker,
    clear,
    handleFileChange,
    fileInputRef,
  };
}
