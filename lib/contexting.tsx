import {
    Context,
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

export function useStore<T>({
    callback,
    defaultValue,
    startArgs,
    interval = 100,
}: {
    callback: (...args: any[]) => T | Promise<T>;
    startArgs?: Parameters<typeof callback>;
    defaultValue?: T;
    interval?: number;
}): {
    value: T;
    hasValue: boolean;
    make: (...args: any[]) => Promise<T>;
    setValue: (data: T) => T;
    flush: () => void;
} {
    const [value, setValue] = useState<T>(defaultValue!);
    const [hasValue, setHasValue] = useState(false);
    let lastMake = useRef(0);

    async function make(...args: Parameters<typeof callback>): Promise<T> {
        if (performance.now() - lastMake.current < interval) return undefined!;

        lastMake.current = performance.now();

        const data = await callback(...args);

        setValue(data);
        setHasValue(true);

        return data;
    }

    useEffect(() => {
        if (startArgs !== undefined) make(...startArgs);
    }, []);

    return {
        value: hasValue ? value : defaultValue!,
        hasValue,

        make,

        setValue(data: T) {
            setValue(data);
            setHasValue(true);

            return data;
        },

        flush() {
            setValue(undefined!);
            setHasValue(false);
        },
    };
}

export function useFetch<T>({
    initialArgs = [],
    initialValue,
    url,
    selector,
    fetchOnStart = false,
    beforeFetch,
    afterFetch,
    method,
    headers,
    fetchInterval = 100,
}: {
    initialArgs?: any[];
    initialValue: T;
    url: string | ((...args: any) => string);
    selector?: (response: Response) => Promise<any>;
    fetchOnStart?: boolean;
    beforeFetch?: (url: string) => any;
    afterFetch?: (url: string, data: T) => any;
    method?: string;
    headers?: Record<string, string>;
    fetchInterval?: number;
}) {
    const state = useState<T>(initialValue);
    let fetching = performance.now();
    const [, set] = state;

    const fetchData = useCallback(
        async (...args: any) => {
            if (performance.now() - fetching < fetchInterval) return;

            fetching = performance.now();

            const _url = url instanceof Function ? url(...args) : url;

            if (beforeFetch) await beforeFetch(_url);

            const response = await fetch(_url, {
                headers,
                method,
            });

            let data = selector
                ? await selector(response)
                : await response.json();

            if (afterFetch) {
                const newData = await afterFetch(_url, data);

                if (newData !== undefined) data = newData;
            }

            set(data);

            fetching = performance.now();
        },
        [selector, set, url]
    );

    useEffect(() => {
        if (fetchOnStart) fetchData(...initialArgs);
    }, []);

    return { state, fetch: fetchData };
}

export function easyFetch<T>(config: Parameters<typeof useFetch<T>>[0]) {
    return function (...initialArgs: any) {
        return useFetch<T>({
            ...config,
            initialArgs,
        });
    };
}

export function easyContextFetch<T>({
    initialValue,
    url,
    selector,
}: {
    initialValue: T;
    url: string | ((...args: any) => string);
    selector?: (response: Response) => Promise<any>;
}) {
    return easyContext(function (children) {
        const {
            state: [value, set],
            fetch,
        } = useFetch({
            initialValue,
            url,
            selector,
        });

        return {
            value: {
                value,
                set,
                fetch,
            },
            children,
        };
    });
}

export function easyContext<T>(
    fn: (children: ReactNode) => {
        value: T;
        children: ReactNode;
    }
): {
    Context: Context<T>;
    Provider: ({ children }: any) => ReactNode;
    useThis: () => T;
} {
    const Context = createContext<any>(null);

    return {
        Context,

        Provider({ children }: any) {
            const { value, children: _children } = fn(children);

            return (
                <Context.Provider value={value}>{_children}</Context.Provider>
            );
        },

        useThis() {
            return useContext(Context);
        },
    };
}
