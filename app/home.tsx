"use client";

import Base from "@/components/Base";
import Deployment from "@/components/Deployment";
import NamespaceSelection from "@/components/NamespaceSelection";
import SideWindowLogs from "@/components/SideWindowLogs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import Deployments from "@/contexts/Deployments";
import Pods from "@/contexts/Pods";
import { RefreshCwIcon } from "lucide-react";
import { useState } from "react";

export default function Home() {
    const [namespace, setNamespace] = useState("");
    const deployments = Deployments.useThis();
    const pods = Pods.useThis();

    async function onNamespaceChange(namespace: string) {
        if (!namespace) return;

        setNamespace(namespace);

        await Promise.all([deployments.make(namespace), pods.make(namespace)]);
    }

    async function refresh() {
        if (!namespace) return;

        await Promise.all([deployments.make(namespace), pods.make(namespace)]);
    }

    return (
        <Base className="flex flex-row px-4 gap-4">
            <ScrollArea className="flex flex-col items-center max-w-xl flex-1 h-full py-8">
                <div className="flex justify-between py-4 px-6 w-full max-w-2xl gap-4">
                    <NamespaceSelection
                        value={namespace}
                        onChange={onNamespaceChange}
                    />
                    <Tooltip>
                        <TooltipTrigger>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={refresh}
                            >
                                <RefreshCwIcon size={16} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Refresh</TooltipContent>
                    </Tooltip>
                </div>
                <div className="flex flex-col gap-2 w-full !h-full pr-4 max-w-2xl">
                    {deployments.value && deployments.value.length > 0 ? (
                        deployments.value.map((item) => (
                            <Deployment
                                key={item.name}
                                namespace={namespace}
                                name={item.name}
                                ready_count={item.ready_count}
                                ready_total={item.ready_total}
                                age={item.age}
                            />
                        ))
                    ) : (
                        <Label className="self-center text-xl font-light py-4">
                            Nothing found.
                        </Label>
                    )}
                </div>
            </ScrollArea>
            <SideWindowLogs />
        </Base>
    );
}
