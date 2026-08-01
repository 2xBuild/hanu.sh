import type { Metadata } from "next";
import { readFileSync } from "fs";
import { join } from "path";

import { ComponentCard } from "./_component-card";
import { FollowNotifications } from "./_follow-notifications";
import { NotificationStack } from "./_notification-stack";

const read = (file: string) => readFileSync(join(process.cwd(), "app/ui", file), "utf8");

const description =
  "Interface components I build and reuse — animated, accessible, and ready to copy straight off the card.";

// `middleware.ts` rewrites ui.hanu.sh/ to this route, so the metadata points at
// the subdomain rather than the /ui path it renders from.
export const metadata: Metadata = {
  title: "ui.hanu.sh",
  description,
  openGraph: {
    title: "ui.hanu.sh",
    description,
    url: "https://ui.hanu.sh",
    siteName: "ui.hanu.sh",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ui.hanu.sh",
    description,
    creator: "@izzHanu",
  },
};

export default function UiPage() {
  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <div className="grid gap-5 sm:grid-cols-2">
          <ComponentCard name="Notification Stack" source={read("_notification-stack.tsx")}>
            <NotificationStack />
          </ComponentCard>

          <ComponentCard name="Follow Notifications" source={read("_follow-notifications.tsx")}>
            <FollowNotifications />
          </ComponentCard>
        </div>
      </div>
    </main>
  );
}
