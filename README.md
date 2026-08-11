# TODO

---

# Hosting notes

The web client is served from **Cloudflare Pages**, not Firebase Hosting. Everything else — Auth, Firestore, Realtime Database, Cloud Storage and Cloud Functions — still runs in the Firebase project `dropbox-clone-716f7`.

## Why

Google suspended Firebase Hosting for this project. The project ID `dropbox-clone-716f7` reads as Dropbox brand impersonation, so the hosted URL was flagged as phishing. The project ID cannot be renamed.

> **Summary**
>
> Resources associated with your project Kiki Storage (id: dropbox-clone-716f7) are being suspended for hosting content that appears to be phishing. This is a violation of the Google Cloud Platform Terms of Service or Acceptable Use Policy (including Terms of Service of the Google API you may be using).
>
> **Details**
>
> Project impacted: Kiki Storage (id: dropbox-clone-716f7)
>
> Site impacted: dropbox-clone-716f7
>
> Url(s) impacted: https://dropbox-clone-716f7.web.app
>
> Description: Hosting content that appears to be phishing has resulted in the suspension of the Url(s).
>
> Location: \*PLEASE EXERCISE ADEQUATE CAUTION AND DO NOT VISIT THESE SITES DIRECTLY\* Url: https://dropbox-clone-716f7.web.app

## Current setup

| Piece | Where |
| --- | --- |
| Frontend | Cloudflare Pages project `kiki-storage`, connected to this repo — branch `main`, root directory `web-client`, build `npm run build`, output `dist` |
| Domain | `storage.k1k1.dev` → CNAME `kiki-storage.pages.dev`, proxied through Cloudflare |
| Auth, Firestore, RTDB, Cloud Storage, Functions | Firebase project `dropbox-clone-716f7`, unchanged |

Login is unaffected by the suspension. Google One Tap hands its credential straight to `signInWithCredential`, and FirebaseUI's popup flow uses `https://dropbox-clone-716f7.firebaseapp.com/__/auth/handler`, which Firebase serves from its Auth infrastructure independently of Hosting — it returns 200 even while the site is suspended. The only casualty is `/__/firebase/init.js`, which this app does not use; its config is hardcoded in `web-client/src/firebase/index.ts`.

## Deploying

Every push to `main` triggers a Pages build. To push without deploying, prefix the commit message with `[CI Skip]`, `[CI-Skip]`, `[Skip CI]`, `[Skip-CI]` or `[CF-Pages-Skip]` — Cloudflare matches these case-insensitively and omits that deployment. Useful for docs-only commits.

A manual deploy needs no local install:

```sh
cd web-client
npx wrangler pages deploy dist --project-name=kiki-storage --branch=main
```

Run it from `web-client`, **not** the repo root. Wrangler treats a root-level `functions/` directory as Pages Functions, and this repo's `functions/` holds Firebase Cloud Functions — from the root, the deploy fails trying to bundle its `node_modules` type definitions.

## Timeline

| Date | Event |
| --- | --- |
| 2024-09-30 | Last CI deploy to Firebase Hosting (383 files) |
| 2025-08-13 | Manual deploy, rolled back to the 2024-09-30 build the following day |
| 2025-08-16 | `firebase hosting:disable` run on the project — recorded as a release with 0 files |
| 2026-08-11 | Suspension notice found in the Google Cloud console; frontend migrated to Cloudflare Pages |

## What made this hard to diagnose

Firebase's API, CLI and console all reported a healthy current release the entire time. The suspension appears only as a warning in the Google Cloud console — nothing surfaces it through Firebase tooling.

- `firebase deploy --only hosting` succeeded and the console showed *Current, 383 files*, while every hostname returned Firebase's generic "Site Not Found" page.
- The `live` channel, a fresh preview channel, and a brand-new site created inside the same project all returned 404 — so the block is project-level, not site- or channel-level.
- `dropbox-clone-716f7.web.app` and a working site from another project both resolve to edge IP `199.36.158.100`. That single IP served the other project and 404'd this one, ruling out DNS, caching and client network.
- `firebase emulators:start --only hosting` served the same `dist` correctly against the real backends, proving the build and every backend were healthy.

## If Firebase Hosting is ever wanted again

The ID cannot be changed, so the suspension cannot be cleared by renaming. Either appeal it with Google, or create a new project with a neutral ID (for example `kiki-storage`) and migrate Auth, Firestore, RTDB and the Storage bucket to it.

Note that the old DNS records for the custom domain — `TXT storage.k1k1.dev` holding `hosting-site=dropbox-clone-716f7`, and `TXT _acme-challenge.storage.k1k1.dev` — have been deleted. Firebase issues fresh ones whenever a domain is attached, so nothing was lost.

## About hosting notes

Written on **2026-08-11** by **Claude Opus 5 (1M context)**, model ID `claude-opus-5[1m]`, on `xhigh` effort, running in Claude Code, while diagnosing the suspension and performing the migration.

Tools used in the process:

- `gcloud` CLI, plus the Firebase Hosting, Firebase Management, Cloud Monitoring and Identity Toolkit REST APIs — for the project inventory and the diagnosis
- Firebase CLI — `deploy`, `hosting:clone`, `hosting:channel:deploy`, `hosting:sites:create` and `emulators:start`, to attempt reviving Hosting and to prove the build was healthy
- The Cloudflare MCP server (`cloudflare-api` plugin) — for the Pages project inspection, the custom domain and the DNS records
- `wrangler` — the initial direct upload of the already-verified `dist`; removed from the repo afterwards, since Cloudflare now builds from GitHub
- `curl` and `dig` — the per-hostname and edge-IP tests that localised the fault
