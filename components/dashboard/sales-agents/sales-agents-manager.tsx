"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Ban,
  CheckCircle2,
  Copy,
  Edit3,
  EyeOff,
  Link2,
  LockOpen,
  MessageCircle,
  Plus,
  Search,
  Send,
  Settings2,
  UserX,
  UsersRound,
} from "lucide-react";
import {
  createSalesAgent,
  deactivateSalesAgent,
  resendSalesAgentInvite,
  setSalesRepAccountDeactivated,
  updateSalesAgent,
} from "@/lib/actions/sales-agents";
import type {
  DealerSalesAgentOwner,
  SalesAgent,
  SalesAgentStatus,
} from "@/lib/types/sales-agents";
import { SALES_AGENT_PERMISSIONS } from "@/lib/constants/sales-agent-permissions";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SellerPageHeader,
  SellerStatusPill,
  SellerSurface,
  formatDashboardDate,
  getInitials,
  sellerGhostButtonClass,
  sellerInputClass,
  sellerLabelClass,
  sellerPrimaryButtonClass,
  sellerSelectClass,
} from "../seller-dashboard-ui";

interface SalesAgentsManagerProps {
  dealer: DealerSalesAgentOwner | null;
  agents: SalesAgent[];
  error?: string;
}

type ModalMode = "create" | "edit";
type SavedSalesAgentPayload = { agent: SalesAgent; inviteUrl?: string };
type InviteNotice = {
  name: string;
  email: string;
  inviteUrl: string;
} | null;

function getInviteStatus(agent: SalesAgent) {
  const isExpired =
    agent.invite_status === "pending" &&
    agent.invite_expires_at &&
    new Date(agent.invite_expires_at).getTime() <= Date.now();

  if (agent.invite_status === "accepted") {
    return { label: "Account linked", tone: "green" as const };
  }

  if (isExpired || agent.invite_status === "expired") {
    return { label: "Invite expired", tone: "red" as const };
  }

  if (agent.invite_status === "pending") {
    return { label: "Invite pending", tone: "amber" as const };
  }

  if (agent.invite_status === "revoked") {
    return { label: "Invite revoked", tone: "neutral" as const };
  }

  return { label: "Invite not sent", tone: "neutral" as const };
}

