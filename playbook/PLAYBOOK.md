# Remy & Doug: The Playbook

*How Remy understands what people say, and how Doug decides what to hand back.*
*A living document. Started October 26, 2026. Add to it whenever someone says something Remy gets wrong.*

The playbook has two parts:

- **This page:** the rules, in plain language.
- **[examples.json](examples.json):** real phrases and what should happen to each. Run `npm run playbook` to check how today's rules do against them. The same examples later become the AI's instructions and its tests.

---

## 1. What Remy hears

Everything someone says to Remy is one of these. Remy works out which, fills in the details it can, and never asks a follow-up question unless it truly can't tell.

| Kind | What it is | Example | Today |
|---|---|---|---|
| **Task** | Something to do | "Switch the laundry" | ✅ Rules |
| **Errand** | A task tied to a kind of place | "Pick up washer fluid" | ✅ Rules |
| **Follow-up** | Reaching out to a person | "Text Mom back about Sunday" | ✅ Rules |
| **Event note** | Something to remember *for* an event | "Ask about reading level at the conference" | ✅ Rules |
| **Setting** | How the app should behave | "My work hours are 9 to 5" | ✅ Rules |
| **Event** | Something happening on a date | "Dentist Tuesday at 3pm" | ⏳ Needs AI |
| **Timed reminder** | A task with a specific time | "Remind me Thursday night to take out the trash" | ⏳ Needs AI |
| **Recurring** | Happens on a rhythm | "Water the plants every Sunday" | ⏳ Needs AI |
| **Deadline** | Needs doing before a date | "Renew my license before March" | ⏳ Needs AI |
| **Someday** | An idea, not a to-do | "Maybe learn pottery someday" | ⏳ Needs AI |
| **Done** | Reporting something finished | "I already called Mom" | ⏳ Needs AI |
| **Ask Doug** | Wanting a suggestion, not adding one | "Doug, what should I do?" | ⏳ Needs AI |
| **Feeling** | How they're doing | "I'm overwhelmed" | ⏳ Needs AI |

## 2. What Remy fills in

| Field | Values | How it's decided |
|---|---|---|
| **Context** | Work, Home, Errands, People, Anytime | Work words (email, meeting, client, report…), home words (laundry, trash, bills…), errand words (buy, pick up, return…), people words (call, text, Mom, birthday…). A place always makes it an errand, unless it's work. |
| **Effort** | Quick, Some, Big | Quick: reply, text, call, buy, pay, short phrases. Big: plan, write, deep clean, declutter, prepare. Otherwise Some. |
| **Place** | A *kind* of place, not an address | Auto parts store, grocery store, pharmacy, hardware store, post office. More to come. |
| **Event** | An upcoming event it belongs to | Shares a meaningful word with the event's name ("conference", "dentist"). |
| **When** | A date or time | ⏳ Needs AI |
| **Repeats** | A rhythm | ⏳ Needs AI |

**Rule of thumb:** when unsure, file it as an Anytime task with Some effort. Easy to fix, never lost.

## 3. Settings people can say

| They say | Remy saves | Today |
|---|---|---|
| "My work hours are Monday through Friday, 5am to 3pm" | Work days and hours | ✅ |
| "I work weekdays 9 to 5", "my shift is 7 to 3 on weekends" | Work days and hours | ✅ |
| "Remind me to tidy up every week" | Check-in rhythm | ✅ |
| "I'm off this Friday" | A day off (work stays hidden that day) | ⏳ |
| "Don't bug me after 9pm" | Quiet hours | ⏳ |
| "My office is on 5th Street" | A saved place | ⏳ |

**Guardrails**
- Days alone don't change the schedule unless it's clearly about the schedule. "I work from home on Tuesdays" stays a regular thought.
- Every setting change shows what was saved, with **Undo**.
- Times without am/pm are read as the most likely workday: "9 to 5" means 9am to 5pm.

## 4. How Remy talks back

Short, warm, and in the past tense. It never lectures and never shows a count of how much is waiting.

| Situation | Remy says |
|---|---|
| Saved a task | "Remy's got it." Then where it was filed, with chips to fix it. |
| Saved an event note | "Saved as a note for *Parent-teacher conference*. I'll bring it back right before." |
| Saved a setting | "Remy will remember: Work hours: Mon–Fri, 5am to 3pm." |
| Couldn't tell | File it as Anytime and say so lightly: "Not sure where this goes, so it's under Anytime." |
| Someone's struggling | Never cheerful at them. "That's a lot. Want just one small thing?" and offer Doug. |

## 5. How Doug picks the one thing

Doug looks at the list in this order and stops at the first match:

1. **An event in the next 2 days with notes waiting.** "It's tomorrow, and you've saved 3 notes for it."
2. **A getting-started task**, one at a time, until all three are done.
3. *(Coming)* **A timed reminder that's due.**
4. **The best-fitting task for right now:**
   - During work hours, only work. Outside them, everything except work.
   - Energy match: a low tank favors Quick, a full tank favors Big.
   - Older items rise slowly; items skipped many times sink a little.
5. **Nothing fits:** "That's everything that fits right now. Resting counts too."

**Doug never:**
- shows more than one thing,
- counts what's left,
- uses red badges, streaks or guilt.

**"Not now"** is free. **"Tomorrow"** hides it until midnight. Getting-started tasks finish themselves when you do the thing.

## 6. Privacy rules for sorting

- Today, all sorting happens on the phone.
- When AI sorting arrives: send only the words of the one thought, never the whole list. Nothing is stored by the AI provider, and nothing is used for training.
- Notes about kids, health and work are treated as sensitive by default.

## 7. How to grow this playbook

1. When Remy files something wrong, add the phrase to **examples.json** with what *should* happen.
2. Run `npm run playbook` to see which phrases today's rules get right.
3. If a phrase needs dates, times or judgment, mark it `"needs": "ai"`. It waits for AI sorting instead of counting as a failure.
4. Add new words to the lists in `src/parse.ts` or `src/spoken.ts` when a simple rule would fix it.

## Open questions

- Should "someday" ideas ever come back on their own, or only in a tidy-up?
- When Remy truly can't tell, is one quick question ever okay?
- Should Remy and Doug sound different from each other?
