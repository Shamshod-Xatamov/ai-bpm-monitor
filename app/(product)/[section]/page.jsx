import { notFound } from "next/navigation";
import ModuleOverview from "@/components/app/ModuleOverview";
import { moduleOverviews } from "@/lib/module-overviews";

export async function generateMetadata({ params }) {
  const { section } = await params;
  const moduleConfig = moduleOverviews[section];

  return {
    title: moduleConfig
      ? `${moduleConfig.title} — AI-BPM Monitor`
      : "AI-BPM Monitor",
  };
}

export default async function ModulePage({ params }) {
  const { section } = await params;
  const moduleConfig = moduleOverviews[section];

  if (!moduleConfig) notFound();

  return <ModuleOverview module={moduleConfig} />;
}
