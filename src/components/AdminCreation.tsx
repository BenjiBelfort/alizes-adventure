// src/components/AdminCreation.tsx

import { useState } from "react";
import {
  PERIOD_TIME,
  type AdminSlot,
  type Period,
} from "../data/adminMockData";

type Props = {
  slots: AdminSlot[];
  setSlots: React.Dispatch<React.SetStateAction<AdminSlot[]>>;
};

const SLOT_OPTIONS: {
  period: Period;
  label: string;
  description: string;
}[] = [
  {
    period: "morningEarly",
    label: "Matin 7:15",
    description: "Compatible avec l’après-midi.",
  },
  {
    period: "morning",
    label: "Matin 9:00",
    description: "Bloque les autres créneaux de la journée.",
  },
  {
    period: "afternoon",
    label: "Après-midi 12:00",
    description: "Compatible avec le matin 7:15.",
  },
];

function buildSlotId(date: string, period: Period) {
  return `slot-${date}-${period}`;
}

function formatDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export default function AdminCreation({ slots, setSlots }: Props) {
  const [date, setDate] = useState("2026-05-20");
  const [selectedPeriods, setSelectedPeriods] = useState<Period[]>([
    "morningEarly",
  ]);
  const [boatsTotal, setBoatsTotal] = useState(4);

  const hasMorningEarly = selectedPeriods.includes("morningEarly");
  const hasMorning = selectedPeriods.includes("morning");
  const hasAfternoon = selectedPeriods.includes("afternoon");

  const periodOrder: Record<Period, number> = {
    morningEarly: 1,
    morning: 2,
    afternoon: 3,
    };

    const sortedSelectedPeriods = [...selectedPeriods].sort(
    (a, b) => periodOrder[a] - periodOrder[b]
    );

  function isDisabled(period: Period) {
    if (period === "morningEarly") {
      return hasMorning;
    }

    if (period === "morning") {
      return hasMorningEarly || hasAfternoon;
    }

    if (period === "afternoon") {
      return hasMorning;
    }

    return false;
  }

  function togglePeriod(period: Period) {
    if (isDisabled(period)) {
      return;
    }

    setSelectedPeriods((currentPeriods) => {
      if (currentPeriods.includes(period)) {
        return currentPeriods.filter((currentPeriod) => currentPeriod !== period);
      }

      if (period === "morning") {
        return ["morning"];
      }

      return [...currentPeriods, period].filter(
        (currentPeriod) => currentPeriod !== "morning"
      );
    });
  }

  function addSlots(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedPeriods.length === 0) {
      alert("Choisis au moins un créneau.");
      return;
    }

    const newSlots: AdminSlot[] = selectedPeriods.map((period) => ({
      id: buildSlotId(date, period),
      date,
      period,
      time: PERIOD_TIME[period],
      boatsTotal,
    }));

    const duplicatedSlots = newSlots.filter((newSlot) =>
      slots.some((slot) => slot.id === newSlot.id)
    );

    if (duplicatedSlots.length > 0) {
      alert("Un ou plusieurs créneaux existent déjà pour cette date.");
      return;
    }

    setSlots((currentSlots) => [...currentSlots, ...newSlots]);

    alert("Sortie créée. Champagne sans alcool, on reste pro.");
  }

  return (
    <section className="grid gap-6 rounded-4xl border border-slate-900/10 bg-white p-5 shadow-2xl shadow-slate-900/10 md:p-8">
      <div>
        <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-teal-600">
          Création des sorties
        </p>

        <h2 className="font-['Baloo_2'] text-4xl font-extrabold leading-none text-slate-950">
          Nouvelle journée
        </h2>

        <p className="mt-3 max-w-2xl font-semibold text-slate-600">
          Sélectionnez une date, les créneaux ouverts et le nombre de bateaux
          disponibles pour cette sortie.
        </p>
      </div>

      <form onSubmit={addSlots} className="grid gap-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <label className="grid gap-2 font-black text-slate-950">
            Date de la sortie
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="min-h-12 rounded-xl border border-slate-900/10 bg-white px-4 font-semibold text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
              required
            />
          </label>

          <label className="grid gap-2 font-black text-slate-950">
            Bateaux disponibles par créneau
            <input
              type="number"
              min={1}
              max={12}
              value={boatsTotal}
              onChange={(event) =>
                setBoatsTotal(Math.max(1, Math.min(12, Number(event.target.value))))
              }
              className="min-h-12 rounded-xl border border-slate-900/10 bg-white px-4 font-semibold text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
              required
            />
          </label>
        </div>

        <fieldset className="grid gap-3">
          <legend className="mb-1 font-black text-slate-950">
            Créneaux disponibles
          </legend>

          <div className="grid gap-3 md:grid-cols-3">
            {SLOT_OPTIONS.map((option) => {
              const checked = selectedPeriods.includes(option.period);
              const disabled = isDisabled(option.period);

              return (
                <label
                  key={option.period}
                  className={[
                    "relative flex cursor-pointer gap-4 rounded-3xl border p-5 transition",
                    checked
                      ? "border-teal-500 bg-teal-50 shadow-lg shadow-teal-700/10"
                      : "border-slate-900/10 bg-white hover:bg-slate-50",
                    disabled
                      ? "cursor-not-allowed opacity-40 hover:bg-white"
                      : "",
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => togglePeriod(option.period)}
                    className="mt-1 h-5 w-5 accent-teal-500"
                  />

                  <span>
                    <span className="block text-lg font-black text-slate-950">
                      {option.label}
                    </span>

                    <span className="mt-1 block text-sm font-semibold text-slate-500">
                      {option.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="rounded-3xl border border-slate-900/10 bg-slate-50 p-5">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-slate-500">
            Résumé
          </p>

          <p className="mt-2 text-xl font-black text-slate-950">
            {formatDate(date)}
          </p>

          <div className="mt-3 grid gap-2">
            {sortedSelectedPeriods.length > 0 ? (
                sortedSelectedPeriods.map((period) => (
                <div
                    key={period}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3"
                >
                    <span className="font-black text-slate-950">
                    {PERIOD_TIME[period]}
                    </span>

                    <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-black text-teal-700">
                    {boatsTotal} bateau{boatsTotal > 1 ? "x" : ""}
                    </span>
                </div>
                ))
            ) : (
                <p className="font-semibold text-slate-500">
                Aucun créneau sélectionné
                </p>
            )}
            </div>
        </div>

        <button
          type="submit"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-teal-500 px-7 py-3 font-black text-white shadow-xl shadow-teal-700/20 transition hover:-translate-y-0.5 hover:bg-teal-600 md:w-fit"
        >
          Créer la sortie
        </button>
      </form>
    </section>
  );
}