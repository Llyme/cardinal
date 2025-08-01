"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Collapsible, CollapsibleContent } from "./ui/collapsible";
import AgeIcon from "./AgeIcon";
import HeartyIcon from "./HeartyIcon";
import Pod from "./Pod";
import { RefreshCwIcon } from "lucide-react";
import { Separator } from "./ui/separator";
import Pods from "@/contexts/Pods";
import PasswordModal from "@/contexts/PasswordModal";
import LoadingScreen from "@/contexts/LoadingScreen";
import { API_URL } from "@/lib/contants";
import Deployments from "@/contexts/Deployments";

export default function Deployment({
    namespace,
    name,
    ready_count,
    ready_total,
    age,
}: {
    namespace: string;
    name: string;
    ready_count: number;
    ready_total: number;
    age: number;
}) {
    const [open, setOpen] = useState(false);
    const pods = Pods.useThis();
    const passwordModal = PasswordModal.useThis();
    const loadingScreen = LoadingScreen.useThis();
    const deployments = Deployments.useThis();

    function restart() {
        passwordModal.setCallback((password) => {
            loadingScreen.wrap(async () => {
                const response = await fetch(
                    `${API_URL}/api/restart/deployment`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            password,
                            namespace,
                            deployment_name: name,
                        }),
                    }
                );

                if (response.status !== 200) {
                    alert("Failed to restart deployment: " + response.status);
                    return;
                }

                await Promise.all([
                    pods.make(namespace),
                    deployments.make(namespace),
                ]);
            });
        });

        passwordModal.setVisible(true);
    }

    const buttonContent = (
        <>
            <Label className="truncate">{name}</Label>
            <Separator className="flex-1 w-0" />
            <HeartyIcon total={ready_total} count={ready_count} />
            <AgeIcon age={age} />
        </>
    );

    if (ready_total === 0)
        return (
            <div className="flex gap-4 w-full items-center">
                {buttonContent}
            </div>
        );

    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <Button
                className={`flex gap-4 w-full ${
                    open
                        ? "rounded-b-none border-1 border-gray-200 border-b-0"
                        : ""
                }`}
                variant="ghost"
                onClick={() => setOpen(!open)}
            >
                <div className="flex flex-1 w-0 items-center gap-4">
                    <Label className="truncate">{name}</Label>
                    <Separator className="!w-0 flex-1" />
                </div>
                <HeartyIcon total={ready_total} count={ready_count} />
                <AgeIcon age={age} />
            </Button>
            <CollapsibleContent className="border-1 border-gray-200 shadow-md border-t-0 rounded-sm rounded-t-none">
                <div className="flex justify-end items-center gap-2 px-4 pt-4">
                    <Separator className="flex-1 mx-4" />
                    <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                        onClick={restart}
                    >
                        <RefreshCwIcon size={12} />
                        <Label className="text-xs">Restart</Label>
                    </Button>
                </div>
                <div className="flex flex-col gap-2 p-4">
                    {pods.value
                        .filter((v) => v.name.startsWith(name))
                        .map((pod) => (
                            <Pod
                                key={pod.name}
                                namespace={pod.namespace}
                                name={pod.name}
                                ready_count={pod.ready_count}
                                ready_total={pod.ready_total}
                                status={pod.status}
                                age={pod.age}
                            />
                        ))}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
