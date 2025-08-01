export const API_URL =
    (process.env.NEXT_PUBLIC_API_URL?.endsWith("/")
        ? process.env.NEXT_PUBLIC_API_URL.slice(0, -1)
        : process.env.NEXT_PUBLIC_API_URL) ?? "";