function SalesAgentForm({
  mode,
  agent,
  onCancel,
  onSaved,
}: {
  mode: ModalMode;
  agent?: SalesAgent;
  onCancel: () => void;
  onSaved: (payload: SavedSalesAgentPayload) => void;
}) {
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const formId = mode === "create" ? "sales-agent-create-form" : "sales-agent-edit-form";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createSalesAgent(formData)
          : await updateSalesAgent(agent?.id ?? "", formData);

      if ("error" in result) {
        setError(result.error);
        return;
      }

      if (result.agent) {
        onSaved({ agent: result.agent, inviteUrl: result.inviteUrl });
      }
    });
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={`${formId}-name`} className={sellerLabelClass}>
            Full name
          </label>
          <input
            id={`${formId}-name`}
            name="name"
            required
            defaultValue={agent?.name ?? ""}
            className={sellerInputClass}
            placeholder="Jane Wanjiku"
          />
        </div>

        <div>
          <label htmlFor={`${formId}-email`} className={sellerLabelClass}>
            Email
          </label>
          <input
            id={`${formId}-email`}
            name="email"
            type="email"
            required
            defaultValue={agent?.email ?? ""}
            className={sellerInputClass}
            placeholder="jane@dealer.co.ke"
          />
        </div>

        <div>
          <label htmlFor={`${formId}-phone`} className={sellerLabelClass}>
            Phone
          </label>
          <input
            id={`${formId}-phone`}
            name="phone"
            required
            defaultValue={agent?.phone ?? ""}
            className={sellerInputClass}
            placeholder="+254700000000"
          />
        </div>

        <div>
          <label htmlFor={`${formId}-status`} className={sellerLabelClass}>
            Status
          </label>
          <select
            id={`${formId}-status`}
            name="status"
            defaultValue={agent?.status ?? "active"}
            className={sellerSelectClass}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            name: "is_verified",
            label: "Verified",
            defaultChecked: agent?.is_verified ?? false,
          },
          {
            name: "whatsapp_enabled",
            label: "WhatsApp",
            defaultChecked: agent?.whatsapp_enabled ?? true,
          },
          {
            name: "hide_phone_number",
            label: "Hide phone",
            defaultChecked: agent?.hide_phone_number ?? false,
          },
        ].map((item) => (
          <label
            key={item.name}
            className="flex min-h-12 items-center gap-3 rounded-[14px] border border-[#ededed] bg-[#fafafa] px-4 text-[13px] font-medium text-[#24272c]"
          >
            <input
              type="checkbox"
              name={item.name}
              defaultChecked={item.defaultChecked}
              className="h-4 w-4 rounded border-[#d1d5db] accent-primary"
            />
            {item.label}
          </label>
        ))}
      </div>

      <div className="rounded-[14px] border border-[#ededed] bg-[#fafafa] p-4">
        <p className="text-[13px] font-semibold text-[#24272c]">Dealership permissions</p>
        <p className="mt-1 text-[12px] leading-5 text-[#6b7280]">
          Choose what this rep can do on behalf of the dealership. Adding or managing other sales
          reps stays restricted to you.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {SALES_AGENT_PERMISSIONS.map((permission) => (
            <label
              key={permission.key}
              className="flex items-start gap-3 rounded-[12px] border border-[#ededed] bg-white px-3 py-3 text-[13px] text-[#24272c]"
            >
              <input
                type="checkbox"
                name="permissions"
                value={permission.key}
                defaultChecked={agent?.permissions?.includes(permission.key) ?? false}
                className="mt-0.5 h-4 w-4 rounded border-[#d1d5db] accent-primary"
              />
              <span>
                <span className="block font-medium">{permission.label}</span>
                <span className="mt-0.5 block text-[12px] leading-5 text-[#6b7280]">
                  {permission.description}
                </span>
              </span>
            </label>
          ))}
        </div>

        <div className="mt-3 border-t border-[#ededed] pt-3">
          <label htmlFor={`${formId}-listings-scope`} className={sellerLabelClass}>
            Listings access
          </label>
          <select
            id={`${formId}-listings-scope`}
            name="listings_scope"
            defaultValue={agent?.listings_scope ?? "all"}
            className={sellerSelectClass}
          >
            <option value="all">All dealership listings</option>
            <option value="assigned">Only listings assigned to this rep</option>
          </select>
          <p className="mt-1 text-[12px] leading-5 text-[#6b7280]">
            Applies when “Manage listings” is enabled. Assign listings to a rep from the listings
            page.
          </p>
        </div>
      </div>

      {error ? (
        <p className="rounded-[14px] border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-[13px] text-[#b42318]">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className={sellerGhostButtonClass}>
          Cancel
        </button>
        <button type="submit" disabled={isPending} className={sellerPrimaryButtonClass}>
          {isPending ? "Saving..." : mode === "create" ? "Add Sales Rep" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

export function SalesAgentsManager({ dealer, agents, error }: SalesAgentsManagerProps) {
  const router = useRouter();
  const [items, setItems] = React.useState(agents);
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<"all" | SalesAgentStatus>("all");
  const [modal, setModal] = React.useState<{ mode: ModalMode; agent?: SalesAgent } | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(error ?? null);
  const [inviteNotice, setInviteNotice] = React.useState<InviteNotice>(null);
  const [deactivatingId, setDeactivatingId] = React.useState<string | null>(null);
  const [isDeactivating, startDeactivateTransition] = React.useTransition();
  const [resendingId, setResendingId] = React.useState<string | null>(null);
  const [isResending, startResendTransition] = React.useTransition();
  const [accountTogglingId, setAccountTogglingId] = React.useState<string | null>(null);
  const [isTogglingAccount, startAccountToggleTransition] = React.useTransition();

  React.useEffect(() => {
    setItems(agents);
  }, [agents]);

  const filteredAgents = items.filter((agent) => {
    const searchText = `${agent.name} ${agent.email} ${agent.phone} ${getInviteStatus(agent).label}`.toLowerCase();
    const matchesQuery = searchText.includes(query.trim().toLowerCase());
    const matchesStatus = status === "all" || agent.status === status;
    return matchesQuery && matchesStatus;
  });

  const activeCount = items.filter((agent) => agent.status === "active").length;
  const verifiedCount = items.filter((agent) => agent.is_verified).length;
  const pendingInviteCount = items.filter((agent) => getInviteStatus(agent).label === "Invite pending").length;

  const handleSaved = ({ agent: savedAgent, inviteUrl }: SavedSalesAgentPayload) => {
    setItems((current) => {
      const exists = current.some((agent) => agent.id === savedAgent.id);
      return exists
        ? current.map((agent) => (agent.id === savedAgent.id ? savedAgent : agent))
        : [savedAgent, ...current];
    });
    setModal(null);
    setActionError(null);
    if (inviteUrl) {
      setInviteNotice({
        name: savedAgent.name,
        email: savedAgent.email,
        inviteUrl,
      });
    }
    router.refresh();
  };

  const copyInviteUrl = async () => {
    if (!inviteNotice?.inviteUrl) return;
    await navigator.clipboard?.writeText(inviteNotice.inviteUrl);
  };

  const handleResendInvite = (agent: SalesAgent) => {
    setResendingId(agent.id);
    setActionError(null);
    setInviteNotice(null);

    startResendTransition(async () => {
      const result = await resendSalesAgentInvite(agent.id);
      setResendingId(null);

      if ("error" in result) {
        setActionError(result.error);
        return;
      }

      if (result.agent) {
        setItems((current) =>
          current.map((item) => (item.id === result.agent?.id ? result.agent : item))
        );
      }

      if (result.agent && result.inviteUrl) {
        setInviteNotice({
          name: result.agent.name,
          email: result.agent.email,
          inviteUrl: result.inviteUrl,
        });
      }

      router.refresh();
    });
  };

  const handleToggleAccount = (agent: SalesAgent) => {
    const nextDeactivated = !agent.account_deactivated;
    const confirmed = window.confirm(
      nextDeactivated
        ? `Deactivate ${agent.name}'s account? They will be signed out and unable to log in until reactivated.`
        : `Reactivate ${agent.name}'s account? They will be able to log in again.`
    );
    if (!confirmed) return;

    setAccountTogglingId(agent.id);
    setActionError(null);
    startAccountToggleTransition(async () => {
      const result = await setSalesRepAccountDeactivated(agent.id, nextDeactivated);
      setAccountTogglingId(null);

      if ("error" in result) {
        setActionError(result.error);
        return;
      }

      if (result.agent) {
        setItems((current) =>
          current.map((item) => (item.id === result.agent?.id ? result.agent : item))
        );
      }
      router.refresh();
    });
  };

  const handleDeactivate = (agent: SalesAgent) => {
    const confirmed = window.confirm(`Deactivate ${agent.name}? They will remain visible in your records.`);
    if (!confirmed) return;

    setDeactivatingId(agent.id);
    setActionError(null);
    startDeactivateTransition(async () => {
      const result = await deactivateSalesAgent(agent.id);
      setDeactivatingId(null);

      if ("error" in result) {
        setActionError(result.error);
        return;
      }

      if (result.agent) {
        setItems((current) =>
          current.map((item) => (item.id === result.agent?.id ? result.agent : item))
        );
      }
      router.refresh();
    });
  };

  if (!dealer) {
    return (
      <div className="space-y-6 lg:space-y-7">
        <SellerPageHeader
          title="Sales Agents"
          description="Sales reps are available after your dealer profile is submitted for review."
        />
        <SellerSurface className="p-6">
          <div className="max-w-2xl">
            <p className="font-heading text-[24px] font-semibold text-[#202224]">
              Dealer profile required
            </p>
            <p className="mt-2 text-[14px] leading-6 text-[#6b7280]">
              Create or submit a dealer profile before adding sales reps to your dashboard.
            </p>
            {error ? <p className="mt-4 text-[13px] text-[#b42318]">{error}</p> : null}
          </div>
        </SellerSurface>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-7">
      <SellerPageHeader
        title="Sales Agents"
        description={`Manage the sales reps attached to ${dealer.name}. Pending and approved dealers can keep team contact details ready for listings and enquiries.`}
        action={
          <button
            type="button"
            onClick={() => {
              setInviteNotice(null);
              setActionError(null);
              setModal({ mode: "create" });
            }}
            className="inline-flex h-12 items-center gap-2 rounded-[14px] bg-primary px-5 text-[14px] font-semibold text-white transition hover:bg-brand-hover"
          >
            <Plus className="h-4 w-4" />
            Add Sales Rep
          </button>
        }
      />

      <SellerSurface className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[14px] font-semibold text-[#202224]">Sales rep account setup</p>
            <p className="mt-2 text-[13px] leading-6 text-[#6b7280]">
              Add the rep with their real email address. Autolist generates an invite link; the rep
              signs in or creates their own account with that email, then accepts the invite. Dealers
              never need to assign or share passwords.
            </p>
          </div>
          <div className="rounded-[14px] border border-brand-muted-border bg-brand-tint px-4 py-3 text-[12px] leading-5 text-brand-hover">
            Email sending uses <span className="font-semibold">RESEND_API_KEY</span>. If it is not
            configured, copy the invite link here and send it manually. WhatsApp delivery uses the
            Meta Cloud API env vars when the rep has WhatsApp enabled.
          </div>
        </div>
      </SellerSurface>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total reps", value: String(items.length), note: dealer.status },
          { label: "Active", value: String(activeCount), note: "Ready for buyer contact" },
          { label: "Verified", value: String(verifiedCount), note: "Identity checked" },
          { label: "Pending invites", value: String(pendingInviteCount), note: "Waiting for setup" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[22px] border border-[#ededed] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
          >
            <p className="text-[13px] font-medium text-[#7b7b7b]">{stat.label}</p>
            <p className="mt-3 font-heading text-[28px] font-semibold leading-none text-[#202224]">
              {stat.value}
            </p>
            <p className="mt-2 text-[12px] text-[#8d8d8d]">{stat.note}</p>
          </div>
        ))}
      </div>

      <SellerSurface className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-[#ededed] px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-heading text-[24px] font-semibold text-[#202224]">Team roster</h2>
            <p className="mt-1 text-[13px] text-[#7a7a7a]">
              Listing counts are reserved for future per-agent assignment data.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex h-12 min-w-[240px] items-center gap-3 rounded-[14px] border border-[#ededed] bg-white px-4">
              <Search className="h-4 w-4 text-[#939393]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search reps..."
                className="h-full flex-1 border-0 bg-transparent text-[14px] outline-none placeholder:text-[#9a9a9a]"
              />
            </div>
            <div className="flex h-12 items-center gap-2 rounded-[14px] border border-[#ededed] bg-white px-4">
              <Settings2 className="h-4 w-4 text-[#939393]" />
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as "all" | SalesAgentStatus)}
                className="border-0 bg-transparent text-[14px] text-[#202224] outline-none"
              >
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {actionError ? (
          <div className="border-b border-[#fecaca] bg-[#fff1f2] px-5 py-3 text-[13px] text-[#b42318]">
            {actionError}
          </div>
        ) : null}

        {inviteNotice ? (
          <div className="border-b border-brand-muted-border bg-brand-tint px-5 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-brand-hover">
                  Invite ready for {inviteNotice.name}
                </p>
                <p className="mt-1 text-[12px] leading-5 text-[#315db5]">
                  Send this link to {inviteNotice.email}. They should sign in or create an account
                  with that email, then accept the invite.
                </p>
                <div className="mt-3 flex min-w-0 items-center gap-2 rounded-[12px] border border-brand-muted-border bg-white px-3 py-2 text-[12px] text-primary">
                  <Link2 className="h-4 w-4 shrink-0" />
                  <span className="truncate">{inviteNotice.inviteUrl}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={copyInviteUrl}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[12px] bg-primary px-4 text-[13px] font-semibold text-white transition hover:bg-brand-hover"
              >
                <Copy className="h-4 w-4" />
                Copy link
              </button>
            </div>
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead>
              <tr className="border-b border-[#ededed] bg-[#fafafa] text-[12px] uppercase tracking-[0.14em] text-[#8a8a8a]">
                <th className="px-5 py-4 font-semibold">Sales rep</th>
                <th className="px-4 py-4 font-semibold">Status</th>
                <th className="px-4 py-4 font-semibold">Verification</th>
                <th className="px-4 py-4 font-semibold">Listings</th>
                <th className="px-4 py-4 font-semibold">Joined</th>
                <th className="px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ededed]">
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center">
                    <UsersRound className="mx-auto h-9 w-9 text-[#9ca3af]" />
                    <p className="mt-3 font-heading text-[22px] font-semibold text-[#202224]">
                      No sales reps match this view
                    </p>
                    <p className="mx-auto mt-2 max-w-lg text-[14px] leading-6 text-[#7d7d7d]">
                      Add a rep or adjust the current search and status filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAgents.map((agent) => {
                  const invite = getInviteStatus(agent);

                  return (
                  <tr key={agent.id} className="text-[14px] text-[#202224]">
                    <td className="px-5 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-brand-tint text-[13px] font-semibold text-primary">
                          {getInitials(agent.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{agent.name}</p>
                          <p className="mt-1 truncate text-[12px] text-[#7b7b7b]">{agent.email}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-[#8a8a8a]">
                            <span>{agent.hide_phone_number ? "Phone hidden" : agent.phone}</span>
                            {agent.whatsapp_enabled ? (
                              <span className="inline-flex items-center gap-1 text-[#2f9e63]">
                                <MessageCircle className="h-3.5 w-3.5" />
                                WhatsApp
                              </span>
                            ) : null}
                            {agent.hide_phone_number ? (
                              <span className="inline-flex items-center gap-1 text-[#8a8a8a]">
                                <EyeOff className="h-3.5 w-3.5" />
                                Hidden
                              </span>
                            ) : null}
                          </div>
                          {agent.permissions && agent.permissions.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {SALES_AGENT_PERMISSIONS.filter((permission) =>
                                agent.permissions.includes(permission.key)
                              ).map((permission) => (
                                <span
                                  key={permission.key}
                                  className="inline-flex items-center rounded-full bg-brand-tint px-2 py-0.5 text-[11px] font-medium text-primary"
                                >
                                  {permission.label}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-2 text-[11px] text-[#9ca3af]">No dealership permissions</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <SellerStatusPill
                        label={agent.status === "active" ? "Active" : "Inactive"}
                        tone={agent.status === "active" ? "green" : "neutral"}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-2">
                        <SellerStatusPill
                          label={agent.is_verified ? "Verified" : "Unverified"}
                          tone={agent.is_verified ? "green" : "amber"}
                        />
                        <SellerStatusPill label={invite.label} tone={invite.tone} />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-[#f4f4f4] px-3 text-[13px] font-semibold text-[#5f6368]">
                        {agent.listing_count}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[#6b7280]">{formatDashboardDate(agent.created_at)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setModal({ mode: "edit", agent })}
                          className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-brand-muted-border bg-white px-3 text-[13px] font-semibold text-primary transition hover:bg-brand-soft-surface"
                        >
                          <Edit3 className="h-4 w-4" />
                          Edit
                        </button>
                        {agent.invite_status !== "accepted" ? (
                          <button
                            type="button"
                            onClick={() => handleResendInvite(agent)}
                            disabled={isResending && resendingId === agent.id}
                            className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-brand-muted-border bg-white px-3 text-[13px] font-semibold text-primary transition hover:bg-brand-soft-surface disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Send className="h-4 w-4" />
                            {isResending && resendingId === agent.id ? "Sending..." : "Invite"}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handleDeactivate(agent)}
                          disabled={agent.status === "inactive" || (isDeactivating && deactivatingId === agent.id)}
                          className={cn(
                            "inline-flex h-10 items-center gap-2 rounded-[12px] border px-3 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
                            agent.status === "inactive"
                              ? "border-[#e5e7eb] bg-[#f7f7f7] text-[#8a8a8a]"
                              : "border-[#fecaca] bg-white text-[#dc2626] hover:bg-[#fff1f2]"
                          )}
                        >
                          {agent.status === "inactive" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <UserX className="h-4 w-4" />
                          )}
                          {agent.status === "inactive"
                            ? "Inactive"
                            : isDeactivating && deactivatingId === agent.id
                              ? "Saving..."
                              : "Deactivate"}
                        </button>
                        {agent.invite_status === "accepted" ? (
                          <button
                            type="button"
                            onClick={() => handleToggleAccount(agent)}
                            disabled={isTogglingAccount && accountTogglingId === agent.id}
                            className={cn(
                              "inline-flex h-10 items-center gap-2 rounded-[12px] border px-3 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
                              agent.account_deactivated
                                ? "border-[#bbf7d0] bg-white text-[#16a34a] hover:bg-[#f0fdf4]"
                                : "border-[#fed7aa] bg-white text-[#c2410c] hover:bg-[#fff7ed]"
                            )}
                            title={
                              agent.account_deactivated
                                ? "Re-enable this rep's login"
                                : "Disable this rep's login"
                            }
                          >
                            {agent.account_deactivated ? (
                              <LockOpen className="h-4 w-4" />
                            ) : (
                              <Ban className="h-4 w-4" />
                            )}
                            {isTogglingAccount && accountTogglingId === agent.id
                              ? "Saving..."
                              : agent.account_deactivated
                                ? "Reactivate account"
                                : "Deactivate account"}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </SellerSurface>

      <Dialog open={Boolean(modal)} onOpenChange={(open) => (!open ? setModal(null) : null)}>
        <DialogContent className="border-[#ededed] bg-white sm:max-w-[640px] sm:rounded-[24px]">
          <DialogHeader>
            <DialogTitle className="font-heading text-[26px] text-[#202224]">
              {modal?.mode === "edit" ? "Edit Sales Rep" : "Add Sales Rep"}
            </DialogTitle>
            <DialogDescription className="text-[14px] leading-6 text-[#767676]">
              Keep contact preferences aligned with how buyers should reach this rep.
            </DialogDescription>
          </DialogHeader>
          {modal ? (
            <SalesAgentForm
              mode={modal.mode}
              agent={modal.agent}
              onCancel={() => setModal(null)}
              onSaved={handleSaved}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
