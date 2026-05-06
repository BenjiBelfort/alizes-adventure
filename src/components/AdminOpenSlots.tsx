// src/components/AdminOpenSlots.tsx

import {
  BOAT_CAPACITY,
  PERIOD_LABEL,
  type AdminSlot,
  type Reservation,
} from "../data/adminMockData";

type Props = {
  slots: AdminSlot[];
  setSlots: React.Dispatch<React.SetStateAction<AdminSlot[]>>;
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

function formatShortDate(dateKey: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parseDateKey(dateKey));
}

function getPassengersTotal(reservation: Reservation) {
  return reservation.adults + reservation.children;
}

function getReservationBoatsNeeded(reservation: Reservation) {
  return Math.ceil(getPassengersTotal(reservation) / BOAT_CAPACITY);
}

function getPeriodOrder(period: AdminSlot["period"]) {
  const order: Record<AdminSlot["period"], number> = {
    morningEarly: 1,
    morning: 2,
    afternoon: 3,
  };

  return order[period];
}

export default function AdminOpenSlots({
  slots,
  setSlots,
  reservations,
}: Props) {
  const sortedSlots = [...slots].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);

    if (dateCompare !== 0) {
      return dateCompare;
    }

    return getPeriodOrder(a.period) - getPeriodOrder(b.period);
  });

  function updateSlotBoats(slotId: string, value: number) {
    const boatsTotal = Math.max(1, Math.min(12, value));

    setSlots((currentSlots) =>
      currentSlots.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              boatsTotal,
            }
          : slot
      )
    );
  }

  function deleteSlot(slotId: string) {
    const hasReservations = reservations.some(
      (reservation) => reservation.slotId === slotId
    );

    if (hasReservations) {
      alert(
        "Ce créneau contient déjà des réservations. Pour éviter les bêtises, on ne le supprime pas directement."
      );
      return;
    }

    setSlots((currentSlots) =>
      currentSlots.filter((slot) => slot.id !== slotId)
    );
  }

  return (
    <section className="grid gap-5 rounded-4xl border border-slate-900/10 bg-white p-5 shadow-2xl shadow-slate-900/10 md:p-8">
      <div>
        <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-teal-600">
          Planning
        </p>

        <h2 className="font-['Baloo_2'] text-4xl font-extrabold leading-none text-slate-950">
          Sorties ouvertes
        </h2>

        <p className="mt-3 max-w-2xl font-semibold text-slate-600">
          Vue rapide des créneaux disponibles, avec le nombre de personnes
          inscrites, les bateaux utilisés et les sorties complètes.
        </p>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-900/10">
        <table className="w-full min-w-245 border-collapse text-left">
          <thead className="bg-slate-950 text-white">
            <tr>
              <th className="px-4 py-4 text-sm font-black">Date</th>
              <th className="px-4 py-4 text-sm font-black">Créneau</th>
              <th className="px-4 py-4 text-sm font-black">Heure</th>
              <th className="px-4 py-4 text-sm font-black">Personnes</th>
              <th className="px-4 py-4 text-sm font-black">Bateaux</th>
              <th className="px-4 py-4 text-sm font-black">État</th>
              <th className="px-4 py-4 text-right text-sm font-black">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedSlots.map((slot) => {
              const confirmedReservations = reservations.filter(
                (reservation) =>
                  reservation.slotId === slot.id &&
                  reservation.status === "confirmed"
              );

              const passengersTotal = confirmedReservations.reduce(
                (total, reservation) => total + getPassengersTotal(reservation),
                0
              );

              const boatsUsed = confirmedReservations.reduce(
                (total, reservation) =>
                  total + getReservationBoatsNeeded(reservation),
                0
              );

              const boatsRemaining = Math.max(0, slot.boatsTotal - boatsUsed);
              const isFull = boatsRemaining <= 0;

              return (
                <tr
                  key={slot.id}
                  className="border-t border-slate-900/10 odd:bg-white even:bg-slate-50"
                >
                  <td className="px-4 py-4">
                    <strong className="block text-slate-950">
                      {formatShortDate(slot.date)}
                    </strong>
                    <span className="text-xs font-semibold text-slate-500">
                      {formatDate(slot.date)}
                    </span>
                  </td>

                  <td className="px-4 py-4 font-semibold text-slate-600">
                    {PERIOD_LABEL[slot.period]}
                  </td>

                  <td className="px-4 py-4 font-black text-slate-950">
                    {slot.time}
                  </td>

                  <td className="px-4 py-4 font-black text-slate-950">
                    {passengersTotal}
                  </td>

                  <td className="px-4 py-4">
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={slot.boatsTotal}
                      onChange={(event) =>
                        updateSlotBoats(slot.id, Number(event.target.value))
                      }
                      className="h-10 w-20 rounded-xl border border-slate-900/10 bg-white px-3 font-black text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                    />

                    <span className="ml-2 text-sm font-semibold text-slate-500">
                      {boatsUsed}/{slot.boatsTotal} utilisé
                      {boatsUsed > 1 ? "s" : ""}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={[
                        "rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide",
                        isFull
                          ? "bg-red-50 text-red-700"
                          : "bg-teal-50 text-teal-700",
                      ].join(" ")}
                    >
                      {isFull
                        ? "Complet"
                        : `${boatsRemaining} bateau${
                            boatsRemaining > 1 ? "x" : ""
                          } libre${boatsRemaining > 1 ? "s" : ""}`}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => deleteSlot(slot.id)}
                      className="cursor-pointer rounded-full bg-red-50 px-4 py-2 text-sm font-black text-red-700 transition hover:bg-red-100"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              );
            })}

            {sortedSlots.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center font-black text-slate-500"
                >
                  Aucune sortie ouverte pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}