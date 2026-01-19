import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import useFormData from "./useFormData";
import useNumericInput from "./useNumericInput";
import useCategoryPicker from './useCategoryListPicker';

export interface Transaction {
    transaction_id?: number;
    category_description?: string;
    category_id?: number;
    category_name?: string;
    merchant?: string;
    notes?: string;
    payment_method_description?: string;
    payment_method_id?: number;
    payment_method_name?: string;
    projected_amount?: number;
    amount: number;
    projected_transaction_date?: string;
    transaction_date?: string;
    recurring_template_id?: number | null;
}

export default function useTransactionFormNew(
    initialData: Transaction,
    onDirtyChange: (isDirty: boolean) => void,
    navigation: object,
    currentParams: { selectedCategoryId?: number },
    formDataDraft: Transaction,
    setFormDataDraft: React.Dispatch<React.SetStateAction<Transaction>>,
) {

    const [errors, setErrors] = useState({});

    const { formData,
        setFormData,
        isDirty,
        handleChange
    } = useFormData(initialData, onDirtyChange, ['amount']);

    const {
        inputRef: amountInputRef,
        inputProps: amountInputHandlers
    } = useNumericInput({
        value: formData.amount,
        setValue: (v: number) => setFormData((prev) => ({ ...prev, amount: v })),
        format: { precision: 2, allowNegative: true },
        error: {
            setError: setErrors,
            key: 'amount',
            message: 'Amount must be numeric.',
        },
    });

    useEffect(() => {
        if (amountInputRef.current) {
            (amountInputRef.current as HTMLInputElement).focus();
        }
    }, []);

    // Computed: lock fields if transaction is system-generated (from recurring_template)
    // If transaction_id is missing, it's a new transaction (not system-generated)
    const isSystemGenerated = useMemo(() => {
        if (!initialData || !initialData.transaction_id) return false;
        return initialData.recurring_template_id !== null && initialData.recurring_template_id !== undefined;
    }, [initialData?.transaction_id, initialData?.recurring_template_id]);

    const { openCategoryList } = useCategoryPicker(navigation, currentParams, formData, setFormData, 'category_id', setFormDataDraft);

    // On first mount, restore formData from draft if available
    React.useEffect(() => {
        if (formDataDraft) {
            setFormData(formDataDraft);
        }
        // Only run on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formDataDraft]);

    return {
        formData,
        setFormData,
        isDirty,
        handleChange,
        amountInputRef,
        amountInputHandlers,
        errors,
        setErrors,
        isSystemGenerated,
        openCategoryList
    };
}