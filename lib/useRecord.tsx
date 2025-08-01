import { useState } from "react";

export default function useRecord<T>(initialValues: { [key: string]: T }) {
    const [record, setRecord] = useState<{ [key: string]: T }>(initialValues);

    const updateField = (key: string, value: T) => {
        setRecord((prev) => ({ ...prev, [key]: value }));
    };

    return {
        record,
        updateField,
    };
}
