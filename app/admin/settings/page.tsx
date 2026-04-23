import { AdminSettingsLive } from "@/components/admin/admin-settings-live";
import { requireAdminPage } from "@/lib/admin/guard";
import { getPlatformSettingsData } from "@/lib/data/platform-settings";

export default async function AdminSettingsRoute() {
  const { supabase } = await requireAdminPage("/admin/settings");
  const { settings, schemaReady } = await getPlatformSettingsData(supabase);

  return <AdminSettingsLive initialSettings={settings} schemaReady={schemaReady} />;
}
