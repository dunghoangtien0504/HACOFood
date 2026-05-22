# MEMORY — HACO Food OS

> File này để Claude/Antigravity đọc khi mở session mới và hiểu ngay context.
> **Cập nhật gần nhất**: 2026-05-10 (sau session "Tinh chỉnh & nâng cấp toàn bộ")

---

## 1. DỰ ÁN LÀ GÌ

**HACO Food OS** — hệ vận hành công ty F&B của HACO Food / Bếp Cô Hạ.

Triết lý cốt lõi:
> **Task hằng ngày → KPI cá nhân → KPI phòng → KPI công ty → Tài chính (Net Profit)**
> Mỗi con số trên app đều truy vết được về 1 nguồn dữ liệu duy nhất.
> Đổi 1 KPI lá ở `/forecast` → tác động lên Net Profit hiện ra ngay (engine `simulateImpact` thật).

**Đường dẫn local**: `D:\Kinh doanh\AI\Quan-tri\haco-food-os`
**Stack**: Next.js 16 + React 19 + Tailwind v4 + TypeScript + Recharts + reactflow
**Mode hiện tại**: Demo (in-memory data trong `lib/queries/demo.ts`). Chưa có Supabase.

---

## 2. HIỆN TRẠNG (state hiện tại — đã VERIFY build pass)

### ✅ Đã làm xong trong session này

**A. Data foundation — Single Source of Truth**
- `lib/queries/demo.ts` (~770 dòng): toàn bộ data F&B của HACO
  - 7 phòng ban: BGĐ · Sales · Marketing · Sản xuất (bếp) · R&D-QA · Mua hàng & Logistics · HR-Tài chính
  - 24 nhân sự (đại diện 82 headcount), có manager chain, skills, base salary, target bonus
  - **30 KPI cây cha-con thật** (id `kpi_np` là root):
    ```
    Net Profit
    ├── Revenue (B2B HORECA · B2C Online · Showroom · MKT Leads feeder)
    ├── COGS (Food Cost % · Wastage % · Supplier Saving %)
    └── OpEx (MKT Spend · Payroll · Logistics)
    ```
    + KPI feeder F&B: OEE bếp, HACCP, OTIF, DSO, eNPS, Repurchase, AOV, Close Rate, ROAS, CPL...
  - 30 task gắn `linkedKpiId` thật, 6 dự án, 6 OKR Q2, 8 alert, 6 approval, 8 audit log, 5 job req, 8 SOP, 7 báo cáo
  - 6 tháng P&L history + Balance Sheet snapshot + 10 transactions

- `lib/queries/index.ts`: **API selector duy nhất** mọi page dùng.
  Helpers: `dashboardHeadlines`, `getDepartmentSummary`, `getEmployeeProfile`, `payrollSummary`, `runForecast`, `cashflowSeries`, `calcRunwayMonths`, `companyKpiSummary`, `listKpisByDepartment`, `operationsSummary`, `alertsSummary`, `approvalsSummary`...

**B. KPI Engine thật**
- `lib/kpi/cascade.ts`: `buildKpiTree`, `completionOf` (xử lý direction increase/decrease), `statusOf` (≥95 xanh, ≥85 vàng, dưới đỏ), `rollupCompletion` (weighted), `simulateImpact` (propagate Δ% từ KPI lá lên NP qua chain weight, phân biệt KPI tiền vs phi tiền).
- `lib/kpi/catalog-haco.ts`: catalog 28 KPI chuẩn ngành F&B với công thức + benchmark (Food Cost, Wastage, OEE, HACCP, OTIF, DSO, eNPS, Repurchase, AOV, Close Rate, ROAS, CPL, Time to Hire, Payroll/Revenue, Days of Inventory, ...).
- `lib/kpi/formulaEngine.ts`: giữ nguyên (sum/sub/mul/div/avg/ratio AST).
- `lib/compensation/ruleEngine.ts`: viết lại — 5 bậc bonus + hệ số phòng (`DEPT_MULTIPLIER`) + BHXH 10.5% NLĐ + PIT ước tính + companyCost (+17.5% BHXH công ty).

