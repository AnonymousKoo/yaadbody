"use client";

import { useMemo, useState } from "react";
import { calculateMealSnapshot } from "@/lib/domain/calculations";
import { buildPackingTasksFromOrders, generatePackingLabelRecords } from "@/lib/domain/packing";
import { components, demoOrders, ingredients, meals, weeklyMenu } from "@/fixtures/demo";
import type { EvidenceConfidence, NutritionFactsPanel, PackingTask } from "@/lib/domain/types";

const confidenceOptions: EvidenceConfidence[] = ["demo", "measured-once", "validated"];
const tasks = buildPackingTasksFromOrders(demoOrders, weeklyMenu, meals);

function demoPanel(task: PackingTask): NutritionFactsPanel {
  const meal = meals.find((item) => item.id === task.mealId)!;
  const snapshot = calculateMealSnapshot(meal, task.portionSize, components, ingredients, task.proteinSubstitutionComponentId);
  const servingSizeGrams = snapshot.components.reduce((sum, item) => sum + item.grams, 0);
  return {
    servingSizeGrams,
    calories: snapshot.macros.calories,
    totalFatGrams: snapshot.macros.fatGrams,
    saturatedFatGrams: 0,
    transFatGrams: 0,
    cholesterolMg: 0,
    sodiumMg: snapshot.macros.sodiumMg ?? 0,
    totalCarbohydrateGrams: snapshot.macros.carbGrams,
    dietaryFiberGrams: snapshot.macros.fiberGrams ?? 0,
    totalSugarsGrams: 0,
    addedSugarsGrams: 0,
    proteinGrams: snapshot.macros.proteinGrams,
    vitaminDMcg: 0,
    calciumMg: 0,
    ironMg: 0,
    potassiumMg: 0,
  };
}

const nutritionFields: Array<[keyof NutritionFactsPanel, string, string]> = [
  ["servingSizeGrams", "Serving size", "g"], ["calories", "Calories", ""], ["totalFatGrams", "Total fat", "g"],
  ["saturatedFatGrams", "Saturated fat", "g"], ["transFatGrams", "Trans fat", "g"], ["cholesterolMg", "Cholesterol", "mg"],
  ["sodiumMg", "Sodium", "mg"], ["totalCarbohydrateGrams", "Total carbohydrate", "g"], ["dietaryFiberGrams", "Dietary fiber", "g"],
  ["totalSugarsGrams", "Total sugars", "g"], ["addedSugarsGrams", "Added sugars", "g"], ["proteinGrams", "Protein", "g"],
  ["vitaminDMcg", "Vitamin D", "mcg"], ["calciumMg", "Calcium", "mg"], ["ironMg", "Iron", "mg"], ["potassiumMg", "Potassium", "mg"],
];

