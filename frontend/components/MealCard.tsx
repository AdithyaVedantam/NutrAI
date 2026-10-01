import { Meal } from "@/types";

const typeStyles: Record<string, string> = {
  breakfast: "bg-amber-50 text-amber-700",
  lunch: "bg-emerald-50 text-emerald-700",
  snack: "bg-violet-50 text-violet-700",
  dinner: "bg-sky-50 text-sky-700",
};
const typeIcons: Record<string, string> = { breakfast: "🌅", lunch: "🥙", snack: "🍎", dinner: "🌙" };

export default function MealCard({ meal, onEdit, onDelete }: { meal: Meal; onEdit?: () => void; onDelete?: () => void }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${typeStyles[meal.mealType]}`}>
        {typeIcons[meal.mealType]}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-800">{meal.name}</p>
        <p className="text-xs text-slate-500">
          <span className="capitalize">{meal.mealType}</span> · P {Math.round(meal.protein)}g · C {Math.round(meal.carbs)}g · F {Math.round(meal.fat)}g
          {meal.source === "ai" && <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">AI est.</span>}
        </p>
      </div>
      <p className="text-right text-sm font-bold text-slate-800">
        {meal.calories} <span className="text-xs font-normal text-slate-500">kcal</span>
      </p>
      {(onEdit || onDelete) && (
        <div className="flex gap-1">
          {onEdit && <button onClick={onEdit} className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100">Edit</button>}
          {onDelete && <button onClick={onDelete} className="rounded-lg px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50">Delete</button>}
        </div>
      )}
    </div>
  );
}
