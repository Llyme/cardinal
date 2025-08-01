import {
    Calendar,
    ChevronUp,
    Home,
    Inbox,
    Search,
    Settings,
    SidebarIcon,
    UserIcon,
} from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Transition } from "./Transition";
import User from "@/contexts/User";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { MouseEvent } from "react";

// Menu items.
const items = [
    {
        title: "Home",
        url: "#",
        icon: Home,
    },
    {
        title: "Inbox",
        url: "#",
        icon: Inbox,
    },
    {
        title: "Calendar",
        url: "#",
        icon: Calendar,
    },
    {
        title: "Search",
        url: "#",
        icon: Search,
    },
    {
        title: "Settings",
        url: "#",
        icon: Settings,
    },
];

export default function NiceSidebar() {
    const user = User.useThis();
    const transition = Transition.useThis();
    const sidebar = useSidebar();

    async function logout(e: MouseEvent<HTMLDivElement>) {
        await transition.show();
        await user.logout();
        await transition.hide({
            startX: e.clientX,
            startY: e.clientY,
            staggerDelay: 100,
        });
    }

    return (
        <Sidebar collapsible="icon">
            {!sidebar.isMobile ? (
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem className="justify-end flex flex-row">
                            <Tooltip>
                                <TooltipTrigger>
                                    <SidebarMenuButton
                                        className="w-fit"
                                        onClick={sidebar.toggleSidebar}
                                    >
                                        <SidebarIcon />
                                    </SidebarMenuButton>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Toggle Sidebar</p>
                                </TooltipContent>
                            </Tooltip>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
            ) : null}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                    <UserIcon /> Username
                                    <ChevronUp className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="w-[--radix-popper-anchor-width]"
                            >
                                <DropdownMenuItem onClick={logout}>
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
