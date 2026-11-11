# Source and preserved decisions

The Product Brief & Work Handoff and Prototype Source pages supplied by the owner were read before implementation. The initial HTML was recovered from the exact linked reference, then preserved in `reference/original-prototype.html`.

Original size: 19,429 bytes.

Original SHA-256: `828abdda25b27e3446cd304ddb04495193afb1a34d2a6e8f2b9af86909be0004`.

The app retains the prototype's paper palette, worksheet heading, optional local name/date, initial eight problems, random operand ranges, local storage key, canvas stroke/eraser model, pencil/eraser controls, answer reveal, and enlarged problem workflow. HTML and CSS are adapted from the original; the state and event handling were repaired and separated into small files.

The creator's decisions remain: school worksheet rather than game; vertical multiplication; no answer boxes; eight 3-digit × 2-digit problems in two tablet columns and four rows; full-sheet and enlarged writing; manual self-checking; local-only optional personal information; no AI, login, payments, or backend.

Implementation repairs: one equation/ink coordinate system, more working space below each equation, chronological Undo, pointer ID isolation and pen preference, cancellation handling, Move page for touch navigation, minimum 44px controls, confirmation before clearing or replacing ink, visible save status, strict stored-data validation, modal focus handling, and duplicate-free new sheets. These support the existing product choices and do not introduce a game, grading system, or additional service.
