"use client";

import { useEffect } from "react";
import {
    Select,
    SelectItem,
    SelectLabel,
    SelectContent,
    SelectGroup,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import Namespaces from "@/contexts/Namespaces";

export default function NamespaceSelection({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    const namespaces = Namespaces.useThis();

    useEffect(() => {
        namespaces.make();
    }, []);

    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-0 max-w-xs flex-1">
                <SelectValue placeholder="Select a namespace" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Namespaces</SelectLabel>
                    {namespaces.value?.map((namespace) => (
                        <SelectItem key={namespace} value={namespace}>
                            {namespace}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
