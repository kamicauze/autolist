import type { ReactNode } from "react";

interface SalesRepLayoutProps {
  children: ReactNode;
}

export default async function SalesRepLayout({ children }: SalesRepLayoutProps) {
  return children;
}
