import {
  Database,
  ExternalLink,
  FileStack,
  FolderOpen,
  Layers3,
} from "lucide-react";
import {
  AdminPageHeader,
  AdminSectionCard,
  adminGhostButtonClass,
} from "@/components/admin/admin-ui";

const DRIVE_FOLDER_URL =
  "https://drive.google.com/drive/folders/1XxsCn6wAfyo5nlZTCryTILiVJqi7m92w";

const resources = [
  {
    title: "Autolist complete documentation",
    description:
      "Internal documentation index covering legal, finance, people, and operating material.",
    href: "https://docs.google.com/document/d/1DnDO62kJiMSlPTvkrp7NtPv48P6gqJJz/edit",
    icon: FileStack,
  },
  {
    title: "Database schema design",
    description:
      "Internal PostgreSQL schema reference. Treat the deployed Supabase schema and committed migrations as authoritative when they differ.",
    href: "https://docs.google.com/document/d/1WnqmHBeiwQBfg3xrEVm8JI7yeQ4u4v8z/edit",
    icon: Database,
  },
  {
    title: "Autolist tiers",
    description:
      "Product and pricing source for private-seller and dealer tier strategy. Current implementation reflects supported dealer plan fields only.",
    href: "https://docs.google.com/document/d/1SI8dWiZzKRvAScfpxHn7RYlFs6XIXZlp/edit",
    icon: Layers3,
  },
];

export default function AdminResourcesPage() {
  return (
    <div className="space-y-7">
      <AdminPageHeader
        title="Internal Resources"
        action={
          <a
            href={DRIVE_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={adminGhostButtonClass}
          >
            <FolderOpen className="h-4 w-4" />
            Open source folder
          </a>
        }
      />

      <div className="rounded-[16px] border border-amber-200 bg-amber-50 px-5 py-4 text-[13px] leading-6 text-amber-900">
        These links are available only inside the authenticated admin area. Private contracts—including
        employment, NDA, IP assignment, vendor, and data-processing agreements—are intentionally not
        surfaced here.
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {resources.map((resource) => (
          <AdminSectionCard
            key={resource.title}
            title={resource.title}
            description={resource.description}
            className="h-full"
            bodyClassName="flex h-full flex-col justify-between gap-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-tint text-primary">
              <resource.icon className="h-5 w-5" />
            </div>
            <a
              href={resource.href}
              target="_blank"
              rel="noopener noreferrer"
              className={adminGhostButtonClass}
            >
              Open in Google Drive
              <ExternalLink className="h-4 w-4" />
            </a>
          </AdminSectionCard>
        ))}
      </div>
    </div>
  );
}
