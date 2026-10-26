# Remy & Doug: The Plan

*A living one-pager. Add to it, cross things out, scribble in the notes section.*
*Last updated: October 26, 2026. Formerly BrindleBrandle (renamed October 26, 2026).*

## The idea in one breath

A personal assistant for life that never overwhelms you. Two friends do almost everything:

- **Remy remembers.** "Hey Remy, pick up washer fluid." Say it or type it. Remy files it for you.
- **Doug does.** "Doug, what now?" You get **one** thing that fits the moment.

Built with ADHD brains in mind: no forms, no giant lists, no guilt. It feels like a friend with a clipboard, not a boss.

## Brand

| | |
|---|---|
| **Name** | Remy & Doug. Use "Remy & Doug™" until a trademark is registered. |
| **Website** | [remyanddoug.com](https://remyanddoug.com) (GitHub Pages, repo `remyanddoug.com`) |
| **Email** | hello@remyanddoug.com (Microsoft 365 through GoDaddy) |
| **Look** | Bare and monochrome: greys, plus one bright red-orange (`#D9411B`, `#F2552B` in dark mode) for Doug and key moments. No emoji. |
| **Type** | Inter Tight (light for headlines), JetBrains Mono for small labels |
| **Logo** | A pixel dragonfly. It stays the same for good. |
| **Background art** | Pixel creatures drawn as grey squares with a few text characters. Changes every quarter (Q4 2026: dragonflies). The same art file shape runs on the website (`art/*.js`) and in the app (`src/art/*.ts`). |
| **Motion** | Slow and calm. Pauses in the background, holds still with Reduce Motion, and has a pause button on the website. |
| **Old domain** | brindlebrandle.com is being retired. Turn off auto-renew before October 19, 2027, and turn off GitHub Pages on the old site repo first. |

## The app

| Screen | What's on it |
|---|---|
| **Home** | The dragonfly, "what's on your mind?", and two big buttons: **Tell Remy** and **Ask Doug ↗**. Small links to Tidy up, Events and Settings. Pixel dragonflies drift behind it. |
| **Tell Remy** | Type or dictate. Remy sorts it, or saves it as a setting when it's one ("my work hours are Mon–Fri, 5am to 3pm"). Always with Undo. |
| **Ask Doug** | Pick your energy and get one suggestion, with **Done**, **Not now** and **Tomorrow**. |
| **Tidy up** | One card at a time: keep, done already, next week or let it go. (Swipe version still to come.) |
| **Settings** | Work hours, check-in rhythm, start over. |

### Getting started
Doug's first three suggestions are small setup tasks, one at a time, each with a **Do it now** button:
1. Tell Remy your work hours
2. Tell Remy one thing that's on your mind
3. Take a 2-minute tidy-up

They finish themselves when you do the thing, however you do it.

### Things you can just say to Remy
| Say | What happens |
|---|---|
| "My work hours are Monday through Friday, 5am to 3pm" | Work hours saved |
| "I work weekdays 9 to 5", "my shift is 7 to 3 on weekends" | Work hours saved |
| "Remind me to tidy up every week" | Check-in rhythm saved |
| Anything else | Filed as a task, or as a note for an upcoming event |

## Rules that keep it gentle

- **One answer, not a list.** Doug never shows more than one thing.
- **"Not now" is free.** No red badges, streaks or guilt.
- **Context decides what you see.** During work hours, only work. Outside them, work stays hidden.
- **Effort matching.** Low, some or full tank. The suggestion fits your energy.
- **Check-ins only if needed.** A tidy-up nudge comes only when you haven't looked in a while.
- **Warm tone everywhere.** Celebrate small wins and never scold.

## How it works behind the scenes

| Piece | Job | Where it lives |
|---|---|---|
| App | What people install | Expo (React Native), **SDK 58**. Expo Go on a phone only runs the newest SDK, so upgrade the project whenever Expo Go updates. |
| Pixel background | Dragonflies behind the home screen | React Native Skia, 30 frames a second |
| Spoken settings | "My work hours are…" | Plain rules on the phone (`src/spoken.ts`), no AI cost |
| AI sorting | Turns a thought into context, effort, place, date and event | A small server function calling **Claude Haiku** (planned) |
| Picking for Doug | Chooses the one suggestion | On the phone: instant, works offline, no AI cost |
| Storage | Your list | On the phone first, with a cloud backup in **Supabase** (planned) |
| Accounts | Ties the backup to you | Sign in with Apple or Google (planned) |
| Notifications | Check-ins and event reminders | Scheduled on the phone. iPhones allow 64 scheduled at a time. |

**Privacy promise:** Notes about kids, health and work are sensitive. Data stays locked to each account. The AI provider doesn't train on it by default. The privacy policy at remyanddoug.com/privacy.html is updated before any data leaves the phone.

## Connections to the phone's own apps

**Ground rules:** off by default, offered at the right moment instead of during setup, and one simple on/off list in Settings.

| Source | iPhone | Android | How Remy gets it |
|---|---|---|---|
| **Calendar** | Very reliable | Very reliable | Read and write directly. Includes Google and Outlook calendars added to the phone. One permission prompt. |
| **Reminders** | Very reliable | No built-in app | iPhone: two-way sync. Android: Remy is the reminders app (Google Tasks would need Google sign-in and review). |
| **Apple Notes / Google Keep** | No access | No access | Share a note to Remy from the Share button. |
| **Messages and email** | No access | No access | Share to Remy. |
| **Screenshots and photos** | When you pick one | When you pick one | AI reads the image: a school flyer becomes an event. |
| **Contacts** | Yes | Yes | "Text Mom back" links to Mom's card. |
| **Location** | About 20 places at once | About 100 | "You're near the auto parts store." |
| **Voice** | Siri: "Hey Siri, tell Remy…" (reliable, iOS 16+) | Google's assistant is changing to Gemini, so less dependable | Android: a home-screen widget and a quick-settings button instead. |
| **Focus modes** | Work Focus tells Doug "work only" | Limited | Needs a real build (not Expo Go). |

**Limits to plan around:** iPhones limit background work, so Doug decides when the app is open and reminders use scheduled notifications. Some Android phone makers close background apps aggressively.

**Further out:** Remy & Doug as an MCP server (Tell Remy and Ask Doug from the Claude app or any AI assistant), direct Outlook and Google sign-in, and Remy reaching into other apps.

## What it costs to run

| Item | Cost | Notes |
|---|---|---|
| remyanddoug.com | ~$22/yr | Auto-renews, privacy on |
| Email (Microsoft 365 via GoDaddy) | ~$2–8/mo per inbox | Check the renewal price after any first-year deal |
| Website hosting (GitHub Pages) | Free | |
| Fonts | Free | Google Fonts |
| Quarterly background art | Free | Design time only |
| Apple Developer | $99/yr | Needed for TestFlight and the App Store |
| Google Play | $25 once | |
| App builds (Expo EAS) | Free → ~$19/mo | Paid only with frequent builds |
| Cloud backup and AI (Supabase + Claude Haiku) | Free → ~$25/mo, plus about 3–10¢ per user per month | Starts when AI sorting goes live |
| Siri and assistant shortcuts | Free | Development time only |
| Trademark (US) | ~$350 per class | Classes 9 and 42, so about $700, plus an optional attorney search |

**Rule of thumb:** anything that runs on the phone or in the browser costs time, not money. Anything on a server or using AI costs a little per user each month. Store accounts and trademarks are yearly or one-time fees.

## Pricing (proposal)

| Plan | Price | What's in it |
|---|---|---|
| **Free** | $0 | Tell Remy, Ask Doug, tidy-ups and reminders on the phone. About 30 AI-sorted thoughts a month. |
| **Plus** | $4.99/mo or $39.99/yr | Unlimited AI sorting, calendar and reminder connections, Siri, backup across devices |
| **Founding member** | $29.99/yr, locked in | For beta testers |

After the stores' 15% cut, a Plus subscriber brings in about $4.20 a month, and AI costs about 10¢ of that. Around 15–20 yearly subscribers cover the fixed costs.

## Trademark (to do before the public beta)

1. Use "Remy & Doug™" now.
2. Get an attorney clearance search (about $300–800). Check especially for objections from Melissa & Doug (toys, a different class, but a similar "Name & Doug" pattern).
3. File the words "REMY & DOUG" as intent-to-use in Classes 9 (app) and 42 (online software). Register the dragonfly logo later.
4. Ignore any trademark "invoice" that doesn't come from @uspto.gov.

## Roadmap

- [x] **Prototype:** add, one suggestion, energy check, work hours, event notes, list review (running in Expo Go)
- [x] **Rename and brand:** Remy & Doug, pixel dragonfly, monochrome plus red-orange
- [x] **Website:** [remyanddoug.com](https://remyanddoug.com) with privacy and support pages, a light/dark favicon and quarterly background art
- [x] **Email:** hello@remyanddoug.com
- [x] **App redesign, part 1:** two-button home, new look, no emoji, app icons with light, dark and tinted versions
- [x] **Spoken settings:** work hours and check-in rhythm through Tell Remy
- [x] **Getting started:** Doug's three setup tasks
- [ ] **Remy's playbook:** the kinds of things people say, 50–100 example phrases and where each goes. These become the AI's instructions and its tests.
- [ ] **Swipe review:** right to keep, up to snooze, left to let go, with Undo
- [ ] **AI sorting:** Supabase function and Claude Haiku. Understands dates and events.
- [ ] **Notifications:** check-ins and event reminders
- [ ] **Backup and accounts:** Sign in with Apple, cloud copy of the list
- [ ] **Private beta:** Apple Developer account, a real build, TestFlight for friends and family
- [ ] **Siri and Focus:** "Hey Siri, tell Remy…", Work Focus shows work only (needs the real build)
- [ ] **Phone calendar and reminders connection**
- [ ] **Share to Remy:** from Notes, Messages, email and screenshots
- [ ] **Location reminders:** saved places and "nearest store"
- [ ] **Trademark filing**
- [ ] **Launch:** App Store and Google Play review, pricing, onboarding

## Known rough edges

- Expo Go only: the app runs while the Mac's dev server is on, on the same Wi‑Fi
- No notifications yet, so the app has to be opened to remind you
- Data lives only on the phone, with no backup
- Sorting is a fixed word list and doesn't understand dates yet
- "Not now" is forgotten when you switch screens
- The pixel background is skipped in the web preview

## Open questions

- Snooze length: always one week, or pick each time?
- Should Doug ever say "nothing right now, go rest" on purpose?
- Shared lists (partner or family) someday?
- Free versus paid: confirm the line above with beta testers
- Do Remy and Doug have distinct voices and personalities?
- Which connection after the calendar? Which apps do people actually ask for?
- Background art for 2027 Q1?

## My notes

*Use this space for anything: ideas from using the app, things that felt off, what friends said.*

-
