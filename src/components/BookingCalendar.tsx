import { useMemo, useRef, useState } from "react";
import BookingForm from "./BookingForm";
import rawDemoSlots from "../data/demoSlots.json";

type Period = "morning" | "afternoon";

type RawSlot = {
  id: string;
  date: string;
  period: Period;
  time: string;
  boatsRemaining: number;
};

type Slot = {
  id: string;
  date: string;
  period: Period;
  label: string;
  boatsRemaining: number;
  placesRemaining: number;
};

const BOAT_CAPACITY = 4;

const PERIOD_LABEL: Record<Period, string> = {
  morning: "Matin",
  afternoon: "Après-midi",
};

const WEEK_DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function normalizeSlot(slot: RawSlot): Slot {
  return {
    id: slot.id,
    date: slot.date,
    period: slot.period,
    label: `${PERIOD_LABEL[slot.period]} — rendez-vous ${slot.time}`,
    boatsRemaining: slot.boatsRemaining,
    placesRemaining: slot.boatsRemaining * BOAT_CAPACITY,
  };
}

const demoSlots: Slot[] = (rawDemoSlots as RawSlot[]).map(normalizeSlot);

function getUniqueSortedDates(slots: Slot[]) {
  return Array.from(new Set(slots.map((slot) => slot.date))).sort();
}

