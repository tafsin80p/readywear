"use client";

import { usePathname } from "next/navigation";

export default function PwaManifest() {
  const pathname = usePathname();
  const manifestUrl = pathname?.startsWith('/admin') ? '/api/admin-manifest' : '/manifest.webmanifest';

  return (
    <link rel="manifest" href={manifestUrl} />
  );
}