**C. 19 trang đều bind vào data layer** (không trang nào còn JSX hardcode)
| Trang | Đặc biệt |
|---|---|
| `/dashboard` | What-if NP đã chạy `simulateImpact` thật. Risk KPI lấy từ tất cả KPI sort theo completion. |
| `/kpi`, `/kpi-tree` | Cây cascade đầy đủ + filter theo phòng + simulator preview. |
| `/departments` | Selector phòng ban có chọn được. KPI/budget/projects realtime. |
| `/people` | Hồ sơ + payroll **đã chạy `computePayroll()` thật** từ KPI completion. Picker nhân sự tìm kiếm được. |
| `/org` | Reactflow đọc `listDepartmentsWithKpi`. Click → drill-down phòng. |
| `/operations` | Filter status, mỗi task hiển thị KPI nó phục vụ + AI Work Auditor banner sống theo data. |
| `/projects` | Budget tracking + linked KPI + filter status. |
| `/okr` | Company + 4 dept objectives Q2 (full key results). |
| `/compensation` | Bảng lương 24 nhân sự dùng payroll engine. Hiển thị bậc rule + override. |
| `/finance` | 4 tab: Tổng quan / P&L / BS / Cashflow — đều từ `FINANCE_SNAPSHOT` & `FINANCE_HISTORY`. |
| `/forecast` | **Slider what-if đa KPI** + 4 scenario chuẩn (DEFAULT_SCENARIOS) đều chạy `simulateImpact`. |
| `/alerts` | Filter severity, link tới KPI gốc. |
| `/approvals` | Filter status, requester/approver. |
| `/audit` | Filter action, truy vết. |
| `/reports` | 7 báo cáo, status ready/generating/scheduled. |
| `/knowledge` | 8 SOP F&B (HACCP, kho lạnh, HORECA pitch, đối soát công nợ...) + master-detail. |
| `/recruiting` | **Trang mới tạo** (nav cũ trỏ vào nhưng route chưa tồn tại). |
| `/profile` · `/settings` | Cá nhân hoá + thông tin công ty (COMPANY constant). |

**D. Re-brand BIZOS → HACO Food**
- README.md viết lại theo HACO. Xoá `Mau-README.md` cũ.
- Sidebar / Topbar / HelpModal / formulaEngine / guide đã sửa.
- Email demo: `ha.nguyen@hacofood.vn` (CEO Nguyễn Thị Hạ).
- Trang `/login` chưa sửa — vẫn là form mock (chưa đụng vì không phải auth thật).

**E. Verify**
- `npx tsc --noEmit`: **0 lỗi**
- `npm run build`: **PASS, 25 routes prerender thành công**
- Recharts có warning `width(-1)/height(-1)` khi SSR prerender (do JSDOM không có viewport) — runtime browser OK, có thể bỏ qua.

### ❌ Chưa có (vẫn cần làm cho production)

- **Database thật**: 0 Supabase, mọi data sống trong `lib/queries/demo.ts`.
- **Auth + RBAC**: trang `/login` là form mock, chưa có Server Action thật, chưa có 7 role policy.
- **Server Actions / Mutations**: mọi button "Duyệt", "Tạo", "Chỉnh sửa" đều dead — chưa wire.
- **AI Claude API**: `AIDashboardBriefing.tsx` vẫn là animation giả (setTimeout + 3 insight cứng). Chưa nối Anthropic SDK.
- **proxy.ts** (Next 16 dùng `proxy` thay `middleware`) — chưa có.
- **F&B-specific schema** (recipes, BOM, inventory_movements, daily_sales, pos_transactions) — chưa có.

---

## 3. KIẾN TRÚC FILE QUAN TRỌNG

```
lib/queries/demo.ts          ← SINGLE SOURCE OF TRUTH (sửa số ở đây = thay đổi cả app)
lib/queries/index.ts         ← API selectors (mọi page chỉ import từ đây)
lib/kpi/cascade.ts           ← buildKpiTree, completionOf, statusOf, simulateImpact
lib/kpi/catalog-haco.ts      ← Catalog KPI ngành F&B (reference)
lib/kpi/formulaEngine.ts     ← AST evaluator (sum/sub/mul/avg/ratio)
lib/compensation/ruleEngine.ts ← computePayroll + DEFAULT_RULES + DEPT_MULTIPLIER
lib/nav.ts                   ← 19 menu items + 3 group
lib/utils.ts                 ← cn, formatVND, formatCompactVND, formatPercent...
types/domain.ts              ← TypeScript types domain (Company, Department, Employee, Kpi...)

app/(app)/                   ← 19 page có shell + data binding thật
app/(app)/layout.tsx         ← Sidebar + Topbar wrapper
app/login/                   ← Form mock — CHƯA WIRE
components/layout/           ← Sidebar, Topbar, PageHeader, HelpModal, ComingSoon
components/ai/AIDashboardBriefing.tsx ← MOCK animation, chưa nối Claude
components/charts/AreaTrend.tsx ← chỉ 1 file chart wrapper
components/dashboard/StatCard.tsx ← reusable stat card
components/search/GlobalSearch.tsx
hooks/use-local-storage.ts   ← persistence client-side (sidebar collapse, tab active)
```

