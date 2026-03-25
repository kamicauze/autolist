import { ChangePasswordForm } from "@/components/dashboard/change-password/change-password-form";

export default function ChangePasswordPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Update your password to keep your account secure.
      </p>

      <div className="mt-8 max-w-lg">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