export function PackingLabelWorkbench() {
  const [taskKey, setTaskKey] = useState(tasks[0]?.key ?? "");
  const task = tasks.find((item) => item.key === taskKey) ?? tasks[0];
  const [batchId, setBatchId] = useState("YB-DEMO-001");
  const [packedOn, setPackedOn] = useState("2026-09-16");
  const [nutritionConfidence, setNutritionConfidence] = useState<EvidenceConfidence>("demo");
  const [nutritionSource, setNutritionSource] = useState("");
  const [recipeConfidence, setRecipeConfidence] = useState<EvidenceConfidence>("demo");
  const [recipeRuns, setRecipeRuns] = useState(0);
  const [recipeSource, setRecipeSource] = useState("");
  const [shelfConfidence, setShelfConfidence] = useState<EvidenceConfidence>("demo");
  const [shelfRuns, setShelfRuns] = useState(0);
  const [shelfDays, setShelfDays] = useState(4);
  const [shelfSource, setShelfSource] = useState("");
  const [panel, setPanel] = useState<NutritionFactsPanel>(() => demoPanel(tasks[0]));

  const result = useMemo(() => task ? generatePackingLabelRecords(
    { batchId, mealId: task.mealId, portionSize: task.portionSize, quantity: task.quantity, packedOn, proteinSubstitutionComponentId: task.proteinSubstitutionComponentId },
    meals, components, ingredients,
    { mealId: task.mealId, portionSize: task.portionSize, panel, confidence: nutritionConfidence, evidenceSource: nutritionSource },
    { mealId: task.mealId, portionSize: task.portionSize, confidence: recipeConfidence, evidenceRunCount: recipeRuns, evidenceSource: recipeSource },
    { id: "local-shelf-policy", storage: "refrigerated", shelfLifeDays: shelfDays, confidence: shelfConfidence, evidenceRunCount: shelfRuns, evidenceSource: shelfSource },
  ) : null, [task, batchId, packedOn, panel, nutritionConfidence, nutritionSource, recipeConfidence, recipeRuns, recipeSource, shelfDays, shelfConfidence, shelfRuns, shelfSource]);
  const preview = result?.records[0];

  const selectTask = (key: string) => {
    const next = tasks.find((item) => item.key === key)!;
    setTaskKey(key);
    setPanel(demoPanel(next));
    setNutritionConfidence("demo");
    setNutritionSource("");
  };

  return <div className="grid gap-8 xl:grid-cols-[1fr_390px]">
    <section className="space-y-7">
      <article className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7">
        <p className="eyebrow">Locked-order packing demand</p><h2 className="mt-2 text-3xl font-black tracking-[-.05em]">Pack what customers ordered.</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">{tasks.map((item) => <button key={item.key} onClick={() => selectTask(item.key)} className={`rounded-2xl border p-4 text-left ${item.key === taskKey ? "border-[var(--brand)] bg-[#fff0e8]" : "border-[var(--line)] bg-white"}`}><div className="flex justify-between gap-4"><div><p className="font-black">{item.mealName}</p><p className="mt-1 text-xs capitalize text-[var(--ink-muted)]">{item.portionSize}{item.proteinSubstitutionComponentId ? ` · ${item.proteinSubstitutionComponentId.replaceAll("-", " ")}` : ""}</p></div><span className="text-2xl font-black">×{item.quantity}</span></div><p className="mt-3 text-[10px] font-bold uppercase tracking-[.1em] text-[var(--ink-muted)]">Orders: {item.sourceOrderIds.join(", ")}</p></button>)}</div>
      </article>

      <article className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7">
        <p className="eyebrow">Batch identity</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><TextField label="Batch ID" value={batchId} onChange={setBatchId} /><label><span className="field-label">Packed on</span><input className="field-control" type="date" value={packedOn} onChange={(e) => setPackedOn(e.target.value)} /></label></div>
        <p className="mt-4 text-xs text-[var(--ink-muted)]">Unit trace codes are generated from this batch ID plus a zero-padded sequence number.</p>
      </article>

      <article className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7">
        <p className="eyebrow">Evidence gates</p><h3 className="mt-2 text-2xl font-black">Three gates before operational label readiness.</h3>
        <div className="mt-5 grid gap-4 lg:grid-cols-3"><EvidenceCard title="Nutrition Facts" confidence={nutritionConfidence} setConfidence={setNutritionConfidence} source={nutritionSource} setSource={setNutritionSource} /><EvidenceCard title="Recipe composition" confidence={recipeConfidence} setConfidence={setRecipeConfidence} source={recipeSource} setSource={setRecipeSource} runs={recipeRuns} setRuns={setRecipeRuns} /><EvidenceCard title="Shelf life" confidence={shelfConfidence} setConfidence={setShelfConfidence} source={shelfSource} setSource={setShelfSource} runs={shelfRuns} setRuns={setShelfRuns} extra={<label><span className="field-label">Days refrigerated</span><input className="field-control" type="number" min="1" step="1" value={shelfDays} onChange={(e) => setShelfDays(Number(e.target.value))} /></label>} /></div>
      </article>

      <article className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7">
        <p className="eyebrow">Nutrition panel evidence</p><h3 className="mt-2 text-2xl font-black">Complete the full nutrient record before validation.</h3><p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">Known demo macros are prefilled from the recipe fixture. Zeroes in fields we have not measured are placeholders, not factual zeroes. Do not mark this validated until every value is supported.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{nutritionFields.map(([key, label, unit]) => <label key={key}><span className="field-label">{label}{unit ? ` (${unit})` : ""}</span><input className="field-control" type="number" min="0" step="0.1" value={panel[key]} onChange={(e) => setPanel((current) => ({ ...current, [key]: Number(e.target.value) }))} /></label>)}</div>
      </article>
    </section>

    <aside className="h-fit rounded-[1.6rem] bg-[var(--leaf-deep)] p-6 text-white xl:sticky xl:top-6">
      <p className="text-xs font-black uppercase tracking-[.16em] text-[var(--warm)]">Packing label proof</p><p className="mt-3 text-3xl font-black capitalize">{result?.status.replaceAll("-", " ")}</p>
      {preview && <div className="mt-5 rounded-2xl bg-white p-5 text-[var(--foreground)]"><div className="flex justify-between gap-4"><div><p className="text-2xl font-black">YaadBody</p><p className="text-sm font-black">{preview.mealName}</p><p className="text-xs capitalize text-[var(--ink-muted)]">{preview.portionSize} portion</p></div><span className="text-xs font-black">{preview.traceCode}</span></div><div className="mt-4 grid grid-cols-2 gap-2 border-y border-[var(--line)] py-3 text-xs"><div><b>Packed</b><br/>{preview.packedOn}</div><div><b>Use by</b><br/>{preview.useByDate ?? "BLOCKED"}</div></div><p className="mt-4 text-xs leading-5"><b>Ingredients:</b> {preview.ingredientStatement}</p>{preview.containsStatement && <p className="mt-3 text-xs font-black">{preview.containsStatement}</p>}<p className="mt-3 text-xs"><b>{preview.storageText}</b></p><div className="mt-4 grid grid-cols-4 gap-2 bg-[var(--surface-soft)] p-3 text-center text-xs"><Mini label="Cal" value={preview.nutritionFacts?.calories ?? "—"} /><Mini label="Protein" value={preview.nutritionFacts ? `${preview.nutritionFacts.proteinGrams}g` : "—"} /><Mini label="Carbs" value={preview.nutritionFacts ? `${preview.nutritionFacts.totalCarbohydrateGrams}g` : "—"} /><Mini label="Fat" value={preview.nutritionFacts ? `${preview.nutritionFacts.totalFatGrams}g` : "—"} /></div><p className="mt-4 text-[10px] leading-4 text-[var(--ink-muted)]">Operational proof only. Regulatory status: {preview.regulatoryStatus.replaceAll("-", " ")}. No “may contain” cross-contact statement is generated automatically.</p></div>}
      {result?.errors.length ? <ul className="mt-5 space-y-2 text-xs text-[#ffd8c5]">{result.errors.map((error) => <li key={error}>• {error}</li>)}</ul> : <div className="mt-5 rounded-2xl bg-[var(--warm)] p-4 text-[var(--leaf-deep)]"><p className="font-black">Operational label data ready.</p><p className="mt-1 text-xs">{result?.records.length} traceable unit records generated for this packing task.</p></div>}
      <p className="mt-5 text-xs leading-5 text-white/45">Nothing is printed or persisted. This remains a local proof surface until approved shared persistence and printer integration exist.</p>
    </aside>
  </div>;
}

function EvidenceCard({ title, confidence, setConfidence, source, setSource, runs, setRuns, extra }: { title: string; confidence: EvidenceConfidence; setConfidence: (value: EvidenceConfidence) => void; source: string; setSource: (value: string) => void; runs?: number; setRuns?: (value: number) => void; extra?: React.ReactNode }) { return <div className="rounded-2xl border border-[var(--line)] bg-white p-4"><p className="font-black">{title}</p><label className="mt-3 block"><span className="field-label">Evidence</span><select className="field-control" value={confidence} onChange={(e) => setConfidence(e.target.value as EvidenceConfidence)}>{confidenceOptions.map((item) => <option key={item} value={item}>{item.replace("-", " ")}</option>)}</select></label>{setRuns && <label className="mt-3 block"><span className="field-label">Evidence runs</span><input className="field-control" type="number" min="0" step="1" value={runs} onChange={(e) => setRuns(Number(e.target.value))} /></label>}<div className="mt-3">{extra}</div><label className="mt-3 block"><span className="field-label">Evidence source</span><input className="field-control" value={source} onChange={(e) => setSource(e.target.value)} placeholder="Required when validated" /></label></div>; }
function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label><span className="field-label">{label}</span><input className="field-control" value={value} onChange={(e) => onChange(e.target.value)} /></label>; }
function Mini({ label, value }: { label: string; value: string | number }) { return <div><p className="font-black">{value}</p><p className="text-[9px] font-bold uppercase tracking-[.08em] text-[var(--ink-muted)]">{label}</p></div>; }
