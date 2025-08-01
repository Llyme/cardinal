"use client";

import { Button } from "./ui/button";
import {
    CheckCircle2Icon,
    CircleQuestionMarkIcon,
    FootprintsIcon,
    LoaderCircleIcon,
    LogsIcon,
    SkullIcon,
    TrashIcon,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Label } from "./ui/label";
import AgeIcon from "./AgeIcon";
import HeartyIcon from "./HeartyIcon";
import PasswordModal from "@/contexts/PasswordModal";
import LoadingScreen from "@/contexts/LoadingScreen";
import { API_URL } from "@/lib/contants";
import Pods from "@/contexts/Pods";
import Deployments from "@/contexts/Deployments";
import Logs from "@/contexts/Logs";

function JustTheIcon({ status }: { status: string }) {
    if (status === "Running") return <FootprintsIcon color="black" />;

    if (
        [
            "CrashLoopBackOff",
            "ImagePullBackOff",
            "ErrImagePull",
            "CreateContainerConfigError",
            "ContainerCreating",
            "PodInitializing",
        ].includes(status)
    )
        return (
            <LoaderCircleIcon
                className="animate-spin"
                color="blue"
                strokeWidth={3}
            />
        );

    if (status === "Completed") return <CheckCircle2Icon color="green" />;

    if (["Error", "OOMKilled"].includes(status))
        return <SkullIcon color="red" />;

    return <CircleQuestionMarkIcon color="white" fill="orange" />;
}

function StatusIcon({ status }: { status: string }) {
    return (
        <Tooltip>
            <TooltipTrigger>
                <JustTheIcon status={status} />
            </TooltipTrigger>
            <TooltipContent>
                <p>{status}</p>
            </TooltipContent>
        </Tooltip>
    );
}

export default function Pod({
    namespace,
    name,
    ready_count,
    ready_total,
    status,
    age,
}: {
    namespace: string;
    name: string;
    ready_count: number;
    ready_total: number;
    status: string;
    age: number;
}) {
    const passwordModal = PasswordModal.useThis();
    const loadingScreen = LoadingScreen.useThis();
    const pods = Pods.useThis();
    const deployments = Deployments.useThis();
    const logs = Logs.useThis();

    function deletePod() {
        passwordModal.setCallback((password) => {
            loadingScreen.wrap(async () => {
                const response = await fetch(`${API_URL}/api/delete/pod`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        password,
                        namespace,
                        pod_name: name,
                    }),
                });

                if (response.status !== 200) {
                    alert("Failed to delete pod: " + response.status);
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

    return (
        <div className="flex gap-4">
            <Label className="flex-1 truncate w-0">{name}</Label>
            <StatusIcon status={status} />
            <HeartyIcon total={ready_total} count={ready_count} />
            <AgeIcon age={age} />
            <Tooltip>
                <TooltipTrigger>
                    <Button
                        size="icon"
                        onClick={() => logs.fetch(namespace, name)}
                    >
                        <LogsIcon size={16} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Logs</p>
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger>
                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={deletePod}
                    >
                        <TrashIcon size={16} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Delete</p>
                </TooltipContent>
            </Tooltip>
        </div>
    );
}
