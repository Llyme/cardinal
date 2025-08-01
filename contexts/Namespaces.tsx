"use client";

import { API_URL } from "@/lib/contants";
import { easyContext, useFetch, useStore } from "../lib/contexting";
import LoadingScreen from "./LoadingScreen";
import User from "./User";
import { useEffect } from "react";

export default easyContext((children) => {
    const loadingScreen = LoadingScreen.useThis();
    const user = User.useThis();
    const store = useStore<string[]>({
        defaultValue: [],

        async callback() {
            return await loadingScreen.wrap(async () => {
                const Authorization = user.authorization;

                if (!Authorization) return [];

                const response = await fetch(`${API_URL}/api/namespaces`, {
                    method: "GET",
                    headers: { Authorization },
                });

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
