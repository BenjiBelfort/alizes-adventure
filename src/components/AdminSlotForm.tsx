import { useState } from "react";

const inputClass =
  "w-full rounded-xl border border-slate-900/10 bg-white px-4 py-3 font-normal text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10";

const labelClass = "grid gap-2 font-black text-slate-950";

export default function AdminSlotForm() {
  const [date, setDate] = useState("");
  const [period, setPeriod] = useState("morning");
  const [boats, setBoats] = useState(4);

  return (
    <form
      className="grid gap-5 rounded-[28px] border border-slate-900/10 bg-white p-8 shadow-2xl shadow-slate-900/10"
      onSubmit={(event) => {
        event.preventDefault();
        alert("Démo : création du créneau à brancher à Supabase.");
      }}
    >
      <h2 className="font-['Baloo_2'] text-4xl font-extrabold leading-none text-slate-950">
        Créer un créneau
      </h2>

      <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-1">
        <label className={labelClass}>
          Date
          <input
            className={inputClass}
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </label>

        <label className={labelClass}>
          Sortie
          <select
            className={inputClass}
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          >
            <option value="morning">Matin — rendez-vous 7h15</option>
            <option value="afternoon">Après-midi — rendez-vous 12h00</option>
          </select>
        </label>

        <label className={labelClass}>
          Bateaux disponibles
          <input
            className={inputClass}
            type="number"
            min={1}
            max={4}
            value={boats}
            onChange={(event) => setBoats(Number(event.target.value))}
          />
        </label>
      </div>

      <button
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-teal-500 px-6 py-3 font-black text-white shadow-2xl shadow-teal-700/20 transition hover:-translate-y-0.5 hover:bg-teal-600"
        type="submit"
      >
        Ajouter le créneau
      </button>
    </form>
  );
}