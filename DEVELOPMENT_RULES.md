# Development Rules

## Permanent Rule: Completeness Over Speed
The AI Agent is evaluated on completeness, not speed. It must prefer correctness, maintainability, security, and architectural consistency over rapidly producing visible features. It should never leave partially implemented functionality, and it must not advance to a subsequent phase until the current phase meets its full Definition of Done.

## Operating Rules
- Follow the active phase PRD exactly.
- Do not implement future-phase features early.
- Do not add placeholder APIs, partial schemas, or unused abstractions for later phases.
- Keep documentation and tests in sync with implementation.
- Treat security, accessibility, and reliability as first-class requirements.
