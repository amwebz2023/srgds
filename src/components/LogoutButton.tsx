"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton({ onLoggedOut, nav = false }: { onLoggedOut?: () => void; nav?: boolean }) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  const logout = async () => {
    setProcessing(true);
    await fetch("/api/auth/logout", { method: "POST" });
    onLoggedOut?.();
    router.replace("/login");
    router.refresh();
  };

  return (
    <button className={nav ? "button button-primary dashboard-logout" : "button button-dark dashboard-logout"} type="button" onClick={logout} disabled={processing}>
      <LogOut size={17} />
      {processing ? "Signing out..." : "Log out"}
    </button>
  );
}