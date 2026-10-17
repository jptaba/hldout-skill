/**
 * Filling in an AUT profile: from the setup flags, and from one visit of the application's start page. Shared by
 * `init` and `add-aut`.
 */
import fs from 'node:fs';
import { flagStr, unmangleMsysPath, type Flags } from '../core/cli';
import { appNameFrom, appRootOf, baseUrlOf, describeCounts, discoverApp, profileIdFor } from '../probe/detect';

export const say = (mark: string, msg: string) => console.log(`${mark} ${msg}`);

export function profileFrom(flags: Flags, base: Record<string, unknown> = {}) {
  const given = flagStr(flags, 'base-url');
  const baseURL = given ? baseUrlOf(given) : (base.baseURL as string);
  if (given && baseURL !== given && baseURL !== `${given}/`) {
    const route = new URL(given).hash;
    say('✔', `base URL: ${baseURL} (${route ? `the app's address without the ${route} route; tests open routes such as #/login from it` : 'the folder of the page you gave, so paths like "page.htm" resolve beside it'})`);
  }
  const hc = flagStr(flags, 'healthcheck');
  return {
    ...base,
    name: flagStr(flags, 'name') ?? (baseURL ? profileIdFor(baseURL) : base.name),
    baseURL,
    // A new --base-url implies the API lives there too unless --api-base-url says otherwise.
    apiBaseURL: (flagStr(flags, 'api-base-url') ? baseUrlOf(flagStr(flags, 'api-base-url')!) : undefined) ?? (flagStr(flags, 'base-url') ? baseURL : (base.apiBaseURL ?? baseURL)),
    testIdAttribute: flagStr(flags, 'test-id-attr') ?? base.testIdAttribute ?? 'data-testid',
    healthcheck: hc ? hc.split(',').map((x) => unmangleMsysPath(x.trim())).filter(Boolean) : (base.healthcheck ?? ['/']),
  };
}

/** Visit the start page once and fill in what the flags didn't give: name, test-id attribute, blockHosts. */
export async function discover(configFile: string, id: string, flags: Flags, renameGeneric = false): Promise<void> {
  const cfg = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  const profile = cfg.auts[id];
  if (!profile) return;
  // The address given may be one page of the app ("…/books"): paths resolve from the app's root.
  const given = profile.baseURL as string;
  const root = await appRootOf(given);
  if (root !== profile.baseURL && root !== `${profile.baseURL}/`) {
    const page = new URL(profile.baseURL).pathname;
    if (profile.apiBaseURL === profile.baseURL && !flagStr(flags, 'api-base-url')) profile.apiBaseURL = root;
    profile.baseURL = root;
    say('✔', `base URL: ${root} (the root of the app ${page} belongs to; the tests' paths resolve from it. An app under a folder: give the folder with a trailing slash)`);
  }
  // The page that was given is the one its owner cares about: discovery visits it too (its ads, its test ids).
  const d = await discoverApp(profile.baseURL, given !== profile.baseURL ? [given] : []);
  if (d.error) { say('•', `could not open ${profile.baseURL} (${d.error}) — profile left as configured; heldout doctor re-checks it`); return; }
  const name = appNameFrom(d.title, id);
  if (!flagStr(flags, 'name') && name) {
    profile.name = name;
    say('✔', `name: "${name}" (from the page title, shown in verdicts; --name overrides)`);
  }
  // localhost or an IP address says nothing about the application: name the profile after its title instead.
  const slug = (name ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  if (renameGeneric && id === 'app' && slug && slug !== id && !cfg.auts[slug]) {
    cfg.auts = Object.fromEntries(Object.entries(cfg.auts).map(([k, v]) => [k === id ? slug : k, v]));
    if (cfg.defaultAut === id) cfg.defaultAut = slug;
    say('✔', `profile id: ${slug} (from the page title; ${new URL(profile.baseURL).host} doesn't name the app; --profile overrides)`);
  }
  if (flagStr(flags, 'test-id-attr')) { /* given */ } else if (d.attribute) {
    profile.testIdAttribute = d.attribute;
    say('✔', `test-id attribute: ${d.attribute} (on ${profile.baseURL}: ${describeCounts(d)}${d.via === 'html' ? '; served HTML only — install Chromium for a rendered check' : ''})`);
  } else if (d.via === 'html') say('•', `test-id attribute: none in the served HTML — keeping "${profile.testIdAttribute}"; heldout doctor renders the app once Playwright is installed and reports the attribute and the API host`);
  else say('•', `test-id attribute: none on the start page or the pages its navigation links to — keeping "${profile.testIdAttribute}"; tests will use roles and labels`);
  if (!flagStr(flags, 'api-base-url') && d.apiOrigin && (!profile.apiBaseURL || profile.apiBaseURL === profile.baseURL)) {
    profile.apiBaseURL = d.apiOrigin;
    say('✔', `API: ${d.apiOrigin} (the web app sends its requests there; --api-base-url overrides)`);
  }
  const block = d.adDomains.filter((h) => !(profile.blockHosts ?? []).includes(h));
  if (block.length) {
    profile.blockHosts = [...(profile.blockHosts ?? []), ...block];
    say('✔', `blockHosts: ${block.join(', ')} (ad/analytics networks the pages loaded; they inject content and make tests flaky)`);
  }
  const overlays = (d.overlays ?? []).map((n) => `getByRole('button', { name: '${n.replace(/'/g, "\\'")}' })`).filter((o) => !(profile.overlays ?? []).includes(o));
  if (overlays.length) {
    profile.overlays = [...(profile.overlays ?? []), ...overlays];
    say('✔', `overlays: ${d.overlays!.map((n) => `"${n}"`).join(', ')} (buttons that close what covers the start page; tests, the UI sign-in and inspect click them whenever they appear)`);
  }
  const prefix = profile.dataPrefix ?? 'hldout';
  say('•', `test data: every name the tests make here starts with "${prefix}" (users ${prefix}-…, records "${prefix} …"), so it is easy to find and sweep; --data-prefix <letters> if the app's rules need another`);
  fs.writeFileSync(configFile, `${JSON.stringify(cfg, null, 2)}\n`);
}
