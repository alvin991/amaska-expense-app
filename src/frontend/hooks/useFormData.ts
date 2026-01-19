import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Generic hook for managing form data and dirty state.
 * @param initialData - The initial object for the form (transaction or recurringTemplate)
 * @param onDirtyChange - Optional callback when dirty state changes
 */
export default function useFormData<T extends object>(
    initialData: T,
    onDirtyChange?: (isDirty: boolean) => void,
    numericFields: string[] = []
) {
    const [formData, setFormData] = useState<T>(initialData);
    const [isDirty, setIsDirty] = useState(false);
    const initialRef = useRef<T>(initialData);

    // Track dirty state
    useEffect(() => {
        console.log('useFormData: checking dirty state...', formData, initialRef.current);
        let dirty = false;
        const formDataKeys = Object.keys(formData);
        const initialRefKeys = Object.keys(initialRef.current);
        for (const key of formDataKeys) {
            if (initialRefKeys.includes(key)) {
                if (numericFields.includes(key)) {
                    if (Number((formData as any)[key]) !== Number((initialRef.current as any)[key])) {
                        dirty = true;
                        break;
                    }
                } else {
                    if ((formData as any)[key] !== (initialRef.current as any)[key]) {
                        dirty = true;
                        break;
                    }
                }
            }
        }

        setIsDirty(dirty);
        if (onDirtyChange) onDirtyChange(dirty);
    }, [formData, onDirtyChange]);

    // Expose a method to reset initialRef and formData
    // const resetInitial = useCallback((newInitial: T) => {
    //     initialRef.current = newInitial;
    //     // setFormData(() => newInitial); // functional update to avoid stale state
    //     setFormData(newInitial);
    // }, []);

    // Reset formData if initialData changes
    useEffect(() => {
        setFormData(initialData);
        initialRef.current = initialData;
    }, [initialData]);

    // Generic change handler
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            // console.log('handleChange event:', e);
            const { name, value, type } = e.target;
            if (type === 'checkbox') {
                setFormData((prev) => ({
                    ...prev,
                    [name]: (e.target as HTMLInputElement).checked,
                }));
            } else {
                setFormData((prev) => ({
                    ...prev,
                    [name]: value,
                }));
            }
        },
        []
    );

    return {
        formData,
        setFormData,
        isDirty,
        handleChange,
        // resetInitial,
    };
}