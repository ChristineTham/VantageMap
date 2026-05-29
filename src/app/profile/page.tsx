"use client";

/**
 * Phase 10.2 — User Profile & Settings Page
 *
 * Allows users to view and update their profile (name, email),
 * change password, and manage notification preferences.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/components/AuthSessionProvider";
import { authClient } from "@/lib/auth-client";
import { User, Lock, Bell, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Tab = "profile" | "password" | "notifications";

export default function ProfilePage() {
  const { user, isPending } = useAuthSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  if (isPending) {
    return (
      <div className="p-8">
        <div className="h-8 w-48 animate-pulse rounded bg-rosely-petal" />
        <div className="mt-6 h-64 w-full max-w-2xl animate-pulse rounded-xl bg-rosely-petal" />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const tabs: { key: Tab; label: string; icon: typeof User }[] = [
    { key: "profile", label: "Profile", icon: User },
    { key: "password", label: "Password", icon: Lock },
    { key: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-rosely-mist hover:text-rosely-night"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-rosely-night">Profile & Settings</h1>
        <p className="mt-1 text-sm text-rosely-mist">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-rosely-blush bg-white p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-rosely-petal text-rosely-plum"
                : "text-rosely-dusk hover:text-rosely-night"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-2xl">
        {activeTab === "profile" && <ProfileTab user={user} />}
        {activeTab === "password" && <PasswordTab />}
        {activeTab === "notifications" && <NotificationsTab />}
      </div>
    </div>
  );
}

// ── Profile Tab ─────────────────────────────────────────────────────────────

function ProfileTab({ user }: { user: { name: string; email: string } }) {
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await authClient.updateUser({ name });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-rosely-blush bg-white p-6">
      <h2 className="text-lg font-bold text-rosely-night">Personal Information</h2>
      <p className="mt-1 text-sm text-rosely-mist">Update your name and display preferences</p>

      {success && (
        <div className="mt-4 rounded-lg border border-rosely-teal/30 bg-rosely-teal/10 px-4 py-3 text-sm text-rosely-teal">
          Profile updated successfully
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-rosely-rose/30 bg-rosely-rose/10 px-4 py-3 text-sm text-rosely-rose">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-rosely-night">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-rosely-blush px-3 py-2 text-sm text-rosely-night focus:border-rosely-lilac focus:outline-none focus:ring-1 focus:ring-rosely-lilac"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-rosely-night">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={user.email}
            disabled
            className="mt-1 w-full rounded-lg border border-rosely-blush bg-rosely-cream/50 px-3 py-2 text-sm text-rosely-mist"
          />
          <p className="mt-1 text-xs text-rosely-mist">Email cannot be changed</p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-rosely-plum px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rosely-mauve disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

// ── Password Tab ────────────────────────────────────────────────────────────

function PasswordTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    setSaving(true);

    try {
      await authClient.changePassword({
        currentPassword,
        newPassword,
      });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to change password. Is your current password correct?");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-rosely-blush bg-white p-6">
      <h2 className="text-lg font-bold text-rosely-night">Change Password</h2>
      <p className="mt-1 text-sm text-rosely-mist">Update your password for security</p>

      {success && (
        <div className="mt-4 rounded-lg border border-rosely-teal/30 bg-rosely-teal/10 px-4 py-3 text-sm text-rosely-teal">
          Password changed successfully
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-rosely-rose/30 bg-rosely-rose/10 px-4 py-3 text-sm text-rosely-rose">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-rosely-night">
            Current Password
          </label>
          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-rosely-blush px-3 py-2 text-sm text-rosely-night focus:border-rosely-lilac focus:outline-none focus:ring-1 focus:ring-rosely-lilac"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-rosely-night">
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={8}
            className="mt-1 w-full rounded-lg border border-rosely-blush px-3 py-2 text-sm text-rosely-night focus:border-rosely-lilac focus:outline-none focus:ring-1 focus:ring-rosely-lilac"
          />
          <p className="mt-1 text-xs text-rosely-mist">Minimum 8 characters</p>
        </div>

        <div>
          <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-rosely-night">
            Confirm New Password
          </label>
          <input
            id="confirmNewPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="mt-1 w-full rounded-lg border border-rosely-blush px-3 py-2 text-sm text-rosely-night focus:border-rosely-lilac focus:outline-none focus:ring-1 focus:ring-rosely-lilac"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-rosely-plum px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rosely-mauve disabled:opacity-50"
        >
          <Lock className="h-4 w-4" />
          {saving ? "Updating..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}

// ── Notifications Tab ───────────────────────────────────────────────────────

function NotificationsTab() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [factSheetChanges, setFactSheetChanges] = useState(true);
  const [subscriptionAlerts, setSubscriptionAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Load preferences from localStorage for now (Phase 11 will add server-side storage)
    const prefs = localStorage.getItem("notification-preferences");
    if (prefs) {
      const parsed = JSON.parse(prefs);
      setEmailNotifs(parsed.emailNotifs ?? true);
      setFactSheetChanges(parsed.factSheetChanges ?? true);
      setSubscriptionAlerts(parsed.subscriptionAlerts ?? true);
      setWeeklyDigest(parsed.weeklyDigest ?? false);
    }
  }, []);

  function handleSave() {
    setSaving(true);
    const prefs = { emailNotifs, factSheetChanges, subscriptionAlerts, weeklyDigest };
    localStorage.setItem("notification-preferences", JSON.stringify(prefs));
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 300);
  }

  return (
    <div className="rounded-xl border border-rosely-blush bg-white p-6">
      <h2 className="text-lg font-bold text-rosely-night">Notification Preferences</h2>
      <p className="mt-1 text-sm text-rosely-mist">Choose how you want to be notified</p>

      {success && (
        <div className="mt-4 rounded-lg border border-rosely-teal/30 bg-rosely-teal/10 px-4 py-3 text-sm text-rosely-teal">
          Preferences saved
        </div>
      )}

      <div className="mt-6 space-y-4">
        <ToggleRow
          label="Email Notifications"
          description="Receive notifications via email"
          checked={emailNotifs}
          onChange={setEmailNotifs}
        />
        <ToggleRow
          label="Fact Sheet Changes"
          description="Notify when fact sheets you subscribe to are modified"
          checked={factSheetChanges}
          onChange={setFactSheetChanges}
        />
        <ToggleRow
          label="Subscription Alerts"
          description="Notify when you are assigned as responsible or accountable"
          checked={subscriptionAlerts}
          onChange={setSubscriptionAlerts}
        />
        <ToggleRow
          label="Weekly Digest"
          description="Receive a weekly summary of all changes"
          checked={weeklyDigest}
          onChange={setWeeklyDigest}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 flex items-center gap-2 rounded-lg bg-rosely-plum px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rosely-mauve disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Save Preferences"}
      </button>
    </div>
  );
}

// ── Toggle Row Helper ───────────────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-rosely-blush p-4 hover:border-rosely-lilac transition-colors">
      <div>
        <p className="text-sm font-medium text-rosely-night">{label}</p>
        <p className="text-xs text-rosely-mist">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-rosely-blush text-rosely-plum focus:ring-rosely-lilac"
      />
    </label>
  );
}
