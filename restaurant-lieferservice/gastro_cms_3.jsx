import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Star,
  Clock3,
  Truck,
  BadgePercent,
  Flame,
  Heart,
  X,
  ChevronDown,
  Utensils,
  Sparkles,
  Scan,
  PlayCircle,
  ArrowRight,
} from "lucide-react";

/**
 * Gastro CMS 3.0 – Restaurant Listing UI
 * - Single-file React component
 * - TailwindCSS required
 * - Mock data included (replace with your API)
 *
 * Innovations included (no Push):
 * - Live Activity (simulated)
 * - Stories (restaurant highlights in a story drawer)
 * - Dynamic recommendations ("Für dich")
 * - AR Menu teaser (demo drawer)
 * - Cross-promotion ("Auch beliebt" in preview)
 */

// Brand gradient (matches gastro-cms.at hero vibe)
const BRAND_GRAD =
  "bg-[linear-gradient(90deg,#2F6BFF_0%,#7C3AED_45%,#FF4D8D_75%,#FFB020_100%)]";

const CATEGORIES = [
  { key: "all", label: "Alles", icon: Utensils },
  { key: "pizza", label: "Pizza" },
  { key: "burger", label: "Burger" },
  { key: "sushi", label: "Sushi" },
  { key: "indian", label: "Indisch" },
  { key: "kebab", label: "Kebab" },
  { key: "asian", label: "Asiatisch" },
  { key: "dessert", label: "Dessert" },
  { key: "healthy", label: "Healthy" },
];

const SORTS = [
  { key: "recommended", label: "Empfohlen" },
  { key: "rating", label: "Beste Bewertung" },
  { key: "deliveryTime", label: "Schnellste Lieferung" },
  { key: "deliveryFee", label: "Günstigste Lieferung" },
  { key: "minOrder", label: "Niedrigster Mindestbestellwert" },
  { key: "live", label: "Gerade beliebt" },
];