---

## 4. QUY ƯỚC TUYỆT ĐỐI (đừng vi phạm)

1. **KHÔNG hardcode dữ liệu trong JSX**. Luôn import qua `@/lib/queries`.
2. **Khi thêm trang mới**: viết selector ở `lib/queries/index.ts` trước, page chỉ render.
3. **Khi thêm KPI**: bổ sung vào `KPIS` trong `demo.ts` với `parentId`, `weight`, `direction`. Cây tree tự rollup, không cần sửa logic.
4. **Khi cắm Supabase**: thay body các selector trong `lib/queries/index.ts`. UI không phải sửa một dòng.
5. **Đọc `node_modules/next/dist/docs/` TRƯỚC** khi viết Next 16 code — đừng dùng pattern Next 14/15 từ training data (xem `AGENTS.md`).
6. **KHÔNG amend commit, KHÔNG force push**. Tạo commit mới.
7. **KHÔNG tạo .md mới** trừ khi user yêu cầu rõ (đặc biệt không tạo README phụ).
8. **KHÔNG dùng emoji** trong code/comment trừ khi yêu cầu.
9. **Phép cascade**: KPI tiền (VND) propagate trực tiếp qua weight. KPI phi tiền propagate qua KPI tiền cha gần nhất theo completion delta × weight chain. Direction `increase`: revenue+ → NP+, direction `decrease`: cost+ → NP−.

---

## 5. VIỆC CẦN LÀM TIẾP (theo thứ tự ưu tiên)

### Ngay sau session này — nếu user muốn nâng cấp tiếp

| Phase | Việc | Mức độ |
|---|---|---|
| **P3** | Cắm Supabase: tạo schema từ types/domain.ts + 9 bảng F&B (recipes, BOM, inventory, daily_sales, pos_transactions...). Migrate `demo.ts` thành seed.sql. Thay body selector. | Lớn |
| **P3** | Auth + RBAC 7 role: ceo · cfo · hr_admin · dept_head · team_lead · employee · auditor. Sidebar filter theo role. | Lớn |
| **P4** | Server Actions cho mọi mutation (createTask, recordTaskOutput, runPayroll, approve...). Wire button hiện đang dead. | Lớn |
| **P4** | AI Claude (Sonnet 4.6 cho briefing, Opus 4.7 cho deep): 6 endpoint AI (briefing, work-auditor, kpi-architect, weekly-review, recipe-optimizer, chat). Trang `/ai-coo` mới. Bắt buộc prompt caching. | Trung |
| **P5** | F&B modules: Recipes & BOM (food cost từ ingredients), Inventory (waste, expiry FEFO), Daily Sales by Channel, POS sync (KiotViet/Sapo). | Lớn |
| **P5** | Polish: mobile responsive, i18n VI/EN, dark mode, toast/confirm, empty/loading states, Vitest + Playwright. | Trung |
| **P5** | Deploy: Vercel + Supabase managed. Healthcheck `/api/health`. | Nhỏ |

### Việc nhỏ có thể làm ngay
- [ ] Đảm bảo trang `/login` redirect thẳng vào `/dashboard` trong demo mode (giờ vẫn là form mock).
- [ ] Trang `/notifications` chưa kiểm tra — có thể vẫn là `<ComingSoon />`.
- [ ] `components/ai/AIDashboardBriefing.tsx` vẫn animation giả — có thể nối tới Claude API qua Anthropic SDK với prompt caching.
- [ ] `proxy.ts` chưa có (Next 16 dùng `proxy` thay `middleware`) — cần khi có auth.

---

