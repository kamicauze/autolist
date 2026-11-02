# WhatsApp setup and private seller verification

Keep `WHATSAPP_ENABLED=false` in each serving deployment environment until the
business sender, authentication template and real-code acceptance below are ready.
Reactivation uses the existing setting and requires a new deployment; it does not
require a code change or a database backfill. See [the production launch checklist](PRODUCTION_LAUNCH.md)
for the other release gates.

## Existing settings

Store credentials in the deployment provider's secret store for the intended
environment. Keep staging and production credentials separate. Do not put tokens,
signing secrets or received codes in Git, screenshots, logs or chat.

| Setting | Required value or behavior |
| --- | --- |
| `WHATSAPP_ENABLED` | Exact lowercase `false` pauses automated WhatsApp and the private seller verification flow. Set explicitly to `true` only after setup and acceptance. An unset value, an empty value or any value other than `false` enables the integration. |
| `WHATSAPP_ACCESS_TOKEN` | Valid server-side Meta token authorized to send using the configured business phone number. Use the owner's approved credential and track its expiry/renewal. |
| `WHATSAPP_PHONE_NUMBER_ID` | The sending phone number's Meta ID, not the display phone number or business account ID. |
| `WHATSAPP_OTP_TEMPLATE_NAME` | Exact name of the approved authentication template described below. |
| `WHATSAPP_OTP_TEMPLATE_LANGUAGE` | Exact approved template language code, such as `en_US` only if that language is actually approved. |
| `WHATSAPP_API_VERSION` | Graph API version used in `https://graph.facebook.com/{version}/{phone-number-id}/messages`. The current code falls back to `v21.0` when unset. Confirm Meta supports the selected version for this sender and validate it in staging; this fallback is not a claim of current provider support. |
| `SELLER_PHONE_OTP_SECRET` | Independent random HMAC signing secret, at least 32 characters after trimming. Use a different secret in staging and production. Changing it invalidates outstanding code digests; it does not remove existing completed verifications. |

When paused, phone credentials are omitted from the integration check's required
settings. All unrelated application requirements still apply. When enabled, the
production check requires the token, phone number ID, template name/language and
signing secret; it validates the secret's minimum length. Runtime phone-code
actions require that signing secret in staging too.

## Sender and template preparation

The business owner must complete the Meta WhatsApp Business setup and establish an
active sending number. Record the operational owner, sender ID, approved template
name/language, API version and credential renewal date without recording secrets
in this document.

Use an **approved authentication template with a copy-code button**. Set its
displayed code expiry to **10 minutes**, matching the application's actual code
expiry. The current sender supplies the same six-digit code as the body text
parameter and as the URL-button text parameter at button index `0`. The approved
template must accept this payload. A free-form text message or an unapproved
template does not satisfy phone verification acceptance.

The app also uses this provider for automated WhatsApp notifications and sales
rep invitations. Enabling the flag reactivates those callers under their existing
preferences and provider rules; review their recipients and queued deliveries
before activation. Skipped deliveries are not automatically replayed by this flag.

## Staging first

1. Confirm the staging deployment uses the isolated staging database, storage and
   worker. Keep production paused while preparing staging's settings.
2. Add the real sender/template settings and staging's own signing secret. Set
   `WHATSAPP_ENABLED=true` for the intended staging Preview branch only. Do not
   broaden a branch-specific setting to unrelated previews.
3. Check the intended environment, then redeploy the reviewed commit. The existing
   package script is `npm run integrations:check`. For a private environment file,
   the equivalent explicit command is:

   ```sh
   node --env-file=/private/path/to/staging.env --import tsx scripts/check-integrations.ts
   ```

   This checks setting presence, not Meta approval or delivery. Preview builds
   skip the build-time production check, so a successful Preview build alone is
   insufficient. Do not print or commit the environment file.
4. Sign in as an owner-controlled individual seller and use
   `/dashboard/verification` with a real WhatsApp number controlled by that owner.
   Request a code, confirm it arrives from the intended sender with the approved
   template, and have the owner enter it in the app. Do not request the code in
   chat or manufacture a provider success response.
5. Verify the actual behavior: codes expire after 10 minutes, resend requests are
   blocked for 60 seconds, five incorrect attempts exhaust that challenge, a
   consumed code cannot be reused, and a newly requested code succeeds. Use
   separate legitimate challenges as needed; do not edit challenge timestamps or
   verification fields to simulate these outcomes.
6. Confirm the genuine successful code updates the seller's displayed phone
   verification status. Check that document upload/submission becomes available
   again, using authorized test evidence only if testing the complete KYC flow.
   Staff approval must still require the verified phone and both ID-document
   sides. Dealer verification and ordinary contact WhatsApp links retain their
   existing behavior.

Record the deployment/commit, environment, sender/template identifiers, receipt
time and acceptance results without the code, token, full phone number or ID
documents. A Meta message ID alone is not proof that the owner received a code.

## Production activation

1. Keep production `WHATSAPP_ENABLED=false` until staging acceptance passes.
   Confirm the production sender, intended recipients and activation window.
   Review pending WhatsApp notifications/invitations before enabling delivery;
   do not replay old test messages through the live sender.
2. Set production's own credentials, signing secret, exact approved template
   name/language and validated API version in the canonical production project's
   **Production** environment. Preserve the isolated Preview settings.
3. Set production `WHATSAPP_ENABLED=true` and check the supplied production
   environment. `npm run integrations:check -- --production` is the existing
   production command; it does not load local `.env` or `.env.local`. With an
   explicit private file, use:

   ```sh
   node --env-file=/private/path/to/production.env --import tsx scripts/check-integrations.ts --production
   ```

4. Create and accept a new production deployment of the reviewed commit. Changing
   a Vercel environment variable does not update already-built deployments.
   `npm run build` runs the same required-settings gate automatically when
   `VERCEL_ENV=production`.
5. Repeat real receipt and successful code entry on the intended production URL
   with an owner-controlled seller and number. Check the displayed status and
   runtime/provider failures before treating verification as available to users.

## Pause again

Set `WHATSAPP_ENABLED=false` in the affected environment, redeploy, and verify the
new deployment serves the unavailable state. Private sellers should see their
existing status and review feedback without phone-code, new document-upload or
submission controls. The corresponding server actions reject requests before
challenge/document/submission writes, and automated provider calls skip sending.

Pausing does not erase existing verification statuses, documents or completed
phone verification. Existing staff review continues to require genuine phone
verification and the required documents. Never set `phone_verified_at` manually,
invent credentials, bypass the phone gate or grant a verification status to make
an acceptance check pass. Ordinary seller/dealer contact WhatsApp links and
dealer listing/verification rules are unchanged by this setting.

Verify the deployed environment after pausing; removing the flag would enable the
integration again. Re-enabling later follows staging acceptance and production
activation above, with a new code request rather than relying on an old challenge.

## Implementation references

- [Availability flag](../lib/server/whatsapp-availability.ts)
- [Meta delivery payload](../lib/server/delivery-providers.ts)
- [Phone challenges, KYC actions and staff approval](../lib/actions/seller-verification.ts)
- [Private seller verification UI](../components/dashboard/verification/seller-verification-panel.tsx)
- [Environment checks](../scripts/check-integrations.ts) and [package scripts](../package.json)
