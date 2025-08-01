"use client";

import { ReactNode, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import Deployment from "./Deployment";
import NamespaceSelection from "./NamespaceSelection";
import Deployments from "@/contexts/Deployments";
import Pods from "@/contexts/Pods";
import { RefreshCwIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Label } from "./ui/label";

export default function DeploymentsModal({
    children,
}: {
    children: ReactNode;
}) {
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
        <Dialog>
            {children ? <DialogTrigger>{children}</DialogTrigger> : null}
            <DialogContent className="w-2xl !max-w-lvw">
                <DialogHeader>
                    <DialogTitle>Deployments</DialogTitle>
                    <DialogDescription>
                        Choose a deployment to examine.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-between">
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
                <ScrollArea className="!max-h-[70lvh] relative">
                    <div className="flex flex-col gap-2 !h-full pr-4">
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
                {/* <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter> */}
            </DialogContent>
        </Dialog>
    );
}
