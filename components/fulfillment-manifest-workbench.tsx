"use client";

import { useMemo, useState } from "react";
import { buildFulfillmentManifests } from "@/lib/domain/fulfillment";
import { buildPackingTasksFromOrders } from "@/lib/domain/packing";
import { demoOrders, meals, weeklyMenu } from "@/fixtures/demo";
import type { PackedMealLabelRecord } from "@/lib/domain/types";

const tasks = buildPackingTasksFromOrders(demoOrders, weeklyMenu, meals);
type TaskState = { packedCount: number; operationalStatus: PackedMealLabelRecord["operationalStatus"] };

const initialState = Object.fromEntries(tasks.map((task) => [task.key, { packedCount: task.quantity, operationalStatus: "proof-only" }])) as Record<string, TaskState>;

export function FulfillmentManifestWorkbench() {
  const [states, setStates] = useState<Record<string, TaskState>>(initialState);
  const packedUnits = useMemo(() => tasks.flatMap((task, taskIndex) => {
    const state = states[task.key] ?? { packedCount: 0, operationalStatus: "proof-only" as const };
    return Array.from({ length: Math.max(0, Math.floor(state.packedCount)) }, (_, index): PackedMealLabelRecord => ({
      id: `local-${taskIndex}-${index}`,
      traceCode: `YB-FULFILL-${String(taskIndex + 1).padStart(2, "0")}-${String(index + 1).padStart(3, "0")}`,
      batchId: `YB-FULFILL-${String(taskIndex + 1).padStart(2, "0")}`,
      sequence: index + 1,
      mealId: task.mealId,
      mealName: task.mealName,
      portionSize: task.portionSize,
      proteinSubstitutionComponentId: task.proteinSubstitutionComponentId,
      packedOn: "2026-09-16",
      useByDate: state.operationalStatus === "operational-label-ready" ? "2026-09-20" : null,
      storageText: "Keep Refrigerated",
      ingredientStatement: "Local fulfillment simulation",
      containsStatement: null,
      allergens: [],
      nutritionFacts: null,
      advisoryAllergenStatement: null,
      operationalStatus: state.operationalStatus,
      regulatoryStatus: "not-assessed",
    }));
  }), [states]);
  const result = buildFulfillmentManifests(demoOrders, weeklyMenu, meals, packedUnits);
  const packedCount = packedUnits.length;

  const update = (key: string, patch: Partial<TaskState>) => setStates((current) => ({ ...current, [key]: { ...current[key], ...patch } }));

  return <div className="grid gap-8 xl:grid-cols-[1fr_390px]">
    <section className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-3"><Metric label="Locked demand" value={result.expectedUnits} detail="units" /><Metric label="Packed locally" value={packedCount} detail="units" /><Metric label="Assigned" value={result.assignedUnits} detail="to order manifests" /></div>
      <article className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7">
        <p className="eyebrow">Packing reconciliation</p><h2 className="mt-2 text-3xl font-black tracking-[-.05em]">Every packed unit must have a destination or a disposition.</h2><p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">Expected quantities come from locked orders. Change the packed count to simulate a short/over pack; change label state to simulate the handoff from packing evidence.</p>
        <div className="mt-6 space-y-3">{tasks.map((task) => { const state = states[task.key]; return <div key={task.key} className="rounded-2xl border border-[var(--line)] bg-white p-4"><div className="grid gap-4 md:grid-cols-[1fr_110px_210px]"><div><p className="font-black">{task.mealName}</p><p className="mt-1 text-xs capitalize text-[var(--ink-muted)]">{task.portionSize}{task.proteinSubstitutionComponentId ? ` · ${task.proteinSubstitutionComponentId.replaceAll("-", " ")}` : ""} · expected {task.quantity}</p></div><label><span className="field-label">Packed</span><input className="field-control" type="number" min="0" step="1" value={state.packedCount} onChange={(e) => update(task.key, { packedCount: Number(e.target.value) })} /></label><label><span className="field-label">Label state</span><select className="field-control" value={state.operationalStatus} onChange={(e) => update(task.key, { operationalStatus: e.target.value as TaskState["operationalStatus"] })}><option value="proof-only">proof only</option><option value="operational-label-ready">operational label ready</option></select></label></div></div>; })}</div>
      </article>
      <article className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7"><p className="eyebrow">Privacy boundary</p><h3 className="mt-2 text-2xl font-black">Fulfillment without customer PII in the kitchen surface.</h3><p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">This layer uses order IDs, pickup/delivery method, and trace codes only. Names, phones, addresses, payment information, and account identity belong behind the future shared identity/fulfillment boundary.</p></article>
    </section>

    <aside className="h-fit rounded-[1.6rem] bg-[var(--leaf-deep)] p-6 text-white xl:sticky xl:top-6">
      <p className="text-xs font-black uppercase tracking-[.16em] text-[var(--warm)]">Fulfillment state</p><p className="mt-3 text-3xl font-black capitalize">{result.status}</p>
      <div className="mt-5 space-y-4">{result.manifests.map((manifest) => <div key={manifest.orderId} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex justify-between gap-4"><div><p className="font-black">{manifest.orderId}</p><p className="text-xs capitalize text-white/50">{manifest.fulfillmentMethod}</p></div><span className="text-2xl font-black text-[var(--warm)]">{manifest.totalUnits}</span></div><div className="mt-3 max-h-32 overflow-auto text-[10px] leading-5 text-white/45">{manifest.unitTraceCodes.map((code) => <div key={code}>{code}</div>)}</div></div>)}</div>
      {result.errors.length > 0 ? <ul className="mt-5 space-y-2 text-xs text-[#ffd8c5]">{result.errors.map((error) => <li key={error}>• {error}</li>)}</ul> : <div className="mt-5 rounded-2xl bg-[var(--warm)] p-4 text-[var(--leaf-deep)]"><p className="font-black">Ready for fulfillment handoff.</p><p className="mt-1 text-xs">All {result.assignedUnits} packed units reconcile exactly to locked demand.</p></div>}
      <p className="mt-5 text-xs leading-5 text-white/45">Local simulation only. In production, label readiness and trace codes must arrive from persisted packing records; this screen must not become a second source of truth.</p>
    </aside>
  </div>;
}

function Metric({ label, value, detail }: { label: string; value: number; detail: string }) { return <article className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface)] p-5"><p className="text-xs font-black uppercase tracking-[.12em] text-[var(--ink-muted)]">{label}</p><p className="mt-3 text-3xl font-black">{value}</p><p className="text-sm text-[var(--ink-muted)]">{detail}</p></article>; }
