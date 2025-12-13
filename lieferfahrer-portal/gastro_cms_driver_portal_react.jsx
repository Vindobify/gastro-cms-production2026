import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Bike,
  BriefcaseBusiness,
  CalendarClock,
  Car,
  CheckCircle2,
  ChevronDown,
  FileUp,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UploadCloud,
  Wallet,
  X,
} from "lucide-react";

/**
 * Gastro CMS 3.0 – Driver Portal
 * Zielgruppe: Selbständig ODER Angestellt
 * Single-file React component
 * Requires TailwindCSS
 * No backend included (submit is mocked) – replace handleSubmit with your API.
 * Hinweis: Keine Zusagen/Versprechen (kein Anspruch auf Vermittlung/Anstellung).
 */

const BRAND_GRAD =
  "bg-[linear-gradient(90deg,#2F6BFF_0%,#7C3AED_45%,#FF4D8D_75%,#FFB020_100%)]";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function SectionTitle({ kicker, title, subtitle }) {
  return (
    <div>
      {kicker ? (
        <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900/90 px-3 py-1 text-xs font-extrabold text-white shadow ring-1 ring-white/10">
          <Sparkles className="h-4 w-4" /> {kicker}
        </div>
      ) : null}
      <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-2 max-w-3xl text-sm font-semibold leading-relaxed text-zinc-600">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/10">
      {children}
    </span>
  );
}

