import { DesktopSidebar, type DesktopSidebarProps } from "../desktop/DesktopSidebar";
import { Sidebar, useSidebar } from "../ui/sidebar";

function MobileSidebarContent(props: DesktopSidebarProps) {
  const { setOpenMobile } = useSidebar();

  return (
    <DesktopSidebar
      {...props}
      mobileMode
      onRequestClose={() => setOpenMobile(false)}
    />
  );
}

export function MobileSidebarSheet(props: DesktopSidebarProps) {
  return (
    <Sidebar side="left">
      <MobileSidebarContent {...props} />
    </Sidebar>
  );
}
