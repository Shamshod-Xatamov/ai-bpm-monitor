import AppShell from "@/components/app/AppShell";

export const metadata = {
  title: "Boshqaruv markazi — AI-BPM Monitor",
  description: "Biznes jarayonlari uchun AI asosidagi boshqaruv markazi.",
};

export default function ProductLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}
