# Storage Security Review Notes

## Feature Scope
Epic 6.2 - File security and validation in backend storage flow.

## Implemented Controls
- Strict allowlist validation for MIME types via `STORAGE_ALLOWED_MIME_TYPES`.
- Extension-to-MIME consistency checks before metadata persistence.
- Maximum file size enforcement via `STORAGE_MAX_FILE_SIZE_BYTES`.
- Filename sanitization to prevent path traversal and unsafe characters.
- Tenant boundary enforcement using `x-tenant-id` alignment with `organizationId`.
- Malware scan integration hook (`MalwareScanner`) with fail behavior for infected results.

## Threats Addressed
- Upload of executable or unsupported content types.
- Content-type spoofing where declared MIME does not match file extension.
- Path traversal in filenames.
- Excessive payload uploads for abuse/resource exhaustion.
- Cross-tenant metadata access.
- Missing anti-malware integration point for future scanner service.

## Residual Risks
- Current malware scanner implementation is a no-op hook; external scanner integration is still required for active malware detection in production.
- MIME and extension verification are metadata-level checks; binary sniffing is out of scope for this phase and should be added in a later hardening pass.

## Recommended Next Hardening
- Integrate a real scanning engine in place of `NoopMalwareScannerService`.
- Add content signature sniffing for high-risk MIME classes.
- Add abuse telemetry for repeated validation failures and scanner rejects.
