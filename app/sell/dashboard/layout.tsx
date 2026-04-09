import type { ReactNode } from "react";
import { SalesRepDashboardLayout } from "@/components/seller/sales-rep-dashboard";

interface SalesRepLayoutProps {
  children: ReactNode;
}

export default function SalesRepLayout({ children }: SalesRepLayoutProps) {
  return <SalesRepDashboardLayout>{children}</SalesRepDashboardLayout>;
}
