import ProcessRegistry from "@/components/processes/ProcessRegistry";

export const metadata = {
  title: "Biznes jarayonlari — AI-BPM Monitor",
  description:
    "Tashkilotdagi biznes jarayonlari reyestri, bosqichlari va SLA holati.",
};

export default function ProcessesPage() {
  return <ProcessRegistry />;
}
