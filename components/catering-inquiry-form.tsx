"use client";

import { useMemo, useState } from "react";
import { cateringPackages } from "@/fixtures/demo";
import { evaluateCateringInquiry } from "@/lib/domain/catering";
import type { CateringEventType, CateringInquiry, CateringServiceLevel } from "@/lib/domain/types";

const eventTypes: Array<{ id: CateringEventType; label: string }> = [
  { id: "birthday", label: "Birthday" }, { id: "corporate", label: "Corporate" },
  { id: "graduation", label: "Graduation" }, { id: "wedding", label: "Wedding" },
  { id: "family-gathering", label: "Family gathering" }, { id: "other", label: "Other" },
];

export function CateringInquiryForm() {
  const [inquiry, setInquiry] = useState<CateringInquiry>({ eventType: "birthday", eventDate: "", guestCount: 30, serviceLevel: "drop-off", location: "", contactEmail: "", dietaryNotes: "" });
  const [reviewed, setReviewed] = useState(false);
  const result = useMemo(() => evaluateCateringInquiry(inquiry, cateringPackages), [inquiry]);
  const update = <K extends keyof CateringInquiry>(key: K, value: CateringInquiry[K]) => { setInquiry((current) => ({ ...current, [key]: value })); setReviewed(false); };

  return <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
    <form onSubmit={(event) => { event.preventDefault(); setReviewed(true); }} className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Event type"><select value={inquiry.eventType} onChange={(event) => update("eventType", event.target.value as CateringEventType)} className="field-control">{eventTypes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></Field>
        <Field label="Event date"><input type="date" value={inquiry.eventDate} onChange={(event) => update("eventDate", event.target.value)} className="field-control" /></Field>
        <Field label="Guest count"><input type="number" min="1" value={inquiry.guestCount} onChange={(event) => update("guestCount", Number(event.target.value))} className="field-control" /></Field>
        <Field label="Event city or ZIP"><input value={inquiry.location} onChange={(event) => update("location", event.target.value)} placeholder="City or ZIP only" className="field-control" /></Field>
        <Field label="Service level"><select value={inquiry.serviceLevel} onChange={(event) => update("serviceLevel", event.target.value as CateringServiceLevel)} className="field-control"><option value="drop-off">Drop-off</option><option value="buffet-setup">Buffet setup</option><option value="full-service">Full service</option></select></Field>
        <Field label="Contact email"><input type="email" value={inquiry.contactEmail} onChange={(event) => update("contactEmail", event.target.value)} placeholder="you@example.com" className="field-control" /></Field>
      </div>
      <Field label="Dietary notes" className="mt-5"><textarea value={inquiry.dietaryNotes} onChange={(event) => update("dietaryNotes", event.target.value)} rows={4} placeholder="Only what the kitchen needs to know." className="field-control resize-none" /></Field>
      <button type="submit" className="mt-6 rounded-full bg-[var(--brand)] px-6 py-3 font-black text-white">Review inquiry</button>
      <p className="mt-3 text-xs leading-5 text-[var(--ink-muted)]">Reviewing these details does not book your event. YaadBody will confirm availability, menu, service, and final pricing before booking.</p>
    </form>
    <aside className="h-fit rounded-[1.6rem] bg-[var(--leaf-deep)] p-6 text-white lg:sticky lg:top-6">
      <p className="text-xs font-black uppercase tracking-[.16em] text-[var(--warm)]">Your event fit</p>
      {!reviewed ? <p className="mt-4 text-sm leading-6 text-white/65">Complete the event details to see the best starting option for your gathering.</p> : <>
        <p className="mt-4 text-3xl font-black tracking-[-.05em]">{result.route === "party-trays" ? "Party Trays" : result.recommendedPackage?.name ?? "Needs adjustment"}</p>
        <p className="mt-3 text-sm leading-6 text-white/65">{result.message}</p>
        {result.errors.length > 0 && <ul className="mt-5 space-y-2 border-t border-white/15 pt-4 text-sm text-[#ffd8c5]">{result.errors.map((error) => <li key={error}>• {error}</li>)}</ul>}
        {result.quoteReady && <div className="mt-5 rounded-2xl bg-white/10 p-4"><p className="font-black text-[var(--warm)]">Ready for a custom quote</p><p className="mt-1 text-xs leading-5 text-white/60">YaadBody can confirm the menu, service level, delivery needs, and final pricing before booking.</p></div>}
      </>}
    </aside>
  </div>;
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) { return <label className={`block ${className}`}><span className="mb-2 block text-xs font-black uppercase tracking-[.12em] text-[var(--ink-muted)]">{label}</span>{children}</label>; }
