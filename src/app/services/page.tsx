import type { Metadata } from "next";
import { getCatalog } from "@/server/catalog";
import { CatalogView } from "@/components/client/CatalogView";

export const metadata: Metadata = { title: "Послуги · Dry Leaf" };
export const dynamic = "force-dynamic";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: { table?: string };
}) {
  const categories = await getCatalog("SERVICE");
  const back = searchParams.table ? `/?table=${searchParams.table}` : "/";

  return (
    <CatalogView
      title="Послуги"
      subtitle="Навчання, сертифікати, клубні програми"
      accentColor="#A8B89A"
      categories={categories}
      backHref={back}
    />
  );
}
