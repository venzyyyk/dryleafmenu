"use server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { CatalogKind } from "@prisma/client";
import { z } from "zod";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  return session;
}

// ─── Публічне читання ──────────────────────────────────────
export async function getCatalog(kind: CatalogKind) {
  return prisma.catalogCategory.findMany({
    where: { kind },
    orderBy: { sortOrder: "asc" },
    include: {
      items: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

// ─── Для адмінки (з прихованими позиціями) ────────────────
export async function getCatalogAdmin(kind: CatalogKind) {
  await requireAdmin();
  return prisma.catalogCategory.findMany({
    where: { kind },
    orderBy: { sortOrder: "asc" },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
}

// ─── Категорії ─────────────────────────────────────────────
const CategorySchema = z.object({
  kind: z.enum(["PRODUCT", "SERVICE"]),
  name: z.string().min(1).max(120),
  note: z.string().max(400).optional(),
  sortOrder: z.number().int().default(0),
});

export async function createCatalogCategory(raw: z.infer<typeof CategorySchema>) {
  await requireAdmin();
  const data = CategorySchema.parse(raw);
  await prisma.catalogCategory.create({
    data: { ...data, note: data.note || null },
  });
  revalidateCatalog();
}

export async function updateCatalogCategory(
  id: string,
  raw: Partial<Omit<z.infer<typeof CategorySchema>, "kind">>
) {
  await requireAdmin();
  await prisma.catalogCategory.update({
    where: { id },
    data: {
      ...(raw.name !== undefined ? { name: raw.name } : {}),
      ...(raw.note !== undefined ? { note: raw.note || null } : {}),
      ...(raw.sortOrder !== undefined ? { sortOrder: raw.sortOrder } : {}),
    },
  });
  revalidateCatalog();
}

export async function deleteCatalogCategory(id: string) {
  await requireAdmin();
  await prisma.catalogCategory.delete({ where: { id } });
  revalidateCatalog();
}

// ─── Позиції ───────────────────────────────────────────────
const ItemSchema = z.object({
  categoryId: z.string().cuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(1500).optional(),
  price: z.string().max(80).optional(),
  badge: z.string().max(80).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export async function createCatalogItem(raw: z.infer<typeof ItemSchema>) {
  await requireAdmin();
  const data = ItemSchema.parse(raw);
  await prisma.catalogItem.create({
    data: {
      ...data,
      description: data.description || null,
      price: data.price || null,
      badge: data.badge || null,
    },
  });
  revalidateCatalog();
}

export async function updateCatalogItem(
  id: string,
  raw: Partial<Omit<z.infer<typeof ItemSchema>, "categoryId">>
) {
  await requireAdmin();
  await prisma.catalogItem.update({
    where: { id },
    data: {
      ...(raw.name !== undefined ? { name: raw.name } : {}),
      ...(raw.description !== undefined ? { description: raw.description || null } : {}),
      ...(raw.price !== undefined ? { price: raw.price || null } : {}),
      ...(raw.badge !== undefined ? { badge: raw.badge || null } : {}),
      ...(raw.isActive !== undefined ? { isActive: raw.isActive } : {}),
      ...(raw.sortOrder !== undefined ? { sortOrder: raw.sortOrder } : {}),
    },
  });
  revalidateCatalog();
}

export async function deleteCatalogItem(id: string) {
  await requireAdmin();
  await prisma.catalogItem.delete({ where: { id } });
  revalidateCatalog();
}

function revalidateCatalog() {
  revalidatePath("/shop");
  revalidatePath("/services");
  revalidatePath("/admin/catalog");
}
