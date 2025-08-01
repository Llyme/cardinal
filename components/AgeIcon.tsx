import { BabyIcon, LaughIcon, MehIcon, SmileIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

function JustTheIcon({ age }: { age: number }) {
    if (age < 7) return <BabyIcon color="blue" />;

    if (age < 30) return <LaughIcon color="green" />;

    if (age < 60) return <SmileIcon color="black" />;

    return <MehIcon color="gray" />;
}

export default function AgeIcon({ age }: { age: number }) {
    const ageDays = Math.floor(age / 24 / 60 / 60);

    return (
        <Tooltip>
            <TooltipTrigger>
                <JustTheIcon age={ageDays} />
            </TooltipTrigger>
            <TooltipContent>
                <p>This has been running for {ageDays} day(s).</p>
            </TooltipContent>
        </Tooltip>
    );
}
