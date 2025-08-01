import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

export default function ToggleBadge({
    toggled,
    children,
    className,
    ...props
}: {
    toggled: boolean;
} & React.ComponentProps<typeof Badge>) {
    return (
        <Badge
            variant={toggled ? "default" : "outline"}
            className={cn("select-none cursor-pointer", className)}
            {...props}
        >
            {children}
        </Badge>
    );
}
