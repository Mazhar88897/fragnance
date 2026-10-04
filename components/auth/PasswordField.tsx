"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type PasswordFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
};

export default function PasswordField({
  label,
  name,
  value,
  onChange,
  autoComplete = "current-password",
  required = true,
  minLength,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="mt-8 block">
      <span className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[#8c857c]">
        {label}
      </span>
      <span className="relative mt-3 block border-b border-[#cfc8bf] focus-within:border-[#1c2118]">
        <input
          type={visible ? "text" : "password"}
          name={name}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border-0 bg-transparent pb-2 pr-10 text-[1rem] text-[#1c2118] outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((open) => !open)}
          className="absolute top-1/2 right-0 -translate-y-1/2 pb-2 text-[#8c857c] transition-colors hover:text-[#1c2118]"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </span>
    </label>
  );
}
