import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ConsultantDashboard() {
  const maybeStore = cookies();
  const cookieStore =
    typeof (maybeStore as any).then === "function" ? await (maybeStore as any) : (maybeStore as any);

  const role = cookieStore.get("role")?.value;

  if (role !== "CONSULTANT") {
    redirect("/login");
  }

  return <div className="p-6">CONSULTANT</div>;
}