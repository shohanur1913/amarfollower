import { prisma } from "@/lib/prisma";
import { AlertTriangle } from "lucide-react";

export default async function MaintenancePage() {
  let title = "Under Maintenance";
  let message = "We're currently performing scheduled maintenance. Please check back shortly.";
  let contact = "";

  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: ["maintenance_title", "maintenance_message", "maintenance_contact"] } },
    });
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    if (map.maintenance_title) title = map.maintenance_title;
    if (map.maintenance_message) message = map.maintenance_message;
    if (map.maintenance_contact) contact = map.maintenance_contact;
  } catch {}

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl border bg-white p-8 shadow-sm text-center">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-amber-100 flex items-center justify-center mb-5">
          <AlertTriangle className="h-8 w-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold mb-3">{title}</h1>
        <p className="leading-relaxed mb-6">{message}</p>
        {contact && (
          <p className="text-sm text-muted-foreground mb-6">
            Contact: <span className="font-medium text-slate-900">{contact}</span>
          </p>
        )}
      </div>
    </div>
  );
}
