import { HeartCrackIcon, HeartIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

function JustTheIcon({ total, count }: { total: number; count: number }) {
    if (total === 0) return <HeartIcon color="gray" />;

    if (count === total) return <HeartIcon stroke="none" fill="green" />;

    return (
        <div className="relative">
            <HeartCrackIcon color="white" fill="red" />
            <HeartCrackIcon
                className="absolute animate-ping top-0 left-0 pointer-events-none"
                color="white"
                fill="red"
            />
        </div>
    );
}

export default function HeartyIcon({
    total,
    count,
}: {
    total: number;
    count: number;
}) {
    return (
        <Tooltip>
            <TooltipTrigger>
                <JustTheIcon total={total} count={count} />
            </TooltipTrigger>
            <TooltipContent>
                {total > 0 ? (
                    <p>
                        {count} of {total} worker(s) are in good condition.
                    </p>
                ) : (
                    <p>No workers found.</p>
                )}
            </TooltipContent>
        </Tooltip>
    );
}
