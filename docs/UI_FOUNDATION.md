# UI Foundation

## Purpose
Document the shared design primitives that define the Phase 01 application shell baseline.

## Typography
- Font family: IBM Plex Sans, Segoe UI, sans-serif
- Heading weight: 700
- Body weight: 400
- Scale:
  - xs: 0.75rem
  - sm: 0.875rem
  - md: 1rem
  - lg: 1.125rem
  - xl: 1.5rem
  - xxl: 2rem

## Spacing Scale
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- xxl: 32px

## Theme Tokens
### Light
- background: #f4f6f8
- surface: #ffffff
- text: #0f172a
- mutedText: #475569
- border: #cbd5e1
- accent: #0f766e
- accentSoft: #ccfbf1
- danger: #b91c1c

### Dark
- background: #0b1220
- surface: #111827
- text: #e2e8f0
- mutedText: #94a3b8
- border: #334155
- accent: #14b8a6
- accentSoft: #134e4a
- danger: #f87171

## Shared Components
- ThemeProvider
- LayoutShell
- NavShell
- LoadingState
- EmptyState
- ErrorState

## Responsive Baseline
- Desktop: two-column shell with persistent navigation rail
- Tablet/mobile: single-column layout with navigation stacked above content at widths below 900px
- Main content padding reduces on smaller screens to preserve readable density

## Phase 01 Scope Limit
This foundation defines only shared shell primitives and state components. Business-facing UI remains out of scope until later phase PRDs.