function Field({ label, hint, required, error, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-extrabold text-zinc-900">
          {label} {required ? <span className="text-rose-600">*</span> : null}
        </div>
        {hint ? (
          <div className="text-xs font-semibold text-zinc-500">{hint}</div>
        ) : null}
      </div>
      {children}
      <AnimatePresence>
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs font-semibold text-rose-600"
          >
            {error}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function UploadCard({ title, required, value, onChange, accept, error, description }) {
  const hasFile = !!value;
  return (
    <div className={cn("rounded-2xl bg-white p-4 ring-1", error ? "ring-rose-300" : "ring-zinc-200")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold text-zinc-900">
            {title} {required ? <span className="text-rose-600">*</span> : null}
          </div>
          <div className="mt-1 text-xs font-semibold text-zinc-500">{description}</div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold ring-1",
            hasFile
              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
              : "bg-zinc-50 text-zinc-700 ring-zinc-200"
          )}
        >
          {hasFile ? <CheckCircle2 className="h-4 w-4" /> : <UploadCloud className="h-4 w-4" />}
          {hasFile ? "Hochgeladen" : "Upload"}
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          {hasFile ? (
            <div className="truncate text-sm font-bold text-zinc-900">{value.name}</div>
          ) : (
            <div className="text-sm font-semibold text-zinc-600">PDF / JPG / PNG – gut lesbar.</div>
          )}
          {error ? <div className="mt-1 text-xs font-semibold text-rose-600">{error}</div> : null}
        </div>

        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-extrabold text-white shadow hover:bg-zinc-800">
          <FileUp className="h-4 w-4" /> Datei wählen
          <input
            type="file"
            className="hidden"
            accept={accept}
            onChange={(e) => onChange(e.target.files?.[0] || null)}
          />
        </label>
      </div>
    </div>
  );
}

function VisualCard({ label, Icon, hint, className }) {
  return (
    <div className={cn("relative overflow-hidden rounded-3xl bg-white/10 ring-1 ring-white/10", className)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.10),transparent_55%),radial-gradient(circle_at_30%_90%,rgba(255,255,255,0.10),transparent_55%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/45 via-transparent to-transparent" />
      <div className="relative flex h-full w-full flex-col justify-between p-5">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold text-zinc-900 shadow">
            <Icon className="h-4 w-4" /> {label}
          </div>
          {hint ? <div className="hidden text-xs font-semibold text-white/70 sm:block">{hint}</div> : null}
        </div>
        <div className="pointer-events-none flex items-end justify-end">
          <Icon className="h-20 w-20 text-white/20" />
        </div>
      </div>
    </div>
  );
}

export default function GastroDriverPortal() {
  // self | employee
  const [candidateType, setCandidateType] = useState("self");

  const [vehicle, setVehicle] = useState("car");
  const [regions, setRegions] = useState("Wien (1130), Wien Umgebung");
  const [availability, setAvailability] = useState("Abends + Wochenende");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // self-employed
  const [companyName, setCompanyName] = useState("");
  const [uid, setUid] = useState("");
  const [bankOrPayout, setBankOrPayout] = useState("");

  // employee
  const [employmentModel, setEmploymentModel] = useState("Teilzeit");
  const [earliestStart, setEarliestStart] = useState("Sofort");
  const [note, setNote] = useState("");

  // uploads
  const [tradeLicense, setTradeLicense] = useState(null); // Pflicht bei self
  const [cvFile, setCvFile] = useState(null); // optional bei employee
  const [idDoc, setIdDoc] = useState(null);
  const [insuranceDoc, setInsuranceDoc] = useState(null);

  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState({});

  const vehicleLabel = useMemo(() => {
    if (vehicle === "car") return "Auto";
    if (vehicle === "scooter") return "Moped / Scooter";
    return "Fahrrad";
  }, [vehicle]);

  const isValidEmail = (v) => {
    const s = String(v || "").trim();
    if (!s) return false;
    const at = s.indexOf("@");
    const dot = s.lastIndexOf(".");
    return at > 0 && dot > at + 1 && dot < s.length - 1;
  };

  const validate = () => {
    const next = {};

    if (!fullName.trim()) next.fullName = "Bitte deinen Namen eintragen.";
    if (!isValidEmail(email)) next.email = "Bitte eine gültige E-Mail eintragen.";
    if (!phone.trim()) next.phone = "Bitte Telefonnummer eintragen.";
    if (!regions.trim()) next.regions = "Bitte Region(en) eintragen.";
    if (!availability.trim()) next.availability = "Bitte Verfügbarkeit eintragen.";

    if (candidateType === "self") {
      if (!companyName.trim()) next.companyName = "Bitte Firmenname/Gewerbe eintragen.";
      if (!tradeLicense) next.tradeLicense = "Gewerbeanmeldung ist Pflicht (bei Selbständig).";
    }

    if (candidateType === "employee") {
      if (!employmentModel.trim()) next.employmentModel = "Bitte Anstellungsart wählen.";
    }

    if (!agree) next.agree = "Bitte bestätigen (kein Anspruch auf Vermittlung/Anstellung).";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSuccess(null);

    // Mock submit – replace with API call
    await new Promise((r) => setTimeout(r, 900));

    const id = "DRV-" + String(Math.floor(Math.random() * 900000) + 100000);
    setSuccess({ id });
    setLoading(false);
  };

  const VehicleButton = ({ id, label, Icon }) => (
    <button
      type="button"
      onClick={() => setVehicle(id)}
      className={cn(
        "flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left ring-1 transition",
        vehicle === id
          ? "bg-zinc-900 text-white ring-zinc-900"
          : "bg-white text-zinc-900 ring-zinc-200 hover:bg-zinc-50"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", vehicle === id ? "bg-white/10" : "bg-zinc-100")}>
          <Icon className={cn("h-5 w-5", vehicle === id ? "text-white" : "text-zinc-700")} />
        </div>
        <div>
          <div className="text-sm font-extrabold">{label}</div>
          <div className={cn("text-xs font-semibold", vehicle === id ? "text-white/70" : "text-zinc-500")}>
            Damit Anfragen grob passen.
          </div>
        </div>
      </div>
      <ChevronDown className={cn("h-5 w-5", vehicle === id ? "rotate-180 text-white/70" : "text-zinc-400")} />
    </button>
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow", BRAND_GRAD)}>
              <span className="text-sm font-extrabold">GC</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-tight">Gastro CMS</div>
              <div className="text-xs font-semibold text-zinc-500">Driver Portal</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="hidden rounded-2xl bg-zinc-100 px-4 py-2.5 text-sm font-extrabold text-zinc-800 hover:bg-zinc-200 sm:inline-flex"
            >
              Login
            </button>
            <a
              href="#bewerben"
              className="rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-extrabold text-white shadow hover:bg-zinc-800"
            >
              Profil anlegen
            </a>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="mx-auto max-w-[1400px] px-4 pt-5">
        <div className={cn("overflow-hidden rounded-3xl text-white shadow ring-1 ring-white/10", BRAND_GRAD)}>
          <div className="relative p-6 sm:p-10">
            <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Pill>
                    <BriefcaseBusiness className="h-4 w-4" /> Selbständig & Angestellt
                  </Pill>
                  <Pill>
                    <Wallet className="h-4 w-4" /> Keine Zusagen
                  </Pill>
                  <Pill>
                    <CalendarClock className="h-4 w-4" /> Zeiten definieren
                  </Pill>
                </div>

                <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Fahrer-Portal: <span className="text-white/80">Bewerben & registrieren</span>
                </h1>
                <p className="mt-3 max-w-xl text-sm font-semibold leading-relaxed text-white/75">
                  Hier kannst du dich als Fahrer registrieren/bewerben – entweder <span className="font-extrabold">selbständig</span> (mit Gewerbe) oder
                  <span className="font-extrabold"> angestellt</span> (Fixjob). Restaurants können dich zur Kontaktaufnahme anfragen.
                  Kein Anspruch, keine Garantie – aber ein sauberer Einstieg.
                </p>

                <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setCandidateType("self")}
                    className={cn(
                      "rounded-2xl px-4 py-3 text-left ring-1 transition",
                      candidateType === "self"
                        ? "bg-white text-zinc-900 ring-white"
                        : "bg-white/10 text-white ring-white/10 hover:bg-white/15"
                    )}
                  >
                    <div className="text-sm font-extrabold">Selbständig</div>
                    <div className={cn("text-xs font-semibold", candidateType === "self" ? "text-zinc-700" : "text-white/70")}>
                      Gewerbeanmeldung erforderlich.
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCandidateType("employee")}
                    className={cn(
                      "rounded-2xl px-4 py-3 text-left ring-1 transition",
                      candidateType === "employee"
                        ? "bg-white text-zinc-900 ring-white"
                        : "bg-white/10 text-white ring-white/10 hover:bg-white/15"
                    )}
                  >
                    <div className="text-sm font-extrabold">Fixer Job (Angestellt)</div>
                    <div className={cn("text-xs font-semibold", candidateType === "employee" ? "text-zinc-700" : "text-white/70")}>
                      Bewerbung – keine Job-Zusage.
                    </div>
                  </button>
                </div>

                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <a
                    href="#bewerben"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-zinc-900 shadow hover:bg-white/90"
                  >
                    Profil anlegen <ArrowRight className="h-4 w-4" />
                  </a>
                  <div className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-extrabold text-white ring-1 ring-white/10">
                    <ShieldCheck className="h-4 w-4" /> Daten sicher & zweckgebunden
                  </div>
                </div>

                <div className="mt-3 text-xs font-semibold text-white/70">
                  Hinweis: Kein Anspruch auf Vermittlung oder Anstellung.
                </div>
              </div>

              {/* Visual collage – brand-safe */}
              <div className="grid grid-cols-2 gap-3">
                <VisualCard className="col-span-2 h-44 sm:h-56" label="Auto" hint="für größere Zonen" Icon={Car} />
                <VisualCard className="h-40" label="Moped" hint="City" Icon={Smartphone} />
                <VisualCard className="h-40" label="Fahrrad" hint="kurz" Icon={Bike} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Value props */}
      <div className="mx-auto max-w-[1400px] px-4 py-10">
        <SectionTitle
          kicker="Dein Vorteil"
          title="Sauberer Einstieg statt Chaos."
          subtitle="Du legst ein Profil an und lädst (je nach Typ) Nachweise hoch. Restaurants können dich zur Kontaktaufnahme anfragen. Ohne Garantie, ohne Blabla."
        />

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-5 ring-1 ring-zinc-200">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white">
                <BadgeCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="text-base font-extrabold">Seriöse Struktur</div>
                <div className="text-sm font-semibold text-zinc-600">Klare Daten, klare Unterlagen.</div>
              </div>
            </div>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-600">
              Restaurants sehen die Basics – und entscheiden selbst, ob sie Kontakt aufnehmen.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 ring-1 ring-zinc-200">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white">
                <CalendarClock className="h-6 w-6" />
              </div>
              <div>
                <div className="text-base font-extrabold">Verfügbarkeit</div>
                <div className="text-sm font-semibold text-zinc-600">Damit Anfragen grob passen.</div>
              </div>
            </div>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-600">
              Du legst Region & Zeiten fest – und reduzierst unnötige Anfragen.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 ring-1 ring-zinc-200">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="text-base font-extrabold">Nachweise</div>
                <div className="text-sm font-semibold text-zinc-600">Gewerbe bei Selbständig, CV optional bei Angestellt.</div>
              </div>
            </div>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-600">
              Dokumente können Vertrauen erhöhen – garantieren aber nichts.
            </p>
          </div>
        </div>
      </div>

      {/* Steps + vehicle selection */}
      <div className="border-y border-zinc-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-10">
          <SectionTitle
            kicker="So läuft's"
            title="Einmal anlegen. Danach kann Kontakt entstehen."
            subtitle="Basics + Nachweise. Restaurants melden sich nur, wenn es wirklich passt."
          />

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-3xl bg-zinc-50 p-5 ring-1 ring-zinc-200">
              <div className="text-xs font-semibold text-zinc-500">Step 1</div>
              <div className="mt-1 text-base font-extrabold">Profil & Region</div>
              <div className="mt-2 text-sm font-semibold text-zinc-600">Name, Kontakt, Region(en), Zeiten.</div>
            </div>
            <div className="rounded-3xl bg-zinc-50 p-5 ring-1 ring-zinc-200">
              <div className="text-xs font-semibold text-zinc-500">Step 2</div>
              <div className="mt-1 text-base font-extrabold">Nachweise hochladen</div>
              <div className="mt-2 text-sm font-semibold text-zinc-600">Je nach Typ (Selbständig/Angestellt).</div>
            </div>
            <div className="rounded-3xl bg-zinc-50 p-5 ring-1 ring-zinc-200">
              <div className="text-xs font-semibold text-zinc-500">Step 3</div>
              <div className="mt-1 text-base font-extrabold">Kontaktanfragen möglich</div>
              <div className="mt-2 text-sm font-semibold text-zinc-600">Keine Garantie – aber eine Chance.</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-3xl bg-white p-5 ring-1 ring-zinc-200">
              <div className="text-sm font-extrabold text-zinc-900">Fahrzeug</div>
              <div className="mt-1 text-sm font-semibold text-zinc-500">Womit bist du unterwegs?</div>
              <div className="mt-3 space-y-2">
                <VehicleButton id="car" label="Auto" Icon={Car} />
                <VehicleButton id="scooter" label="Moped / Scooter" Icon={Smartphone} />
                <VehicleButton id="bike" label="Fahrrad" Icon={Bike} />
              </div>
              <div className="mt-4 rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
                <div className="text-xs font-semibold text-zinc-500">Aktiv gewählt</div>
                <div className="mt-1 text-base font-extrabold text-zinc-900">{vehicleLabel}</div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-5 ring-1 ring-zinc-200">
              <div className="text-sm font-extrabold text-zinc-900">Was Restaurants sehen</div>
              <div className="mt-1 text-sm font-semibold text-zinc-500">Nur die Infos, die eine erste Kontaktaufnahme ermöglichen.</div>
              <div className="mt-4 space-y-2">
                {["Region(en)", "Verfügbarkeit", "Fahrzeug", "Nachweise (je nach Typ)", "Optional: Ausweis/Versicherung"].map((t) => (
                  <div key={t} className="flex items-center justify-between gap-3 rounded-2xl bg-zinc-50 px-4 py-3 ring-1 ring-zinc-200">
                    <div className="text-sm font-extrabold text-zinc-900">{t}</div>
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl bg-zinc-900 p-4 text-white">
                <div className="text-sm font-extrabold">Hinweis</div>
                <div className="mt-1 text-sm font-semibold text-white/75">Dokumente können Vertrauen schaffen – garantieren aber nichts.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application form */}
      <div id="bewerben" className="mx-auto max-w-[1400px] px-4 py-10">
        <SectionTitle
          kicker="Bewerben / Registrieren"
          title="Profil anlegen"
          subtitle="Gewerbeanmeldung ist nur bei Selbständig Pflicht. Kein Anspruch auf Vermittlung oder Anstellung."
        />

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-5 ring-1 ring-zinc-200 lg:col-span-7">
            <div className="mb-4 rounded-3xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
              <div className="text-sm font-extrabold text-zinc-900">Ich bin …</div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setCandidateType("self")}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-left ring-1 transition",
                    candidateType === "self" ? "bg-zinc-900 text-white ring-zinc-900" : "bg-white text-zinc-900 ring-zinc-200 hover:bg-zinc-100"
                  )}
                >
                  <div className="text-sm font-extrabold">Selbständig</div>
                  <div className={cn("text-xs font-semibold", candidateType === "self" ? "text-white/70" : "text-zinc-500")}>
                    Gewerbe-Nachweis ist Pflicht.
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setCandidateType("employee")}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-left ring-1 transition",
                    candidateType === "employee" ? "bg-zinc-900 text-white ring-zinc-900" : "bg-white text-zinc-900 ring-zinc-200 hover:bg-zinc-100"
                  )}
                >
                  <div className="text-sm font-extrabold">Fixer Job (Angestellt)</div>
                  <div className={cn("text-xs font-semibold", candidateType === "employee" ? "text-white/70" : "text-zinc-500")}>
                    Bewerbung – keine Job-Zusage.
                  </div>
                </button>
              </div>
              <div className="mt-3 text-xs font-semibold text-zinc-600">
                Wichtig: Keine Garantie, keine Zusage. Restaurants können dich anfragen – es gibt keinen Anspruch auf Vermittlung oder Anstellung.
              </div>
            </div>

            <AnimatePresence>
              {success ? (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-4 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-emerald-900">Eingegangen 🎉</div>
                        <div className="mt-1 text-sm font-semibold text-emerald-800">
                          Deine Driver-ID: <span className="font-extrabold">{success.id}</span>
                        </div>
                        <div className="mt-1 text-xs font-semibold text-emerald-800/80">
                          Nächster Schritt: Prüfung – danach kann dein Profil im Pool sichtbar werden.
                        </div>
                      </div>
                    </div>
                    <button type="button" onClick={() => setSuccess(null)} className="rounded-full p-2 text-emerald-800 hover:bg-emerald-100" aria-label="Schließen">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Vor- und Nachname" required error={errors.fullName}>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={cn(
                    "w-full rounded-2xl bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 ring-1 focus:outline-none focus:ring-2",
                    errors.fullName ? "ring-rose-200 focus:ring-rose-400" : "ring-zinc-200 focus:ring-zinc-900"
                  )}
                  placeholder="Mario Musterfahrer"
                />
              </Field>

              <Field label="E-Mail" required error={errors.email}>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "w-full rounded-2xl bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 ring-1 focus:outline-none focus:ring-2",
                    errors.email ? "ring-rose-200 focus:ring-rose-400" : "ring-zinc-200 focus:ring-zinc-900"
                  )}
                  placeholder="name@email.at"
                />
              </Field>

              <Field label="Telefon" required error={errors.phone}>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={cn(
                    "w-full rounded-2xl bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 ring-1 focus:outline-none focus:ring-2",
                    errors.phone ? "ring-rose-200 focus:ring-rose-400" : "ring-zinc-200 focus:ring-zinc-900"
                  )}
                  placeholder="+43 660 …"
                />
              </Field>

              <Field label="Region(en)" hint="Mehrere möglich" required error={errors.regions}>
                <input
                  value={regions}
                  onChange={(e) => setRegions(e.target.value)}
                  className={cn(
                    "w-full rounded-2xl bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 ring-1 focus:outline-none focus:ring-2",
                    errors.regions ? "ring-rose-200 focus:ring-rose-400" : "ring-zinc-200 focus:ring-zinc-900"
                  )}
                  placeholder="z.B. Wien 1–23, Mödling, Baden"
                />
              </Field>

              {candidateType === "self" ? (
                <>
                  <Field label="Firmenname / Gewerbe" required error={errors.companyName}>
                    <input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className={cn(
                        "w-full rounded-2xl bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 ring-1 focus:outline-none focus:ring-2",
                        errors.companyName ? "ring-rose-200 focus:ring-rose-400" : "ring-zinc-200 focus:ring-zinc-900"
                      )}
                      placeholder="Muster Delivery e.U."
                    />
                  </Field>

                  <Field label="UID (optional)" hint="falls vorhanden">
                    <input
                      value={uid}
                      onChange={(e) => setUid(e.target.value)}
                      className="w-full rounded-2xl bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 ring-1 ring-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                      placeholder="ATU…"
                    />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Anstellungsart" required error={errors.employmentModel}>
                    <select
                      value={employmentModel}
                      onChange={(e) => setEmploymentModel(e.target.value)}
                      className={cn(
                        "w-full rounded-2xl bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 ring-1 focus:outline-none focus:ring-2",
                        errors.employmentModel ? "ring-rose-200 focus:ring-rose-400" : "ring-zinc-200 focus:ring-zinc-900"
                      )}
                    >
                      <option>Vollzeit</option>
                      <option>Teilzeit</option>
                      <option>Geringfügig</option>
                      <option>Wochenendjob</option>
                    </select>
                  </Field>

                  <Field label="Frühester Start (optional)" hint="z.B. sofort / Datum">
                    <input
                      value={earliestStart}
                      onChange={(e) => setEarliestStart(e.target.value)}
                      className="w-full rounded-2xl bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 ring-1 ring-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                      placeholder="Sofort / 01.02.2026"
                    />
                  </Field>
                </>
              )}

              <Field label="Verfügbarkeit" hint="kurz & klar" required error={errors.availability}>
                <input
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className={cn(
                    "w-full rounded-2xl bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 ring-1 focus:outline-none focus:ring-2",
                    errors.availability ? "ring-rose-200 focus:ring-rose-400" : "ring-zinc-200 focus:ring-zinc-900"
                  )}
                  placeholder="Mo–Fr ab 17:00, Sa/So flexibel"
                />
              </Field>

              {candidateType === "self" ? (
                <Field label="Auszahlung (optional)" hint="IBAN/Wallet">
                  <input
                    value={bankOrPayout}
                    onChange={(e) => setBankOrPayout(e.target.value)}
                    className="w-full rounded-2xl bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 ring-1 ring-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    placeholder="IBAN / Bank / Wallet"
                  />
                </Field>
              ) : (
                <Field label="Kurzprofil (optional)" hint="2–3 Sätze">
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full rounded-2xl bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 ring-1 ring-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    placeholder="z.B. 2 Jahre Fahrerfahrung, zuverlässig, Abenddienste"
                  />
                </Field>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              {candidateType === "self" ? (
                <UploadCard
                  title="Gewerbeanmeldung"
                  required
                  value={tradeLicense}
                  onChange={setTradeLicense}
                  accept="application/pdf,image/*"
                  error={errors.tradeLicense}
                  description="Pflicht bei Selbständig: Ohne Gewerbe keine Listung als Selbständiger."
                />
              ) : (
                <UploadCard
                  title="Lebenslauf / CV (optional)"
                  required={false}
                  value={cvFile}
                  onChange={setCvFile}
                  accept="application/pdf,image/*"
                  error={null}
                  description="Optional bei Angestellt: Hilft bei der ersten Einschätzung – garantiert aber nichts."
                />
              )}

              <UploadCard
                title="Ausweis (optional)"
                required={false}
                value={idDoc}
                onChange={setIdDoc}
                accept="application/pdf,image/*"
                error={null}
                description="Optional: Kann Vertrauen erhöhen, ist aber keine Garantie."
              />
              <UploadCard
                title="Versicherung (optional)"
                required={false}
                value={insuranceDoc}
                onChange={setInsuranceDoc}
                accept="application/pdf,image/*"
                error={null}
                description="Optional: z.B. Haftpflicht/Transport – je nach Setup."
              />
            </div>

            <div className="mt-4 rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-zinc-300 text-zinc-900"
                />
                <div>
                  <div className="text-sm font-extrabold text-zinc-900">Einverständnis</div>
                  <div className="mt-1 text-sm font-semibold text-zinc-600">
                    Ich bestätige, dass meine Angaben stimmen und Gastro CMS meine Daten zum Zweck der Kontaktanbahnung an Restaurants weitergeben darf. Mir ist bewusst, dass es keinen Anspruch auf Vermittlung oder Anstellung gibt.
                  </div>
                  {errors.agree ? <div className="mt-2 text-xs font-semibold text-rose-600">{errors.agree}</div> : null}
                </div>
              </label>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs font-semibold text-zinc-500">DSGVO: Nur nötige Daten, klare Zweckbindung.</div>
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-extrabold text-white shadow hover:bg-zinc-800",
                  loading && "opacity-70"
                )}
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Senden …
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" /> Abschicken
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-3xl bg-white p-5 ring-1 ring-zinc-200">
              <div className="text-sm font-extrabold text-zinc-900">Warum das Portal Sinn macht</div>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-600">
                Wenn Restaurants keine Fahrer haben, ist das Business blockiert. Du bringst Option & Planbarkeit – ohne Versprechen. Ein sauberes Profil hilft, schneller ins Gespräch zu kommen.
              </p>
              <div className="mt-4 space-y-2">
                {["Zentraler Einstieg", "Klare Unterlagen", "Kontakt auf Anfrage – keine Zusage"].map((t) => (
                  <div key={t} className="flex items-center gap-3 rounded-2xl bg-zinc-50 px-4 py-3 ring-1 ring-zinc-200">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <div className="text-sm font-extrabold text-zinc-900">{t}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-zinc-900 p-5 text-white">
              <div className="text-sm font-extrabold">Pro-Positionierung</div>
              <div className="mt-2 text-sm font-semibold text-white/75">„Profil anlegen – sichtbar werden.“ Kurz, ehrlich, verständlich. Ohne Zusagen.</div>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                  <div className="text-xs font-semibold text-white/70">Ziel</div>
                  <div className="mt-1 text-base font-extrabold">Kontakt</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                  <div className="text-xs font-semibold text-white/70">Ehrlich</div>
                  <div className="mt-1 text-base font-extrabold">Keine Garantie</div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-5 ring-1 ring-zinc-200">
              <div className="text-sm font-extrabold text-zinc-900">Mini-FAQ</div>
              <div className="mt-3 space-y-2">
                {[
                  {
                    q: "Muss ich selbständig sein?",
                    a: "Nein. Du kannst dich auch als ‚Fixer Job (Angestellt)‘ bewerben. Gewerbe ist nur bei Selbständig Pflicht.",
                  },
                  {
                    q: "Bekomme ich garantiert Aufträge oder einen Job?",
                    a: "Nein. Restaurants können dich anfragen. Es gibt keinen Anspruch auf Vermittlung oder Anstellung.",
                  },
                  {
                    q: "Auto/Moped/Fahrrad – geht alles?",
                    a: "Ja. Du gibst dein Setup an – Restaurants entscheiden, was sie suchen.",
                  },
                ].map((x) => (
                  <div key={x.q} className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
                    <div className="text-sm font-extrabold text-zinc-900">{x.q}</div>
                    <div className="mt-1 text-sm font-semibold text-zinc-600">{x.a}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-10">
          <div className={cn("h-1 w-28 rounded-full", BRAND_GRAD)} />
          <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-base font-extrabold text-zinc-900">Gastro CMS Driver Portal</div>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-600">
                Portal für Fahrer (selbständig & angestellt). Ziel: Kontaktanbahnung zwischen Restaurants und Fahrern – ohne Versprechen.
              </p>
            </div>
            <div>
              <div className="text-sm font-extrabold text-zinc-900">Portal</div>
              <ul className="mt-3 space-y-2 text-sm font-semibold text-zinc-600">
                <li>
                  <a className="hover:text-zinc-900" href="#bewerben">Profil anlegen</a>
                </li>
                <li>
                  <a className="hover:text-zinc-900" href="#">Login</a>
                </li>
                <li>
                  <a className="hover:text-zinc-900" href="#">Hilfe</a>
                </li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-extrabold text-zinc-900">Unternehmen</div>
              <ul className="mt-3 space-y-2 text-sm font-semibold text-zinc-600">
                <li>
                  <a className="hover:text-zinc-900" href="#">Kontakt</a>
                </li>
                <li>
                  <a className="hover:text-zinc-900" href="#">Partner</a>
                </li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-extrabold text-zinc-900">Rechtliches</div>
              <ul className="mt-3 space-y-2 text-sm font-semibold text-zinc-600">
                <li>
                  <a className="hover:text-zinc-900" href="#">Impressum</a>
                </li>
                <li>
                  <a className="hover:text-zinc-900" href="#">Datenschutz</a>
                </li>
                <li>
                  <a className="hover:text-zinc-900" href="#">AGB</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 border-t border-zinc-200 pt-6 text-sm font-semibold text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
            <div>© {new Date().getFullYear()} Gastro CMS 3.0 • Alle Rechte vorbehalten</div>
            <div className="text-xs font-semibold text-zinc-500">* Demo-UI. Keine Zusage/Garantie.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
