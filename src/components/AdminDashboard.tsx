// src/components/AdminDashboard.tsx

import { useMemo, useState } from "react";
import AdminCreation from "./AdminCreation";
import AdminOpenSlots from "./AdminOpenSlots";
import AdminReservations from "./AdminReservations";
import {
  BOAT_CAPACITY,
  initialReservations,
  initialSlots,
  type AdminSlot,
  type Reservation,
} from "../data/adminMockData";

const ADULT_PRICE = 50;
const CHILD_PRICE = 30;

type ActiveTab = "creation" | "openSlots" | "reservations";

function getPassengersTotal(reservation: Reservation) {
  return reservation.adults + reservation.children;
}

function getReservationPrice(reservation: Reservation) {
  return reservation.adults * ADULT_PRICE + reservation.children * CHILD_PRICE;
}

function getReservationBoatsNeeded(reservation: Reservation) {
  return Math.ceil(getPassengersTotal(reservation) / BOAT_CAPACITY);
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("reservations");
  const [slots, setSlots] = useState<AdminSlot[]>(initialSlots);
  const [reservations, setReservations] =
    useState<Reservation[]>(initialReservations);

  const globalStats = useMemo(() => {
    const confirmedReservations = reservations.filter(
      (reservation) => reservation.status === "confirmed"
    );

    const passengersTotal = confirmedReservations.reduce(
      (total, reservation) => total + getPassengersTotal(reservation),
      0
    );

    const adultsTotal = confirmedReservations.reduce(
      (total, reservation) => total + reservation.adults,
      0
    );

    const childrenTotal = confirmedReservations.reduce(
      (total, reservation) => total + reservation.children,
      0
    );

    const revenueTotal = confirmedReservations.reduce(
      (total, reservation) => total + getReservationPrice(reservation),
      0
    );

    const fullSlotsCount = slots.filter((slot) => {
      const confirmedForSlot = confirmedReservations.filter(
        (reservation) => reservation.slotId === slot.id
      );

      const boatsUsed = confirmedForSlot.reduce(
        (total, reservation) => total + getReservationBoatsNeeded(reservation),
        0
      );

      return boatsUsed >= slot.boatsTotal;
    }).length;

    return {
      confirmedCount: confirmedReservations.length,
      passengersTotal,
      adultsTotal,
      childrenTotal,
      revenueTotal,
      fullSlotsCount,
    };
  }, [reservations, slots]);

  return (
    <div className="mx-auto grid w-[min(calc(100%-1rem),1280px)] gap-6">
      <header className="rounded-4xl border border-slate-900/10 bg-white p-5 shadow-2xl shadow-slate-900/10 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-teal-600">
              Administration
            </p>

            <h1 className="font-['Baloo_2'] text-[clamp(2.2rem,5vw,4.8rem)] font-extrabold leading-none text-slate-950">
              Gestion des sorties
            </h1>

            <p className="mt-4 max-w-2xl font-semibold leading-relaxed text-slate-600">
              Création des créneaux, suivi des sorties ouvertes, récapitulatif
              des réservations et montant à encaisser au départ.
            </p>
          </div>

          <div className="rounded-3xl border border-teal-500/20 bg-teal-50 p-5 text-right max-sm:w-full max-sm:text-left">
            <p className="text-sm font-black uppercase tracking-[0.12em] text-teal-700">
              À encaisser
            </p>

            <strong className="mt-1 block text-4xl font-black text-slate-950">
              {formatPrice(globalStats.revenueTotal)}
            </strong>

            <p className="mt-2 text-sm font-semibold text-slate-600">
              Démo — espèces ou chèque.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            dark
            label="Réservations confirmées"
            value={globalStats.confirmedCount}
          />

          <StatCard
            label="Participants"
            value={globalStats.passengersTotal}
            detail={`${globalStats.adultsTotal} adulte${
              globalStats.adultsTotal > 1 ? "s" : ""
            } • ${globalStats.childrenTotal} enfant${
              globalStats.childrenTotal > 1 ? "s" : ""
            }`}
          />

          <StatCard
            label="Sorties ouvertes"
            value={slots.length}
            detail="Créneaux disponibles au planning"
          />

          <StatCard
            label="Sorties complètes"
            value={globalStats.fullSlotsCount}
            detail="Tous les bateaux sont utilisés"
          />
        </div>
      </header>

      <nav className="grid gap-2 rounded-3xl border border-slate-900/10 bg-white p-2 shadow-xl shadow-slate-900/5 md:grid-cols-3">
        <TabButton
          active={activeTab === "creation"}
          onClick={() => setActiveTab("creation")}
        >
          Créer des sorties
        </TabButton>

        <TabButton
          active={activeTab === "openSlots"}
          onClick={() => setActiveTab("openSlots")}
        >
          Sorties ouvertes
        </TabButton>

        <TabButton
          active={activeTab === "reservations"}
          onClick={() => setActiveTab("reservations")}
        >
          Réservations
        </TabButton>
      </nav>

      {activeTab === "creation" && (
        <AdminCreation slots={slots} setSlots={setSlots} />
      )}

      {activeTab === "openSlots" && (
        <AdminOpenSlots
          slots={slots}
          setSlots={setSlots}
          reservations={reservations}
        />
      )}

      {activeTab === "reservations" && (
        <AdminReservations slots={slots} reservations={reservations} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "cursor-pointer rounded-2xl px-4 py-3 text-sm font-black transition md:text-base",
        active
          ? "bg-slate-950 text-white shadow-lg shadow-slate-900/20"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-950",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function StatCard({
  label,
  value,
  detail,
  dark = false,
}: {
  label: string;
  value: number | string;
  detail?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-3xl p-5",
        dark
          ? "bg-slate-950 text-white"
          : "border border-slate-900/10 bg-slate-50 text-slate-950",
      ].join(" ")}
    >
      <p
        className={
          dark
            ? "text-sm font-bold text-white/50"
            : "text-sm font-bold text-slate-500"
        }
      >
        {label}
      </p>

      <strong className="mt-2 block text-4xl font-black">{value}</strong>

      {detail && (
        <p
          className={
            dark
              ? "mt-1 text-sm font-semibold text-white/50"
              : "mt-1 text-sm font-semibold text-slate-500"
          }
        >
          {detail}
        </p>
      )}
    </div>
  );
}