"use client";

/**
 * Phase 10.3 — User Administration Page
 *
 * Admin-only page for listing users, inviting by email,
 * changing roles, and archiving users.
 * User status lifecycle: Active → Archived (and reverse).
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  Search,
  MoreVertical,
  Shield,
  Archive,
  RotateCcw,
  Mail,
} from "lucide-react";
import { useAuthSession } from "@/components/AuthSessionProvider";

// ── Types ───────────────────────────────────────────────────────────────────

interface UserRecord {
  id: string;
  name: string;
  email: string;
  status: string;
  role: string;
  createdAt: string;
}

// ── Page Component ──────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const { user, isPending } = useAuthSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search[name]", searchQuery);
      if (statusFilter !== "all") params.set("filter[status]", statusFilter);
      params.set("pageSize", "50");

      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data || []);
      }
    } catch {
      // silently fail — UI shows empty state
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    if (!isPending && user) {
      fetchUsers();
    }
  }, [isPending, user, fetchUsers]);

  if (isPending) {
    return <AdminLoadingSkeleton />;
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-rosely-night">User Management</h1>
          <p className="mt-1 text-sm text-rosely-mist">
            Manage workspace users, invite new members, and assign roles
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 rounded-lg bg-rosely-plum px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rosely-mauve"
        >
          <UserPlus className="h-4 w-4" />
          Invite User
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rosely-mist" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full rounded-lg border border-rosely-blush py-2 pl-10 pr-3 text-sm text-rosely-night placeholder:text-rosely-mist focus:border-rosely-lilac focus:outline-none focus:ring-1 focus:ring-rosely-lilac"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
          className="rounded-lg border border-rosely-blush px-3 py-2 text-sm text-rosely-night focus:border-rosely-lilac focus:outline-none focus:ring-1 focus:ring-rosely-lilac"
        >
          <option value="all">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Invited">Invited</option>
          <option value="Archived">Archived</option>
        </select>
      </div>

      {/* User Table */}
      <div className="rounded-xl border border-rosely-blush bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-rosely-blush text-left text-rosely-mist">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rosely-petal">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-rosely-mist">
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-rosely-mist">
                  <Users className="mx-auto h-8 w-8 text-rosely-blush" />
                  <p className="mt-2">No users found</p>
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-rosely-petal/40 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-rosely-night">{u.name}</p>
                      <p className="text-xs text-rosely-mist">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <UserStatusBadge status={u.status} />
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-3 text-rosely-dusk">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <button
                        onClick={() => setActionMenuId(actionMenuId === u.id ? null : u.id)}
                        className="rounded-lg p-1 text-rosely-mist hover:bg-rosely-petal hover:text-rosely-night"
                        aria-label={`Actions for ${u.name}`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {actionMenuId === u.id && (
                        <UserActionMenu
                          user={u}
                          onClose={() => setActionMenuId(null)}
                          onRefresh={fetchUsers}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteUserModal
          onClose={() => setShowInviteModal(false)}
          onInvited={fetchUsers}
        />
      )}
    </div>
  );
}

// ── User Status Badge ───────────────────────────────────────────────────────

function UserStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Active: "bg-rosely-teal/20 text-rosely-teal",
    Invited: "bg-rosely-periwinkle/20 text-rosely-periwinkle",
    Requested: "bg-rosely-golden/20 text-rosely-night",
    Archived: "bg-rosely-mist/20 text-rosely-mist",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] || "bg-rosely-petal text-rosely-dusk"}`}
    >
      {status}
    </span>
  );
}

// ── Role Badge ──────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    Admin: "bg-rosely-plum/20 text-rosely-plum",
    Member: "bg-rosely-lilac/20 text-rosely-mauve",
    Viewer: "bg-rosely-petal text-rosely-dusk",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[role] || "bg-rosely-petal text-rosely-dusk"}`}
    >
      {role}
    </span>
  );
}

// ── Action Menu ─────────────────────────────────────────────────────────────

