"use client";

/**
 * Phase 10.4 — Technical User / API Token Management
 *
 * Admin page for creating technical users, generating API tokens,
 * setting token expiry, and revoking tokens.
 * Tokens are shown ONCE at creation time.
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { useAuthSession } from "@/components/AuthSessionProvider";

// ── Types ───────────────────────────────────────────────────────────────────

interface ApiToken {
  id: string;
  name: string;
  prefix: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
}

// ── Page Component ──────────────────────────────────────────────────────────

export default function TechnicalUsersPage() {
  const { user, isPending } = useAuthSession();
  const router = useRouter();
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);

  const fetchTokens = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tokens");
      if (res.ok) {
        const data = await res.json();
        setTokens(data.data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isPending && user) {
      fetchTokens();
    }
  }, [isPending, user, fetchTokens]);

  if (isPending) {
    return (
      <div className="p-8">
        <div className="h-8 w-48 animate-pulse rounded bg-rosely-petal" />
        <div className="mt-6 h-64 w-full animate-pulse rounded-xl bg-rosely-petal" />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-rosely-night">API Tokens</h1>
          <p className="mt-1 text-sm text-rosely-mist">
            Manage API tokens for technical integrations and automation
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-rosely-plum px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rosely-mauve"
        >
          <Plus className="h-4 w-4" />
          Create Token
        </button>
      </div>

      {/* Show newly created token warning */}
      {newToken && (
        <NewTokenBanner token={newToken} onDismiss={() => setNewToken(null)} />
      )}

      {/* Token List */}
      <div className="rounded-xl border border-rosely-blush bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-rosely-blush text-left text-rosely-mist">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Token Prefix</th>
              <th className="px-4 py-3 font-medium">Expires</th>
              <th className="px-4 py-3 font-medium">Last Used</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rosely-petal">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-rosely-mist">
                  Loading tokens...
                </td>
              </tr>
            ) : tokens.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-rosely-mist">
                  <Key className="mx-auto h-8 w-8 text-rosely-blush" />
                  <p className="mt-2">No API tokens created yet</p>
                  <p className="text-xs">Create a token for CI/CD pipelines or external integrations</p>
                </td>
              </tr>
            ) : (
              tokens.map((token) => (
                <TokenRow
                  key={token.id}
                  token={token}
                  onRevoke={fetchTokens}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateTokenModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(token) => {
            setNewToken(token);
            fetchTokens();
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

// ── New Token Banner ────────────────────────────────────────────────────────

function NewTokenBanner({ token, onDismiss }: { token: string; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mb-6 rounded-xl border border-rosely-golden/50 bg-rosely-golden/10 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-rosely-night" />
        <div className="flex-1">
          <p className="text-sm font-medium text-rosely-night">
            Copy your token now — it won&apos;t be shown again
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-white px-3 py-2 font-mono text-xs text-rosely-night border border-rosely-blush break-all">
              {token}
            </code>
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-lg border border-rosely-blush p-2 hover:bg-white transition-colors"
              aria-label="Copy token"
            >
              {copied ? (
                <Check className="h-4 w-4 text-rosely-teal" />
              ) : (
                <Copy className="h-4 w-4 text-rosely-dusk" />
              )}
            </button>
          </div>
          <button
            onClick={onDismiss}
            className="mt-2 text-xs text-rosely-dusk hover:text-rosely-night"
          >
            I&apos;ve copied it — dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Token Row ───────────────────────────────────────────────────────────────

function TokenRow({ token, onRevoke }: { token: ApiToken; onRevoke: () => void }) {
  const [revoking, setRevoking] = useState(false);

  const isExpired = token.expiresAt && new Date(token.expiresAt) < new Date();

  async function handleRevoke() {
    if (!confirm(`Revoke token "${token.name}"? This cannot be undone.`)) return;
    setRevoking(true);
    try {
      await fetch(`/api/admin/tokens/${token.id}`, { method: "DELETE" });
      onRevoke();
    } catch {
      // silently fail
    } finally {
      setRevoking(false);
    }
  }

  return (
    <tr className="hover:bg-rosely-petal/40 transition-colors">
      <td className="px-4 py-3 font-medium text-rosely-night">{token.name}</td>
      <td className="px-4 py-3">
        <code className="rounded bg-rosely-cream px-2 py-0.5 font-mono text-xs text-rosely-dusk">
          {token.prefix}...
        </code>
      </td>
      <td className="px-4 py-3">
        {token.expiresAt ? (
          <span className={`flex items-center gap-1 text-xs ${isExpired ? "text-rosely-rose" : "text-rosely-dusk"}`}>
            <Clock className="h-3 w-3" />
            {isExpired ? "Expired" : new Date(token.expiresAt).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-xs text-rosely-mist">Never</span>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-rosely-dusk">
        {token.lastUsedAt ? new Date(token.lastUsedAt).toLocaleDateString() : "Never"}
      </td>
      <td className="px-4 py-3 text-xs text-rosely-dusk">
        {new Date(token.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={handleRevoke}
          disabled={revoking}
          className="rounded-lg p-1.5 text-rosely-rose hover:bg-rosely-rose/10 transition-colors disabled:opacity-50"
          aria-label={`Revoke token ${token.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

// ── Create Token Modal ──────────────────────────────────────────────────────

function CreateTokenModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (token: string) => void;
}) {
  const [name, setName] = useState("");
  const [expiryDays, setExpiryDays] = useState("90");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const body: { name: string; expiresInDays?: number } = { name };
      if (expiryDays !== "never") {
        body.expiresInDays = parseInt(expiryDays);
      }

      const res = await fetch("/api/admin/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message || "Failed to create token");
        setCreating(false);
        return;
      }

      const data = await res.json();
      onCreated(data.data.token);
    } catch {
      setError("An unexpected error occurred");
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl border border-rosely-blush bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-rosely-night">Create API Token</h3>
        <p className="mt-1 text-sm text-rosely-mist">
          Generate a new token for technical integrations
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-rosely-rose/30 bg-rosely-rose/10 px-4 py-3 text-sm text-rosely-rose">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="mt-4 space-y-4">
          <div>
            <label htmlFor="token-name" className="block text-sm font-medium text-rosely-night">
              Token Name
            </label>
            <input
              id="token-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. CI/CD Pipeline, Import Script"
              className="mt-1 w-full rounded-lg border border-rosely-blush px-3 py-2 text-sm text-rosely-night placeholder:text-rosely-mist focus:border-rosely-lilac focus:outline-none focus:ring-1 focus:ring-rosely-lilac"
            />
          </div>

          <div>
            <label htmlFor="token-expiry" className="block text-sm font-medium text-rosely-night">
              Expiration
            </label>
            <select
              id="token-expiry"
              value={expiryDays}
              onChange={(e) => setExpiryDays(e.target.value)}
              className="mt-1 w-full rounded-lg border border-rosely-blush px-3 py-2 text-sm text-rosely-night focus:border-rosely-lilac focus:outline-none focus:ring-1 focus:ring-rosely-lilac"
            >
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
              <option value="365">1 year</option>
              <option value="never">Never expires</option>
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
              disabled={creating}
              className="flex items-center gap-2 rounded-lg bg-rosely-plum px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rosely-mauve disabled:opacity-50"
            >
              <Key className="h-4 w-4" />
              {creating ? "Creating..." : "Create Token"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
