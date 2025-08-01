import {
    CheckCircle2Icon,
    CircleAlertIcon,
    CircleStopIcon,
    FileIcon,
    InfoIcon,
    TriangleAlertIcon,
} from "lucide-react";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import Logs, { Log, LogCategory } from "@/contexts/Logs";
import { useEffect, useRef, useState } from "react";
import ToggleBadge from "./ToggleBadge";

function LogDate({ date }: { date: string }) {
    return (
        <Label className="font-light shrink-0 grow-0 leading-normal">
            {date}
        </Label>
    );
}

function LogIcon({
    category,
    ...props
}: { category: LogCategory } & React.SVGProps<SVGSVGElement>) {
    switch (category) {
        case "INFO":
            return <InfoIcon color="blue" {...props} />;

        case "ERROR":
            return <CircleAlertIcon fill="red" color="white" {...props} />;

        case "WARNING":
            return <TriangleAlertIcon color="orange" {...props} />;

        case "SUCCESS":
            return <CheckCircle2Icon color="green" {...props} />;

        case "SHUTDOWN":
            return <CircleStopIcon color="gray" {...props} />;
    }
}

function LogItem({ log }: { log: Log }) {
    return (
        <div
            className={cn(
                "flex gap-2 items-start py-2 odd:bg-gray-50 even:bg-white px-4"
            )}
        >
            <LogIcon category={log.category} className="shrink-0 grow-0" />
            <LogDate date={log.dates[0]} />
            <Label className="flex-1 break-words w-0 overflow-hidden select-auto cursor-auto leading-normal">
                {log.texts[0]}
            </Label>
            {log.texts.length > 1 ? (
                <Label className="font-bold leading-normal">
                    x{log.texts.length}
                </Label>
            ) : null}
        </div>
    );
}

function CategoryItem({
    toggled,
    icon,
    count,
    className,
    ...props
}: {
    toggled: boolean;
    icon: React.ReactNode;
    count: number;
    className?: string;
} & React.ComponentProps<typeof ToggleBadge>) {
    return (
        <ToggleBadge
            className={cn("flex gap-2 items-center select-none", className)}
            toggled={toggled}
            {...props}
        >
            {icon}
            {count}
        </ToggleBadge>
    );
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function BytesItem({ bytes }: { bytes: number }) {
    return (
        <Badge className="flex gap-2 items-center select-none">
            <FileIcon />
            {formatBytes(bytes)}
        </Badge>
    );
}

export default function SideWindowLogs() {
    const logs = Logs.useThis();
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [infoToggled, setInfoToggled] = useState(true);
    const [warningToggled, setWarningToggled] = useState(true);
    const [successToggled, setSuccessToggled] = useState(true);
    const [errorToggled, setErrorToggled] = useState(true);
    const [shutdownToggled, setShutdownToggled] = useState(true);

    // Calculate category counts
    const categoryCounts = logs.parsedLogs.reduce((acc, log) => {
        acc[log.category] = (acc[log.category] || 0) + 1;
        return acc;
    }, {} as Record<LogCategory, number>);

    const items = logs.parsedLogs
        .filter((v) => {
            if (infoToggled && v.category === "INFO") return true;
            if (warningToggled && v.category === "WARNING") return true;
            if (successToggled && v.category === "SUCCESS") return true;
            if (errorToggled && v.category === "ERROR") return true;
            if (shutdownToggled && v.category === "SHUTDOWN") return true;

            return false;
        })
        .slice(0, 100)
        .map((log, index) => {
            return <LogItem key={index} log={log} />;
        });

    // if (items.length === 0) return;

    return (
        <div className="h-full flex-1 max-h-lvh flex flex-col py-8 gap-4">
            <div className="flex w-full gap-2">
                <CategoryItem
                    toggled={infoToggled}
                    icon={<InfoIcon />}
                    count={categoryCounts.INFO || 0}
                    className={cn(
                        infoToggled ? "bg-blue-600" : "border-blue-500"
                    )}
                    onClick={() => setInfoToggled(!infoToggled)}
                />
                <CategoryItem
                    toggled={warningToggled}
                    icon={<TriangleAlertIcon />}
                    count={categoryCounts.WARNING || 0}
                    className={cn(
                        warningToggled ? "bg-orange-600" : "border-orange-500"
                    )}
                    onClick={() => setWarningToggled(!warningToggled)}
                />
                <CategoryItem
                    toggled={successToggled}
                    icon={<CheckCircle2Icon />}
                    count={categoryCounts.SUCCESS || 0}
                    className={cn(
                        successToggled ? "bg-green-600" : "border-green-500"
                    )}
                    onClick={() => setSuccessToggled(!successToggled)}
                />
                <CategoryItem
                    toggled={errorToggled}
                    icon={<CircleAlertIcon />}
                    count={categoryCounts.ERROR || 0}
                    className={cn(
                        errorToggled ? "bg-red-600" : "border-red-500"
                    )}
                    onClick={() => setErrorToggled(!errorToggled)}
                />
                <CategoryItem
                    toggled={shutdownToggled}
                    icon={<CircleStopIcon />}
                    count={categoryCounts.SHUTDOWN || 0}
                    className={cn(
                        shutdownToggled ? "bg-gray-600" : "border-gray-500"
                    )}
                    onClick={() => setShutdownToggled(!shutdownToggled)}
                />
                <BytesItem bytes={logs.bytes} />
            </div>
            <ScrollArea
                ref={scrollAreaRef}
                className="h-full flex-1 max-h-lvh !flex !flex-col pb-8 pr-4"
            >
                {items}
                {logs.isStreaming && (
                    <div className="flex items-center gap-2 px-4 py-2 text-blue-600 animate-pulse">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                        ></div>
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
