# Fresh-eyes QA harness

Run from the repository root on the Mac. Tool dependencies are deliberately outside the application dependency tree:

```sh
export PATH=/opt/homebrew/bin:$PATH
NODE_ENV=development npm ci
NODE_ENV=development npm run build
npm install --prefix /tmp/pwcheck playwright axe-core lighthouse
cp AUDIT/qa-scripts/*.mjs /tmp/pwcheck/
cp AUDIT/qa-scripts/required-check.mjs /tmp/pwcheck/check.mjs
node /tmp/pwcheck/qa-server.mjs .vercel/output/static
```

The server binds port 4477 and implements static files, byte ranges, legacy RU redirects and localized fallback 404s. It is a local test adapter, not a Vercel routing emulator; production redirects are independently tested against LIVE.

In another terminal, from the repository root:

```sh
node /tmp/pwcheck/qa-matrix.mjs https://ellinayatsenyuk.com live
node /tmp/pwcheck/qa-matrix.mjs http://localhost:4477 local-final
node /tmp/pwcheck/qa-interactions.mjs http://localhost:4477 local-final
node /tmp/pwcheck/qa-motion.mjs http://localhost:4477 local-final
node /tmp/pwcheck/qa-lighthouse.mjs http://localhost:4477 local-final
node /tmp/pwcheck/qa-links.mjs
node /tmp/pwcheck/qa-clipping.mjs
node /tmp/pwcheck/qa-settle.mjs
node /tmp/pwcheck/qa-history.mjs http://localhost:4477 final-history
node /tmp/pwcheck/qa-history-stack.mjs
node /tmp/pwcheck/qa-dialog-keys.mjs
node /tmp/pwcheck/qa-fix-regressions.mjs
node /tmp/pwcheck/qa-webkit-shots.mjs
node /tmp/pwcheck/check.mjs .vercel/output/static http://localhost:4477
```

`qa-clipping` targets localhost; `qa-settle` targets LIVE. The interaction harness exercises the swipe handler with synthetic touch events, not physical touch hardware. Video playback checks actual decoded dimensions and advancing currentTime. It waits for the native dialog's queued close event before checking cleanup. Filters are conditional: absent for the current one-project/one-film content.

Motion captures target a 50 ms cadence; recorded `performance.now()` timestamps expose actual timing and any capture overhead. Screenshots use real-time animations, not screenshot animation disabling. Fast-scroll samples are followed by a separate per-frame settle check to avoid misclassifying an intentional reveal as a stuck slit.

The scripts write raw results to `AUDIT/qa-evidence/`. For the committed audit, large raw captures were moved to ignored `screenshots/qa-final/`; compact JSON summaries and representative screenshots remain in `AUDIT/qa-evidence/`.

The matrix also accepts optional `QA_ENGINE=chromium|webkit` and `QA_WIDTH=390|768|1440|393` environment filters. The final build was tested in four independent matrix shards and their 42-case results combined into `local-final-matrix.json` (168 cases). Do not rebuild while a static preview server is serving the build directory: stop/restart it around the build or use an immutable copy.
