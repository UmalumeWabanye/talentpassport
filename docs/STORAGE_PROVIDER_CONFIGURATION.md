# Storage Provider Configuration

## Overview
The backend storage module exposes provider-agnostic signed URL generation and file metadata persistence.
Current provider support:
- `local`

## Environment Variables
- `STORAGE_PROVIDER`: provider key (`local`)
- `STORAGE_BUCKET`: logical bucket/container identifier used in metadata context
- `STORAGE_SIGNING_SECRET`: HMAC secret used to sign URL tokens
- `STORAGE_SIGNED_URL_TTL_SECONDS`: signed URL lifetime in seconds
- `STORAGE_PUBLIC_BASE_URL`: public API base URL used when constructing signed routes

These values are defined in:
- `.env.example`
- `.env.local.example`
- `.env.test.example`
- `.env.staging.example`
- `.env.production.example`

## API Endpoints
All endpoints are versioned under `/api/v1/storage`.

- `POST /files/presign-upload`
  - Creates `file_metadata` row
  - Returns upload signed URL payload

- `POST /files/:fileId/presign-download`
  - Validates file metadata and tenant boundary
  - Returns download signed URL payload

- `GET /files/:fileId/metadata`
  - Returns persisted file metadata record

## Tenant Boundary
Requests must include `x-tenant-id` and it must match the target `organizationId` (tenant ID). Cross-tenant access is rejected.

## Evidence
- Unit tests:
  - `services/backend/src/storage/providers/local-storage.provider.test.ts`
  - `services/backend/src/storage/storage.service.test.ts`
- Backend quality gates:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
