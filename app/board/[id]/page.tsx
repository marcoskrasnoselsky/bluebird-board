"use client";

import { useParams, useRouter } from "next/navigation";
import CompanyDetail from "@/components/CompanyDetail";

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  return (
    <div style={{ minHeight: "100vh", background: "#F6F3EC" }}>
      <CompanyDetail companyId={companyId} onClose={() => router.push("/board")} />
    </div>
  );
}
