// Checks today's rules against playbook/examples.json. Run with: npm run playbook
// Needs Node 23+ (runs the .ts files directly).
import { readFileSync } from 'node:fs';
import { parseThought } from '../src/parse.ts';
import { parseSpokenSetting } from '../src/spoken.ts';

const book = JSON.parse(readFileSync(new URL('../playbook/examples.json', import.meta.url), 'utf8'));

/** What today's rules do with a phrase, in the same shape as the examples. */
function hear(say) {
  const setting = parseSpokenSetting(say, book.workHours);
  if (setting) return { type: 'setting', summary: setting.summary };
  const t = parseThought(say, book.events);
  return { type: t.kind, context: t.context, effort: t.effort, place: t.place, event: t.kind === 'note' ? t.eventId : undefined };
}

const rows = { pass: [], fail: [], waiting: [] };
for (const ex of book.examples) {
  const got = hear(ex.say);
  const misses = Object.entries(ex.expect)
    .filter(([k, v]) => got[k] !== v)
    .map(([k, v]) => `${k}: wanted ${JSON.stringify(v)}, got ${JSON.stringify(got[k])}`);
  if (ex.needs === 'ai') rows.waiting.push({ ex, ok: !misses.length });
  else rows[misses.length ? 'fail' : 'pass'].push({ ex, misses });
}

console.log(`\nRemy's playbook: ${rows.pass.length} of ${rows.pass.length + rows.fail.length} handled by today's rules\n`);
for (const { ex, misses } of rows.fail) console.log(`  ✕ "${ex.say}"\n      ${misses.join('\n      ')}`);
if (!rows.fail.length) console.log('  Every rules phrase is handled.');
console.log(`\n${rows.waiting.length} phrases are waiting for AI sorting (dates, times, judgment).\n`);
process.exitCode = rows.fail.length ? 1 : 0;
