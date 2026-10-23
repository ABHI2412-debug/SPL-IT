import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/app-shell";

const spaces = ["trip", "local"] as const;

export function generateStaticParams() {
  return [{ space: "trip" }, { space: "local" }];
}

export default async function SpacePage({
  params,
}: {
  params: Promise<{ space: string }>;
}) {
  const { space } = await params;
  console.log("[Route /[space]] Invoked with space param:", space);
  if (!spaces.includes(space as (typeof spaces)[number])) {
    console.log("[Route /[space]] Unknown space:", space, "-> calling notFound()");
    notFound();
  }
  return <DashboardShell initialSpace={space as "trip" | "local"} />;
}
// Turbopack rebuild trigger
