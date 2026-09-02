import UsersManagement from "@/components/users/UsersManagement";
import { getCurrentUser } from "@/lib/server/auth/session";

export const metadata = {
  title: "Foydalanuvchilar — AI-BPM Monitor",
  description: "Foydalanuvchilar, rollar va platformaga kirish boshqaruvi.",
};

export default async function UsersPage() {
  const user = await getCurrentUser();
  return <UsersManagement currentUser={user} />;
}
