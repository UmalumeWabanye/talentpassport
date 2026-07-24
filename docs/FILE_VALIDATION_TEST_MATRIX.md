# File Validation Test Matrix

## Scope
Validation coverage for Epic 6.2 in backend storage upload reservation flow.

## Rules Covered
- Allowed MIME type allowlist
- Extension and MIME alignment
- Max file size enforcement
- Original filename sanitization
- Tenant boundary check on file operations
- Malware scan hook failure path

## Test Matrix
| Scenario | Input | Expected Result | Test |
| --- | --- | --- | --- |
| Valid PDF upload | `application/pdf`, `candidate-portfolio.pdf`, 120KB | Accepted, signed upload URL returned | `file-validation.service.test.ts` and `storage.service.test.ts` |
| Unsafe filename path traversal | `../../Profile Photo (Final).png` | Sanitized filename persisted (`Profile-Photo-Final-.png`) | `file-validation.service.test.ts` |
| Disallowed MIME | `application/x-msdownload`, `script.exe` | Rejected with bad request | `file-validation.service.test.ts` and `storage.service.test.ts` |
| MIME/extension mismatch | `application/pdf`, `avatar.png` | Rejected with bad request | `file-validation.service.test.ts` |
| Oversized file | size > `STORAGE_MAX_FILE_SIZE_BYTES` | Rejected with payload too large | `file-validation.service.test.ts` |
| Malware scanner flags infected | scanner returns `infected` | Rejected with bad request | `storage.service.test.ts` |

## Execution Evidence
- `pnpm test` in `services/backend` passes with storage validation tests.
- `pnpm lint` and `pnpm typecheck` pass after integrating validation and malware scan hook.
