"use client";
import { useState, useEffect, useTransition } from "react";
import { Plus, Trash2, Pencil, Eye, EyeOff, ChevronDown, RefreshCw, X, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  getCatalogAdmin,
  createCatalogCategory, updateCatalogCategory, deleteCatalogCategory,
  createCatalogItem, updateCatalogItem, deleteCatalogItem,
} from "@/server/catalog";
import type { CatalogKind } from "@prisma/client";

type Data = Awaited<ReturnType<typeof getCatalogAdmin>>;
type Item = Data[number]["items"][number];

const KINDS: { value: CatalogKind; label: string }[] = [
  { value: "PRODUCT", label: "Товари" },
  { value: "SERVICE", label: "Послуги" },
];

export default function CatalogAdminClient() {
  const [kind, setKind] = useState<CatalogKind>("PRODUCT");
  const [data, setData] = useState<Data>([]);
  const [loading, setLoading] = useState(true);
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Формы
  const [newCatName, setNewCatName] = useState("");
  const [editingItem, setEditingItem] = useState<(Partial<Item> & { categoryId: string }) | null>(null);
  const [editingCat, setEditingCat] = useState<{ id: string; name: string; note: string } | null>(null);

  async function load() {
    setLoading(true);
    try {
      setData(await getCatalogAdmin(kind));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [kind]);

  function run(fn: () => Promise<void>, msg: string) {
    startTransition(async () => {
      try {
        await fn();
        await load();
        toast.success(msg);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Помилка");
      }
    });
  }

  return (
    <div className="max-w-3xl px-5 py-6 md:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-widest text-muted/55">Управління</p>
          <h1 className="font-serif text-3xl font-light text-cream">Каталог</h1>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-cream">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Оновити
        </button>
      </div>

      {/* Переключатель товары/услуги */}
      <div className="mb-5 flex gap-2">
        {KINDS.map((k) => (
          <button
            key={k.value}
            onClick={() => { setKind(k.value); setOpenCat(null); }}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-all",
              kind === k.value
                ? "border-sage/30 bg-sage/15 text-sage"
                : "border-line text-muted hover:text-cream"
            )}
          >
            {k.label}
          </button>
        ))}
      </div>

      {/* Новая категория */}
      <div className="mb-5 flex gap-2">
        <input
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          placeholder="Новий розділ..."
          className="flex-1 rounded-xl border border-line bg-elevated px-4 py-2.5 text-sm text-cream outline-none transition-colors placeholder:text-muted/40 focus:border-sage/40"
        />
        <button
          disabled={isPending || !newCatName.trim()}
          onClick={() =>
            run(async () => {
              await createCatalogCategory({
                kind,
                name: newCatName.trim(),
                sortOrder: data.length,
              });
              setNewCatName("");
            }, "Розділ додано")
          }
          className="flex items-center gap-1.5 rounded-xl border border-sage/30 bg-sage/15 px-4 py-2.5 text-xs text-sage transition-all hover:bg-sage/25 disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
          Розділ
        </button>
      </div>

      {/* Категории */}
      <div className="space-y-2">
        {loading && !data.length && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-14 rounded-xl" />
        ))}
        {!loading && data.length === 0 && (
          <p className="py-12 text-center text-sm text-muted">Розділів ще немає</p>
        )}

        {data.map((cat) => {
          const open = openCat === cat.id;
          return (
            <div key={cat.id} className="overflow-hidden rounded-xl border border-line bg-surface">
              {/* Заголовок раздела */}
              <div className="flex items-center gap-2 px-4 py-3">
                <button
                  onClick={() => setOpenCat(open ? null : cat.id)}
                  className="flex flex-1 items-center gap-2 text-left"
                >
                  <ChevronDown className={cn("h-4 w-4 text-muted transition-transform", open && "rotate-180")} />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-cream">{cat.name}</p>
                    <p className="text-[10px] text-muted">{cat.items.length} позицій</p>
                  </div>
                </button>
                <button
                  onClick={() => setEditingCat({ id: cat.id, name: cat.name, note: cat.note ?? "" })}
                  className="text-muted transition-colors hover:text-cream"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (!confirm(`Видалити розділ "${cat.name}" з усіма позиціями?`)) return;
                    run(() => deleteCatalogCategory(cat.id), "Розділ видалено");
                  }}
                  className="text-muted transition-colors hover:text-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Редактирование раздела */}
              {editingCat?.id === cat.id && (
                <div className="space-y-2 border-t border-line px-4 py-3">
                  <input
                    value={editingCat.name}
                    onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                    placeholder="Назва розділу"
                    className="w-full rounded-xl border border-line bg-elevated px-3 py-2 text-sm text-cream outline-none focus:border-sage/40"
                  />
                  <textarea
                    rows={2}
                    value={editingCat.note}
                    onChange={(e) => setEditingCat({ ...editingCat, note: e.target.value })}
                    placeholder="Опис / умови розділу (необов'язково)"
                    className="w-full resize-none rounded-xl border border-line bg-elevated px-3 py-2 text-sm text-cream outline-none placeholder:text-muted/40 focus:border-sage/40"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        run(async () => {
                          await updateCatalogCategory(cat.id, {
                            name: editingCat.name,
                            note: editingCat.note,
                          });
                          setEditingCat(null);
                        }, "Збережено")
                      }
                      className="flex items-center gap-1.5 rounded-xl border border-sage/30 bg-sage/15 px-3 py-1.5 text-xs text-sage"
                    >
                      <Check className="h-3 w-3" /> Зберегти
                    </button>
                    <button
                      onClick={() => setEditingCat(null)}
                      className="flex items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-xs text-muted"
                    >
                      <X className="h-3 w-3" /> Скасувати
                    </button>
                  </div>
                </div>
              )}

              {/* Позиции */}
              {open && (
                <div className="border-t border-line">
                  {cat.items.map((it) => (
                    <div key={it.id} className="flex items-start gap-2 border-b border-line/60 px-4 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-sm", it.isActive ? "text-cream" : "text-muted/50 line-through")}>
                          {it.name}
                        </p>
                        {it.description && (
                          <p className="mt-0.5 line-clamp-2 whitespace-pre-line text-[11px] text-muted">
                            {it.description}
                          </p>
                        )}
                      </div>
                      {it.price && <span className="shrink-0 text-xs text-sage">{it.price}</span>}
                      <button
                        onClick={() => run(() => updateCatalogItem(it.id, { isActive: !it.isActive }), "Оновлено")}
                        className="text-muted transition-colors hover:text-cream"
                        title={it.isActive ? "Сховати" : "Показати"}
                      >
                        {it.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => setEditingItem({ ...it })}
                        className="text-muted transition-colors hover:text-cream"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (!confirm(`Видалити "${it.name}"?`)) return;
                          run(() => deleteCatalogItem(it.id), "Видалено");
                        }}
                        className="text-muted transition-colors hover:text-danger"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() =>
                      setEditingItem({ categoryId: cat.id, name: "", description: "", price: "", badge: "" })
                    }
                    className="flex w-full items-center justify-center gap-1.5 py-3 text-xs text-sage transition-colors hover:bg-elevated/50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Додати позицію
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Модалка позиции */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-line bg-surface p-5 sm:rounded-2xl">
            <p className="mb-4 font-serif text-xl font-light text-cream">
              {editingItem.id ? "Редагувати позицію" : "Нова позиція"}
            </p>
            <div className="space-y-3">
              <Field
                label="Назва"
                value={editingItem.name ?? ""}
                onChange={(v) => setEditingItem({ ...editingItem, name: v })}
              />
              <div>
                <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-muted/50">
                  Опис (необов'язково)
                </label>
                <textarea
                  rows={4}
                  value={editingItem.description ?? ""}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full resize-none rounded-xl border border-line bg-elevated px-4 py-3 text-sm text-cream outline-none focus:border-sage/40"
                />
              </div>
              <Field
                label="Ціна (текстом: 1250 грн / 1100 USD / 900 грн за годину)"
                value={editingItem.price ?? ""}
                onChange={(v) => setEditingItem({ ...editingItem, price: v })}
              />
              <Field
                label="Позначка (напр. «тимчасово недоступно»)"
                value={editingItem.badge ?? ""}
                onChange={(v) => setEditingItem({ ...editingItem, badge: v })}
              />
            </div>

            <div className="mt-5 flex gap-2">
              <button
                disabled={isPending || !editingItem.name?.trim()}
                onClick={() =>
                  run(async () => {
                    if (editingItem.id) {
                      await updateCatalogItem(editingItem.id, {
                        name: editingItem.name!,
                        description: editingItem.description ?? "",
                        price: editingItem.price ?? "",
                        badge: editingItem.badge ?? "",
                      });
                    } else {
                      const cat = data.find((c) => c.id === editingItem.categoryId);
                      await createCatalogItem({
                        categoryId: editingItem.categoryId,
                        name: editingItem.name!,
                        description: editingItem.description || undefined,
                        price: editingItem.price || undefined,
                        badge: editingItem.badge || undefined,
                        isActive: true,
                        sortOrder: cat?.items.length ?? 0,
                      });
                    }
                    setEditingItem(null);
                  }, "Збережено")
                }
                className="flex-1 rounded-xl bg-sage py-3 text-sm font-medium text-base disabled:opacity-40"
              >
                Зберегти
              </button>
              <button
                onClick={() => setEditingItem(null)}
                className="rounded-xl border border-line px-5 py-3 text-sm text-muted"
              >
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-muted/50">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-elevated px-4 py-3 text-sm text-cream outline-none focus:border-sage/40"
      />
    </div>
  );
}
