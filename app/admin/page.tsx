import { getAdminOverview } from "../../lib/backend/admin";
import AdminPanel from "./AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const overview = await getAdminOverview();
  return <AdminPanel initialOverview={overview} />;
}
