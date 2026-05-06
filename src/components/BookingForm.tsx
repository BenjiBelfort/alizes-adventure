import type { ReactNode } from "react";

type Slot = {
  id: string;
  date: string;
  period: "morning" | "afternoon";
  label: string;
  boatsRemaining: number;
  placesRemaining: number;
};

type Props = {
  slot?: Slot;
  adults: number;
  children: number;
  passengers: number;
  boatsNeeded: number;
  totalPrice: number;
  canBook: boolean;
};

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parseDateKey(date));
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatPassengerDetail(adults: number, children: number) {
  const adultLabel = `${adults} adulte${adults > 1 ? "s" : ""}`;

  if (children <= 0) {
    return adultLabel;
  }

  const childLabel = `${children} enfant${children > 1 ? "s" : ""}`;

  return `${adultLabel} et ${childLabel}`;
}

const inputClass =
  "w-full rounded-xl border border-slate-900/10 bg-white px-4 py-3 font-normal text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10";

const labelClass = "grid gap-2 font-black text-slate-950";

function RequiredText({ children }: { children: ReactNode }) {
  return (
    <span>
      {children} <span className="text-red-600" aria-hidden="true">*</span>
      <span className="sr-only"> obligatoire</span>
    </span>
  );
}

export default function BookingForm({
  slot,
  adults,
  children,
  passengers,
  boatsNeeded,
  totalPrice,
  canBook,
}: Props) {
  return (
    <form
      className="grid min-w-0 grid-cols-[0.9fr_1.1fr] gap-6 rounded-3xl border border-slate-900/10 bg-white p-4 shadow-2xl shadow-slate-900/10 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:p-8 max-lg:grid-cols-1"
      onSubmit={(event) => {
        event.preventDefault();
        alert("Démo : la réservation sera branchée ensuite à Supabase.");
      }}
    >
      <div className="rounded-3xl bg-linear-to-br from-teal-950 via-slate-950 to-amber-950 p-5 text-white shadow-2xl shadow-teal-950/30 sm:p-6 lg:p-7">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-teal-300">
          Confirmation
        </p>

        <h2 className="font-['Baloo_2'] text-[clamp(2.2rem,4vw,4rem)] font-extrabold leading-none">
          Dernière étape
        </h2>

        <p className="mt-4 leading-relaxed text-white/65">
          Vérifiez votre sortie, laissez vos coordonnées, et la demande partira
          au capitaine.
        </p>

        {slot ? (
          <div className="mt-6 grid gap-3 rounded-2xl bg-white/10 p-4 sm:p-5">
            <div>
              <p className="mb-1 text-sm font-bold text-white/50">Date</p>
              <strong className="capitalize text-white">
                {formatDate(slot.date)}
              </strong>
            </div>

            <div>
              <p className="mb-1 text-sm font-bold text-white/50">Créneau</p>
              <strong className="text-white">{slot.label}</strong>
            </div>

            <div>
              <p className="mb-1 text-sm font-bold text-white/50">
                Participants
              </p>

              <strong className="block text-white">
                {formatPassengerDetail(adults, children)}
              </strong>

              <p className="mb-0 mt-1 text-sm font-semibold text-white/60">
                {passengers} personne{passengers > 1 ? "s" : ""} au total •{" "}
                {boatsNeeded} bateau{boatsNeeded > 1 ? "x" : ""} nécessaire
                {boatsNeeded > 1 ? "s" : ""}
              </p>
            </div>

            <div className="rounded-2xl border border-teal-300/20 bg-teal-300/5 p-4">
              <p className="mb-1 text-sm font-bold text-teal-100">
                Prix à payer au départ
              </p>

              <strong className="block text-3xl font-black text-white">
                {formatPrice(totalPrice)}
              </strong>

              <p className="mb-0 mt-2 text-sm font-semibold text-white/65">
                Paiement en espèces ou par chèque au départ de l’excursion.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl bg-white/10 p-4 sm:p-5">
            Sélectionnez un créneau.
          </div>
        )}
      </div>

      <div className="grid min-w-0 gap-5">
        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <label className={labelClass}>
            <RequiredText>Prénom</RequiredText>
            <input className={inputClass} name="firstname" type="text" required />
          </label>

          <label className={labelClass}>
            <RequiredText>Nom</RequiredText>
            <input className={inputClass} name="lastname" type="text" required />
          </label>

          <label className={labelClass}>
            <RequiredText>E-mail</RequiredText>
            <input className={inputClass} name="email" type="email" required />
          </label>

          <label className={labelClass}>
            <RequiredText>Téléphone</RequiredText>
            <input className={inputClass} name="phone" type="tel" required />
          </label>
        </div>

        <label className={labelClass}>
          Message optionnel
          <textarea
            className={inputClass}
            name="message"
            rows={5}
            placeholder="Une précision, une question, une demande spéciale ?"
          ></textarea>
        </label>

        <label className="flex items-start gap-3 font-semibold text-slate-700">
          <input
            className="mt-1 size-4 shrink-0 accent-teal-600"
            name="cgv"
            type="checkbox"
            required
          />
          <span>
            J’ai lu et j’accepte les conditions générales de réservation{" "}
            <span className="text-red-600" aria-hidden="true">*</span>
            <span className="sr-only"> obligatoire</span>
          </span>
        </label>

        <p className="-mt-2 text-sm text-slate-500">
          <span className="text-red-600">*</span> Champs obligatoires
        </p>

        <button
          className="inline-flex min-h-14 w-full cursor-pointer touch-manipulation items-center justify-center rounded-full bg-teal-500 px-8 py-4 text-lg font-black text-white shadow-2xl shadow-teal-700/20 transition hover:-translate-y-0.5 hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          type="submit"
          disabled={!canBook}
        >
          Envoyer ma demande de réservation
        </button>

        {!canBook && (
          <p className="m-0 text-sm text-slate-500">
            Ce créneau ne peut pas accueillir ce nombre de personnes.
          </p>
        )}
      </div>
    </form>
  );
}