# My Multiplication Worksheet

A small, independent website for practicing vertical multiplication by hand. It keeps the creator's printed-school-worksheet direction: eight 3-digit × 2-digit problems, two columns and four rows on tablets, blank writing space, and answers for manual self-checking.

**Release candidate 0.1.0.** Publication was approved on November 11, 2026. The independent public repository is `julian-amaro/multiplication-worksheet`; the initial GitHub Pages deployment is being prepared. Physical iPad Safari and Apple Pencil acceptance testing remains outstanding.

## Use

Write with a finger, stylus, Pencil, or mouse. Enlarge any problem and return without changing the coordinate system. Pencil and Eraser change the drawing tool. Move page enables touch scrolling and browser pinch zoom over the writing areas; page margins can also be used for scrolling. Undo removes the latest stroke or erasure across the sheet; inside an enlarged problem, it applies only to that problem. Clear ink and replacing a written worksheet require confirmation. Show Answers reveals exact products without grading handwriting.

Names are optional. Work is stored only in this browser on this device. Clearing browser data, private browsing, storage limits, or a different site address can affect persistence. There is no account, backend, analytics, advertising, AI, or upload endpoint. The hosting provider still receives ordinary website requests.

## Run locally

Requires Node 22+ for tests and Python 3 for the optional local server. No installation or application dependencies are needed.

```sh
npm run check
npm test
npm run serve
```

Open `http://localhost:3000`. The deployable website is the complete `public/` directory. The public app uses relative asset paths and works under a repository subpath.

## Files

- `public/index.html`, `styles.css`: adapted original worksheet interface.
- `public/model.js`: validated local state, fresh problems, chronological Undo.
- `public/app.js`: drawing, shared equation/ink geometry, dialogs, local persistence.
- `reference/original-prototype.html`: unmodified source preserved for provenance.
- `tests/`: state and event-handler regression tests; a manual responsive fixture.
- `docs/TEST_REPORT.md`: observed checks and hardware testing limits.
- `docs/DEPLOYMENT.md`: proposed independent GitHub repository and publishing steps.
- `.github/workflows/`: CI verification and manual-only Pages publication.

No open-source license is assigned in this candidate. The creator retains that decision. Publishing source is a separate approval from granting an open-source license.