const MOCK_RESTAURANTS = [
  {
    id: "r1",
    name: "Trattoria Napoli",
    brand: "pizza",
    cuisines: ["Italienisch", "Pizza", "Pasta"],
    rating: 4.7,
    ratingCount: 1240,
    deliveryTimeMin: 25,
    deliveryTimeMax: 40,
    deliveryFee: 2.49,
    minOrder: 12,
    distanceKm: 1.2,
    isOpen: true,
    isSponsored: true,
    isHot: true,
    promo: "-20% auf Klassiker",
    tags: ["Beliebt", "Holzofen"],
    popularItems: ["Margherita", "Diavola", "Carbonara"],
    hasAR: true,
    baseLive: 8,
    stories: [
      {
        title: "Holzofen-Hype",
        subtitle: "Margherita + Dip",
        image:
          "https://images.unsplash.com/photo-1548365328-8b849e6f0e9b?auto=format&fit=crop&w=1200&q=80",
      },
      {
        title: "Deal",
        subtitle: "-20% auf Klassiker",
        image:
          "https://images.unsplash.com/photo-1601924638867-3ec9b1f6d01e?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    image:
      "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "r2",
    name: "BurgerWerk 1130",
    brand: "burger",
    cuisines: ["Burger", "American", "Fries"],
    rating: 4.4,
    ratingCount: 830,
    deliveryTimeMin: 20,
    deliveryTimeMax: 35,
    deliveryFee: 1.99,
    minOrder: 15,
    distanceKm: 2.4,
    isOpen: true,
    isSponsored: false,
    isHot: false,
    promo: "Gratis Fries ab 25€",
    tags: ["Smash", "Haus-Sauce"],
    popularItems: ["Smash Classic", "Truffle Fries", "BBQ Bacon"],
    hasAR: false,
    baseLive: 5,
    stories: [
      {
        title: "Smash-Time",
        subtitle: "Knusprig & juicy",
        image:
          "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=1200&q=80",
      },
      {
        title: "Deal",
        subtitle: "Gratis Fries ab 25€",
        image:
          "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "r3",
    name: "Sakura Sushi",
    brand: "sushi",
    cuisines: ["Sushi", "Japanisch", "Bowls"],
    rating: 4.8,
    ratingCount: 560,
    deliveryTimeMin: 35,
    deliveryTimeMax: 55,
    deliveryFee: 3.49,
    minOrder: 18,
    distanceKm: 3.7,
    isOpen: true,
    isSponsored: false,
    isHot: true,
    promo: "2=1 Maki Deal",
    tags: ["Premium", "Frisch"],
    popularItems: ["Dragon Roll", "Salmon Maki", "Poke Bowl"],
    hasAR: true,
    baseLive: 7,
    stories: [
      {
        title: "2=1 Maki",
        subtitle: "Heute mega beliebt",
        image:
          "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=80",
      },
      {
        title: "Chef’s Choice",
        subtitle: "Dragon Roll",
        image:
          "https://images.unsplash.com/photo-1617196034183-421b4917c92c?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    image:
      "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "r4",
    name: "Delhi Spice",
    brand: "indian",
    cuisines: ["Indisch", "Curry", "Vegetarisch"],
    rating: 4.2,
    ratingCount: 410,
    deliveryTimeMin: 30,
    deliveryTimeMax: 50,
    deliveryFee: 0.0,
    minOrder: 14,
    distanceKm: 2.9,
    isOpen: true,
    isSponsored: false,
    isHot: false,
    promo: "Lieferung gratis",
    tags: ["Vegan", "Scharf"],
    popularItems: ["Butter Chicken", "Chana Masala", "Naan"],
    hasAR: false,
    baseLive: 4,
    stories: [
      {
        title: "Gratis Lieferung",
        subtitle: "Heute aktiv",
        image:
          "https://images.unsplash.com/photo-1604908177225-1db9f0db3b7a?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    image:
      "https://images.unsplash.com/photo-1604908177225-1db9f0db3b7a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "r5",
    name: "Kebab & Co",
    brand: "kebab",
    cuisines: ["Kebab", "Türkisch", "Grill"],
    rating: 4.1,
    ratingCount: 980,
    deliveryTimeMin: 15,
    deliveryTimeMax: 25,
    deliveryFee: 1.49,
    minOrder: 10,
    distanceKm: 0.9,
    isOpen: false,
    isSponsored: false,
    isHot: false,
    promo: "",
    tags: ["Schnell"],
    popularItems: ["Döner", "Dürüm", "Falafel"],
    hasAR: false,
    baseLive: 2,
    stories: [],
    image:
      "https://images.unsplash.com/photo-1625944228741-cf30983ec5d0?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "r6",
    name: "Green Bowl Lab",
    brand: "healthy",
    cuisines: ["Healthy", "Bowls", "Salate"],
    rating: 4.6,
    ratingCount: 290,
    deliveryTimeMin: 20,
    deliveryTimeMax: 35,
    deliveryFee: 2.99,
    minOrder: 16,
    distanceKm: 1.8,
    isOpen: true,
    isSponsored: true,
    isHot: false,
    promo: "-10% ab 2 Bowls",
    tags: ["Protein", "Fresh"],
    popularItems: ["Chicken Bowl", "Avocado Mix", "Protein Shake"],
    hasAR: true,
    baseLive: 6,
    stories: [
      {
        title: "-10% ab 2 Bowls",
        subtitle: "Meal Prep Mode",
        image:
          "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "r7",
    name: "Sweet Corner",
    brand: "dessert",
    cuisines: ["Dessert", "Waffeln", "Shakes"],
    rating: 4.3,
    ratingCount: 150,
    deliveryTimeMin: 25,
    deliveryTimeMax: 45,
    deliveryFee: 2.49,
    minOrder: 12,
    distanceKm: 2.1,
    isOpen: true,
    isSponsored: false,
    isHot: false,
    promo: "Gratis Topping",
    tags: ["Neu"],
    popularItems: ["Waffel", "Milkshake", "Brownie"],
    hasAR: false,
    baseLive: 3,
    stories: [
      {
        title: "Gratis Topping",
        subtitle: "Waffel + Shake",
        image:
          "https://images.unsplash.com/photo-1511381939415-c1e00fdcde0d?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    image:
      "https://images.unsplash.com/photo-1511381939415-c1e00fdcde0d?auto=format&fit=crop&w=1200&q=80",
  },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function moneyEUR(n) {
  const v = Number(n || 0);
  return v === 0 ? "0,00 €" : v.toFixed(2).replace(".", ",") + " €";
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h);
}

function RatingPill({ rating, count }) {
  const r = clamp(rating, 0, 5);
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-zinc-900/90 px-2 py-1 text-xs font-semibold text-white shadow">
      <Star className="h-3.5 w-3.5" />
      <span>{r.toFixed(1)}</span>
      <span className="text-white/70">({count})</span>
    </div>
  );
}

function LivePill({ count }) {
  if (!count || count <= 0) return null;
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-2 py-1 text-xs font-extrabold text-zinc-900 shadow">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
      </span>
      Live: {count}
    </div>
  );
}

function Chip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition",
        active
          ? "bg-zinc-900 text-white shadow"
          : "bg-white text-zinc-800 ring-1 ring-zinc-200 hover:bg-zinc-50"
      )}
    >
      {children}
    </button>
  );
}

function Toggle({ checked, label, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 ring-1 ring-zinc-200 hover:bg-zinc-50"
      type="button"
    >
      <span className="text-sm font-medium text-zinc-800">{label}</span>
      <span
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition",
          checked ? "bg-zinc-900" : "bg-zinc-200"
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white shadow transition",
            checked ? "translate-x-5" : "translate-x-1"
          )}
        />
      </span>
    </button>
  );
}

function Range({ value, min, max, step = 1, onChange, suffix = "" }) {
  return (
    <div className="rounded-xl bg-white p-3 ring-1 ring-zinc-200">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-zinc-800">Max. Lieferzeit</div>
        <div className="text-sm font-semibold text-zinc-900">
          {value}
          {suffix}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full"
      />
      <div className="mt-1 flex justify-between text-xs text-zinc-500">
        <span>
          {min}
          {suffix}
        </span>
        <span>
          {max}
          {suffix}
        </span>
      </div>
    </div>
  );
}

function Drawer({ open, title, onClose, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-2xl rounded-t-3xl bg-white shadow-2xl ring-1 ring-zinc-200"
            initial={{ y: 480 }}
            animate={{ y: 0 }}
            exit={{ y: 480 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <div className="flex items-center justify-between px-5 py-4">
              <div className="text-base font-extrabold text-zinc-900">{title}</div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-zinc-600 hover:bg-zinc-100"
                aria-label="Schließen"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[72vh] overflow-auto px-5 pb-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function RestaurantCard({ r, liveCount, onSelect, saved, onToggleSave, onOpenAR }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:shadow-md",
        !r.isOpen && "opacity-75"
      )}
    >
      <button type="button" onClick={() => onSelect?.(r)} className="block w-full text-left">
        <div className="relative h-44 w-full overflow-hidden">
          <img
            src={r.image}
            alt={r.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-zinc-950/0 to-transparent" />

          <div className="absolute left-3 top-3 flex items-center gap-2">
            {r.isSponsored && (
              <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-zinc-900 shadow">
                Sponsored
              </span>
            )}
            {r.isHot && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-zinc-900 shadow">
                <Flame className="h-3.5 w-3.5" /> Trend
              </span>
            )}
            <LivePill count={liveCount} />
          </div>

          <div className="absolute right-3 top-3 flex items-center gap-2">
            {r.hasAR && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOpenAR?.(r);
                }}
                className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-extrabold text-zinc-900 shadow hover:bg-white"
                aria-label="AR Menü ansehen"
              >
                <Scan className="h-3.5 w-3.5" /> AR
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSave?.(r.id);
              }}
              className={cn(
                "rounded-full bg-white/90 p-2 shadow transition hover:bg-white",
                saved ? "text-zinc-900" : "text-zinc-600"
              )}
              aria-label="Restaurant speichern"
            >
              <Heart className={cn("h-4 w-4", saved && "fill-zinc-900")} />
            </button>
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-lg font-extrabold tracking-tight text-white">{r.name}</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {r.tags?.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold text-white ring-1 ring-white/15"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <RatingPill rating={r.rating} count={r.ratingCount} />
          </div>

          {!r.isOpen && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-zinc-950/80 px-3 py-1 text-sm font-semibold text-white ring-1 ring-white/10">
                Gerade geschlossen
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-700">
            <span className="truncate">{r.cuisines.join(" • ")}</span>
            <span className="text-zinc-300">•</span>
            <span className="text-zinc-600">{r.distanceKm.toFixed(1).replace(".", ",")} km</span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-600">
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-50 px-2 py-1 ring-1 ring-zinc-200">
              <Sparkles className="h-3.5 w-3.5" /> Beliebt: {r.popularItems?.[0]}
            </span>
            {r.popularItems?.[1] ? (
              <span className="truncate text-zinc-500">+ {r.popularItems[1]}</span>
            ) : null}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div className="rounded-xl bg-zinc-50 p-2 ring-1 ring-zinc-200">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-700">
                <Clock3 className="h-3.5 w-3.5" /> Zeit
              </div>
              <div className="mt-0.5 text-[13px] font-extrabold leading-tight text-zinc-900">
                {r.deliveryTimeMin}–{r.deliveryTimeMax} min
              </div>
            </div>
            <div className="rounded-xl bg-zinc-50 p-2 ring-1 ring-zinc-200">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-700">
                <Truck className="h-3.5 w-3.5" /> Lieferung
              </div>
              <div className="mt-0.5 text-[13px] font-extrabold leading-tight text-zinc-900">
                {moneyEUR(r.deliveryFee)}
              </div>
            </div>
            <div className="col-span-2 rounded-xl bg-zinc-50 p-2 ring-1 ring-zinc-200 sm:col-span-1">
              <div className="truncate whitespace-nowrap text-[10px] font-semibold tracking-tight text-zinc-700">
                Min. Bestellwert
              </div>
              <div className="mt-0.5 whitespace-nowrap text-[13px] font-extrabold leading-tight text-zinc-900">
                {r.minOrder} €
              </div>
            </div>
          </div>

          {r.promo ? (
            <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white">
              <BadgePercent className="h-4 w-4" /> {r.promo}
            </div>
          ) : (
            <div className="mt-3 text-xs font-semibold text-zinc-400">Keine Promo aktiv</div>
          )}
        </div>
      </button>
    </motion.div>
  );
}

function StoryStrip({ restaurants, onOpenStory }) {
  const withStories = restaurants.filter((r) => (r.stories?.length || 0) > 0);
  if (withStories.length === 0) return null;

  return (
    <div className="rounded-3xl bg-white p-4 ring-1 ring-zinc-200">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold text-zinc-900">Stories</div>
          <div className="text-xs font-semibold text-zinc-500">
            Mini-Highlights – damit das Listing nicht nur „Liste“, sondern „Erlebnis“ ist.
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full bg-zinc-50 px-3 py-1 text-xs font-bold text-zinc-700 ring-1 ring-zinc-200 sm:inline-flex">
          <PlayCircle className="h-4 w-4" /> Tap & Swipe
        </div>
      </div>

      <div className="mt-3 flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {withStories.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onOpenStory(r)}
            className="group flex w-[92px] flex-none flex-col items-center gap-2"
          >
            <div className="relative h-16 w-16 rounded-full p-[2px]">
              <div className={cn("absolute inset-0 rounded-full", BRAND_GRAD)} />
              <div className="relative h-full w-full overflow-hidden rounded-full bg-white p-[2px]">
                <img
                  src={r.image}
                  alt={r.name}
                  className="h-full w-full rounded-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="w-full truncate text-center text-xs font-extrabold text-zinc-800 group-hover:text-zinc-900">
              {r.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function GastroRestaurantListing() {
  const [address, setAddress] = useState("Wien, 1130");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("recommended");

  const [onlyOpen, setOnlyOpen] = useState(true);
  const [freeDelivery, setFreeDelivery] = useState(false);
  const [hasPromo, setHasPromo] = useState(false);
  const [maxTime, setMaxTime] = useState(60);
  const [minRating, setMinRating] = useState(0);

  const [saved, setSaved] = useState(() => new Set());
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Innovation states
  const [activeRestaurant, setActiveRestaurant] = useState(null);
  const [activeStoryRestaurant, setActiveStoryRestaurant] = useState(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const [activeARRestaurant, setActiveARRestaurant] = useState(null);

  // Live Activity simulation (swap later for real-time signals)
  const [liveMap, setLiveMap] = useState(() => {
    const m = {};
    for (const r of MOCK_RESTAURANTS) m[r.id] = r.baseLive ?? 0;
    return m;
  });

  useEffect(() => {
    const t = setInterval(() => {
      setLiveMap((prev) => {
        const next = { ...prev };
        for (const r of MOCK_RESTAURANTS) {
          const cur = Number(prev[r.id] ?? r.baseLive ?? 0);
          const delta = (Math.random() < 0.55 ? 1 : -1) * (Math.random() < 0.75 ? 1 : 2);
          const base = r.baseLive ?? 0;
          next[r.id] = clamp(cur + delta, 0, base + 12);
        }
        return next;
      });
    }, 4500);
    return () => clearInterval(t);
  }, []);

  const score = (r) => {
    // A simple recommended-ish ranking: rating + sponsored + hot + promo + live - time - fees
    let s = r.rating * 10;
    if (r.isSponsored) s += 6;
    if (r.isHot) s += 4;
    if (r.promo) s += 2;
    s += (liveMap[r.id] ?? 0) * 0.35;
    s -= r.deliveryTimeMax / 10;
    s -= r.deliveryFee;
    return s;
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = MOCK_RESTAURANTS.filter((r) => {
      if (onlyOpen && !r.isOpen) return false;
      if (freeDelivery && r.deliveryFee > 0) return false;
      if (hasPromo && !r.promo) return false;
      if (r.deliveryTimeMax > maxTime) return false;
      if (r.rating < minRating) return false;

      if (category !== "all" && r.brand !== category) return false;

      if (!q) return true;
      const hay = [r.name, ...r.cuisines, ...(r.tags || []), ...(r.popularItems || [])]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });

    list.sort((a, b) => {
      if (sort === "recommended") return score(b) - score(a);
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "deliveryTime") return a.deliveryTimeMax - b.deliveryTimeMax;
      if (sort === "deliveryFee") return a.deliveryFee - b.deliveryFee;
      if (sort === "minOrder") return a.minOrder - b.minOrder;
      if (sort === "live") return (liveMap[b.id] ?? 0) - (liveMap[a.id] ?? 0);
      return 0;
    });

    return list;
  }, [query, category, sort, onlyOpen, freeDelivery, hasPromo, maxTime, minRating, liveMap]);

  const stats = useMemo(() => {
    const total = MOCK_RESTAURANTS.length;
    const open = MOCK_RESTAURANTS.filter((r) => r.isOpen).length;
    const promos = MOCK_RESTAURANTS.filter((r) => r.promo).length;
    return { total, open, promos };
  }, []);

  const onToggleSave = (id) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const forYou = useMemo(() => {
    const all = [...MOCK_RESTAURANTS].filter((r) => r.isOpen);
    const savedIds = Array.from(saved);

    if (savedIds.length > 0) {
      const savedBrands = new Set(
        all.filter((r) => savedIds.includes(r.id)).map((r) => r.brand)
      );
      const picks = all
        .filter((r) => !savedIds.includes(r.id))
        .sort((a, b) => {
          const aBoost = savedBrands.has(a.brand) ? 100 : 0;
          const bBoost = savedBrands.has(b.brand) ? 100 : 0;
          return bBoost + score(b) - (aBoost + score(a));
        })
        .slice(0, 3);
      return picks;
    }

    return all.sort((a, b) => score(b) - score(a)).slice(0, 3);
  }, [saved, liveMap]);

  const crossPromo = useMemo(() => {
    if (!activeRestaurant) return [];
    const base = activeRestaurant;
    const list = MOCK_RESTAURANTS.filter((r) => r.id !== base.id && r.isOpen);
    const baseCuisineKey = (base.cuisines?.[0] || base.brand || "").toLowerCase();

    return list
      .map((r) => {
        const sameBrand = r.brand === base.brand;
        const sameCuisine = r.cuisines?.some((c) => c.toLowerCase().includes(baseCuisineKey));
        const dist = Math.abs(r.distanceKm - base.distanceKm);
        const affinity = (sameBrand ? 3 : 0) + (sameCuisine ? 2 : 0) - dist;
        return { r, affinity };
      })
      .sort((a, b) => b.affinity - a.affinity)
      .slice(0, 3)
      .map((x) => x.r);
  }, [activeRestaurant]);

  const FiltersPanel = (
    <div className="space-y-3">
      <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-extrabold text-zinc-900">Filter</div>
            <div className="text-xs font-semibold text-zinc-500">
              Feinschliff fürs Listing – weil Chaos schlecht konvertiert.
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setOnlyOpen(true);
              setFreeDelivery(false);
              setHasPromo(false);
              setMaxTime(60);
              setMinRating(0);
            }}
            className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-200"
          >
            Reset
          </button>
        </div>
      </div>

      <Toggle checked={onlyOpen} label="Nur offene Restaurants" onChange={setOnlyOpen} />
      <Toggle checked={hasPromo} label="Nur Angebote" onChange={setHasPromo} />
      <Toggle checked={freeDelivery} label="Gratis Lieferung" onChange={setFreeDelivery} />

      <Range value={maxTime} min={20} max={90} step={5} onChange={setMaxTime} suffix=" min" />

      <div className="rounded-xl bg-white p-3 ring-1 ring-zinc-200">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-zinc-800">Mindestbewertung</div>
          <div className="text-sm font-semibold text-zinc-900">{minRating.toFixed(1)}</div>
        </div>
        <input
          type="range"
          min={0}
          max={5}
          step={0.1}
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
          className="mt-2 w-full"
        />
        <div className="mt-1 flex justify-between text-xs text-zinc-500">
          <span>0.0</span>
          <span>5.0</span>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
        <div className="text-sm font-extrabold text-zinc-900">Quick Stats</div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-zinc-50 p-2 ring-1 ring-zinc-200">
            <div className="text-xs font-semibold text-zinc-500">Gesamt</div>
            <div className="text-lg font-extrabold text-zinc-900">{stats.total}</div>
          </div>
          <div className="rounded-xl bg-zinc-50 p-2 ring-1 ring-zinc-200">
            <div className="text-xs font-semibold text-zinc-500">Offen</div>
            <div className="text-lg font-extrabold text-zinc-900">{stats.open}</div>
          </div>
          <div className="rounded-xl bg-zinc-50 p-2 ring-1 ring-zinc-200">
            <div className="text-xs font-semibold text-zinc-500">Deals</div>
            <div className="text-lg font-extrabold text-zinc-900">{stats.promos}</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-zinc-900 p-4 text-white">
        <div className="text-sm font-extrabold">Gastro CMS 3.0</div>
        <div className="mt-1 text-xs font-semibold text-white/75">
          Listing = Funnel. Saubere Filter, starke Cards, klare CTAs.
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-semibold ring-1 ring-white/10">
            API-ready
          </span>
          <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-semibold ring-1 ring-white/10">
            Mobile-first
          </span>
          <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-semibold ring-1 ring-white/10">
            Stories + Live
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24 md:pb-0">
      {/* Topbar */}
      <div className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow",
                BRAND_GRAD
              )}
            >
              <span className="text-sm font-extrabold">GC</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-tight">Gastro CMS</div>
              <div className="text-xs font-semibold text-zinc-500">Restaurant Listing</div>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <div className="relative w-[320px]">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Adresse / PLZ"
                className="w-full rounded-2xl bg-zinc-50 py-2.5 pl-10 pr-3 text-sm font-semibold text-zinc-900 ring-1 ring-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
            <button
              type="button"
              className="rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-extrabold text-white shadow hover:bg-zinc-800"
            >
              Restaurants finden
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFiltersMobile(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-zinc-100 px-3 py-2 text-sm font-bold text-zinc-700 hover:bg-zinc-200 md:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filter
            </button>
            <button
              type="button"
              className="hidden rounded-2xl bg-zinc-900 px-3 py-2 text-sm font-extrabold text-white shadow hover:bg-zinc-800 md:inline-flex"
            >
              Restaurant registrieren
            </button>
          </div>
        </div>
      </div>

      {/* Hero / Search */}
      <div className="mx-auto max-w-[1400px] px-4 pt-5">
        <div className={cn("overflow-hidden rounded-3xl text-white shadow ring-1 ring-white/10", BRAND_GRAD)}>
          <div className="relative p-5 sm:p-8">
            <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />

            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/10">
                  <BadgePercent className="h-4 w-4" /> Deals, Trends & Lieblingslokale
                </div>
                <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Alle Restaurants – direkt aus deinem <span className="text-white/80">Gastro CMS 3.0</span>
                </h1>
                <p className="mt-2 max-w-2xl text-sm font-semibold text-white/70">
                  Lieferando-Vibes + foodora-Polish: schnell suchen, filtern, auswählen. Jetzt mit Stories + Live Activity.
                </p>
              </div>

              <div className="flex w-full flex-col gap-2 md:w-[420px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Suche nach Restaurant, Küche, Tag …"
                    className="w-full rounded-2xl bg-white/10 py-3 pl-10 pr-3 text-sm font-semibold text-white placeholder:text-white/50 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-white/60"
                  />
                </div>

                <div className="md:hidden">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Adresse / PLZ"
                      className="w-full rounded-2xl bg-white/10 py-3 pl-10 pr-3 text-sm font-semibold text-white placeholder:text-white/50 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-white/60"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-white/70">
                  <div className="inline-flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 ring-1 ring-white/10">
                      <Clock3 className="h-3.5 w-3.5" /> Live Filter
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 ring-1 ring-white/10">
                      <Truck className="h-3.5 w-3.5" /> Lieferung
                    </span>
                  </div>
                  <div>
                    <span className="font-extrabold text-white">{filtered.length}</span> Ergebnisse
                  </div>
                </div>
              </div>
            </div>

            {/* Category slider */}
            <div className="mt-5 flex w-full gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                return (
                  <Chip key={c.key} active={category === c.key} onClick={() => setCategory(c.key)}>
                    <span className="inline-flex items-center gap-2">
                      {Icon ? <Icon className="h-4 w-4" /> : null}
                      {c.label}
                    </span>
                  </Chip>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 px-4 py-6 md:grid-cols-12">
        {/* Sidebar filters */}
        <aside className="hidden md:col-span-4 md:block lg:col-span-3">{FiltersPanel}</aside>

        {/* Main */}
        <main className="md:col-span-8 lg:col-span-9">
          {/* Stories */}
          <StoryStrip
            restaurants={MOCK_RESTAURANTS}
            onOpenStory={(r) => {
              setActiveStoryRestaurant(r);
              setStoryIndex(0);
            }}
          />

          {/* For you */}
          <div className="mt-4 rounded-3xl bg-white p-4 ring-1 ring-zinc-200">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold text-zinc-900">Für dich</div>
                <div className="text-xs font-semibold text-zinc-500">
                  Dynamisch – basiert auf Live Activity und deinen gespeicherten Restaurants.
                </div>
              </div>
              <div className="hidden items-center gap-2 rounded-full bg-zinc-50 px-3 py-1 text-xs font-bold text-zinc-700 ring-1 ring-zinc-200 sm:inline-flex">
                <Sparkles className="h-4 w-4" /> Smart Picks
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {forYou.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveRestaurant(r)}
                  className="group flex items-center gap-3 rounded-2xl bg-zinc-50 p-3 ring-1 ring-zinc-200 hover:bg-zinc-100"
                >
                  <img
                    src={r.image}
                    alt={r.name}
                    className="h-12 w-12 rounded-xl object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1 text-left">
                    <div className="truncate text-sm font-extrabold text-zinc-900">{r.name}</div>
                    <div className="mt-0.5 truncate text-xs font-semibold text-zinc-600">
                      {r.cuisines.join(" • ")}
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 text-xs font-extrabold text-zinc-900">
                    <LivePill count={liveMap[r.id]} />
                    <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-zinc-900" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-zinc-200">
              <div className="text-sm font-extrabold text-zinc-900">
                Lieferung nach <span className="text-zinc-600">{address}</span>
              </div>
              <div className="text-xs font-semibold text-zinc-500">
                Tipp: Hier kannst du später Geofencing + Liefergebiete prüfen.
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none rounded-2xl bg-white px-4 py-3 pr-10 text-sm font-extrabold text-zinc-900 ring-1 ring-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                >
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      Sortierung: {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              </div>

              <div className="hidden rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-extrabold text-white shadow sm:inline-flex">
                <span className="inline-flex items-center gap-2">
                  <Heart className="h-4 w-4" /> Gespeichert: {saved.size}
                </span>
              </div>
            </div>
          </div>

          {/* Result grid */}
          <div className="mt-4">
            {filtered.length === 0 ? (
              <div className="rounded-3xl bg-white p-8 text-center ring-1 ring-zinc-200">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white">
                  <Search className="h-5 w-5" />
                </div>
                <div className="mt-3 text-lg font-extrabold text-zinc-900">Keine Treffer</div>
                <div className="mt-1 text-sm font-semibold text-zinc-500">
                  Dreh an den Filtern oder such nach einer Küche (z.B. „Pizza“).
                </div>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {filtered.map((r) => (
                    <RestaurantCard
                      key={r.id}
                      r={r}
                      liveCount={liveMap[r.id] || 0}
                      saved={saved.has(r.id)}
                      onToggleSave={onToggleSave}
                      onSelect={(rr) => setActiveRestaurant(rr)}
                      onOpenAR={(rr) => setActiveARRestaurant(rr)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* Footer note */}
          <div className="mt-6 rounded-3xl bg-white p-5 ring-1 ring-zinc-200">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-extrabold text-zinc-900">Integration-Hook</div>
                <div className="mt-1 text-sm font-semibold text-zinc-500">
                  Tausche <span className="font-bold text-zinc-700">MOCK_RESTAURANTS</span> gegen deine Gastro CMS API.
                  Stories/Live kannst du später aus Events, Orders, Views befüllen.
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-700">
                  /api/restaurants
                </span>
                <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-700">
                  /api/orders/live
                </span>
                <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-700">
                  /restaurants/:id
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-10">
          <div className={cn("h-1 w-28 rounded-full", BRAND_GRAD)} />

          <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-base font-extrabold text-zinc-900">Gastro CMS 3.0</div>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-600">
                Das Restaurant-Listing ist dein Einstiegspunkt: finden, vergleichen, bestellen. Danach übernimmt dein
                System den Rest – sauber, schnell, skalierbar.
              </p>
            </div>

            <div>
              <div className="text-sm font-extrabold text-zinc-900">Produkt</div>
              <ul className="mt-3 space-y-2 text-sm font-semibold text-zinc-600">
                <li>
                  <a className="hover:text-zinc-900" href="#">
                    Features
                  </a>
                </li>
                <li>
                  <a className="hover:text-zinc-900" href="#">
                    Preise
                  </a>
                </li>
                <li>
                  <a className="hover:text-zinc-900" href="#">
                    Demo
                  </a>
                </li>
                <li>
                  <a className="hover:text-zinc-900" href="#">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-extrabold text-zinc-900">Unternehmen</div>
              <ul className="mt-3 space-y-2 text-sm font-semibold text-zinc-600">
                <li>
                  <a className="hover:text-zinc-900" href="#">
                    Über uns
                  </a>
                </li>
                <li>
                  <a className="hover:text-zinc-900" href="#">
                    Partner werden
                  </a>
                </li>
                <li>
                  <a className="hover:text-zinc-900" href="#">
                    Kontakt
                  </a>
                </li>
                <li>
                  <a className="hover:text-zinc-900" href="#">
                    Jobs
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-extrabold text-zinc-900">Rechtliches</div>
              <ul className="mt-3 space-y-2 text-sm font-semibold text-zinc-600">
                <li>
                  <a className="hover:text-zinc-900" href="#">
                    Impressum
                  </a>
                </li>
                <li>
                  <a className="hover:text-zinc-900" href="#">
                    Datenschutz
                  </a>
                </li>
                <li>
                  <a className="hover:text-zinc-900" href="#">
                    AGB
                  </a>
                </li>
                <li>
                  <a className="hover:text-zinc-900" href="#">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-zinc-200 pt-6 text-sm font-semibold text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
            <div>© {new Date().getFullYear()} Gastro CMS 3.0 • Alle Rechte vorbehalten</div>
            <div className="flex flex-wrap items-center gap-3">
              <a className="hover:text-zinc-900" href="#">
                Status
              </a>
              <span className="text-zinc-300">•</span>
              <a className="hover:text-zinc-900" href="#">
                Support
              </a>
              <span className="text-zinc-300">•</span>
              <a className="hover:text-zinc-900" href="#">
                Changelog
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile filter drawer */}
      <Drawer open={showFiltersMobile} title="Filter" onClose={() => setShowFiltersMobile(false)}>
        {FiltersPanel}
      </Drawer>

      {/* Restaurant preview drawer (cross-promo) */}
      <Drawer
        open={!!activeRestaurant}
        title={activeRestaurant ? activeRestaurant.name : "Restaurant"}
        onClose={() => setActiveRestaurant(null)}
      >
        {activeRestaurant && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl bg-zinc-50 ring-1 ring-zinc-200">
              <div className="relative h-40 w-full">
                <img
                  src={activeRestaurant.image}
                  alt={activeRestaurant.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <RatingPill rating={activeRestaurant.rating} count={activeRestaurant.ratingCount} />
                  <LivePill count={liveMap[activeRestaurant.id] || 0} />
                </div>
              </div>
              <div className="p-4">
                <div className="text-sm font-extrabold text-zinc-900">Beliebte Gerichte</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {activeRestaurant.popularItems?.slice(0, 6).map((x) => (
                    <span
                      key={x}
                      className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-zinc-800 ring-1 ring-zinc-200"
                    >
                      {x}
                    </span>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-white p-2 ring-1 ring-zinc-200">
                    <div className="text-[11px] font-semibold text-zinc-600">Zeit</div>
                    <div className="text-sm font-extrabold text-zinc-900">
                      {activeRestaurant.deliveryTimeMin}–{activeRestaurant.deliveryTimeMax} min
                    </div>
                  </div>
                  <div className="rounded-xl bg-white p-2 ring-1 ring-zinc-200">
                    <div className="text-[11px] font-semibold text-zinc-600">Lieferung</div>
                    <div className="text-sm font-extrabold text-zinc-900">
                      {moneyEUR(activeRestaurant.deliveryFee)}
                    </div>
                  </div>
                  <div className="rounded-xl bg-white p-2 ring-1 ring-zinc-200">
                    <div className="truncate whitespace-nowrap text-[11px] font-semibold text-zinc-600">
                      Min. Bestellwert
                    </div>
                    <div className="text-sm font-extrabold text-zinc-900">{activeRestaurant.minOrder} €</div>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-4 w-full rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-extrabold text-white shadow hover:bg-zinc-800"
                >
                  Menü öffnen
                </button>

                <div className="mt-3 text-xs font-semibold text-zinc-500">
                  (Hook: hier später direkt zu /restaurants/{activeRestaurant.id} + Warenkorb)
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
              <div className="text-sm font-extrabold text-zinc-900">Auch beliebt in deiner Nähe</div>
              <div className="mt-1 text-xs font-semibold text-zinc-500">
                Cross-Promo: ähnliche Küche / ähnliche Distanz. Win-Win: mehr Conversion, mehr Umsatz.
              </div>

              <div className="mt-3 space-y-2">
                {crossPromo.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setActiveRestaurant(r)}
                    className="flex w-full items-center gap-3 rounded-2xl bg-zinc-50 p-3 text-left ring-1 ring-zinc-200 hover:bg-zinc-100"
                  >
                    <img src={r.image} alt={r.name} className="h-12 w-12 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-extrabold text-zinc-900">{r.name}</div>
                      <div className="mt-0.5 truncate text-xs font-semibold text-zinc-600">
                        {r.cuisines.join(" • ")}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-xs font-extrabold text-zinc-900">
                        {r.deliveryTimeMin}–{r.deliveryTimeMax} min
                      </div>
                      <div className="text-xs font-semibold text-zinc-500">{r.distanceKm.toFixed(1).replace(".", ",")} km</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Story drawer */}
      <Drawer
        open={!!activeStoryRestaurant}
        title={activeStoryRestaurant ? `${activeStoryRestaurant.name} – Stories` : "Stories"}
        onClose={() => setActiveStoryRestaurant(null)}
      >
        {activeStoryRestaurant && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold text-zinc-500">
                Story {storyIndex + 1} / {(activeStoryRestaurant.stories || []).length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStoryIndex((i) => Math.max(0, i - 1))}
                  className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-extrabold text-zinc-700 hover:bg-zinc-200"
                >
                  Zurück
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setStoryIndex((i) => Math.min((activeStoryRestaurant.stories || []).length - 1, i + 1))
                  }
                  className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-zinc-800"
                >
                  Weiter
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl ring-1 ring-zinc-200">
              <div className="relative h-[360px] w-full bg-zinc-100">
                <img
                  src={activeStoryRestaurant.stories?.[storyIndex]?.image || activeStoryRestaurant.image}
                  alt="Story"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/65 via-transparent to-transparent" />

                <div className="absolute top-3 left-3 right-3 flex gap-2">
                  {(activeStoryRestaurant.stories || []).map((_, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "h-1.5 flex-1 rounded-full",
                        idx <= storyIndex ? "bg-white" : "bg-white/40"
                      )}
                    />
                  ))}
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-lg font-extrabold text-white">
                    {activeStoryRestaurant.stories?.[storyIndex]?.title || "Highlight"}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-white/75">
                    {activeStoryRestaurant.stories?.[storyIndex]?.subtitle || ""}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveRestaurant(activeStoryRestaurant);
                      setActiveStoryRestaurant(null);
                    }}
                    className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-white/90 px-4 py-2 text-sm font-extrabold text-zinc-900 shadow hover:bg-white"
                  >
                    Zum Restaurant <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
              <div className="text-sm font-extrabold text-zinc-900">Warum Stories?</div>
              <div className="mt-1 text-sm font-semibold text-zinc-600">
                Social Proof ohne Social Media: Deals, Highlights, neue Gerichte. Das hebt dein Listing von „nur Karten“ ab.
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* AR drawer (teaser) */}
      <Drawer
        open={!!activeARRestaurant}
        title={activeARRestaurant ? `${activeARRestaurant.name} – AR Menü (Demo)` : "AR Menü"}
        onClose={() => setActiveARRestaurant(null)}
      >
        {activeARRestaurant && (
          <div className="space-y-4">
            <div className={cn("overflow-hidden rounded-3xl ring-1 ring-zinc-200", "bg-white")}> 
              <div className="relative h-44 w-full">
                <img src={activeARRestaurant.image} alt="AR" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/65 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold text-zinc-900 shadow">
                  <Scan className="h-4 w-4" /> AR Menü – Beta
                </div>
              </div>
              <div className="p-4">
                <div className="text-sm font-extrabold text-zinc-900">AR Vorschau (Platzhalter)</div>
                <div className="mt-1 text-sm font-semibold text-zinc-600">
                  Hier würdest du später Gerichte als 3D/AR-Preview zeigen (z.B. per WebXR / Model Viewer). Fürs Listing reicht
                  schon ein „Wow“-Teaser.
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {(activeARRestaurant.popularItems || []).slice(0, 4).map((x) => (
                    <div key={x} className="rounded-2xl bg-zinc-50 p-3 ring-1 ring-zinc-200">
                      <div className="text-xs font-semibold text-zinc-500">AR Dish</div>
                      <div className="mt-0.5 truncate text-sm font-extrabold text-zinc-900">{x}</div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveRestaurant(activeARRestaurant);
                    setActiveARRestaurant(null);
                  }}
                  className="mt-4 w-full rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-extrabold text-white shadow hover:bg-zinc-800"
                >
                  Zum Restaurant
                </button>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Mobile bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-zinc-200 bg-white/90 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => setShowFiltersMobile(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-zinc-100 px-4 py-3 text-sm font-extrabold text-zinc-700"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filter
          </button>
          <button
            type="button"
            className="flex-1 rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-extrabold text-white shadow"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <Heart className="h-4 w-4" /> Gespeichert ({saved.size})
            </span>
          </button>
        </div>
      </div>

      <div className="h-20 md:hidden" />
    </div>
  );
}
