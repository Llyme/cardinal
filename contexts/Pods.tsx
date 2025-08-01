"use client";

import { API_URL } from "@/lib/contants";
import { easyContext, useStore } from "../lib/contexting";
import LoadingScreen from "./LoadingScreen";
import User from "./User";

export type PodType = {
    namespace: string;
    name: string;
    ready_count: number;
    ready_total: number;
    status: string;
    restart_count: number;
    restart_age: number | null;
    age: number;
    immediate_age: number;
};

export default easyContext((children) => {
    const loadingScreen = LoadingScreen.useThis();
    const user = User.useThis();

    const store = useStore<PodType[]>({
        defaultValue: [],

        async callback(namespace: string) {
            return await loadingScreen.wrap(async () => {
                const Authorization = user.authorization;

                if (!Authorization) return [];

                const response = await fetch(
                    `${API_URL}/api/pods/${namespace}`,
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

    return {
        value: {
            ...store,
        },
        children,
    };
});
