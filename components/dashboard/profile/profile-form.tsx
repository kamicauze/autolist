"use client";

import * as React from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";

interface ProfileFormProps {
  user: { email?: string | null; user_metadata?: Record<string, unknown> };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const displayName = (user.user_metadata?.full_name as string) || "";
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;

  const [form, setForm] = React.useState({
    fullName: displayName,
    email: user.email || "",
    phone: "",
    whatsapp: "",
    bio: "",
    city: "",
    address: "",
    website: "",
    facebook: "",
    twitter: "",
    instagram: "",
  });

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
        <p className="text-sm text-muted-foreground">Update your personal information and preferences</p>
      </div>

      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        {/* Avatar */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative">
            <Avatar src={avatarUrl} alt={form.fullName} size="lg" fallback={form.fullName.slice(0, 2) || "U"} />
            <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-sm hover:bg-primary/90">
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{form.fullName || "Your Name"}</p>
            <p className="text-xs text-muted-foreground">{form.email}</p>
          </div>
        </div>

        {/* Personal Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Personal Information</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} disabled className="bg-muted" />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="+254 7XX XXX XXX" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" placeholder="+254 7XX XXX XXX" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" placeholder="Tell buyers a bit about yourself..." value={form.bio} onChange={(e) => update("bio", e.target.value)} />
          </div>
        </div>

        {/* Location */}
        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Location</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="Nairobi" value={form.city} onChange={(e) => update("city", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="Your business address" value={form.address} onChange={(e) => update("address", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Social Links</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" placeholder="https://yoursite.com" value={form.website} onChange={(e) => update("website", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <Input id="facebook" placeholder="https://facebook.com/..." value={form.facebook} onChange={(e) => update("facebook", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter</Label>
              <Input id="twitter" placeholder="https://twitter.com/..." value={form.twitter} onChange={(e) => update("twitter", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input id="instagram" placeholder="https://instagram.com/..." value={form.instagram} onChange={(e) => update("instagram", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Change Password</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" placeholder="Enter current password" />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" placeholder="Enter new password" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
