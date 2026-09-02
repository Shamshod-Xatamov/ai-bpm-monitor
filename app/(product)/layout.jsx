import AppShell from "@/components/app/AppShell";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/auth/session";

export const metadata = {
  title: "Boshqaruv markazi — AI-BPM Monitor",
  description: "Biznes jarayonlari uchun AI asosidagi boshqaruv markazi.",
};

export default async function ProductLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <AppShell currentUser={user}>{children}</AppShell>;
}
