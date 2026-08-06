"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  badge: string | null;
};
type Category = {
  id: string;
  name: string;
  note: string | null;
  items: Item[];
};

interface Props {
  title: string;
  subtitle: string;
  accentColor: string;
  categories: Category[];
  backHref: string;
}

export function CatalogView({ title, subtitle, accentColor, categories, backHref }: Props) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories
      .map((c) => ({
        ...c,
        items: q
          ? c.items.filter(
              (i) =>
                i.name.toLowerCase().includes(q) ||
                (i.description ?? "").toLowerCase().includes(q)
            )
          : c.items,
      }))
      .filter((c) => c.items.length > 0)
      .filter((c) => (activeCat && !q ? c.id === activeCat : true));
  }, [categories, query, activeCat]);

  return (
    <div className="min-h-screen bg-base">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-line">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link
            href={backHref}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-elevated text-muted transition-colors hover:text-cream"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-base font-light text-cream">{title}</p>
            <p className="truncate text-[10px] text-muted">{subtitle}</p>
          </div>
        </div>

        {/* Поиск */}
        <div className="mx-auto max-w-3xl px-4 pb-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Пошук..."
              className="w-full rounded-xl border border-line bg-elevated py-2.5 pl-9 pr-3 text-sm text-cream outline-none transition-colors placeholder:text-muted/40 focus:border-sage/40"
            />
          </div>
        </div>

        {/* Категории */}
        {categories.length > 1 && (
          <div className="scrollbar-hide mx-auto flex max-w-3xl gap-2 overflow-x-auto px-4 pb-3">
            <button
              onClick={() => setActiveCat(null)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-xs transition-all",
                !activeCat ? "font-medium" : "border-line text-muted hover:text-cream"
              )}
              style={
                !activeCat
                  ? { background: accentColor + "20", borderColor: accentColor + "60", color: accentColor }
                  : {}
              }
            >
              Усе
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id === activeCat ? null : c.id)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-xs transition-all",
                  activeCat === c.id ? "font-medium" : "border-line text-muted hover:text-cream"
                )}
                style={
                  activeCat === c.id
                    ? { background: accentColor + "20", borderColor: accentColor + "60", color: accentColor }
                    : {}
                }
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Контент */}
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-6 pb-24">
        {filtered.length === 0 && (
          <p className="py-16 text-center text-sm text-muted">Нічого не знайдено</p>
        )}

        <AnimatePresence initial={false}>
          {filtered.map((cat) => (
            <motion.section
              key={cat.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <div className="mb-3">
                <h2 className="font-serif text-xl font-light text-cream">{cat.name}</h2>
                {cat.note && (
                  <p className="mt-1 whitespace-pre-line text-[11px] leading-relaxed text-muted/70">
                    {cat.note}
                  </p>
                )}
                <div
                  className="mt-2.5 h-px w-14"
                  style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
                />
              </div>

              <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
                {cat.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 px-4 py-3.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm text-cream">{item.name}</p>
                        {item.badge && (
                          <span
                            className="rounded-md px-1.5 py-0.5 text-[9px] uppercase tracking-wide"
                            style={{ background: accentColor + "1F", color: accentColor }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-muted">
                          {item.description}
                        </p>
                      )}
                    </div>
                    {item.price && (
                      <span
                        className="shrink-0 whitespace-nowrap font-serif text-base font-light"
                        style={{ color: accentColor }}
                      >
                        {item.price}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.section>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
