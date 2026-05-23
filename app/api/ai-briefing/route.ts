/**
 * app/api/ai-briefing/route.ts
 * ----------------------------
 * AI COO — Server-side Claude Opus 4.7 briefing endpoint.
 * Nhận context từ client, gọi Claude, trả về 3 insights JSON.
 *
 * Yêu cầu: ANTHROPIC_API_KEY trong .env.local
 * Trả về 503 nếu không có API key (component fallback về mock).
 */

import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

// Tăng timeout cho Vercel (Pro plan = 60s, Hobby = 10s)
export const maxDuration = 60;

// ------------------------------------------------------------------ //
// System prompt — được cache giữa các request cùng context             //
// ------------------------------------------------------------------ //
const SYSTEM_PROMPT = `Bạn là AI COO của HACO Food — công ty F&B Việt Nam chuyên sản xuất và phân phối thực phẩm (thương hiệu Bếp Cô Hạ).

Triết lý vận hành: Task → Personal KPI → Dept KPI → Company KPI → Net Profit.

NHIỆM VỤ: Phân tích dữ liệu thực tế và đưa ra ĐÚNG 3 insights quan trọng nhất hôm nay, được cá nhân hóa theo vai trò người nhận.

QUY TẮC BẮT BUỘC:
1. Chỉ trả về JSON hợp lệ — không có text nào bên ngoài JSON
2. Mỗi insight PHẢI trích dẫn số liệu cụ thể từ dữ liệu (VD: "doanh thu đạt 5.2 tỷ / mục tiêu 6.4 tỷ = 81%")
3. Tiêu đề ngắn gọn, dưới 8 từ, viết Tiếng Việt
4. Mô tả: 2-3 câu rõ ràng, dùng số liệu thực
5. Hành động: 1-2 câu, cụ thể, có thể thực hiện ngay hôm nay
6. Phân loại type chính xác:
   - "critical": rủi ro quan trọng cần xử lý ngay
   - "opportunity": cơ hội tăng trưởng/cải thiện
   - "ops": vận hành cần chú ý
   - "people": nhân sự/tổ chức/văn hóa

FORMAT JSON OUTPUT (không có text ngoài JSON):
{
  "insights": [
    {
      "type": "critical|opportunity|ops|people",
      "title": "Tiêu đề ngắn",
      "desc": "Mô tả 2-3 câu với số liệu thực",
      "action": "Hành động cụ thể ngay hôm nay"
    },
    { ... },
    { ... }
  ]
}`;

// ------------------------------------------------------------------ //
// POST /api/ai-briefing                                               //
// ------------------------------------------------------------------ //
export async function POST(req: NextRequest) {
  // Guard: API key phải được cấu hình
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "no_api_key" }, { status: 503 });
  }

  let body: {
    role: string;
    userName: string;
    context: Record<string, unknown>;
  };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  const { role, userName, context } = body;

  const roleLabel: Record<string, string> = {
    ceo: "CEO / Tổng Giám đốc",
    cfo: "CFO / Giám đốc Tài chính",
    hr_admin: "HR Admin / Quản trị Nhân sự",
    dept_head: "Trưởng phòng",
    team_lead: "Trưởng nhóm",
    employee: "Nhân viên",
    auditor: "Kiểm toán nội bộ",
  };

  const userMessage = `Phân tích dữ liệu hệ thống HACO Food và đưa ra 3 insights cho ${userName} (${roleLabel[role] ?? role}).

Lưu ý ưu tiên cho vai trò ${roleLabel[role] ?? role}:
${role === "ceo" ? "- Tập trung vào P&L, KPI công ty, rủi ro chiến lược và cơ hội tăng trưởng" : ""}${role === "cfo" ? "- Tập trung vào cash flow, tỷ lệ chi phí, ngân sách phòng ban và rủi ro tài chính" : ""}${role === "hr_admin" ? "- Tập trung vào headcount, payroll, tuyển dụng, KPI nhân sự" : ""}${role === "dept_head" ? "- Tập trung vào KPI phòng ban, tiến độ task, ngân sách phòng và cơ hội cải thiện" : ""}${role === "employee" ? "- Tập trung vào task cá nhân, KPI cá nhân, đóng góp cho team" : ""}

DỮ LIỆU HỆ THỐNG (tháng ${(context as any)?.period ?? "hiện tại"}):
${JSON.stringify(context, null, 2)}

Trả về ĐÚNG 3 insights theo format JSON đã chỉ định.`;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let message: Awaited<ReturnType<typeof client.messages.create>>;
  try {
    message = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 2000,
      thinking: { type: "adaptive" } as any,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ] as any,
      messages: [{ role: "user", content: userMessage }],
    });
  } catch (err: any) {
    console.error("[ai-briefing] Claude API error:", err?.message ?? err);
    return Response.json(
      { error: "claude_error", detail: err?.message ?? "Unknown error" },
      { status: 502 }
    );
  }

  // Extract text block from response
  const textBlock = message.content.find((b: any) => b.type === "text") as
    | { type: "text"; text: string }
    | undefined;

  if (!textBlock) {
    return Response.json({ error: "no_text_block" }, { status: 500 });
  }

  // Parse JSON from Claude's output
  let insights: unknown[];
  try {
    const raw = textBlock.text.trim();
    const parsed = JSON.parse(raw) as { insights: unknown[] };
    insights = parsed.insights ?? [];
  } catch {
    // Fallback: try to extract JSON object from the text
    const match = textBlock.text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]) as { insights: unknown[] };
        insights = parsed.insights ?? [];
      } catch {
        return Response.json(
          { error: "parse_error", raw: textBlock.text.slice(0, 500) },
          { status: 500 }
        );
      }
    } else {
      return Response.json(
        { error: "parse_error", raw: textBlock.text.slice(0, 500) },
        { status: 500 }
      );
    }
  }

  return Response.json({ insights });
}
