import { AuthModalShell } from "@/components/auth/auth-modal-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthModalShell
      title="Forgot Password"
      imageAlt="Forgot password"
      imageSrc="/sample-car-4.jpg"
      className="max-w-3xl md:grid-cols-[320px_1fr]"
    >
      <ForgotPasswordForm />
    </AuthModalShell>
  );
}
