"use client";

import { API_URL } from "@/lib/contants";
import { easyContext, useStore } from "../lib/contexting";
import LoadingScreen from "./LoadingScreen";
import User from "./User";
import { useEffect } from "react";

export type DeploymentType = {
    name: string;
    ready_count: number;
    ready_total: number;
    up_to_date: number;
    available: number;
    age: number;
};

export default easyContext((children) => {
    const loadingScreen = LoadingScreen.useThis();
    const user = User.useThis();

    const store = useStore<DeploymentType[]>({
        defaultValue: [],

        async callback(namespace: string) {
            return await loadingScreen.wrap(async () => {
                const Authorization = user.authorization;

                if (!Authorization) return [];

                const response = await fetch(
                    `${API_URL}/api/deployments/${namespace}`,
                    {
                        method: "GET",
                        headers: { Authorization },
                    }
                );

                if (!response.ok) return [];

                return await response.json();
            });
        },
    });

    useEffect(() => {
        user.waitForLogin(store.make);
    }, []);

    return {
        value: {
            ...store,
        },
        children,
    };
});