function groupSlotsByDate(slots: Slot[]) {
  return slots.reduce<Record<string, Slot[]>>((acc, slot) => {
    acc[slot.date] ??= [];
    acc[slot.date].push(slot);
    return acc;
  }, {});
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(dateKey: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(parseDateKey(dateKey));
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function boatsNeeded(passengers: number) {
  return Math.ceil(passengers / BOAT_CAPACITY);
}

function getCalendarDays(monthDate: Date): Array<Date | null> {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const mondayBasedStartOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays: Array<Date | null> = [];

  for (let i = 0; i < mondayBasedStartOffset; i += 1) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    calendarDays.push(new Date(year, month, day));
  }

  return calendarDays;
}

function getDayAvailability(slots: Slot[]) {
  const hasSlots = slots.length > 0;
  const isFull = hasSlots && slots.every((slot) => slot.boatsRemaining <= 0);

  const hasMorning = slots.some(
    (slot) => slot.period === "morning" && slot.boatsRemaining > 0
  );

  const hasAfternoon = slots.some(
    (slot) => slot.period === "afternoon" && slot.boatsRemaining > 0
  );

  const boatsRemaining = slots.reduce(
    (total, slot) => total + slot.boatsRemaining,
    0
  );

  return {
    hasSlots,
    isFull,
    hasMorning,
    hasAfternoon,
    boatsRemaining,
  };
}

function getAvailabilityLabel(boatsRemaining: number) {
  if (boatsRemaining <= 0) {
    return "Complet";
  }

  if (boatsRemaining === 1) {
    return "1 bateau disponible";
  }

  return `${boatsRemaining} bateaux disponibles`;
}

export default function BookingCalendar() {
  const dates = useMemo(() => getUniqueSortedDates(demoSlots), []);
  const slotsByDate = useMemo(() => groupSlotsByDate(demoSlots), []);

  const firstAvailableDate =
    dates.find((date) => {
      const slots = slotsByDate[date] ?? [];
      return slots.some((slot) => slot.boatsRemaining > 0);
    }) ?? dates[0];

  const firstAvailableSlot =
    slotsByDate[firstAvailableDate]?.find((slot) => slot.boatsRemaining > 0) ??
    slotsByDate[firstAvailableDate]?.[0];

  const [selectedDate, setSelectedDate] = useState(firstAvailableDate);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(
    firstAvailableSlot?.id ?? null
  );

  const [passengers, setPassengers] = useState(2);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    firstAvailableDate ? parseDateKey(firstAvailableDate) : new Date()
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);

  const calendarDays = useMemo<Array<Date | null>>(
    () => getCalendarDays(visibleMonth),
    [visibleMonth]
  );

  const selectedSlots = slotsByDate[selectedDate] ?? [];
  const selectedSlot = selectedSlots.find((slot) => slot.id === selectedSlotId);

  const needed = boatsNeeded(passengers);
  const canBook = selectedSlot ? needed <= selectedSlot.boatsRemaining : false;

  function closeForm() {
    setIsFormOpen(false);
  }

  function openBookingForm() {
    setIsFormOpen(true);

    window.setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  }

  function goToPreviousMonth() {
    setVisibleMonth((date) => {
      return new Date(date.getFullYear(), date.getMonth() - 1, 1);
    });

    closeForm();
  }

  function goToNextMonth() {
    setVisibleMonth((date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 1);
    });

    closeForm();
  }

  function selectDate(dateKey: string) {
    const slots = slotsByDate[dateKey] ?? [];
    const firstAvailableSlot =
      slots.find((slot) => slot.boatsRemaining > 0) ?? slots[0];

    setSelectedDate(dateKey);
    setSelectedSlotId(firstAvailableSlot?.id ?? null);
    closeForm();
  }

  function selectSlot(slotId: string) {
    setSelectedSlotId(slotId);
    closeForm();
  }

  function decrementPassengers() {
    setPassengers((value) => Math.max(1, value - 1));
    closeForm();
  }

  function incrementPassengers() {
    setPassengers((value) => Math.min(16, value + 1));
    closeForm();
  }

  function updatePassengers(value: number) {
    if (Number.isNaN(value)) {
      setPassengers(1);
      closeForm();
      return;
    }

    setPassengers(Math.min(16, Math.max(1, value)));
    closeForm();
  }

  return (
    <section className="relative z-30 grid min-w-0 gap-6 py-10 md:gap-8 md:py-20">
      <div className="relative z-30 min-w-0 rounded-[28px] border border-slate-900/10 bg-white p-4 shadow-2xl shadow-slate-900/10 sm:p-6 lg:p-8">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-teal-600">
            Réservation démo
          </p>

          <h2 className="font-['Baloo_2'] text-[clamp(2.2rem,4vw,4rem)] font-extrabold leading-none text-slate-950">
            Choisissez votre sortie
          </h2>

          <p className="mt-4 leading-relaxed text-slate-600">
            Sélectionnez une date, un créneau, puis indiquez le nombre de
            participants. Ensuite, validez votre demande avec vos informations.
          </p>
        </div>

        <div className="mt-8 grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
          {/* Calendrier */}
          <div className="relative z-30 isolate min-w-0 rounded-3xl border border-slate-900/10 bg-slate-50 p-2 sm:p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="relative z-40 grid size-11 cursor-pointer touch-manipulation place-items-center rounded-xl bg-white text-xl font-black text-slate-900 shadow-sm ring-1 ring-slate-900/10 transition hover:bg-teal-50 hover:text-teal-700"
                aria-label="Mois précédent"
              >
                ←
              </button>

              <strong className="text-center text-base font-black capitalize text-slate-950 sm:text-lg">
                {formatMonth(visibleMonth)}
              </strong>

              <button
                type="button"
                onClick={goToNextMonth}
                className="relative z-40 grid size-11 cursor-pointer touch-manipulation place-items-center rounded-xl bg-white text-xl font-black text-slate-900 shadow-sm ring-1 ring-slate-900/10 transition hover:bg-teal-50 hover:text-teal-700"
                aria-label="Mois suivant"
              >
                →
              </button>
            </div>

            <div className="grid min-w-0 grid-cols-7 gap-1 sm:gap-2">
              {WEEK_DAYS.map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-[10px] font-black uppercase tracking-wide text-slate-400 sm:text-xs"
                >
                  {day}
                </div>
              ))}

              {calendarDays.map((date, index) => {
                if (!date) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="h-12 sm:aspect-square sm:h-auto"
                    />
                  );
                }

                const dateKey = toDateKey(date);
                const slots = slotsByDate[dateKey] ?? [];
                const {
                  hasSlots,
                  isFull,
                  hasMorning,
                  hasAfternoon,
                  boatsRemaining,
                } = getDayAvailability(slots);

                const isSelected = dateKey === selectedDate;

                return (
                  <button
                    key={dateKey}
                    type="button"
                    disabled={!hasSlots || isFull}
                    onClick={() => selectDate(dateKey)}
                    title={
                      hasSlots
                        ? getAvailabilityLabel(boatsRemaining)
                        : "Aucun créneau"
                    }
                    className={[
                      "relative z-40 flex h-12 min-w-0 cursor-pointer touch-manipulation flex-col items-center justify-center rounded-xl border p-1 text-sm font-black transition disabled:cursor-not-allowed sm:aspect-square sm:h-auto sm:rounded-2xl",
                      isSelected
                        ? "border-teal-500 bg-teal-500 text-white shadow-xl shadow-teal-700/20"
                        : hasSlots && !isFull
                          ? "border-slate-900/10 bg-white text-slate-950 hover:border-teal-400 hover:bg-teal-50"
                          : "border-transparent bg-transparent text-slate-300",
                    ].join(" ")}
                  >
                    <span className="pointer-events-none leading-none">
                      {date.getDate()}
                    </span>

                    {hasSlots && !isFull && (
                      <span className="pointer-events-none absolute bottom-1.5 flex gap-1 sm:bottom-2">
                        {hasMorning && (
                          <span
                            className={[
                              "size-1.5 rounded-full",
                              isSelected ? "bg-white" : "bg-amber-400",
                            ].join(" ")}
                            title="Matin disponible"
                          />
                        )}

                        {hasAfternoon && (
                          <span
                            className={[
                              "size-1.5 rounded-full",
                              isSelected ? "bg-white" : "bg-teal-500",
                            ].join(" ")}
                            title="Après-midi disponible"
                          />
                        )}
                      </span>
                    )}

                    {isFull && (
                      <span className="pointer-events-none absolute bottom-1 hidden text-[9px] font-black uppercase text-red-500 sm:block">
                        Complet
                      </span>
                    )}

                    {hasSlots && !isFull && boatsRemaining <= 2 && (
                      <span className="pointer-events-none absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-red-500 text-[10px] font-black text-white sm:right-1 sm:top-1">
                        {boatsRemaining}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-slate-500">
              <span className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full bg-amber-400" />
                Matin
              </span>

              <span className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full bg-teal-500" />
                Après-midi
              </span>

              <span className="inline-flex items-center gap-2">
                <span className="grid size-4 place-items-center rounded-full bg-red-500 text-[10px] font-black text-white">
                  1
                </span>
                Disponibilité faible
              </span>
            </div>
          </div>

          {/* Panneau choix */}
          <aside className="relative z-30 rounded-3xl border border-teal-900/10 bg-linear-to-br from-teal-50 via-white to-amber-50 p-4 shadow-xl shadow-slate-900/10 sm:p-6 xl:sticky xl:top-28">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-teal-700">
              Votre choix
            </p>

            <h3 className="font-['Baloo_2'] text-3xl font-extrabold leading-none text-slate-950 sm:text-4xl">
              Détails de la sortie
            </h3>

            <div className="mt-6 rounded-2xl border border-slate-900/10 bg-white p-4 shadow-sm">
              <p className="mb-1 text-sm font-bold text-slate-500">
                Date sélectionnée
              </p>

              <strong className="block text-lg font-black capitalize text-slate-950 sm:text-xl">
                {selectedDate
                  ? formatDate(selectedDate)
                  : "Choisissez une date"}
              </strong>
            </div>

            <div className="mt-5">
              <h4 className="mb-3 font-black text-slate-950">Créneau</h4>

              <div className="grid gap-3">
                {selectedSlots.length > 0 ? (
                  selectedSlots.map((slot) => {
                    const isSelected = slot.id === selectedSlotId;
                    const isFull = slot.boatsRemaining <= 0;

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={isFull}
                        className={[
                          "relative z-40 cursor-pointer touch-manipulation rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50",
                          isSelected
                            ? "border-teal-500 bg-teal-500/10 shadow-lg shadow-teal-700/10"
                            : "border-slate-900/10 bg-white hover:border-teal-400 hover:bg-teal-50",
                        ].join(" ")}
                        onClick={() => selectSlot(slot.id)}
                      >
                        <span className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
                          <strong className="flex items-center gap-2 text-slate-950">
                            <span
                              className={[
                                "size-2.5 rounded-full",
                                slot.period === "morning"
                                  ? "bg-amber-400"
                                  : "bg-teal-500",
                              ].join(" ")}
                              aria-hidden="true"
                            />
                            {PERIOD_LABEL[slot.period]}
                          </strong>

                          <em
                            className={[
                              "text-sm font-black not-italic",
                              isFull
                                ? "text-red-600"
                                : slot.boatsRemaining <= 2
                                  ? "text-orange-600"
                                  : "text-teal-700",
                            ].join(" ")}
                          >
                            {isFull
                              ? "Complet"
                              : getAvailabilityLabel(slot.boatsRemaining)}
                          </em>
                        </span>

                        <span className="mt-1 block text-sm text-slate-600">
                          {slot.label}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <p className="rounded-2xl border border-slate-900/10 bg-white p-4 font-semibold text-slate-500">
                    Aucun créneau disponible sur cette date.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-900/10 bg-white p-5 text-slate-950 shadow-sm">
              <label htmlFor="passengers" className="grid gap-2 font-black">
                Nombre de personnes
              </label>

              <div className="mt-3 grid grid-cols-[46px_1fr_46px] gap-2">
                <button
                  type="button"
                  className="cursor-pointer touch-manipulation rounded-xl bg-teal-500 text-2xl font-black text-white transition hover:bg-teal-600"
                  onClick={decrementPassengers}
                  aria-label="Retirer une personne"
                >
                  −
                </button>

                <input
                  id="passengers"
                  type="number"
                  min={1}
                  max={16}
                  value={passengers}
                  className="rounded-xl border border-slate-900/10 px-4 py-3 text-center font-semibold text-slate-950"
                  onChange={(event) => {
                    updatePassengers(Number(event.target.value));
                  }}
                />

                <button
                  type="button"
                  className="cursor-pointer touch-manipulation rounded-xl bg-teal-500 text-2xl font-black text-white transition hover:bg-teal-600"
                  onClick={incrementPassengers}
                  aria-label="Ajouter une personne"
                >
                  +
                </button>
              </div>

              <p
                className={[
                  "mb-0 mt-4 font-black",
                  canBook ? "text-teal-700" : "text-red-700",
                ].join(" ")}
              >
                {selectedSlot
                  ? canBook
                    ? `${needed} bateau(x) nécessaire(s). Réservation possible.`
                    : `${needed} bateau(x) nécessaire(s), mais seulement ${selectedSlot.boatsRemaining} disponible(s).`
                  : "Aucun créneau sélectionné."}
              </p>
            </div>

            <button
              type="button"
              disabled={!canBook}
              onClick={openBookingForm}
              className="mt-6 inline-flex min-h-14 w-full cursor-pointer touch-manipulation items-center justify-center rounded-full bg-teal-500 px-8 py-4 text-lg font-black text-white shadow-2xl shadow-teal-700/20 transition hover:-translate-y-0.5 hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              Réserver ce créneau
            </button>

            {!canBook && (
              <p className="mb-0 mt-3 text-sm font-semibold text-slate-500">
                Ce créneau ne peut pas accueillir ce nombre de personnes.
              </p>
            )}
          </aside>
        </div>
      </div>

      {isFormOpen && (
        <div ref={formRef} className="scroll-mt-28">
          <BookingForm
            slot={selectedSlot}
            passengers={passengers}
            boatsNeeded={needed}
            canBook={canBook}
          />
        </div>
      )}
    </section>
  );
}