## 6. F&B SPECIFIC (HACO khác BIZOS chuẩn)

KPI catalog F&B đã có trong `lib/kpi/catalog-haco.ts`. Khi mở rộng, các module **chưa có** cần thêm:
1. **Recipes & BOM** — `recipes`, `recipe_ingredients`, `dishes` (kiểm soát food cost theo SKU)
2. **Inventory** — `ingredients`, `inventory_movements`, `inventory_locations` (waste, expiry FEFO, stock)
3. **Daily Sales by Channel** — `daily_sales(channel: b2b/b2c_offline/b2c_online/partner, dish_id, qty)`
4. **POS Integration** — `pos_transactions` + cron sync KiotViet/Sapo/POS365

Chuỗi giá trị F&B: Mua hàng → R&D → Sản xuất → QA → Kho → Logistics → Sales (B2B HORECA / B2C Online / Showroom) → CS.

---

## 7. CÁCH DÙNG MEMORY NÀY (cho session mới)

1. **Đầu session mới**: nói "Đọc MEMORY.md trong project root để hiểu context".
2. **Trước khi sửa data**: nhớ rằng `lib/queries/demo.ts` là SSOT — sửa số ở đây = thay đổi cả app.
3. **Trước khi thêm trang/widget**: viết selector trong `lib/queries/index.ts` trước.
4. **Trước khi đụng cascade**: hiểu `simulateImpact` xử lý KPI tiền vs phi tiền khác nhau (xem `lib/kpi/cascade.ts` lines 100-160).
5. **Sau khi xong 1 mốc lớn**: update file này, ghi rõ "đã xong", giữ ngắn gọn.
6. **Khi sẵn sàng cắm Supabase**: chỉ thay body các selector trong `lib/queries/index.ts`. UI không phải sửa.

---

## 8. SESSION LOG TÓM TẮT

### Session 2026-05-10 (session này — "Tinh chỉnh & nâng cấp toàn bộ")
**Vấn đề ban đầu**: User báo "vỏ bên ngoài đẹp nhưng rỗng bên trong, các trường chưa liên kết, KPI chưa rõ cho phòng ban". Khảo sát phát hiện:
- 17/19 trang JSX hardcode rời rạc, chỉ 2 trang (`/dashboard`, `/kpi`) đọc data từ `demo.ts`.
- Số liệu mâu thuẫn giữa các trang (Net Profit dashboard ≠ finance ≠ kpi-tree).
- Type domain đầy đủ nhưng 0 file UI nào dùng.
- `simulateImpact` là stub 3 dòng. `cascade.ts` được nhắc trong README nhưng không tồn tại.
- Vẫn branding BIZOS, email `*.bizos.local`.

**Đã làm**: viết lại `demo.ts` (770 dòng F&B data), tạo `cascade.ts` + `catalog-haco.ts`, viết lại `ruleEngine.ts`, tạo `lib/queries/index.ts`, refactor 18 trang + tạo mới `/recruiting`, re-brand toàn bộ. Build pass.

### Session trước (đã có trước session này)
File này (`MEMORY.md`) có sẵn từ session khảo sát BIZOS reference + viết `ANTIGRAVITY_PROMPTS.md`. Phần đó vẫn còn giá trị tham khảo cho phase Supabase migration sau này (xem `ANTIGRAVITY_PROMPTS.md` ở root).

---

## 9. RESOURCES

- `AGENTS.md` (root) — Next 16 lưu ý quan trọng (đọc trước khi viết code Next).
- `ANTIGRAVITY_PROMPTS.md` (root) — playbook 10 bước bê qua Antigravity (chủ yếu cho phase Supabase + AI).
- `README.md` — đã viết lại theo HACO Food (mô tả kiến trúc + 19 màn).
- BIZOS reference cũ: `https://github.com/ungden/bizos-company-os` — có 66 bảng schema + RLS + cascade + ruleEngine để copy khi sang Supabase.
- Anthropic SDK: `https://docs.anthropic.com` — cho phase AI.
- Skill nội bộ Claude Code: `claude-api` (cho phase AI).

---

**Trạng thái app sau session này**: Demo runnable. UI đẹp, data nhất quán toàn cục, KPI cascade thật, payroll engine thật, what-if simulator thật. Cần Supabase + Auth + AI để thành production.
