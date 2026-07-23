# Accessibility Baseline

## Purpose
Define the minimum accessibility expectations for the shared platform shell in Phase 01.

## Standards
- Use semantic landmarks for navigation and main content.
- Ensure all interactive controls are keyboard reachable.
- Preserve visible focus states from the browser or design system.
- Avoid color-only meaning for critical status communication.
- Keep readable contrast between text and surfaces.

## Current Shell Coverage
- `NavShell` uses a semantic `nav` landmark with `aria-label`.
- `LayoutShell` renders primary content inside `main`.
- Shared states expose readable headings and descriptions.
- Navigation items are keyboard-focusable buttons.
- Mobile layout stacks navigation before content below 900px.

## Manual Validation Checklist
- Tab through all shell controls in each app.
- Confirm reading order remains logical on mobile widths.
- Confirm headings remain visible and unique per shell.
- Confirm error and empty states are readable without relying on color alone.

## Remaining Work
- Add automated accessibility checks in a later Epic 2 pass.
- Validate contrast ratios formally once final token system is expanded.
