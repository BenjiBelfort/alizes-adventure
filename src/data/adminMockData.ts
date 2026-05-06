// src/data/adminMockData.ts

export const BOAT_CAPACITY = 4;

export type Period = "morningEarly" | "morning" | "afternoon";

export const PERIOD_LABEL: Record<Period, string> = {
  morningEarly: "Matin",
  morning: "Matin",
  afternoon: "Après-midi",
};

export const PERIOD_TIME: Record<Period, string> = {
  morningEarly: "7:15",
  morning: "9:00",
  afternoon: "12:00",
};

export type ReservationStatus = "confirmed" | "cancelled";

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
  adults: number;
  children: number;
  status: ReservationStatus;
};

export const initialSlots: AdminSlot[] = [
  // Lundi 18 mai
  {
    id: "slot-2026-05-18-morningEarly",
    date: "2026-05-18",
    period: "morningEarly",
    time: "7:15",
    boatsTotal: 4,
  },
  {
    id: "slot-2026-05-18-afternoon",
    date: "2026-05-18",
    period: "afternoon",
    time: "12:00",
    boatsTotal: 4,
  },

  // Mardi 19 mai — bateau en manutention
  {
    id: "slot-2026-05-19-morning",
    date: "2026-05-19",
    period: "morning",
    time: "9:00",
    boatsTotal: 3,
  },

  // Mercredi 20 mai
  {
    id: "slot-2026-05-20-morningEarly",
    date: "2026-05-20",
    period: "morningEarly",
    time: "7:15",
    boatsTotal: 4,
  },
  {
    id: "slot-2026-05-20-afternoon",
    date: "2026-05-20",
    period: "afternoon",
    time: "12:00",
    boatsTotal: 4,
  },

  // Jeudi 21 mai
  {
    id: "slot-2026-05-21-morning",
    date: "2026-05-21",
    period: "morning",
    time: "9:00",
    boatsTotal: 4,
  },

  // Vendredi 22 mai
  {
    id: "slot-2026-05-22-morningEarly",
    date: "2026-05-22",
    period: "morningEarly",
    time: "7:15",
    boatsTotal: 4,
  },
  {
    id: "slot-2026-05-22-afternoon",
    date: "2026-05-22",
    period: "afternoon",
    time: "12:00",
    boatsTotal: 4,
  },

  // Samedi 23 mai — grosse journée
  {
    id: "slot-2026-05-23-morningEarly",
    date: "2026-05-23",
    period: "morningEarly",
    time: "7:15",
    boatsTotal: 4,
  },
  {
    id: "slot-2026-05-23-afternoon",
    date: "2026-05-23",
    period: "afternoon",
    time: "12:00",
    boatsTotal: 4,
  },

  // Dimanche 24 mai
  {
    id: "slot-2026-05-24-morning",
    date: "2026-05-24",
    period: "morning",
    time: "9:00",
    boatsTotal: 4,
  },

  // Semaine suivante
  {
    id: "slot-2026-05-25-morningEarly",
    date: "2026-05-25",
    period: "morningEarly",
    time: "7:15",
    boatsTotal: 4,
  },
  {
    id: "slot-2026-05-25-afternoon",
    date: "2026-05-25",
    period: "afternoon",
    time: "12:00",
    boatsTotal: 4,
  },
  {
    id: "slot-2026-05-26-morning",
    date: "2026-05-26",
    period: "morning",
    time: "9:00",
    boatsTotal: 3,
  },
];

