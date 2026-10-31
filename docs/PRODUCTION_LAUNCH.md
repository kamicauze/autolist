# Monday production launch

Target: **2 November 2026**, Africa/Nairobi. Release scope: **free dealer pilot**.
Retain current accounts/listings and all existing News & Reviews articles,
including Evans's published posts and drafts; move staging to a separate database and bucket.
Paid package activation is paused on the server and in the membership UI.

## Verified preparation as of 31 October

- The supplied retained-database password works. The logical database archive,
  role definitions and separate scheduler history have passed an offline restore
  on Postgres 17.6, with networking unavailable and scheduled execution disabled.
  Restored inventory: 110 listings, 30 profiles, 30 Auth users and 8 storage records.
- Compared 620 schema/security objects and every row in 87 core tables. All
  application tables matched. Four Auth tables reflect later sign-in/session
  changes; all 33 non-volatile Auth-user columns, including credentials and account
  state, matched. All 204,520 captured scheduler-history rows passed digest checks.
- All 14 editorial rows (9 published, 5 drafts) match the complete private
  preservation snapshot after timestamp normalization. All 26 linked image
  originals (5,215,168 bytes) match the object backup. Four private RLS/notification
  helper functions also match their source definitions, ownership and grants.
- The private launch-backup folder contains
  `database-recovery-manifest-2026-10-31.json`, the core archive, role SQL,
  encrypted/compressed history chunks and their separate recovery key. Keep these
  together, outside Git. The earlier `database-snapshot-2026-10-31.dump` is a
  preserved **failed partial export**, not the usable recovery archive.
- Recovery covers database data/definitions plus the separate media/KYC backups.
  Managed service configuration and role passwords require separate handling;
  ephemeral `pg_net` transport tables are excluded by the extension. The database
  and object captures occurred at different times; take a fresh pre-cutover
  capture. This does not establish an off-device backup or hosted-service recovery.
- Applied migration `20261031093042_protect_profile_privileges` only, recording its
  own history entry without replaying older migrations. Ordinary clients cannot
  assign staff/sales-agent roles or edit account deactivation fields. Existing
  buyer/seller/dealer onboarding remains supported. Removed public-client
  TRUNCATE/REFERENCES/TRIGGER privileges and their public-schema defaults.
  `supabase/tests/profile_access.sql` passes against the isolated restore; live
  denial/profile-edit checks were rolled back and profile fingerprints matched.
  Applied `20261031094149_pin_database_function_search_paths` for 18 existing
  functions without changing their bodies, ownership or execution grants.
  Applied `20261031094351_constrain_insurance_request_submissions`: guest/owner
  requests remain supported while requester impersonation and prepopulated quote
  fields are denied. Isolated SQL regressions pass; retained request rows match.
  The database-only CLI security advisor now reports one warning (the existing
  `pg_net` extension location), down from 20. Auth settings, RPC exposure and
  other access policies still require review; this is not a full-platform sign-off.
- New staging project `autolist-staging-isolated` / `uivndmsjrwmsmxhnhgkl` is
  healthy on Postgres 17.11 in Ireland under AutoList KE's Free organization.
  Automatic RLS is on; automatic table exposure is off. The application schema,
  required private helpers, Auth trigger, private KYC policies and six reference
  tables are imported and verified. No retained accounts, listings, editorial
  content, KYC bytes, messages or queues were copied. Staging contains controlled
  QA accounts only. Sandbox signup/confirmation, login, private KYC signed access
  and cross-account denial checks have passed.
- Both Vercel projects' Preview and Development settings now use the isolated
  staging database and `autolist-staging-isolated` R2 bucket. Production values
  were preserved when shared environment records were partitioned. The staging
  R2 key can read/write only its bucket; access to the retained bucket returns
  403. Presigned upload, public download, exact bytes and allowed/denied CORS
  origins passed; disposable test objects were removed. Local development also
  uses the isolated resources, with unrelated local settings preserved.
