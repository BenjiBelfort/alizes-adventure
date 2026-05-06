import { useMemo, useState } from "react";
import {
  BOAT_CAPACITY,
  PERIOD_LABEL,
  PERIOD_TIME,
  type AdminSlot,
  type Period,
  type Reservation,
  initialReservations,
  initialSlots,
} from "../data/adminMockData";

type Tab = "dates" | "reservations";

const WEEK_DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthDays(currentMonth: Date) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();

  const days: Array<string | null> = [];

  for (let i = 0; i < startOffset; i += 1) {
    days.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    days.push(toDateInputValue(new Date(year, month, day)));
  }

  return days;
}

function getSlotId(date: string, period: Period) {
  return `slot-${date}-${period}`;
}

function getSlotLabel(slot: AdminSlot) {
  return `${PERIOD_LABEL[slot.period]} — ${slot.time}`;
}

export default function AdminReservations() {
  const [activeTab, setActiveTab] = useState<Tab>("dates");
  const [slots, setSlots] = useState<AdminSlot[]>(initialSlots);
  const [reservations] = useState<Reservation[]>(initialReservations);

  const [currentMonth, setCurrentMonth] = useState(
    new Date("2026-05-01T12:00:00"),
  );

  const [selectedDate, setSelectedDate] = useState<string>("2026-05-12");
  const [createMorning, setCreateMorning] = useState(true);
  const [createAfternoon, setCreateAfternoon] = useState(false);
  const [boatsTotal, setBoatsTotal] = useState(1);

  const reservationsBySlot = useMemo(() => {
    return reservations.reduce<Record<string, Reservation[]>>(
      (acc, reservation) => {
        if (reservation.status !== "confirmed") return acc;

        if (!acc[reservation.slotId]) {
          acc[reservation.slotId] = [];
        }

        acc[reservation.slotId].push(reservation);

        return acc;
      },
      {},
    );
  }, [reservations]);

  const slotsByDate = useMemo(() => {
    return slots.reduce<Record<string, AdminSlot[]>>((acc, slot) => {
      if (!acc[slot.date]) {
        acc[slot.date] = [];
      }

      acc[slot.date].push(slot);

      return acc;
    }, {});
  }, [slots]);

  const selectedDateSlots = useMemo(() => {
    return [...(slotsByDate[selectedDate] ?? [])].sort((a, b) => {
      if (a.period === b.period) return 0;
      return a.period === "morning" ? -1 : 1;
    });
  }, [slotsByDate, selectedDate]);

  const monthDays = useMemo(() => getMonthDays(currentMonth), [currentMonth]);

  const reservationGroups = useMemo(() => {
    const activeReservations = reservations.filter(
      (reservation) => reservation.status === "confirmed",
    );

    const groups = activeReservations.reduce<
      Record<
        string,
        {
          date: string;
          slots: Array<{
            slot: AdminSlot;
            reservations: Reservation[];
            passengers: number;
            remainingPlaces: number;
          }>;
        }
      >
    >((acc, reservation) => {
      const slot = slots.find((item) => item.id === reservation.slotId);

      if (!slot) return acc;

      if (!acc[slot.date]) {
        acc[slot.date] = {
          date: slot.date,
          slots: [],
        };
      }

      let slotGroup = acc[slot.date].slots.find(
        (item) => item.slot.id === slot.id,
      );

      if (!slotGroup) {
        slotGroup = {
          slot,
          reservations: [],
          passengers: 0,
          remainingPlaces: slot.boatsTotal * BOAT_CAPACITY,
        };

        acc[slot.date].slots.push(slotGroup);
      }

      slotGroup.reservations.push(reservation);
      slotGroup.passengers += reservation.passengers;
      slotGroup.remainingPlaces =
        slot.boatsTotal * BOAT_CAPACITY - slotGroup.passengers;

      return acc;
    }, {});

    return Object.values(groups).sort((a, b) => a.date.localeCompare(b.date));
  }, [reservations, slots]);

  function previousMonth() {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  }

  function nextMonth() {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  }

  function createSlotsForSelectedDate() {
    const periods: Period[] = [];

    if (createMorning) periods.push("morning");
    if (createAfternoon) periods.push("afternoon");

    if (periods.length === 0) {
      alert("Il faut choisir au moins un créneau. Sinon c’est une sortie fantôme.");
      return;
    }

    const existingPeriods = new Set(
      selectedDateSlots.map((slot) => slot.period),
    );

    const newSlots = periods
      .filter((period) => !existingPeriods.has(period))
      .map<AdminSlot>((period) => ({
        id: getSlotId(selectedDate, period),
        date: selectedDate,
        period,
        time: PERIOD_TIME[period],
        boatsTotal,
      }));

    if (newSlots.length === 0) {
      alert("Les créneaux sélectionnés existent déjà pour cette date.");
      return;
    }

    setSlots((current) => [...current, ...newSlots]);
  }

  function deleteSlot(slotId: string) {
    const relatedReservations = reservationsBySlot[slotId] ?? [];

    if (relatedReservations.length > 0) {
      const passengers = relatedReservations.reduce(
        (total, reservation) => total + reservation.passengers,
        0,
      );

      const confirmation = window.confirm(
        `⚠️ Attention : cette sortie contient déjà ${relatedReservations.length} réservation(s), soit ${passengers} passager(s).\n\nSi tu supprimes cette sortie, il faudra prévenir les clients par email.\n\nSupprimer quand même ?`,
      );

      if (!confirmation) return;
    }

    setSlots((current) => current.filter((slot) => slot.id !== slotId));
  }

  function getSlotStats(slot: AdminSlot) {
    const slotReservations = reservationsBySlot[slot.id] ?? [];

    const passengers = slotReservations.reduce(
      (total, reservation) => total + reservation.passengers,
      0,
    );

    const totalPlaces = slot.boatsTotal * BOAT_CAPACITY;
    const remainingPlaces = totalPlaces - passengers;

    return {
      reservationsCount: slotReservations.length,
      passengers,
      totalPlaces,
      remainingPlaces,
    };
  }

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-teal-600">
            Alizés Adventure
          </p>

          <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
            Admin réservations
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Prototype sans base de données. Les actions sont simulées pour
            valider le fonctionnement avant branchement réel.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">
            Aujourd’hui
          </p>
          <p className="mt-1 text-lg font-black">
            {new Intl.DateTimeFormat("fr-FR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }).format(new Date())}
          </p>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("dates")}
          className={`rounded-full px-5 py-3 text-sm font-black transition ${
            activeTab === "dates"
              ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20"
              : "bg-white text-slate-700 ring-1 ring-slate-200 hover:text-teal-700"
          }`}
        >
          Créer des dates
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reservations")}
          className={`rounded-full px-5 py-3 text-sm font-black transition ${
            activeTab === "reservations"
              ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20"
              : "bg-white text-slate-700 ring-1 ring-slate-200 hover:text-teal-700"
          }`}
        >
          Réservations effectuées
        </button>
      </div>

      {activeTab === "dates" ? (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 md:p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={previousMonth}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 transition hover:border-teal-500 hover:text-teal-700"
              >
                ←
              </button>

              <h2 className="text-center text-xl font-black capitalize text-slate-950 md:text-2xl">
                {formatMonth(currentMonth)}
              </h2>

              <button
                type="button"
                onClick={nextMonth}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 transition hover:border-teal-500 hover:text-teal-700"
              >
                →
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {WEEK_DAYS.map((day) => (
                <div
                  key={day}
                  className="pb-2 text-center text-xs font-black uppercase tracking-[0.12em] text-slate-400"
                >
                  {day}
                </div>
              ))}

              {monthDays.map((date, index) => {
                const daySlots = date ? slotsByDate[date] ?? [] : [];
                const isSelected = date === selectedDate;

                return (
                  <button
                    key={date ?? `empty-${index}`}
                    type="button"
                    disabled={!date}
                    onClick={() => date && setSelectedDate(date)}
                    className={`min-h-23 rounded-2xl border p-2 text-left transition disabled:pointer-events-none disabled:border-transparent disabled:bg-transparent ${
                      isSelected
                        ? "border-teal-500 bg-teal-50 ring-4 ring-teal-500/10"
                        : "border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50/40"
                    }`}
                  >
                    {date && (
                      <>
                        <span className="text-sm font-black text-slate-950">
                          {Number(date.slice(-2))}
                        </span>

                        <div className="mt-2 grid gap-1">
                          {daySlots.length === 0 ? (
                            <span className="text-xs font-bold text-slate-300">
                              —
                            </span>
                          ) : (
                            daySlots.map((slot) => {
                              const stats = getSlotStats(slot);

                              return (
                                <span
                                  key={slot.id}
                                  className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-black text-slate-700"
                                >
                                  {slot.period === "morning" ? "Matin" : "Aprem"}{" "}
                                  · {stats.remainingPlaces} pl.
                                </span>
                              );
                            })
                          )}
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </article>

          <aside className="grid gap-6">
            <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-600">
                Date sélectionnée
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                {formatDate(selectedDate)}
              </h2>

              <div className="mt-6 grid gap-4">
                <div>
                  <p className="mb-3 text-sm font-black text-slate-800">
                    Créer une sortie
                  </p>

                  <div className="grid gap-3">
                    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={createMorning}
                        onChange={(event) =>
                          setCreateMorning(event.target.checked)
                        }
                        className="size-4 accent-teal-600"
                      />
                      Sortie matin — 09:00
                    </label>

                    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={createAfternoon}
                        onChange={(event) =>
                          setCreateAfternoon(event.target.checked)
                        }
                        className="size-4 accent-teal-600"
                      />
                      Sortie après-midi — 14:00
                    </label>
                  </div>
                </div>

                <label className="grid gap-2 text-sm font-black text-slate-800">
                  Nombre de bateaux
                  <select
                    value={boatsTotal}
                    onChange={(event) =>
                      setBoatsTotal(Number(event.target.value))
                    }
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  >
                    <option value={1}>1 bateau — 4 places</option>
                    <option value={2}>2 bateaux — 8 places</option>
                  </select>
                </label>

                <button
                  type="button"
                  onClick={createSlotsForSelectedDate}
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-teal-700"
                >
                  Créer les sorties
                </button>
              </div>
            </article>

            <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
              <h2 className="text-xl font-black text-slate-950">
                Sorties créées ce jour
              </h2>

              <div className="mt-5 grid gap-3">
                {selectedDateSlots.length > 0 ? (
                  selectedDateSlots.map((slot) => {
                    const stats = getSlotStats(slot);
                    const hasReservations = stats.reservationsCount > 0;

                    return (
                      <div
                        key={slot.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-black text-slate-950">
                              {getSlotLabel(slot)}
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                              {stats.passengers}/{stats.totalPlaces} passagers ·{" "}
                              {stats.remainingPlaces} place(s) restante(s)
                            </p>

                            {hasReservations && (
                              <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
                                Attention : réservation(s) déjà enregistrée(s).
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => deleteSlot(slot.id)}
                            className="rounded-full bg-rose-600 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-rose-700"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-500">
                    Aucune sortie créée pour cette date.
                  </div>
                )}
              </div>
            </article>
          </aside>
        </section>
      ) : (
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 md:p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-950">
              Réservations en cours
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Liste groupée par jour, puis par créneau. C’est ici que le patron
              voit qui vient, combien de personnes, et les coordonnées.
            </p>
          </div>

          <div className="grid gap-6">
            {reservationGroups.length > 0 ? (
              reservationGroups.map((group) => (
                <article
                  key={group.date}
                  className="overflow-hidden rounded-3xl border border-slate-200"
                >
                  <header className="bg-slate-950 px-5 py-4 text-white">
                    <h3 className="text-lg font-black">
                      {formatDate(group.date)}
                    </h3>
                  </header>

                  <div className="divide-y divide-slate-200">
                    {group.slots.map((slotGroup) => (
                      <div key={slotGroup.slot.id} className="p-5">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-black text-slate-950">
                              {getSlotLabel(slotGroup.slot)}
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                              {slotGroup.passengers}/
                              {slotGroup.slot.boatsTotal * BOAT_CAPACITY}{" "}
                              passagers · {slotGroup.remainingPlaces} place(s)
                              restante(s)
                            </p>
                          </div>

                          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700 ring-1 ring-teal-200">
                            {slotGroup.reservations.length} réservation(s)
                          </span>
                        </div>

                        <div className="grid gap-3">
                          {slotGroup.reservations.map((reservation) => (
                            <div
                              key={reservation.id}
                              className="grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-[1fr_auto]"
                            >
                              <div>
                                <p className="font-black text-slate-950">
                                  {reservation.firstname} {reservation.lastname}
                                </p>

                                <div className="mt-2 grid gap-1 text-sm text-slate-600">
                                  <p>{reservation.email}</p>
                                  <p>{reservation.phone}</p>
                                </div>
                              </div>

                              <div className="flex items-center">
                                <span className="rounded-full bg-white px-3 py-2 text-sm font-black text-slate-800 ring-1 ring-slate-200">
                                  {reservation.passengers} passager(s)
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl bg-slate-50 p-8 text-center">
                <p className="font-black text-slate-700">
                  Aucune réservation en cours.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Calme plat. Même les poissons n’ont pas appelé.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}