export const initialReservations: Reservation[] = [
  {
    id: "reservation-1",
    slotId: "slot-2026-05-18-morningEarly",
    firstname: "Laura",
    lastname: "Martin",
    email: "laura.martin@example.com",
    phone: "06 90 00 00 00",
    adults: 2,
    children: 1,
    status: "confirmed",
  },
  {
    id: "reservation-2",
    slotId: "slot-2026-05-18-morningEarly",
    firstname: "Thomas",
    lastname: "Leroy",
    email: "thomas.leroy@example.com",
    phone: "06 90 11 22 33",
    adults: 4,
    children: 0,
    status: "confirmed",
  },
  {
    id: "reservation-3",
    slotId: "slot-2026-05-18-afternoon",
    firstname: "Émilie",
    lastname: "Moreau",
    email: "emilie.moreau@example.com",
    phone: "06 90 44 55 66",
    adults: 2,
    children: 2,
    status: "confirmed",
  },
  {
    id: "reservation-4",
    slotId: "slot-2026-05-19-morning",
    firstname: "Sophie",
    lastname: "Petit",
    email: "sophie.petit@example.com",
    phone: "06 90 77 88 99",
    adults: 3,
    children: 1,
    status: "confirmed",
  },
  {
    id: "reservation-5",
    slotId: "slot-2026-05-19-morning",
    firstname: "Marc",
    lastname: "Durand",
    email: "marc.durand@example.com",
    phone: "06 90 12 34 56",
    adults: 2,
    children: 0,
    status: "cancelled",
  },
  {
    id: "reservation-6",
    slotId: "slot-2026-05-20-morningEarly",
    firstname: "Camille",
    lastname: "Robert",
    email: "camille.robert@example.com",
    phone: "06 90 98 76 54",
    adults: 1,
    children: 2,
    status: "confirmed",
  },
  {
    id: "reservation-7",
    slotId: "slot-2026-05-20-afternoon",
    firstname: "Nicolas",
    lastname: "Simon",
    email: "nicolas.simon@example.com",
    phone: "06 90 23 45 67",
    adults: 4,
    children: 3,
    status: "confirmed",
  },
  {
    id: "reservation-8",
    slotId: "slot-2026-05-21-morning",
    firstname: "Julie",
    lastname: "Roux",
    email: "julie.roux@example.com",
    phone: "06 90 34 56 78",
    adults: 2,
    children: 0,
    status: "confirmed",
  },
  {
    id: "reservation-9",
    slotId: "slot-2026-05-22-morningEarly",
    firstname: "Antoine",
    lastname: "Girard",
    email: "antoine.girard@example.com",
    phone: "06 90 45 67 89",
    adults: 2,
    children: 1,
    status: "confirmed",
  },
  {
    id: "reservation-10",
    slotId: "slot-2026-05-22-afternoon",
    firstname: "Manon",
    lastname: "Faure",
    email: "manon.faure@example.com",
    phone: "06 90 56 78 90",
    adults: 3,
    children: 2,
    status: "confirmed",
  },
  {
    id: "reservation-11",
    slotId: "slot-2026-05-23-morningEarly",
    firstname: "Hugo",
    lastname: "Blanc",
    email: "hugo.blanc@example.com",
    phone: "06 90 67 89 01",
    adults: 4,
    children: 0,
    status: "confirmed",
  },
  {
    id: "reservation-12",
    slotId: "slot-2026-05-23-morningEarly",
    firstname: "Claire",
    lastname: "Garnier",
    email: "claire.garnier@example.com",
    phone: "06 90 78 90 12",
    adults: 2,
    children: 2,
    status: "confirmed",
  },
  {
    id: "reservation-13",
    slotId: "slot-2026-05-23-afternoon",
    firstname: "Benoît",
    lastname: "Chevalier",
    email: "benoit.chevalier@example.com",
    phone: "06 90 89 01 23",
    adults: 1,
    children: 1,
    status: "confirmed",
  },
  {
    id: "reservation-14",
    slotId: "slot-2026-05-24-morning",
    firstname: "Anaïs",
    lastname: "Lambert",
    email: "anais.lambert@example.com",
    phone: "06 90 90 12 34",
    adults: 2,
    children: 3,
    status: "confirmed",
  },
  {
    id: "reservation-15",
    slotId: "slot-2026-05-25-afternoon",
    firstname: "Luc",
    lastname: "Marchand",
    email: "luc.marchand@example.com",
    phone: "06 90 01 23 45",
    adults: 4,
    children: 4,
    status: "confirmed",
  },
  {
    id: "reservation-16",
    slotId: "slot-2026-05-26-morning",
    firstname: "Sarah",
    lastname: "Vidal",
    email: "sarah.vidal@example.com",
    phone: "06 90 22 33 44",
    adults: 2,
    children: 0,
    status: "confirmed",
  },
];