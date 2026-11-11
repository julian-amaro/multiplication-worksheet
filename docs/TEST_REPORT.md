# Verification report

Candidate: 0.1.0. Date: November 11, 2026.

## Automated checks performed

`npm run check`: PASS (JavaScript syntax).

`npm test`: PASS — 19 tests using Node's built-in test runner. The app-handler tests execute the real app script against a small DOM/event double, not a Safari browser.

Coverage includes original problem answers; eight unique 3-digit × 2-digit replacement problems with no repeats from the previous sheet; chronological cross-problem Undo; enlarged Undo scope; round-trip ink, erasures, answer visibility and local fields; legacy record parsing; invalid-record rejection; independent state arrays; secondary pointer rejection; Pencil preference over an active touch; pointer cancellation; Move page preventing ink; New Worksheet cancellation and acceptance; confirmation for both Clear ink actions; storage failure messaging; preserving invalid stored data until explicit reset; both-view persistence; and another-tab overwrite protection.

## Browser checks performed

Remote desktop Chrome with mouse input, using the managed local preview:

- Eight vertical multiplication problems rendered with blank working space.
- Drawing on the full worksheet, opening the enlarged view, and returning retained ink.
- Eraser visibly removed a segment; Undo restored it.
- Show Answers displayed the correct products, including 125 × 24 = 3000; visibility persisted on reload.
- Page reload restored handwriting.
- Cancelling New Worksheet preserved the current sheet and ink; accepting generated eight fresh problems, cleared ink, hid answers, and incremented the sheet number.
- Clear ink displayed its confirmation; accepting cleared ink and disabled Undo/Clear.
- Layouts inspected in same-origin viewport fixtures at 768 × 1024, 1024 × 768, and 390 × 844. Tablet retained two columns; phone used one column. Enlarged workspace remained usable at phone size and in tablet landscape.
- An overlapping Enlarge button discovered at tablet width was moved beside the problem number and rechecked.
- Resizing an enlarged viewport retained ink and equation alignment.

The fixture changes CSS viewport dimensions only. It does not emulate Safari, Apple Pencil, iPad hardware, or native touch gestures. Browser console inspection showed browser-extension metadata errors; those were not worksheet application errors.

## Live deployment checks

The public GitHub Pages site was verified in remote Chrome on November 11, 2026. Its relative assets loaded successfully. Drawing, enlarging a problem, returning, showing answers, and reloading retained the stroke and answer visibility. Undo then removed the disposable test stroke. GitHub Actions deployment run 43072730415 passed syntax verification and all 19 automated tests before publishing.

## Physical device acceptance still required

On the creator's iPad in Safari, after the authorized HTTPS deployment:

1. Write 125 × 24 using carrying and partial products. Test Apple Pencil, finger, and the intended stylus.
2. Rest a palm on the screen while writing; confirm no stray strokes. Event filtering is implemented, but hardware palm rejection is not certified.
3. Enlarge the problem, add more writing, erase part of a digit, Undo, and return. Marks must remain aligned with the equation.
4. Rotate between portrait and landscape in both views. Check the entire canvas and all controls remain reachable.
5. Choose Move page and test touch scrolling and pinch zoom; choose Pencil and resume writing. Scroll via margins as well.
6. Show and hide answers. Cancel New Worksheet and Clear ink, then test each accepted action using disposable practice work.
7. Reload, close/reopen the tab, and return after backgrounding Safari. Verify the latest completed strokes remain.
8. Check browser Print/PDF output if desired. Print styles are included; a physical Safari print/PDF has not been verified.

## Boundaries

No handwriting recognition or automatic grading. No cloud synchronization or backup. No offline install/service worker claim. Saving occurs at stroke completion and page lifecycle events; abrupt device termination during a stroke may lose that unfinished stroke. Stroke replay uses the original canvas approach; very long sessions need real-device latency testing. Physical device checks remain a release-verification gap, not a claim of completed iPad testing.
