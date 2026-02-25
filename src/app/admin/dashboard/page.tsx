import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const maybeStore = cookies();
  const cookieStore =
    typeof (maybeStore as any).then === "function" ? await (maybeStore as any) : (maybeStore as any);

  const role = cookieStore.get("role")?.value;

  if (role !== "ADMIN") {
    redirect("/login");
  }

  return <div className="p-6">ADMIN</div>;
}