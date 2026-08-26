// All product copy lives here, keyed by string id.
// English is complete and verbatim from SPEC.md 4.5.
// fr and es keys are present with TODO values and fall back to English.

export type Lang = "en" | "fr" | "es";
export const LANGS: Lang[] = ["en", "fr", "es"];

type Entry = { en: string; fr: string; es: string };

const TODO = "TODO";
const e = (en: string): Entry => ({ en, fr: TODO, es: TODO });

export const strings = {
  "attract.headline": e("We can't have a 10x ambition if we can't imagine it."),
  "attract.sub": e("Five rooms. One working week, five years out."),
  "attract.chip": e("Touch to begin"),

  "greeter.question": e("Do you work inside the UN system, or alongside it?"),
  "greeter.door1.title": e("I work inside the system"),
  "greeter.door1.sub": e("Walk a week of your own work, five years from now."),
  "greeter.door2.title": e("I work alongside it"),
  "greeter.door2.sub": e("Civil society, academia, government. See what you could ask of it."),

  "gallery.sub.staffer": e("Five rooms. One working week, five years out."),
  "gallery.sub.guest": e("Five rooms. Ask each one: what would I want from this?"),
  "gallery.threshold.choice": e("The Choice"),
  "gallery.threshold.wall": e("The Wall"),

  "room.legal.title": e("Office of Legal Affairs"),
  "room.legal.oneliner": e("AI removes friction. People drive judgment."),
  "room.legal.persona": e("Amina, legal officer, Thursday 09:10"),
  "room.legal.now": e(
    "Copilot drafts the first pass of a standard agreement. Amina reviews it clause by clause. Research that took a week now takes a morning.",
  ),
  "room.legal.next": e(
    "Every precedent, treaty and past agreement, cross-referenced as she types. Her week is judgment calls: the novel clause, the hard negotiation, the call only she can make.",
  ),
  "room.legal.lens": e("Visiting as a partner? Agreements move in days, not months."),

  "room.procurement.title": e("Procurement & Operations"),
  "room.procurement.oneliner": e("AI processes transactions. People make decisions."),
  "room.procurement.persona": e("Maria, procurement officer, Tuesday 08:40"),
  "room.procurement.now": e(
    "Copilot compares bids, drafts purchase orders, summarises supplier history. The queue is still long, but every item moves faster.",
  ),
  "room.procurement.next": e(
    "Overnight, agents cleared 340 routine orders against policy. Maria reviews six flagged exceptions over coffee, then spends her afternoon negotiating the framework agreement that actually needs her.",
  ),
  "room.procurement.lens": e("Visiting as a supplier or implementer? Faster, fairer, more transparent."),

  "room.resident-coordinator.title": e("Resident Coordinator"),
  "room.resident-coordinator.oneliner": e("AI gathers information. People build alignment."),
  "room.resident-coordinator.persona": e("Daniel, resident coordinator, Monday 07:30"),
  "room.resident-coordinator.now": e(
    "The researcher agent assembles his country brief from agency reports. Meeting recaps land before he does. Negotiators now use AI to prepare cultural context before talks.",
  ),
  "room.resident-coordinator.next": e(
    "A live country picture across every agency, updated as partners report. His day goes where it counts: alignment between government, agencies and donors.",
  ),
  "room.resident-coordinator.lens": e("Visiting from a ministry? One coordinated country picture to plug into."),

  "room.humanitarian.title": e("Humanitarian Response"),
  "room.humanitarian.oneliner": e("AI accelerates response. People deliver impact."),
  "room.humanitarian.persona": e("Leila, operations officer, Saturday 02:15"),
  "room.humanitarian.now": e(
    "Situation reports drafted from field messages in any language. Damage mapped from imagery in hours, not days.",
  ),
  "room.humanitarian.next": e(
    "A needs assessment hours after the flood, not weeks. Supply routes suggested, checked, and moving by dawn. Leila's night goes to the calls that move aid, not the paperwork behind them.",
  ),
  "room.humanitarian.lens": e("Visiting as a local responder? The same live picture the agencies see."),

  "room.chief-of-staff.title": e("Agentic Chief of Staff"),
  "room.chief-of-staff.oneliner": e("AI prepares the work. Leaders shape the future."),
  "room.chief-of-staff.persona": e("Grace, director, Friday 16:00"),
  "room.chief-of-staff.now": e(
    "Briefing packs assembled by agents, sources cited. Meeting prep takes minutes, not evenings.",
  ),
  "room.chief-of-staff.next": e(
    "The work arrives prepared: options weighed, positions mapped, drafts ready. Leadership time goes to direction, relationships, and the decisions no agent should make.",
  ),
  "room.chief-of-staff.lens": e(
    "Visiting from civil society? Your evidence reaches the table, and reporting gets far easier.",
  ),

  "choice.headline": e("The future depends on skills, governance, data, operating model and partnerships."),
  "choice.sub": e("Not just models. An invitation, not a warning."),
  "choice.skills.title": e("Skills"),
  "choice.skills.body": e("People who know how to use it. Everywhere, not just headquarters."),
  "choice.governance.title": e("Governance"),
  "choice.governance.body": e("Clear rules for what AI may do, and what stays human."),
  "choice.data.title": e("Data"),
  "choice.data.body": e("Trusted, protected, and ready to work."),
  "choice.operating-model.title": e("Operating model"),
  "choice.operating-model.body": e("Workflows redesigned, not just tools added."),
  "choice.partnerships.title": e("Partnerships"),
  "choice.partnerships.body": e("Built together, so no one figures it out alone."),

  "why.quote": e("We're imagining this with you, because we understand you."),
  "why.sub": e("Built with the same tools, by a small team, in three weeks."),

  "wall.prompt": e("What's the one thing you'll do now?"),
  "wall.placeholder": e("One line. It joins the wall."),
  "wall.card1.title": e("UN system staff"),
  "wall.card1.body": e("The 10-week programme. Any part of the system can join."),
  "wall.card2.title": e("Everyone"),
  "wall.card2.body": e("Free AI learning paths."),
  "wall.card3.title": e("Go further"),
  "wall.card3.body": e("Connect with the Changemakers community."),
  "wall.seed1": e("Pilot the researcher agent with my team"),
  "wall.seed2": e("Map one workflow worth redesigning"),
  "wall.seed3": e("Ask for a session with our country office"),

  "flip.now": e("NOW"),
  "flip.next": e("IN FIVE YEARS"),
  "nav.back": e("Back"),
  "nav.continue": e("Continue"),
  "nav.allrooms": e("All rooms"),
  "nav.restart": e("Restart"),

  "beat.legal.counter": e("sources cross-referenced"),
  "beat.procurement.channel": e("cleared against policy"),
  "beat.humanitarian.tnow": e("T+3 weeks"),
  "beat.humanitarian.tnext": e("T+6 hours"),
  "daystrip.agents": e("agents, overnight"),

  "facilitator.title": e("Facilitator"),
  "facilitator.jump": e("Jump"),
  "facilitator.language": e("Language"),
  "facilitator.sound": e("Sound"),
  "facilitator.reset": e("Reset session"),
  "facilitator.export": e("Export wall CSV"),
  "facilitator.clear": e("Clear wall"),
  "facilitator.clear.confirm": e("Touch again to clear the wall"),
  "facilitator.stats": e("Session stats"),
} as const;

export type StringId = keyof typeof strings;

export function translate(id: StringId, lang: Lang): string {
  const entry: Entry = strings[id];
  const v = entry[lang];
  return v === TODO ? entry.en : v;
}
