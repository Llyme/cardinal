import { SidebarTrigger, useSidebar } from "./ui/sidebar";

export default function NavBar() {
    const sidebar = useSidebar();

    if (!sidebar.isMobile) return;

    return (
        <>
            <div className="flex w-full h-10 top-0 items-center px-2 bg-white shadow-2xl shrink-0 grow-0">
                <SidebarTrigger />
            </div>
        </>
    );
}
