# BrindleBrandle: The Plan

*A living one-pager. Add to it, cross things out, scribble in the notes section.*
*Last updated: October 19, 2026*

## The idea in one breath

A personal assistant for life that never overwhelms you. Two words do almost everything:

- **Brandle**: "add this." Say it or type it. The app files it for you.
- **Brindle**: "what should I do right now?" You get **one** thing that fits the moment.

Built with ADHD brains in mind: no forms, no giant lists, no guilt. It feels like a friend with a clipboard, not a boss.

## The app: four screens, that's it

| Screen | What's on it |
|---|---|
| **Home** | Two big buttons: **Brindle** and **Brandle**. Nothing else competing for attention. |
| **Review** | One card at a time. Swipe **right = Keep**, **up = Snooze**, **left = Drop**. |
| **Settings** | Work hours, saved places, check-in frequency, account. |
| *(Brindle result)* | The one suggestion, with **Done ✓**, **Not now**, **Tomorrow**. |

There's no Events page or List page. AI does the filing. "Parent-teacher conference Nov 4" becomes an event, "ask about reading at the conference" becomes a note for it, and Brindle brings both back at the right time.

### The swipe review, in detail
- While your finger drags, the matching word fades in and grows: **Keep →**, **↑ Snooze**, **← Drop**.
- A small vibration when you've gone far enough to commit.
- An **Undo** button for the last swipe, because a mistaken Drop will happen.
- Small tap buttons too, for anyone who can't swipe or uses VoiceOver.
- Snooze defaults to one week. A long-press could let you pick another length.
- Three to ten cards per session, ending with "All tidy ✨", never "you have 47 items."

## Rules that keep it gentle

- **One answer, not a list.** Brindle never shows more than one thing.
- **"Not now" is free.** Skipping never shows red badges or guilt. The app quietly remembers.
- **Context decides what you see.** During work hours, only work items. Outside them, work stays hidden.
- **Effort matching.** "How much gas do you have?" Low, Some or Full. The suggestion fits your energy.
- **Monthly check-in, only if needed.** "When did you last look over your list?" comes 30 days after your last review, and never if you've been keeping up.
- **Warm tone everywhere.** Celebrate small wins and never scold.

## How it works behind the scenes

| Piece | Job | Where it lives |
|---|---|---|
| App | What people install | Expo (React Native), built with EAS for iPhone and Android |
| AI sorting | Turns a Brandle into context, effort, place, date and event | A small server function calling **Claude Haiku 5.5** (fast and cheap) |
| Picking for Brindle | Chooses the one suggestion | On the phone: instant, works offline, no AI cost |
| Storage | Your list | On the phone first, with a cloud backup in **Supabase** |
| Accounts | Ties the backup to you | Sign in with Apple or Google |
| Notifications | Check-ins and event reminders | Scheduled on the phone, so no server is needed |
| Location | "You're near an auto parts store" | iPhone geofencing (watches about 20 places at a time) |

**Privacy promise:** Notes about kids, health and work are sensitive. Data stays locked to each account. The AI provider doesn't train on it by default. A plain-language privacy policy comes before launch.

## What it costs

| | Just me | 100 beta testers | 10,000 users |
|---|---|---|---|
| Apple Developer | $99/yr | $99/yr | $99/yr |
| Google Play | $25 once | $25 once | $25 once |
| Supabase (storage and server) | Free | Free | ~$25+/mo |
| Expo builds (EAS) | Free tier | Free tier | ~$19–99/mo |
| AI sorting (Haiku) | Pennies | ~$5/mo | ~$300–600/mo |

- AI is about **$0.0001–0.0002 per Brandle**. At 10 a day, that's **3–6¢ per user per month**.
- A **$2–3/month** subscription would comfortably cover costs. Apple keeps 15% for small developers.
- *Service prices are rough as of October 2026. Check them when signing up.*

## Roadmap

- [x] **Prototype:** Brindle, Brandle, energy check, work hours, event notes, list review (running in Expo Go)
- [ ] **Redesign:** two-button home, swipe review deck, Settings
- [ ] **AI sorting:** Supabase function and Claude Haiku. Understands dates and events. Works away from home Wi‑Fi.
- [ ] **Notifications:** monthly check-in and event reminders
- [ ] **Backup and accounts:** Sign in with Apple, cloud copy of the list
- [ ] **Private beta:** Apple Developer account, then TestFlight for friends and family
- [ ] **Location reminders:** saved places and "nearest store" geofences
- [ ] **Launch:** privacy policy, App Store review, pricing, onboarding

## Known rough edges in the prototype

- Only runs while the Mac's dev server is on, on the same Wi‑Fi
- No notifications, so the app has to be opened to remind you
- Data lives only inside Expo Go, with no backup
- Sorting is guesswork from a fixed word list and doesn't understand dates
- "Not now" is forgotten when you switch screens
- Event reminders reappear every time the app opens in the last two days
- Work hours have no "day off" switch
- ✕ deletes instantly with no undo

## Open questions

- Snooze length: always one week, or pick each time?
- Should Brindle ever say "nothing right now, go rest" on purpose?
- Shared lists (partner or family) someday?
- Free tier versus paid: what's free forever?
- Name of the voice and personality: does Brindle have a character?

## My notes

*Use this space for anything: ideas from using the app, things that felt off, what friends said.*

-