- Vercel Authentication protects both projects' current and older Preview URLs.
  Anonymous requests redirect to Vercel; production-domain protection is unchanged.
  The canonical staging worker has separate automation access stored in staging
  Vault. The retained database's old staging cron job is paused, with its command,
  history and queue rows preserved; it had no pending external deliveries or
  listing-alert jobs. The isolated worker's automatic one-minute run delivered
  a controlled message to Mailtrap on its first attempt; the exact test event and
  delivery were removed. Live email was not sent.
- Public profile queries now use a three-column projection: ID, display name and
  avatar. Offline SQL and staging Data API tests verify anonymous/cross-account
  contact denial, owner editing, staff support access and seller/reviewer embeds.
  The projection migration `20261031102857` is applied to both databases. The
  private-read policy `20261031102957` is applied to staging only: **apply it to
  the retained database with the updated production application before cutover**.
  Its existing raw-profile contact exposure remains a production launch blocker.
- Migration `20261031103408` is applied to both databases. User-controlled signup
  metadata accepts only buyer/seller/dealer roles; sales-agent and staff values
  fall back to buyer. Validated server-side invite acceptance still assigns rep
  roles. Existing retained profile rows matched their pre-change fingerprint.
  Profile access, privacy and insurance SQL regressions pass with rolled-back
  fixtures; the dedicated-review and enquiry-fallback relationships are covered.

## Required before traffic cutover

| Gate | Acceptance evidence |
| --- | --- |
| Recovery | A complete database backup plus media/KYC object inventory; successful isolated restore. An empty/failed dump is not a backup. |
| Editorial preservation | All existing `content_posts` rows and linked media retained, including Evans's posts under both `Evans M` and `Evans M.` author labels. Compare the complete editorial snapshot and media checksums against the restored/retained production data; verify published article URLs, content and images before cutover. Keep drafts private. |
| Staging isolation | Separate Supabase project, Auth settings, notification queue, R2 bucket and credentials. Preview and production references must differ. |
| Database security | Current RLS/policy/adviser review, private KYC buckets and restricted signed-document access. Apply `20261031102957_restrict_private_profile_reads` to the retained database with the compatible production app; verify public seller names plus anonymous/cross-account private-profile denial. Never run the divergent migration history wholesale. |
| Email | Verified live sender, Supabase custom SMTP and confirmed delivery of registration/reset and app notification emails. Preview remains Mailtrap-only. |
| Phone verification | Active WhatsApp sender/token and an approved authentication template with a copy-code button, language and 10-minute expiry. Confirm receipt, expiry and retry limits with an authorised test number. |
| Staff email | Confirm a monitored domain mailbox and support ownership. Workspace checkout is deferred; existing domain mail can remain in use. If migrating to Workspace, preserve existing mailbox contents, verify the domain and configure sender authentication before changing MX. |
| Existing inventory | Review existing pilot/test inventory before publishing. The retired seed login owns 78 retained listings, including 69 active listings; review their dealer ownership and publication status without deleting them. |
| Operations | Named support/moderation owner, error/uptime alert destination, restore procedure and approved identity-document retention/deletion policy. |
| Acceptance | Desktop/mobile registration, real confirmation/reset, dealer onboarding/KYC review, listing/photos, search/detail, enquiry/reply and delivered notifications. Verify denial of another dealer's private data. |

## News & Reviews preservation

The user explicitly requires every article Evans has written to survive the
production move. Retain the full editorial catalog rather than filtering only
by an author string: names can vary, and authorship metadata must not determine
whether an existing article is discarded.

Preserve IDs, slugs/URLs, titles, excerpts, complete body content, author and
creator attribution, categories/subcategories, draft/published status, publication
dates, creation/update dates, cover images, galleries and inline images. Do not
replace this catalog with a reference-data seed or automatically publish drafts.

Before isolation/cutover, refresh the private editorial JSON snapshot, per-row
hashes and media manifest; record every new or deliberately edited post since
the prior capture. Verify all baseline rows and linked original media in the
isolated restore and retained production resources. After approved production
deployment, open each published article at its existing URL and verify its text,
cover/gallery/inline media; confirm drafts remain accessible only to authorised
editors. Missing or unexplained differences block traffic cutover.

The initial private preservation baseline was captured on 31 October 2026:
14 posts (9 published, 5 drafts). Raw content, creator IDs and media backups stay
outside Git in the private launch-backup folder. This targeted snapshot does not
replace the full database backup and isolated restore gate above.

