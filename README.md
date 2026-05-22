# HACO Food OS — Hệ vận hành Bếp Cô Hạ

> Hệ thống vận hành toàn công ty cho doanh nghiệp F&B / thực phẩm chế biến.
> **Task → KPI cá nhân → KPI phòng → KPI công ty → Tài chính** — mỗi con số đều truy vết được về 1 nguồn dữ liệu duy nhất.

---

## ⚡ Triết lý

```
Task hằng ngày
  → Output cá nhân
    → KPI cá nhân
      → KPI phòng ban
        → KPI công ty
          → Doanh thu / COGS / OpEx / Net Profit
```

Đổi 1 KPI lá ở **/forecast** sẽ thấy tác động lên Net Profit ngay lập tức (engine `simulateImpact` thật, không phải mô phỏng đồ hoạ).

## 🏗 Kiến trúc dữ liệu (Single Source of Truth)

| File | Vai trò |
|---|---|
| `lib/queries/demo.ts` | Toàn bộ dữ liệu mẫu — phòng ban, nhân sự, KPI, task, dự án, finance, payroll, OKR, alert, approval, audit, SOP, tuyển dụng |
| `lib/queries/index.ts` | API selectors duy nhất các trang dùng. Khi cắm Supabase chỉ thay phần body, UI không phải đổi. |
| `lib/kpi/cascade.ts` | `buildKpiTree`, `completionOf`, `statusOf`, `rollupCompletion`, `simulateImpact` |
| `lib/kpi/catalog-haco.ts` | Catalog KPI chuẩn ngành F&B theo phòng ban (kèm công thức + benchmark) |
| `lib/compensation/ruleEngine.ts` | `computePayroll` — bậc bonus + hệ số phòng + insurance + PIT |
| `types/domain.ts` | TypeScript types cho 12+ entity domain |

## 🏢 7 phòng ban F&B

| Mã | Tên | Vai trò |
|---|---|---|
| EXEC | Ban Giám đốc | Lãnh đạo & chiến lược |
| SALES | Kinh doanh | B2B HORECA · B2C Online · Showroom · CS |
| MKT | Marketing | Brand · Performance · Content |
| PROD | Sản xuất (Bếp trung tâm) | Vận hành bếp · chế biến · đóng gói |
| RNDQA | R&D & QA | Phát triển SKU · HACCP · QC |
| SCM | Mua hàng & Logistics | Procurement · Kho · 3PL |
| BACK | Nhân sự & Tài chính | HR · C&B · Kế toán · ngân quỹ |

## 🎯 30+ KPI cây cha-con

```
Net Profit (root)
├── Revenue 5.2 tỷ
│   ├── B2B HORECA 2.65 tỷ
│   ├── B2C Online 1.62 tỷ
│   ├── Showroom 930 tr
│   └── MKT Leads (feeder) 2.480
│       ├── CPL 52k đ
│       ├── ROAS 4.8x
│       └── Qualified Leads 855
├── COGS 2.4 tỷ
│   ├── Food Cost % 36.5
│   ├── Wastage % 3.1
│   └── Supplier Saving % 5.2
└── OpEx 1.375 tỷ
    ├── Marketing Spend 348tr
    ├── Payroll 705tr
    └── Logistics 175tr
```

KPI catalog F&B đầy đủ tại `lib/kpi/catalog-haco.ts` — Food Cost, Wastage, OEE, HACCP, OTIF, DSO, eNPS, Repurchase Rate…

## 🖥 19 màn hình

| # | Route | Mô tả |
|---|---|---|
| 1 | `/dashboard` | Overview · 6 KPI cards · risk KPI · what-if NP · alerts · audit |
| 2 | `/org` | Sơ đồ tổ chức (reactflow) — click phòng ban → drill down |
| 3 | `/departments` | Phòng ban + KPI + tasks + budget + projects |
| 4 | `/people` | Hồ sơ nhân sự + KPI cá nhân + payroll + skills |
| 5 | `/kpi` | Bảng KPI có filter theo phòng |
| 6 | `/kpi-tree` | Cây KPI cascade + simulator |
| 7 | `/operations` | Task board + AI Work Auditor |
| 8 | `/projects` | Initiatives + ROI + budget tracking |
| 9 | `/compensation` | Payroll engine — bậc bonus + hệ số phòng |
| 10 | `/finance` | P&L · BS · Cashflow · Transactions |
| 11 | `/okr` | Objectives + Key Results Q2 |
| 12 | `/forecast` | What-if simulator — slider lên 7 KPI lá |
| 13 | `/alerts` | Trung tâm cảnh báo — 8 cảnh báo từ KPI deviation |
| 14 | `/approvals` | Bonus / Budget / Hire / Purchase / Expense |
| 15 | `/audit` | Audit log truy vết hành động |
| 16 | `/reports` | Snapshot báo cáo + lịch tự động |
| 17 | `/knowledge` | SOP · Playbook (8 SOP F&B) |
| 18 | `/recruiting` | Pipeline tuyển dụng (5 JD) |
| 19 | `/profile` · `/settings` | Cá nhân hoá + cấu hình hệ thống |

## 🚀 Chạy local

```bash
npm install
npm run dev
```

Mở http://localhost:3000 — đăng nhập tự bypass trong demo mode.

## 🧱 Stack

- **Next.js 16** (App Router · Server Components) + TypeScript
- **Tailwind CSS v4** + lucide-react
- **Recharts** + **reactflow**
- React 19 · Zod · date-fns

## 📐 Quy ước phát triển

1. **Không hardcode dữ liệu trong JSX** — luôn import qua `@/lib/queries`.
2. Khi thêm trang mới: viết selector ở `lib/queries/index.ts` trước, page chỉ render.
3. Khi thêm KPI: bổ sung vào `KPIS` trong `demo.ts` với `parentId`, `weight`, `direction`. Cây tree tự rollup.
4. Khi cắm Supabase: thay body các selector trong `lib/queries/index.ts`. UI không phải sửa.

## 📝 License

Proprietary — **HACO / Bếp Cô Hạ**.
