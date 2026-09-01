import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type ReminderCompany = {
  id: string;
  company: string;
  status: string;
  follow_up_date: string;
  assignee_email: string;
};

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Triggered by Vercel Cron (see vercel.json). Finds every company whose follow-up date
// is today or earlier — excluding Closed/Not Interested, since those are done — and
// emails each assignee a summary. Protected by CRON_SECRET so it can't be hit publicly.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY is not configured" }, { status: 500 });
  }

  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: companies, error } = await supabase
    .from("companies")
    .select("id, company, status, follow_up_date, assignee_email")
    .not("assignee_email", "is", null)
    .lte("follow_up_date", today)
    .not("status", "in", '("Closed","Not Interested")');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const byAssignee = new Map<string, ReminderCompany[]>();
  for (const c of (companies || []) as ReminderCompany[]) {
    if (!byAssignee.has(c.assignee_email)) byAssignee.set(c.assignee_email, []);
    byAssignee.get(c.assignee_email)!.push(c);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bluebird-board.vercel.app";
  let assigneesNotified = 0;
  const failures: string[] = [];

  for (const [email, items] of byAssignee) {
    const overdueCount = items.filter((c) => c.follow_up_date < today).length;
    const rows = items
      .map((c) => {
        const overdue = c.follow_up_date < today;
        return `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #E4DDC9;">
            <a href="${siteUrl}/board/${c.id}" style="color:#2F5233;text-decoration:none;font-weight:600;">${escapeHtml(c.company)}</a>
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #E4DDC9;color:${overdue ? "#8A2E2E" : "#4A4A3F"};">
            ${overdue ? "Overdue" : "Due today"} (${c.follow_up_date})
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #E4DDC9;">${escapeHtml(c.status)}</td>
        </tr>`;
      })
      .join("");

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;">
        <h2 style="color:#1F2E2B;margin-bottom:4px;">Bluebird Prospect Board</h2>
        <p style="color:#4A4A3F;">You have ${items.length} follow-up${items.length === 1 ? "" : "s"} due${overdueCount > 0 ? ` (${overdueCount} overdue)` : ""}:</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr>
              <th style="text-align:left;padding:8px 12px;border-bottom:2px solid #1F2E2B;">Company</th>
              <th style="text-align:left;padding:8px 12px;border-bottom:2px solid #1F2E2B;">Follow-up</th>
              <th style="text-align:left;padding:8px 12px;border-bottom:2px solid #1F2E2B;">Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="margin-top:20px;"><a href="${siteUrl}/board" style="color:#C9743B;">Open the board →</a></p>
      </div>
    `;

    try {
      await resend.emails.send({
        from: "Bluebird Prospect Board <onboarding@resend.dev>",
        to: email,
        subject: `${items.length} follow-up${items.length === 1 ? "" : "s"} due${overdueCount > 0 ? " (some overdue)" : ""}`,
        html,
      });
      assigneesNotified++;
    } catch (e) {
      failures.push(email);
      console.error(`Failed to send reminder email to ${email}`, e);
    }
  }

  return NextResponse.json({
    ok: true,
    totalCompanies: companies?.length || 0,
    assigneesNotified,
    failures,
  });
}
