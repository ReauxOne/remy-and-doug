# Remy & Doug

A calm, low-friction personal assistant for life, built with ADHD brains in mind.

- **Remy remembers.** "Hey Remy, pick up washer fluid." Say or type a thought; it gets filed for you.
- **Doug does.** "Doug, what now?" You get **one** suggestion that fits the moment.

Website: [remyanddoug.com](https://remyanddoug.com). The plan (design, costs, pricing, roadmap and notes) lives in [PLAN.md](PLAN.md).
How Remy understands people and how Doug picks: [playbook/PLAYBOOK.md](playbook/PLAYBOOK.md) (check it with `npm run playbook`).

## Core ideas

| Idea | What it means |
|---|---|
| Zero-friction capture | No forms. Context, effort and timing are inferred and can be fixed later. |
| Settings by talking | "My work hours are Monday through Friday, 5am to 3pm" updates your settings. |
| One answer, not a list | Doug picks a single next step. "Not now" skips it, with no guilt and no red badges. |
| Context filters | During work hours only work shows; outside them, work stays hidden. Places and events come next. |
| Event notes | Collect notes and questions toward an upcoming event and get them all back right before it. |
| Effort matching | Doug asks "how much gas do you have?" and suggests something that fits. |
| Gentle review | A tidy-up nudge only when you haven't looked in a while. |
| Look | Monochrome with one red-orange accent, a pixel dragonfly, and quiet pixel art in the background. |

## Try it

```bash
npm install
npx expo start
```

- **On your phone:** install **Expo Go**, then scan the QR code in the terminal. Phone and computer need to be on the same Wi-Fi. Expo Go only runs the newest Expo SDK, so if it says the project is incompatible, upgrade with `npx expo install expo@^<new version> --fix`.
- **In a browser:** press `w` in the terminal. The pixel background is skipped on the web.

Everything is stored on the device. Settings → *Load samples* / *Clear everything* resets it.

## Code map

| File | What it does |
|---|---|
| `App.tsx` | Home screen (Tell Remy / Ask Doug) and moving between screens |
| `src/parse.ts` | Remy: sorts a raw thought into context, effort, place and event |
| `src/spoken.ts` | Remy: recognizes settings said out loud, like work hours |
| `src/doug.ts` | Doug: picks one suggestion from getting-started tasks, events, work hours and energy |
| `src/store.tsx` | State, on-device storage, sample data and getting-started tasks |
| `src/ui.tsx` | Colors (light and dark), fonts, the dragonfly logo, shared buttons, cards and chips |
| `src/PixelSky.native.tsx` | Pixel background on phones (Skia) |
| `src/art/` | The quarter's background art (same shape as the website's) |
| `src/screens/` | Remy, Doug, List (with review), Events, Settings |
| `playbook/` | The playbook and its example phrases |
| `scripts/playbook-check.mjs` | Checks today's rules against the example phrases |

## License

Copyright © 2026 Remy & Doug. All rights reserved. The code is shared to read and learn from; it isn't licensed for reuse.
