# BrindleBrandle

A warm, low-friction personal assistant for life — built with ADHD brains in mind.

- **Brandle** — "add this to my list." Say or type a thought; it gets filed for you.
- **Brindle** — "what should I do right now?" You get **one** suggestion that fits the moment.

📋 **The plan** (design, costs, roadmap and notes) lives in [PLAN.md](PLAN.md).

## Core ideas

| Idea | What it means |
|---|---|
| Zero-friction capture | One word, no forms. Context, effort and timing are inferred and can be fixed later. |
| One answer, not a list | Brindle picks a single next step. "Not now" skips it — no guilt, no red badges. |
| Context filters | Time windows (e.g. work hours Mon–Fri 6am–4pm only show work items), places (pass an auto store → washer fluid), and events. |
| Event notes | Collect notes and questions toward a future event (e.g. parent-teacher conference) and get them all back right before it. |
| Effort matching | Brindle asks "how much gas do you have?" and suggests something that fits your energy. |
| Gentle review | Every few days: "When did you last look over your list? Want 2 minutes to tidy it?" |
| Tone | A friend with a clipboard, not a boss. Warm, light, a little playful. |

## Try it

```bash
npm install
npx expo start
```

- **On your phone:** install **Expo Go** from the App Store, then scan the QR code in the terminal with your camera. Phone and computer need to be on the same Wi-Fi.
- **In a browser:** press `w` in the terminal, or run `npx expo start --web`.

Everything is stored on the device. Settings → *Load samples* / *Clear everything* resets it.

## Code map

| File | What it does |
|---|---|
| `src/parse.ts` | Brandle: sorts a raw thought into context, effort, place and event |
| `src/brindle.ts` | Brindle: picks one suggestion from time, work hours, energy and upcoming events |
| `src/store.tsx` | State, on-device storage and sample data |
| `src/ui.tsx` | Colors (light and dark), shared buttons, cards and chips |
| `src/screens/` | Brindle, Brandle, List (with review), Events, Settings |

## Roadmap

### Stage 1 — Prototype you can use on your phone
- Expo (React Native) + TypeScript, run on your phone through Expo Go
- Brandle capture (text first, then voice), Brindle suggestion, effort check, "not now"
- Time-window contexts (work hours), event notes, review nudge
- Data stored on the device only

### Stage 2 — Real phone app (private beta)
- Development build installed on your phone (needed for background location)
- Location reminders (geofences around saved places or store types)
- Local notifications, calendar access for upcoming events
- "Hey Siri, Brindle" / "Hey Siri, Brandle" shortcuts
- AI sorting of captured thoughts (Claude API) through a small backend
- Sync and backup (e.g. Supabase); TestFlight for friends and family
- Needs: Apple Developer account ($99/yr), Google Play account ($25 once)

### Stage 3 — Public launch
- Accounts, privacy policy, App Store review (location use must be justified)
- Pricing (AI calls cost money per use), onboarding, support
