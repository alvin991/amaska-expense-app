import { useRef } from 'react';

/**
 * Generic numeric input behavior hook.
 * - Sanitizes input so it only contains digits and a single dot.
 * - Selects all text on focus.
 * - On blur, validates and optionally formats to fixed precision.
 *
 * Caller owns the string value state via `value` and `setValue`.
 */
export default function useNumericInput({
  value,
  setValue,
  format = {},
  error = {},
  events = {},
}) {
  const { precision = 2 } = format;
  const { setError, key: errorKey = 'amount', message: errorMessage = 'Amount must be numeric.' } = error;
  const { onChangeNumber, onBlurValidNumber, onBlurInvalidNumber } = events;
  const inputRef = useRef(null);

  const handleChange = (e) => {
    let v = e.target.value;
    // Remove everything except digits and dot
    v = v.replace(/[^0-9.]/g, '');
    // Allow at most one dot
    const parts = v.split('.');
    if (parts.length > 2) {
      v = parts[0] + '.' + parts.slice(1).join('');
    }

    setValue(v);

    if (onChangeNumber) {
      const num = Number(v);
      onChangeNumber(Number.isNaN(num) || v === '' ? null : num);
    }
  };

  const handleFocus = () => {
    // highlight entire value when focused via keyboard or programmatically
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      el.setSelectionRange(0, el.value.length);
    });
  };

  const handleMouseDown = (e) => {
    // Ensure mouse clicks also trigger our select-all behavior
    if (e.button !== 0) return; // only left-click
    e.preventDefault();
    const el = inputRef.current;
    if (el) {
      el.focus();
      // Immediately select all on mouse interaction as well
      el.setSelectionRange(0, el.value.length);
    }
  };

  const handleBlur = () => {
    const v = value;
    if (v === '' || v === null || v === undefined) return;

    const num = Number(v);
    if (Number.isNaN(num)) {
      setValue('');
      if (setError) {
        setError((prev) => ({ ...prev, [errorKey]: errorMessage }));
      }
      if (onBlurInvalidNumber) {
        onBlurInvalidNumber();
      }
      return;
    }

    const formatted = num.toFixed(precision);
    setValue(formatted);
    if (setError) {
      setError((prev) => ({ ...prev, [errorKey]: undefined }));
    }
    if (onBlurValidNumber) {
      onBlurValidNumber(num);
    }
  };

  return {
    inputRef,
    inputProps: {
        onChange: handleChange,
        onFocus: handleFocus,
        onBlur: handleBlur,
        onMouseDown: handleMouseDown,
    },
  };
}
