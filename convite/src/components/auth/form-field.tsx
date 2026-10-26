import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormFieldProps = Omit<ComponentProps<typeof Input>, "name"> & {
  name: string;
  label: string;
  hint?: string;
  error?: string[];
};

export function FormField({ label, hint, error, id, name, ...props }: FormFieldProps) {
  const fieldId = id ?? name;
  const message = error?.[0];
  const describedBy = message ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={fieldId}>{label}</Label>
      <Input
        id={fieldId}
        name={name}
        aria-invalid={message ? true : undefined}
        aria-describedby={describedBy}
        className="h-11 bg-white"
        {...props}
      />
      {message ? (
        <p id={`${fieldId}-error`} className="text-sm text-red-700">
          {message}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="text-sm text-[#1F1B33]/60">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
