import { AuthModalShell } from "@/components/auth/auth-modal-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthModalShell
      title="Reset Password"
      imageAlt="Reset password"
      imageSrc="/sample-car-1.jpg"
      className="max-w-3xl md:grid-cols-[320px_1fr]"
    >
      <ResetPasswordForm />
    </AuthModalShell>
  );
}
