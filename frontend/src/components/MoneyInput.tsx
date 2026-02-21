import * as React from "react";

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: number | string;
  onChange: (value: number) => void;
}

export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ value, onChange, className, style, onFocus, onBlur, ...props }, ref) => {
    const [localValue, setLocalValue] = React.useState(value ? value.toString() : "");

    // Sync from parent when value changes externally (e.g. form reset)
    React.useEffect(() => {
      const numericLocal = parseFloat(localValue.replace(/,/g, ""));
      const numericProps = typeof value === "string" ? parseFloat(value) : value;
      if (!isNaN(numericProps) && numericProps !== numericLocal && localValue !== "") {
        setLocalValue(numericProps.toString());
      } else if (!value && localValue !== "") {
        setLocalValue("");
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;
      // Strip everything except digits and decimal point
      val = val.replace(/[^0-9.]/g, "");
      // Prevent multiple decimal points
      const parts = val.split(".");
      if (parts.length > 2) val = parts[0] + "." + parts.slice(1).join("");
      // Lock to 2 decimal places
      if (val.includes(".")) {
        const [int, dec] = val.split(".");
        val = `${int}.${dec.slice(0, 2)}`;
      }
      setLocalValue(val);
      const parsed = parseFloat(val);
      onChange(isNaN(parsed) ? 0 : parsed);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      const parsed = parseFloat(localValue.replace(/,/g, ""));
      if (!isNaN(parsed)) setLocalValue(parsed.toString());
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const parsed = parseFloat(localValue.replace(/,/g, ""));
      if (!isNaN(parsed)) {
        setLocalValue(parsed.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        onChange(parsed);
      } else {
        setLocalValue("");
        onChange(0);
      }
      onBlur?.(e);
    };

    return (
      <div
        className="flex items-center rounded-md border overflow-hidden"
        style={{
          backgroundColor: "var(--surface-raised)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* $ prefix — flex child, perfectly centred */}
        <span
          className="flex items-center justify-center h-9 px-2.5 text-sm font-bold font-mono border-r select-none flex-shrink-0"
          style={{
            color: "var(--fortress-steel)",
            borderColor: "var(--border-subtle)",
            backgroundColor: "var(--surface)",
          }}
        >
          $
        </span>

        <input
          {...props}
          ref={ref}
          type="text"
          inputMode="decimal"
          value={localValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`flex-1 h-9 px-2 bg-transparent text-sm font-mono font-bold tracking-wide outline-none min-w-0 ${className || ""}`}
          style={{
            color: "var(--text-primary)",
            ...style,
          }}
        />
      </div>
    );
  }
);

MoneyInput.displayName = "MoneyInput";