## Deployment target

- Repository: `kamicauze/autolist`; production branch: `main`.
- Canonical Vercel project: `autolist`, ID `prj_E3ZChukrWsa7LezWtM0JaIduI011`.
- Team: `autolist-kes-projects`, ID `team_tbYKbl0wIclw2ZUcNk813RAf`.
- Intended site: `https://autolist.co.ke`; configure `www` as a redirect after domain verification.
- A second Git-linked project, `autolist-1`, exists. Its settings do not configure the canonical project.
- As of 30 October, public DNS still points at the existing host and MX at the existing mail service. Neither was changed during source preparation.

## Production application settings

Set secrets in the provider's secret store, scoped only to the intended environment.
Never put secret values in this document, Git, command arguments or build logs.

| Settings | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production browser/Auth/Data API |
| `SUPABASE_SERVICE_ROLE_KEY` | Production-only privileged server operations |
| `NEXT_PUBLIC_SITE_URL=https://autolist.co.ke` | Auth redirects, invitations and notification links |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `NEXT_PUBLIC_R2_PUBLIC_URL` | Correct environment's media storage and delivery |
| `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, `EMAIL_FROM` | Verified live transactional sender |
| `NOTIFICATION_PROCESS_SECRET` | Independent production worker authentication |
| `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` | Phone verification sender |
| `SELLER_PHONE_OTP_SECRET` | Independent random signing secret, at least 32 characters |
| `WHATSAPP_OTP_TEMPLATE_NAME`, `WHATSAPP_OTP_TEMPLATE_LANGUAGE` | Approved authentication template and its exact language code |
| `QA_TOOLS_ENABLED=false` | QA account tools remain disabled; production also rejects them in code |

Optional AI/Maps features must be configured and accepted if included in launch scope.
The application configuration check does not verify supplier approval, inbox receipt,
backups, database permissions or staging isolation.

## Verification and release sequence

1. Finish the backup/restore and account setup gates. Keep production traffic unchanged.
2. Provision staging's separate project/bucket, restore the reviewed schema and reference catalog, and create controlled QA accounts. Keep real customer accounts/evidence in the retained production project.
3. Switch only the `staging` Preview branch to isolated resources, preserving the production configuration. Recheck public and signed media, uploads and Mailtrap receipt.
4. Review the current notification/alert queues and scheduled jobs. Stop the old shared staging job before enabling a production worker. Do not drain historical QA rows through a live sender. Preserve/review pending legitimate deliveries.
5. Configure production's SMTP, redirects, secrets, scheduled worker and media CORS. Verify staff/support inboxes and callback URLs.
6. Run `npm ci`, `npm test`, `npm run lint`, `npm run build`, `npm run typecheck` and `npm audit --omit=dev`. Build only the reviewed commit, excluding unrelated local work.
7. Build a production candidate without assigning public domains. `npm run build` automatically checks required application settings when `VERCEL_ENV=production`; incomplete settings stop the build. Review React Compiler migration warnings separately; Rules of Hooks and dependency checks retain their established levels.
8. Complete authenticated desktop/mobile acceptance on that production candidate, including actual provider receipt. Test `/api/seed` and `/api/seed-images` return 404 and production QA account tools reject requests.
9. Record the accepted commit, deployment ID, database/storage identities, backup manifests, DNS/MX before-state and rollback target. Only then approve traffic cutover.
10. Assign the domain, verify TLS/callbacks/uploads/search/contact flows, and watch runtime/delivery errors. A source/build success alone is not a production go-live sign-off.

For an explicit environment check with a private local credential file:

```sh
node --env-file=/private/path/to/production.env --import tsx scripts/check-integrations.ts --production
```

Do not substitute `.env.local` from QA. Production secrets may not be readable back
from the provider; validate inside the intended deployment environment where needed.

## Rollback boundary

Keep the previous application deployment and DNS values recorded. Preserve the
database, customer accounts and media. Application rollback does not reverse data,
SMTP, worker schedules, storage or mail routing. Any recovery affecting those
systems requires its separately reviewed procedure and backup.
