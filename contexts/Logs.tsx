"use client";

import { API_URL } from "@/lib/contants";
import { easyContext, useFetch } from "../lib/contexting";
import LoadingScreen from "./LoadingScreen";
import { useState } from "react";

export type LogCategory = "INFO" | "ERROR" | "WARNING" | "SUCCESS" | "SHUTDOWN";
export type Log = {
    texts: string[];
    dates: string[];
    category: LogCategory;
};

function getDate(text: string): string {
    const rx = text.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)/);

    if (!rx) return "";

    const date = new Date(rx[1]);
    const formattedDate = date.toLocaleString();

    return formattedDate;
}

function getCategory(text: string): LogCategory {
    if (text.includes("INFO")) return "INFO";

    if (text.includes("ERROR")) return "ERROR";

    if (text.includes("WARNING")) return "WARNING";

    if (text.includes("SUCCESS")) return "SUCCESS";

    // Check for error patterns
    if (/\b(error|failed|exception|crash|fatal)\b/i.test(text)) return "ERROR";

    // Check for warning patterns
    if (/\b(warn|warning|caution|deprecated)\b/i.test(text)) return "WARNING";

    // Check for success patterns
    if (
        /\b(success|successful|started|complete|completed|finished|ready|ok|connected)\b/i.test(
            text
        )
    )
        return "SUCCESS";

    // Check for shutdown/ending patterns
    if (
        /\b(shutdown|shutting down|stopping|stopped|terminated|terminating|ended|ending|closing|closed|exit|exiting|quit|quitting)\b/i.test(
            text
        )
    )
        return "SHUTDOWN";

    return "INFO";
}

function isSimilar(text1: string, text2: string, threshold: number): boolean {
    // Calculate Levenshtein distance
    const dp: number[][] = Array(text1.length + 1)
        .fill(null)
        .map(() => Array(text2.length + 1).fill(0));

    for (let i = 0; i <= text1.length; i++) {
        dp[i][0] = i;
    }

    for (let j = 0; j <= text2.length; j++) {
        dp[0][j] = j;
    }

    for (let i = 1; i <= text1.length; i++) {
        for (let j = 1; j <= text2.length; j++) {
            if (text1[i - 1] === text2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1, // deletion
                    dp[i][j - 1] + 1, // insertion
                    dp[i - 1][j - 1] + 1 // substitution
                );
            }
        }
    }

    const distance = dp[text1.length][text2.length];
    const maxLength = Math.max(text1.length, text2.length);
    const similarity = 1 - distance / maxLength;

    return similarity >= threshold;
}

function* parseLogs(texts: string[]): Generator<Log, void, unknown> {
    let captured: string[] = [];
    let dates: string[] = [];

    for (const text of texts) {
        const trimmedText = text.trim().substring(31);

        if (!trimmedText) continue;

        if (/^(.)\1*$/.test(trimmedText)) continue;

        if (!captured.length) {
            captured.push(text.substring(31));
            dates.push(getDate(text));
            continue;
        }

        if (isSimilar(captured[captured.length - 1], text, 0.5)) {
            captured.push(text.substring(31));
            dates.push(getDate(text));
            continue;
        }

        yield {
            texts: captured,
            dates,
            category: getCategory(captured[captured.length - 1]),
        };

        captured = [text.substring(31)];
        dates = [getDate(text)];
    }

    if (captured.length) {
        yield {
            texts: captured,
            dates,
            category: getCategory(captured[captured.length - 1]),
        };
    }
}

export default easyContext((children) => {
    const loadingScreen = LoadingScreen.useThis();
    const [parsedLogs, setParsedLogs] = useState<Log[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [bytes, setBytes] = useState(0);

    async function doParsedLogs(rawLogs: string[]) {
        setIsStreaming(true);
        setParsedLogs([]); // Clear previous logs for fresh streaming
        let temp: Log[] = [];

        for (const log of parseLogs(rawLogs)) {
            temp.push(log);
            setParsedLogs([...temp]); // Create new array to trigger re-render

            const mod =
                temp.length >= 500
                    ? 500
                    : Math.pow(10, Math.floor(Math.log10(temp.length)));

            if (temp.length % mod === 0) {
                console.log(temp.length);
                await new Promise((resolve) => setTimeout(resolve, 1));
            }
        }

        setIsStreaming(false);
    }

    const {
        state: [values],
        fetch,
    } = useFetch<Log[]>({
        initialValue: [],

        url(namespace: string, pod_name: string) {
            return `${API_URL}/api/logs/${namespace}/${pod_name}`;
        },

        method: "GET",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },

        beforeFetch() {
            loadingScreen.setFlag("logs", true);
        },

        afterFetch() {
            loadingScreen.setFlag("logs", false);
        },

        async selector(response) {
            if (!response.ok) return [];

            const data = await response.json();

            setBytes(data.length);
            doParsedLogs(data);

            return data;
        },
    });

    return {
        value: {
            values,
            parsedLogs,
            isStreaming,
            fetch,
            bytes,
        },
        children,
    };
});
