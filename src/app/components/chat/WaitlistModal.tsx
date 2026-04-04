import { useState } from "react";
import { Bell, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useI18n } from "../../lib/i18n";
import { projectId, publicAnonKey } from "/utils/supabase/info";

const WAITLIST_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4ab11b6d/waitlist`;

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string;
}

export function WaitlistModal({
  open,
  onOpenChange,
  feature,
}: WaitlistModalProps) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(WAITLIST_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          feature,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to register");
      }

      setIsSuccess(true);
    } catch (err) {
      setError(t.waitlist.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after dialog close animation
    setTimeout(() => {
      setName("");
      setEmail("");
      setIsSuccess(false);
      setError(null);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[420px]"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <DialogHeader>
          <DialogTitle
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "var(--font-size-h2)",
              fontWeight: "var(--font-weight-semibold)" as unknown as number,
            }}
            className="text-foreground"
          >
            {t.waitlist.title}
          </DialogTitle>
          <DialogDescription
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "var(--font-size-small)",
              fontWeight: "var(--font-weight-normal)" as unknown as number,
            }}
          >
            {t.waitlist.subtitle}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-[var(--spacing-md)] py-[var(--spacing-lg)]"
            >
              <div
                className="rounded-full flex items-center justify-center"
                style={{
                  width: "64px",
                  height: "64px",
                  backgroundColor: "color-mix(in srgb, var(--color-success) 10%, transparent)",
                }}
              >
                <CheckCircle
                  className="size-8"
                  style={{ color: "var(--color-success)" }}
                />
              </div>
              <p
                className="text-foreground text-center"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "var(--font-size-body)",
                  fontWeight: "var(--font-weight-medium)" as unknown as number,
                  margin: 0,
                }}
              >
                {t.waitlist.successMessage}
              </p>
              <Button variant="outline" size="lg" onClick={handleClose}>
                {t.waitlist.close}
              </Button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-[var(--spacing-md)]"
            >
              <div className="flex flex-col gap-[var(--spacing-xs)]">
                <Label
                  htmlFor="waitlist-name"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "var(--font-size-small)",
                    fontWeight: "var(--font-weight-medium)" as unknown as number,
                  }}
                >
                  {t.waitlist.nameLabel}
                </Label>
                <Input
                  id="waitlist-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.waitlist.namePlaceholder}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex flex-col gap-[var(--spacing-xs)]">
                <Label
                  htmlFor="waitlist-email"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "var(--font-size-small)",
                    fontWeight: "var(--font-weight-medium)" as unknown as number,
                  }}
                >
                  {t.waitlist.emailLabel}
                </Label>
                <Input
                  id="waitlist-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.waitlist.emailPlaceholder}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {error && (
                <p
                  className="text-destructive"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "var(--font-size-caption)",
                    fontWeight: "var(--font-weight-normal)" as unknown as number,
                    margin: 0,
                  }}
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                variant="secondary"
                size="lg"
                disabled={isSubmitting || !name.trim() || !email.trim()}
                style={{ fontSize: "var(--font-size-body)" }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>{t.waitlist.submitting}</span>
                  </>
                ) : (
                  <>
                    <Bell className="size-4" />
                    <span>{t.waitlist.submit}</span>
                  </>
                )}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
