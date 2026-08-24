"use client";

import { useParams, useRouter } from "next/navigation";
import CompanyDetail from "@/components/CompanyDetail";

export default function CompanyModal() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  const close = () => router.back();

  return (
    <div
      onClick={close}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(35,35,35,0.5)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "40px 20px",
        overflowY: "auto",
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#F6F3EC",
          borderRadius: 16,
          maxWidth: 900,
          width: "100%",
          overflow: "hidden",
          boxShadow: "0 24px 70px rgba(20,20,20,0.35)",
        }}
      >
        <CompanyDetail companyId={companyId} onClose={close} />
      </div>
    </div>
  );
}
