import { getVenues } from "@/server/menu";
import { HeroSection } from "@/components/client/HeroSection";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { table?: string };
}) {
  const venues = await getVenues();
  return <HeroSection venues={venues} tableCode={searchParams.table ?? null} />;
}
