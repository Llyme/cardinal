"use client";

import { easyContext } from "@/lib/contexting";
import { cn } from "@/lib/utils";
import { LoaderCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default easyContext((children) => {
    const [flags, setFlags] = useState<Record<string, boolean>>({});
    const isVisible = Object.values(flags).some((tag) => tag);

    useEffect(() => {
        if (!isVisible) return;

        const preventDefault = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
        };

        // List of events to block
        const events = [
            "click",
            "mousedown",
            "mouseup",
            "mousemove",
            // "keydown",
            // "keyup",
            "keypress",
            "touchstart",
            "touchend",
            "touchmove",
            "wheel",
            "scroll",
        ];

        events.forEach((event) => {
            document.addEventListener(event, preventDefault, { capture: true });
        });

        return () => {
            events.forEach((event) => {
                document.removeEventListener(event, preventDefault, {
                    capture: true,
                });
            });
        };
    }, [isVisible]);

    function setFlag(flag: string, value: boolean) {
        setFlags((prev) => {
            if (!value) {
                const newFlags = { ...prev };

                delete newFlags[flag];

                return newFlags;
            }

            return { ...prev, [flag]: value };
        });
    }

    return {
        value: {
            isVisible,

            setFlag,

            async wrap<T>(fn: () => T) {
                const uuid = crypto.randomUUID();

                setFlag(uuid, true);

                const result = await fn();

                setFlag(uuid, false);

                return result;
            },
        },
        children: (
            <>
                <div
                    className={cn(
                        "z-[999] absolute top-0 bg-black/50 bottom-0 left-0 right-0 flex justify-center items-center transition-opacity duration-300",
                        isVisible
                            ? "opacity-100"
                            : "opacity-0 pointer-events-none"
                    )}
                >
                    <LoaderCircleIcon
                        className="animate-spin pointer-events-none"
                        color="white"
                        strokeWidth={1}
                        size={128}
                    />
                </div>
                {children}
            </>
        ),
    };
});
