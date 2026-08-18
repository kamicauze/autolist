import Link from "next/link";
import { BellRing, ListChecks, Mail } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";
import { ListingAlertsManager } from "@/components/alerts/listing-alerts-manager";
import { getListingAlertsPageData } from "@/lib/data/listing-alerts";

const alertSteps = [
  {
    icon: BellRing,
    title: "Save your search",
    description: "Choose a category and the details that matter to you.",
  },
  {
    icon: Mail,
    title: "Get a real match",
    description: "See it in Notifications and optionally receive an email.",
  },
  {
    icon: ListChecks,
    title: "Stay in control",
    description: "Edit, pause, resume, or delete saved alerts from this page.",
  },
];

export default async function AlertsPage() {
  const data = await getListingAlertsPageData();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-white">
        <PageHero
          label="LISTING ALERTS"
          heading="Get notified when the right listing becomes available"
        >
          {data.viewer ? (
            <ListingAlertsManager
              initialAlerts={data.alerts}
              viewerEmail={data.viewer.email}
              initialError={data.error}
            />
          ) : (
            <div className="mx-auto w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-xl sm:p-9">
              <BellRing className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-4 text-xl font-semibold text-gray-950">
                Sign in to save listing alerts
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
                Your alerts are private to your account, so you can safely manage them and
                review every match later.
              </p>
              <Button asChild className="mt-6">
                <Link href="/login?next=/alerts">Sign in to create an alert</Link>
              </Button>
            </div>
          )}
        </PageHero>

        <section className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            How listing alerts work
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {alertSteps.map((step) => (
              <div
                key={step.title}
                className="rounded-xl border border-gray-200 bg-white p-5 text-center"
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
