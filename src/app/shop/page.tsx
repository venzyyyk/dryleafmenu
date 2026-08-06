import type { Metadata } from "next";
import { getCatalog } from "@/server/catalog";
import { CatalogView } from "@/components/client/CatalogView";

export const metadata: Metadata = { title: "Товари · Dry Leaf" };
export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { table?: string };
}) {
  const categories = await getCatalog("PRODUCT");
  const back = searchParams.table ? `/?table=${searchParams.table}` : "/";

  return (
    <CatalogView
      title="Товари"
      subtitle="Більярдний магазин"
      accentColor="#C9A86A"
      categories={categories}
      backHref={back}
    />
  );
}
