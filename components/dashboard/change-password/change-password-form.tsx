"use client";

import * as React from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sellerInputClass, sellerLabelClass } from "../seller-dashboard-ui";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from your current password.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const PasswordField = ({
    id,
    label,
    value,
    setValue,
    open,
    setOpen,
    placeholder,
  }: {
    id: string;
    label: string;
    value: string;
    setValue: (value: string) => void;
    open: boolean;
    setOpen: (value: boolean) => void;
    placeholder: string;
  }) => (
    <div>
      <label htmlFor={id} className={sellerLabelClass}>
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a8a8a]" />
        <input
          id={id}
          type={open ? "text" : "password"}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className={`${sellerInputClass} pl-11 pr-11`}
          required
        />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8a8a8a] transition hover:text-[#202224]"
        >
          {open ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? (
        <div className="rounded-[18px] border border-[#ffd9d6] bg-[#fff3f2] px-4 py-3 text-[14px] text-[#d92d20]">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-[18px] border border-[#d1fadf] bg-[#eefaf2] px-4 py-3 text-[14px] text-[#2f9e63]">
          Password updated successfully.
        </div>
      ) : null}

      <PasswordField
        id="current-password"
        label="Current Password"
        value={currentPassword}
        setValue={setCurrentPassword}
        open={showCurrent}
        setOpen={setShowCurrent}
        placeholder="Enter current password"
      />

      <PasswordField
        id="new-password"
        label="New Password"
        value={newPassword}
        setValue={setNewPassword}
        open={showNew}
        setOpen={setShowNew}
        placeholder="Enter new password"
      />

      <PasswordField
        id="confirm-password"
        label="Confirm Password"
        value={confirmPassword}
        setValue={setConfirmPassword}
        open={showConfirm}
        setOpen={setShowConfirm}
        placeholder="Confirm new password"
      />

      <div className="rounded-[18px] border border-[#ededed] bg-[#faf9f7] p-4">
        <p className="text-[13px] font-semibold text-[#202224]">Password requirements</p>
        <ul className="mt-3 space-y-2 text-[13px] text-[#777]">
          <li>At least 8 characters</li>
          <li>Use a unique password for this seller account</li>
          <li>Keep it different from the previous password</li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 items-center justify-center rounded-[14px] bg-primary px-5 text-[14px] font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
