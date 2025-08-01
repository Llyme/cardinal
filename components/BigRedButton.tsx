import { ArrowDownIcon } from "lucide-react";
import { Button } from "./ui/button";
import { MouseEventHandler, ReactNode } from "react";

export default function BigRedButton({
    icon,
    text,
    onClick,
}: {
    icon: ReactNode;
    text?: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
}) {
    return (
        <div className="flex flex-col items-center gap-4">
            <Button
                size="icon"
                className="rounded-full w-fit h-fit p-12 flex-col relative shadow-xl"
                variant="destructive"
                onClick={onClick}
            >
                <ArrowDownIcon
                    className="absolute top-[-64px] animate-bounce"
                    size={64}
                    color="red"
                />
                {icon}
            </Button>
            {text ? <p className="text-2xl select-none">{text}</p> : null}
        </div>
    );
}
