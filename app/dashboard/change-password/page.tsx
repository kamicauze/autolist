import { SellerPageHeader, SellerSurface } from "@/components/dashboard/seller-dashboard-ui";
import { ChangePasswordForm } from "@/components/dashboard/change-password/change-password-form";

export default function ChangePasswordPage() {
  return (
    <div className="space-y-6 lg:space-y-7">
      <SellerPageHeader
        title="Change Password"
        description="Update your account credentials separately from the public seller profile information."
      />

      <SellerSurface className="max-w-3xl p-5 lg:p-6">
        <ChangePasswordForm />
      </SellerSurface>
    </div>
  );
}
