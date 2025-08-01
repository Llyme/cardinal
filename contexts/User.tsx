"use client";

import { API_URL } from "@/lib/contants";
import { easyContext } from "../lib/contexting";
import LoadingScreen from "./LoadingScreen";
import { useEffect, useRef, useState } from "react";

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
    const [isLoggedIn, setIsLoggedIn] = useState<"yes" | "no" | "loading">(
        "loading"
    );
    const queue = useRef<(() => any)[]>([]);

    // Helper function to check if we're in the browser
    const isBrowser = typeof window !== "undefined";

    async function runQueue() {
        console.log("wowowee", queue.current.length);

        const result = await Promise.all(
            queue.current.map((callback) => callback())
        );

        console.log(result);

        queue.current = [];
    }

    async function login(username: string, password: string) {
        if (!isBrowser) return false;

        loadingScreen.setFlag("login", true);

        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.status !== 200) {
            loadingScreen.setFlag("login", false);
            return false;
        }

        const { token, refresh_token } = await response.json();

        localStorage.setItem("token", token);
        localStorage.setItem("refresh_token", refresh_token);
        localStorage.setItem("username", username);
        setIsLoggedIn("yes");

        loadingScreen.setFlag("login", false);

        runQueue();

        return true;
    }

    async function logout() {
        if (!isBrowser) return false;

        if (!localStorage.getItem("token")) {
            return false;
        }

        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("username");
        setIsLoggedIn("no");

        return true;
    }

    async function me() {
        if (!isBrowser) return new Response("", { status: 401 });

        if (!localStorage.getItem("token")) {
            return new Response("", { status: 401 });
        }

        return await fetch(`${API_URL}/api/auth/me`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
    }

    async function tryRefresh() {
        if (!isBrowser) return;

        const current_refresh_token = localStorage.getItem("refresh_token");

        if (!current_refresh_token) {
            return;
        }

        if ((await me()).status === 200) {
            return;
        }

        const response = await fetch(`${API_URL}/api/auth/refresh`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${current_refresh_token}`,
            },
        });

        const { token, refresh_token } = await response.json();

        localStorage.setItem("token", token);
        localStorage.setItem("refresh_token", refresh_token);
    }

    // Use useEffect to call tryRefresh only on the client side
    useEffect(() => {
        (async () => {
            await tryRefresh();

            const response = await me();

            setIsLoggedIn(response.ok ? "yes" : "no");

            if (response.ok) {
                runQueue();
            }
        })();
    }, []);

    return {
        value: {
            login,
            logout,

            isLoggedIn,

            get username() {
                return isBrowser ? localStorage.getItem("username") : null;
            },

            get authorization() {
                return isBrowser
                    ? `Bearer ${localStorage.getItem("token")}`
                    : null;
            },

            waitForLogin(callback: () => any) {
                console.log("rawrxd", queue.current.length, isLoggedIn);

                if (isLoggedIn === "yes") {
                    callback();
                } else {
                    queue.current.push(callback);
                }
            },
        },
        children,
    };
});
