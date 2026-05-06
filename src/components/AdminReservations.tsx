// src/components/AdminReservations.tsx

import {
  BOAT_CAPACITY,
  PERIOD_LABEL,
  type AdminSlot,
  type Reservation,
} from "../data/adminMockData";

const ADULT_PRICE = 50;
const CHILD_PRICE = 30;

type Props = {
  slots: AdminSlot[];
  reservations: Reservation[];
};

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(dateKey: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parseDateKey(dateKey));
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

function getPassengersTotal(reservation: Reservation) {
  return reservation.adults + reservation.children;
}

function getReservationBoatsNeeded(reservation: Reservation) {
  return Math.ceil(getPassengersTotal(reservation) / BOAT_CAPACITY);
}

function getReservationPrice(reservation: Reservation) {
  return reservation.adults * ADULT_PRICE + reservation.children * CHILD_PRICE;
}

function getPeriodOrder(period: AdminSlot["period"]) {
  const order: Record<AdminSlot["period"], number> = {
    morningEarly: 1,
    morning: 2,
    afternoon: 3,
  };

  return order[period];
}

export default function AdminReservations({ slots, reservations }: Props) {
  const sortedSlots = [...slots].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);

    if (dateCompare !== 0) {
      return dateCompare;
    }

    return getPeriodOrder(a.period) - getPeriodOrder(b.period);
  });

  return (
    <section className="grid gap-6 rounded-4xl border border-slate-900/10 bg-white p-5 shadow-2xl shadow-slate-900/10 md:p-8">
      <div>
        <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-teal-600">
          Réservations
        </p>

        <h2 className="font-['Baloo_2'] text-4xl font-extrabold leading-none text-slate-950">
          Réservations en cours
        </h2>

        <p className="mt-3 max-w-2xl font-semibold text-slate-600">
          Récapitulatif par sortie : inscrits, nombre de personnes, bateaux
          utilisés et montant à encaisser.
        </p>
      </div>

      <div className="grid gap-5">
        {sortedSlots.map((slot) => {
          const slotReservations = reservations.filter(
            (reservation) =>
              reservation.slotId === slot.id &&
              reservation.status === "confirmed"
          );

          const passengersTotal = slotReservations.reduce(
            (total, reservation) => total + getPassengersTotal(reservation),
            0
          );

          const boatsUsed = slotReservations.reduce(
            (total, reservation) =>
              total + getReservationBoatsNeeded(reservation),
            0
          );

          const boatsRemaining = Math.max(0, slot.boatsTotal - boatsUsed);

          const revenueTotal = slotReservations.reduce(
            (total, reservation) => total + getReservationPrice(reservation),
            0
          );

          const isFull = boatsRemaining <= 0;

          return (
            <article
              key={slot.id}
              className="overflow-hidden rounded-4xl border border-slate-900/10 bg-white shadow-xl shadow-slate-900/5"
            >
              <header className="grid gap-5 bg-slate-950 p-5 text-white md:p-6 xl:grid-cols-[1fr_620px]">
                <div className="min-w-0">
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-teal-300">
                    {PERIOD_LABEL[slot.period]} — rendez-vous {slot.time}
                  </p>

                  <h3 className="font-['Baloo_2'] text-3xl font-extrabold leading-none md:text-4xl">
                    {formatDate(slot.date)}
                  </h3>

                  <div
                    className={[
                      "mt-4 inline-flex rounded-2xl px-4 py-2 text-sm font-black",
                      isFull
                        ? "bg-red-500 text-white"
                        : "bg-teal-400 text-slate-950",
                    ].join(" ")}
                  >
                    {isFull
                      ? "Sortie complète"
                      : `${boatsRemaining} bateau${
                          boatsRemaining > 1 ? "x" : ""
                        } encore disponible${
                          boatsRemaining > 1 ? "s" : ""
                        }`}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-white/45">
                      Inscrits
                    </p>

                    <strong className="mt-1 block text-3xl font-black">
                      {passengersTotal}
                    </strong>

                    <p className="mt-1 text-xs font-semibold text-white/50">
                      personne{passengersTotal > 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-white/45">
                      Bateaux
                    </p>

                    <strong className="mt-1 block text-3xl font-black">
                      {boatsUsed}/{slot.boatsTotal}
                    </strong>

                    <p className="mt-1 text-xs font-semibold text-white/50">
                      utilisé{boatsUsed > 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-white/45">
                      Restant
                    </p>

                    <strong className="mt-1 block text-3xl font-black">
                      {boatsRemaining}
                    </strong>

                    <p className="mt-1 text-xs font-semibold text-white/50">
                      bateau{boatsRemaining > 1 ? "x" : ""}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-teal-400/15 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-teal-100">
                      À encaisser
                    </p>

                    <strong className="mt-1 block text-3xl font-black">
                      {formatPrice(revenueTotal)}
                    </strong>

                    <p className="mt-1 text-xs font-semibold text-teal-100/70">
                      sur place
                    </p>
                  </div>
                </div>
              </header>

              {slotReservations.length > 0 ? (
                <>
                  {/* Version mobile */}
                  <div className="grid gap-3 p-4 md:hidden">
                    {slotReservations.map((reservation) => {
                      const passengers = getPassengersTotal(reservation);
                      const boats = getReservationBoatsNeeded(reservation);
                      const price = getReservationPrice(reservation);
                      const cleanPhone = reservation.phone.replaceAll(" ", "");

                      return (
                        <article
                          key={reservation.id}
                          className="rounded-3xl border border-slate-900/10 bg-white p-4 shadow-lg shadow-slate-900/5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="text-xl font-black leading-tight text-slate-950">
                                {reservation.firstname} {reservation.lastname}
                              </h4>

                              <p className="mt-1 text-sm font-semibold text-slate-500">
                                {passengers} personne
                                {passengers > 1 ? "s" : ""} • {boats} bateau
                                {boats > 1 ? "x" : ""}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-teal-50 px-3 py-2 text-right">
                              <p className="text-xs font-black uppercase tracking-wide text-teal-700">
                                À encaisser
                              </p>

                              <strong className="block text-lg font-black text-teal-700">
                                {formatPrice(price)}
                              </strong>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3">
                            <div>
                              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                                Adultes
                              </p>

                              <p className="text-lg font-black text-slate-950">
                                {reservation.adults}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                                Enfants
                              </p>

                              <p className="text-lg font-black text-slate-950">
                                {reservation.children}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-500">
                            <a
                              href={`mailto:${reservation.email}`}
                              className="break-all rounded-2xl bg-slate-50 px-4 py-3 transition hover:text-teal-700"
                            >
                              {reservation.email}
                            </a>

                            <a
                              href={`tel:${cleanPhone}`}
                              className="rounded-2xl bg-slate-50 px-4 py-3 transition hover:text-teal-700"
                            >
                              {reservation.phone}
                            </a>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <a
                              href={`tel:${cleanPhone}`}
                              className="inline-flex min-h-12 items-center justify-center rounded-full bg-teal-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-teal-700/20 transition hover:bg-teal-600"
                            >
                              Appeler
                            </a>

                            <a
                              href={`mailto:${reservation.email}`}
                              className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-900/10 bg-white px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-slate-50"
                            >
                              Email
                            </a>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {/* Version desktop */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-215 border-collapse text-left">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-4 py-3 text-sm font-black">Nom</th>
                          <th className="px-4 py-3 text-sm font-black">
                            Contact
                          </th>
                          <th className="px-4 py-3 text-sm font-black">
                            Personnes
                          </th>
                          <th className="px-4 py-3 text-sm font-black">
                            Bateaux utilisés
                          </th>
                          <th className="px-4 py-3 text-sm font-black">
                            À encaisser
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {slotReservations.map((reservation) => {
                          const passengers = getPassengersTotal(reservation);
                          const boats = getReservationBoatsNeeded(reservation);
                          const price = getReservationPrice(reservation);

                          return (
                            <tr
                              key={reservation.id}
                              className="border-t border-slate-900/10 odd:bg-white even:bg-slate-50"
                            >
                              <td className="px-4 py-4">
                                <strong className="block text-slate-950">
                                  {reservation.firstname} {reservation.lastname}
                                </strong>
                              </td>

                              <td className="px-4 py-4 text-sm font-semibold text-slate-500">
                                <a
                                  href={`mailto:${reservation.email}`}
                                  className="block transition hover:text-teal-700"
                                >
                                  {reservation.email}
                                </a>

                                <a
                                  href={`tel:${reservation.phone.replaceAll(
                                    " ",
                                    ""
                                  )}`}
                                  className="block transition hover:text-teal-700"
                                >
                                  {reservation.phone}
                                </a>
                              </td>

                              <td className="px-4 py-4 font-semibold text-slate-600">
                                <strong className="text-slate-950">
                                  {passengers}
                                </strong>{" "}
                                personne{passengers > 1 ? "s" : ""}
                                <br />
                                <span className="text-sm">
                                  {reservation.adults} adulte
                                  {reservation.adults > 1 ? "s" : ""} •{" "}
                                  {reservation.children} enfant
                                  {reservation.children > 1 ? "s" : ""}
                                </span>
                              </td>

                              <td className="px-4 py-4 font-black text-slate-950">
                                {boats}
                              </td>

                              <td className="px-4 py-4 font-black text-teal-700">
                                {formatPrice(price)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="p-5">
                  <div className="rounded-3xl border border-dashed border-slate-900/15 bg-slate-50 p-8 text-center">
                    <p className="font-black text-slate-950">
                      Aucune réservation sur cette sortie.
                    </p>

                    <p className="mt-2 text-sm font-semibold text-slate-500">
                      Pour l’instant, c’est calme. Même les crabes n’ont pas
                      réservé.
                    </p>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}