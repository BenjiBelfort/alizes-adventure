export type Period = "morning" | "afternoon";

export type AdminSlot = {
  id: string;
  date: string;
  period: Period;
  time: string;
  boatsTotal: number;
};

export type Reservation = {
  id: string;
  slotId: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  passengers: number;
  status: "confirmed" | "cancelled";
};

export const BOAT_CAPACITY = 4;

export const PERIOD_LABEL: Record<Period, string> = {
  morning: "Matin",
  afternoon: "Après-midi",
};

export const PERIOD_TIME: Record<Period, string> = {
  morning: "09:00",
  afternoon: "14:00",
};

export const initialSlots: AdminSlot[] = [
  {
    id: "slot-2026-05-12-morning",
    date: "2026-05-12",
    period: "morning",
    time: "09:00",
    boatsTotal: 1,
  },
  {
    id: "slot-2026-05-12-afternoon",
    date: "2026-05-12",
    period: "afternoon",
    time: "14:00",
    boatsTotal: 1,
  },
  {
    id: "slot-2026-05-15-morning",
    date: "2026-05-15",
    period: "morning",
    time: "09:00",
    boatsTotal: 2,
  },
  {
    id: "slot-2026-05-18-morning",
    date: "2026-05-18",
    period: "morning",
    time: "09:00",
    boatsTotal: 1,
  },
];

export const initialReservations: Reservation[] = [
  {
    id: "resa-001",
    slotId: "slot-2026-05-12-morning",
    firstname: "Julien",
    lastname: "Moreau",
    email: "julien.moreau@email.com",
    phone: "0690 12 34 56",
    passengers: 2,
    status: "confirmed",
  },
  {
    id: "resa-002",
    slotId: "slot-2026-05-12-morning",
    firstname: "Claire",
    lastname: "Bernard",
    email: "claire.bernard@email.com",
    phone: "0690 98 76 54",
    passengers: 3,
    status: "confirmed",
  },
  {
    id: "resa-003",
    slotId: "slot-2026-05-12-afternoon",
    firstname: "Mathieu",
    lastname: "Leroy",
    email: "mathieu.leroy@email.com",
    phone: "0690 45 67 89",
    passengers: 4,
    status: "confirmed",
  },
  {
    id: "resa-004",
    slotId: "slot-2026-05-15-morning",
    firstname: "Sophie",
    lastname: "Durand",
    email: "sophie.durand@email.com",
    phone: "0690 33 22 11",
    passengers: 1,
    status: "confirmed",
  },
];