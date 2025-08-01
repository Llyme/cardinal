"use client";

import NavBar from "@/components/NavBar";
import NiceSidebar from "@/components/NiceSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Logs from "@/contexts/Logs";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export default function Base({
    className,
    children,
}: {
    className?: string;
    children?: ReactNode;
}) {
    return (
        <Logs.Provider>
            <SidebarProvider>
                <NiceSidebar />
                <div className="flex flex-col w-full h-lvh">
                    <NavBar />
                    <div className={cn("flex-1 overflow-hidden", className)}>
                        {children}
                    </div>
                </div>
            </SidebarProvider>
        </Logs.Provider>
    );
}
