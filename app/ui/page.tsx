import { readFileSync } from "fs";
import { join } from "path";

import { ComponentCard } from "./_component-card";
import { NotificationStack } from "./_notification-stack";

const read = (file: string) => readFileSync(join(process.cwd(), "app/ui", file), "utf8");

export default function UiPage() {
  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="mb-5 text-sm font-medium text-slate-900">Components</h1>

        <div className="grid gap-5 sm:grid-cols-2">
          <ComponentCard name="Notification Stack" source={read("_notification-stack.tsx")}>
            <NotificationStack />
          </ComponentCard>
        </div>
      </div>
    </main>
  );
}