function UserActionMenu({
  user: u,
  onClose,
  onRefresh,
}: {
  user: UserRecord;
  onClose: () => void;
  onRefresh: () => void;
}) {
  async function changeRole(role: string) {
    try {
      await fetch(`/api/admin/users/${u.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      onRefresh();
    } catch {
      // silently fail
    }
    onClose();
  }

  async function toggleArchive() {
    const newStatus = u.status === "Archived" ? "Active" : "Archived";
    try {
      await fetch(`/api/admin/users/${u.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      onRefresh();
    } catch {
      // silently fail
    }
    onClose();
  }

  return (
    <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-rosely-blush bg-white py-1 shadow-lg">
      <button
        onClick={() => changeRole("Viewer")}
        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-rosely-dusk hover:bg-rosely-petal/50"
      >
        <Shield className="h-4 w-4" />
        Set as Viewer
      </button>
      <button
        onClick={() => changeRole("Member")}
        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-rosely-dusk hover:bg-rosely-petal/50"
      >
        <Shield className="h-4 w-4" />
        Set as Member
      </button>
      <button
        onClick={() => changeRole("Admin")}
        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-rosely-dusk hover:bg-rosely-petal/50"
      >
        <Shield className="h-4 w-4" />
        Set as Admin
      </button>
      <div className="my-1 border-t border-rosely-blush" />
      <button
        onClick={toggleArchive}
        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-rosely-rose hover:bg-rosely-petal/50"
      >
        {u.status === "Archived" ? (
          <>
            <RotateCcw className="h-4 w-4" />
            Restore User
          </>
        ) : (
          <>
            <Archive className="h-4 w-4" />
            Archive User
          </>
        )}
      </button>
    </div>
  );
}

// ── Invite Modal ────────────────────────────────────────────────────────────

function InviteUserModal({
  onClose,
  onInvited,
}: {
  onClose: () => void;
  onInvited: () => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Member");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message || "Failed to send invitation");
        setSending(false);
        return;
      }

      onInvited();
      onClose();
    } catch {
      setError("An unexpected error occurred");
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl border border-rosely-blush bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-rosely-night">Invite User</h3>
        <p className="mt-1 text-sm text-rosely-mist">
          Send an invitation email to add a new workspace member
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-rosely-rose/30 bg-rosely-rose/10 px-4 py-3 text-sm text-rosely-rose">
            {error}
          </div>
        )}

        <form onSubmit={handleInvite} className="mt-4 space-y-4">
          <div>
            <label htmlFor="invite-email" className="block text-sm font-medium text-rosely-night">
              Email Address
            </label>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="colleague@company.com"
              className="mt-1 w-full rounded-lg border border-rosely-blush px-3 py-2 text-sm text-rosely-night placeholder:text-rosely-mist focus:border-rosely-lilac focus:outline-none focus:ring-1 focus:ring-rosely-lilac"
            />
          </div>

          <div>
            <label htmlFor="invite-role" className="block text-sm font-medium text-rosely-night">
              Role
            </label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full rounded-lg border border-rosely-blush px-3 py-2 text-sm text-rosely-night focus:border-rosely-lilac focus:outline-none focus:ring-1 focus:ring-rosely-lilac"
            >
              <option value="Viewer">Viewer</option>
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-rosely-blush px-4 py-2 text-sm font-medium text-rosely-dusk hover:bg-rosely-petal transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="flex items-center gap-2 rounded-lg bg-rosely-plum px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rosely-mauve disabled:opacity-50"
            >
              <Mail className="h-4 w-4" />
              {sending ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Loading Skeleton ────────────────────────────────────────────────────────

function AdminLoadingSkeleton() {
  return (
    <div className="p-8">
      <div className="h-8 w-48 animate-pulse rounded bg-rosely-petal" />
      <div className="mt-6 h-96 w-full animate-pulse rounded-xl bg-rosely-petal" />
    </div>
  );
}
