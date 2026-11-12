import { UserIcon } from "@phosphor-icons/react";
import { Skeleton } from "#/components/ui/skeleton.tsx";
import { formatDate } from "#/lib/utils.ts";

import type { UserWithRole } from "better-auth/plugins";

function InfoItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs tracking-widest uppercase">{label}</dt>
      <dd className="text-foreground mt-1 text-sm break-all">{children}</dd>
    </div>
  );
}

interface ProfileCardProps {
  user: UserWithRole;
}

export function SessionProfileCard({ user }: ProfileCardProps) {
  return (
    <>
      <div className="flex items-center gap-3">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name}
            className="border-border size-12 shrink-0 rounded-full border object-cover"
          />
        ) : (
          <div className="border-border bg-muted flex size-12 shrink-0 items-center justify-center rounded-full border">
            <UserIcon className="text-muted-foreground size-5" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-primary truncate font-serif text-2xl tracking-tight">{user.name}</h1>
          <p className="text-muted-foreground truncate text-sm">{user.email}</p>
        </div>
      </div>

      <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <InfoItem label="Role">
          <span className="capitalize">{user.role ?? "user"}</span>
        </InfoItem>
        <InfoItem label="Status">
          {user.banned ? (
            <span className="text-destructive">
              Banned{user.banReason ? ` · ${user.banReason}` : ""}
            </span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400">Active</span>
          )}
        </InfoItem>
        <InfoItem label="Email verified">{user.emailVerified ? "Yes" : "No"}</InfoItem>
        <InfoItem label="Joined">{formatDate(user.createdAt)}</InfoItem>
        <InfoItem label="User ID">{user.id}</InfoItem>
      </dl>
    </>
  );
}

export function SessionProfileSkeleton() {
  return (
    <>
      <div className="flex items-center gap-3">
        <Skeleton className="size-12 shrink-0 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </>
  );
}
