import Link from "next/link";
import { CheckCircle2, Mail, ShieldCheck, TriangleAlert } from "lucide-react";
import {
  acceptSalesAgentInviteAction,
  claimSalesAgentInviteAction,
} from "@/lib/actions/sales-agent-invite-acceptance";
import {
  firstRelation,
  getSalesAgentInviteByToken,
  isSalesAgentInviteExpired,
} from "@/lib/server/sales-agent-invites";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

type SalesAgentJoinPageProps = {
  params: Promise<{ token: string }>;
  searchParams?: Promise<{
    status?: string | string[];
    message?: string | string[];
  }>;
};

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function statusClass(status: string | undefined) {
  if (status === "success") {
    return "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]";
  }
  return "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]";
}

export default async function SalesAgentJoinPage({
  params,
  searchParams,
}: SalesAgentJoinPageProps) {
  const { token } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const status = getParamValue(resolvedSearchParams.status);
  const message = getParamValue(resolvedSearchParams.message);

  const [{ invite, error: inviteError }, supabase] = await Promise.all([
    getSalesAgentInviteByToken(token),
    createClient(),
  ]);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dealer = invite ? firstRelation(invite.dealer) : null;
  const joinPath = `/join/sales-agent/${encodeURIComponent(token)}`;
  const loginHref = `/login?next=${encodeURIComponent(joinPath)}`;
  const isExpired = invite ? isSalesAgentInviteExpired(invite.invite_expires_at) : false;
  const signedInEmail = user?.email?.toLowerCase() || "";
  const emailMatches = Boolean(invite && signedInEmail && signedInEmail === invite.email.toLowerCase());
  const canAccept = Boolean(user && invite && emailMatches && invite.invite_status === "pending" && !isExpired);

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <section className="w-full max-w-[720px] rounded-[24px] border border-[#e5e7eb] bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#eff6ff] text-[#2563eb]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#2563eb]">
                Sales rep invite
              </p>
              <h1 className="mt-2 font-heading text-[30px] font-semibold leading-tight text-[#111827]">
                Join {dealer?.name || "a dealership"} on Autolist
              </h1>
              <p className="mt-3 text-[14px] leading-6 text-[#64748b]">
                Sales reps do not need a password assigned by the dealer. Sign in or create an
                account with the invited email address, then accept the dealership invite here.
              </p>
            </div>
          </div>

          {message ? (
            <div className={`mt-6 rounded-[16px] border px-4 py-3 text-[13px] ${statusClass(status)}`}>
              {message}
            </div>
          ) : null}

          {!invite ? (
            <div className="mt-8 rounded-[16px] border border-[#fecaca] bg-[#fef2f2] px-5 py-4 text-[14px] leading-6 text-[#991b1b]">
              {inviteError ||
                "This invite link is invalid or has already been used. Ask the dealer to send a new invite from the sales agents dashboard."}
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              <div className="grid gap-3 rounded-[18px] border border-[#eef2f7] bg-[#f8fafc] p-4 sm:grid-cols-2">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#94a3b8]">
                    Invited rep
                  </p>
                  <p className="mt-1 text-[15px] font-semibold text-[#111827]">{invite.name}</p>
                  <p className="mt-1 text-[13px] text-[#64748b]">{invite.email}</p>
                </div>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#94a3b8]">
                    Dealership
                  </p>
                  <p className="mt-1 text-[15px] font-semibold text-[#111827]">
                    {dealer?.name || "Dealer account"}
                  </p>
                  <p className="mt-1 text-[13px] text-[#64748b]">
                    Invite status: {isExpired ? "expired" : invite.invite_status.replace("_", " ")}
                  </p>
                </div>
              </div>

              {!user ? (
                isExpired || invite.invite_status !== "pending" ? (
                  <div className="rounded-[16px] border border-[#fed7aa] bg-[#fff7ed] px-5 py-4 text-[14px] leading-6 text-[#9a3412]">
                    This invite is {isExpired ? "expired" : invite.invite_status}. Ask the dealer to
                    send a fresh invite.
                  </div>
                ) : (
                  <div className="rounded-[16px] border border-[#dbeafe] bg-[#eff6ff] px-5 py-4">
                    <div className="flex gap-3">
                      <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#2563eb]" />
                      <div>
                        <p className="text-[14px] font-semibold text-[#1d4ed8]">
                          Set up your sales rep account
                        </p>
                        <p className="mt-1 text-[13px] leading-5 text-[#315db5]">
                          Choose a password for {invite.email}. We&apos;ll create your rep account
                          and connect you to the dealership in one step — no email verification
                          needed.
                        </p>
                      </div>
                    </div>

                    <form action={claimSalesAgentInviteAction} className="mt-4 space-y-3">
                      <input type="hidden" name="token" value={token} />
                      <div>
                        <label
                          htmlFor="claim-name"
                          className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#64748b]"
                        >
                          Full name
                        </label>
                        <input
                          id="claim-name"
                          name="fullName"
                          type="text"
                          required
                          defaultValue={invite.name}
                          className="mt-1 h-11 w-full rounded-[12px] border border-[#cdddf5] bg-white px-3 text-[14px] text-[#111827] outline-none focus:border-[#2563eb]"
                        />
                      </div>
                      <div>
                        <label className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#64748b]">
                          Email
                        </label>
                        <input
                          type="email"
                          value={invite.email}
                          readOnly
                          className="mt-1 h-11 w-full cursor-not-allowed rounded-[12px] border border-[#e2e8f0] bg-[#f8fafc] px-3 text-[14px] text-[#64748b]"
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="claim-password"
                            className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#64748b]"
                          >
                            Password
                          </label>
                          <input
                            id="claim-password"
                            name="password"
                            type="password"
                            required
                            minLength={8}
                            autoComplete="new-password"
                            className="mt-1 h-11 w-full rounded-[12px] border border-[#cdddf5] bg-white px-3 text-[14px] text-[#111827] outline-none focus:border-[#2563eb]"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="claim-confirm"
                            className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#64748b]"
                          >
                            Confirm password
                          </label>
                          <input
                            id="claim-confirm"
                            name="confirmPassword"
                            type="password"
                            required
                            minLength={8}
                            autoComplete="new-password"
                            className="mt-1 h-11 w-full rounded-[12px] border border-[#cdddf5] bg-white px-3 text-[14px] text-[#111827] outline-none focus:border-[#2563eb]"
                          />
                        </div>
                      </div>
                      <p className="text-[12px] leading-5 text-[#64748b]">
                        Use at least 8 characters.
                      </p>
                      <button
                        type="submit"
                        className="inline-flex h-11 w-full items-center justify-center rounded-[12px] bg-[#2563eb] px-4 text-[14px] font-semibold text-white transition hover:bg-[#1d4ed8] sm:w-auto"
                      >
                        Create account &amp; accept invite
                      </button>
                    </form>

                    <p className="mt-4 text-[13px] text-[#315db5]">
                      Already have an account with {invite.email}?{" "}
                      <Link href={loginHref} className="font-semibold text-[#1d4ed8] underline">
                        Sign in
                      </Link>{" "}
                      to accept.
                    </p>
                  </div>
                )
              ) : !emailMatches ? (
                <div className="rounded-[16px] border border-[#fed7aa] bg-[#fff7ed] px-5 py-4 text-[14px] leading-6 text-[#9a3412]">
                  <div className="flex gap-3">
                    <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                    <p>
                      You are signed in as {user.email || "another account"}. This invite must be
                      accepted with {invite.email}.
                    </p>
                  </div>
                </div>
              ) : isExpired || invite.invite_status !== "pending" ? (
                <div className="rounded-[16px] border border-[#fed7aa] bg-[#fff7ed] px-5 py-4 text-[14px] leading-6 text-[#9a3412]">
                  This invite is {isExpired ? "expired" : invite.invite_status}. Ask the dealer to
                  send a fresh invite.
                </div>
              ) : (
                <form action={acceptSalesAgentInviteAction} className="rounded-[16px] border border-[#bbf7d0] bg-[#f0fdf4] px-5 py-4">
                  <input type="hidden" name="token" value={token} />
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#16a34a]" />
                      <p className="text-[14px] leading-6 text-[#166534]">
                        You are signed in with the invited email. Accepting links this account to
                        the dealership as a sales rep.
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={!canAccept}
                      className="inline-flex h-11 shrink-0 items-center justify-center rounded-[12px] bg-[#16a34a] px-4 text-[14px] font-semibold text-white transition hover:bg-[#15803d] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Accept invite
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
