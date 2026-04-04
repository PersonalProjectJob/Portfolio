import { Menu, X } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";
import { useI18n } from "../../lib/i18n";
import { useSidebar } from "../ui/sidebar";

export interface MobileSidebarButtonProps {
  className?: string;
}

export function MobileSidebarButton({ className }: MobileSidebarButtonProps) {
  const { t } = useI18n();
  const { openMobile, toggleSidebar } = useSidebar();

  const label = openMobile ? t.chat.collapseSidebar : t.chat.expandSidebar;

  return (
    <Button
      type="button"
      variant="ghost"
      size="touch"
      onClick={toggleSidebar}
      className={cn(
        "shrink-0 rounded-full text-muted-foreground hover:text-foreground",
        className,
      )}
      aria-label={label}
      aria-expanded={openMobile}
      title={label}
    >
      {openMobile ? <X className="size-5" /> : <Menu className="size-5" />}
    </Button>
  );
}
