# ANTIGRAVITY PROMPTS — HACO FOOD OS UPGRADE

> Playbook đầy đủ để nâng cấp dự án `haco-food-os` từ "vỏ UI" thành "hệ vận hành thật" cho HACO Food.
> Reference codebase: `https://github.com/ungden/bizos-company-os`
> Demo: `https://bizos-company-os.vercel.app`

---

## CÁCH DÙNG FILE NÀY

1. **TRƯỚC TIÊN** — điền **PHẦN A: HACO BANK** bên dưới (tổ chức, KPI, role thật của HACO Food). Phần này chỉ mất 30 phút và quyết định chất lượng seed data.
2. Mỗi lần làm 1 bước:
   - Mở Antigravity, tạo session mới
   - Copy nguyên **PREAMBLE** (PHẦN B) + 1 prompt bước (PHẦN C, từ Bước 1 đến Bước 10) vào ô input
   - Antigravity chạy → khi báo "DONE", check tiêu chí "DONE KHI" — nếu pass thì sang bước kế
3. Không skip bước. Phase 0 → 4 có dependency rõ.
4. Nếu Antigravity báo lỗi giữa chừng — copy log lỗi + paste lại với câu "Sửa lỗi này, đừng đi tiếp".

---

# PHẦN A — HACO BANK (ĐIỀN TRƯỚC KHI CHẠY PHASE 0)

> Antigravity sẽ đọc phần này khi seed data ở Bước 2. Càng chính xác càng tốt.

## A.1. Cơ cấu tổ chức HACO Food

```
Company: HACO Food
Currency: VND
Timezone: Asia/Ho_Chi_Minh
Tên đầy đủ pháp lý: [ĐIỀN: vd "Công ty TNHH HACO Food"]
MST: [ĐIỀN]
Địa chỉ: [ĐIỀN]
```

**Phòng ban** (sửa cho khớp thực tế — đây là gợi ý cho F&B):

| Code | Tên | Trưởng phòng | Ngân sách tháng (VND) | Ghi chú |
|---|---|---|---|---|
| BEP | Bếp / Sản xuất | [tên người] | [vd 200,000,000] | Tổ chế biến |
| RND | R&D / Phát triển món | [tên] | [vd 30,000,000] | Nghiên cứu công thức |
| SAL_B2B | Sales B2B | [tên] | [vd 80,000,000] | Bán sỉ, NCC, công ty |
| SAL_B2C | Sales B2C | [tên] | [vd 80,000,000] | Bán lẻ, online |
| MKT | Marketing | [tên] | [vd 100,000,000] | Ads + content |
| OPS | Vận hành / Logistic | [tên] | [vd 60,000,000] | Giao hàng, kho |
| HR | Nhân sự | [tên] | [vd 30,000,000] | |
| FIN | Tài chính | [tên] | [vd 25,000,000] | Kế toán |

## A.2. Nhân sự (cần ít nhất 14 người để demo có ý nghĩa)

| Code | Họ tên | Email | Phòng ban | Vị trí | Lương cơ bản | Role hệ thống |
|---|---|---|---|---|---|---|
| HR001 | [tên CEO] | ceo@hacofood.vn | FIN | CEO | | ceo |
| HR002 | [tên CFO] | cfo@hacofood.vn | FIN | CFO | | cfo |
| HR003 | [tên HR] | hr@hacofood.vn | HR | HR Manager | | hr_admin |
| HR004 | [tên Bếp trưởng] | bep@hacofood.vn | BEP | Trưởng bếp | | dept_head |
| HR005 | [tên Sales B2B Lead] | sales.b2b@hacofood.vn | SAL_B2B | Trưởng SalesB2B | | dept_head |
| HR006 | [tên Sales B2C Lead] | sales.b2c@hacofood.vn | SAL_B2C | Trưởng SalesB2C | | dept_head |
| HR007 | [tên MKT Lead] | mkt@hacofood.vn | MKT | Trưởng Marketing | | dept_head |
| HR008 | [tên Ops Lead] | ops@hacofood.vn | OPS | Trưởng Vận hành | | dept_head |
| HR009-014 | [6 staff khác] | ... | ... | Staff/Team Lead | | employee/team_lead |

## A.3. KPI cây cascade HACO Food (14 KPI tối thiểu)

> Đây là tim của hệ thống. Mỗi KPI có owner, target tháng, formula nếu là composite.

**Cấp công ty (CEO own):**
1. **NP** — Net Profit — Target tháng: [vd 1,200,000,000 VND] — Formula: `Revenue - COGS - OpEx - Tax`
2. **GP** — Gross Profit — Target: [vd 2,800,000,000] — Formula: `Revenue - COGS`
3. **REV** — Revenue tổng — Target: [vd 5,000,000,000] — Formula: `sum(REV_B2B, REV_B2C)`
4. **FOOD_COST_PCT** — Food Cost % — Target: ≤ [vd 32%] — Formula: `(COGS_food / Revenue) × 100` — **F&B-specific**

**Cấp phòng ban:**
5. **REV_B2B** — Doanh thu B2B — Owner: SAL_B2B — Target: [vd 2,500,000,000]
6. **REV_B2C** — Doanh thu B2C — Owner: SAL_B2C — Target: [vd 2,500,000,000]
7. **MKT_LEADS** — Marketing Leads — Owner: MKT — Target: 1,000 leads/tháng
8. **MKT_CAC** — Cost per Acquisition — Owner: MKT — Target: ≤ [vd 200,000 VND/lead]
9. **OPS_OTD** — On-Time Delivery — Owner: OPS — Target: ≥ 95%
10. **WASTE_PCT** — Waste % — Owner: BEP — Target: ≤ 3% — **F&B-specific**
11. **AOV** — Average Order Value — Owner: SAL_B2C — Target: [vd 350,000]

**Cấp cá nhân (mẫu):**
12. **HR007.LEADS** — Leads do MKT Lead — Target: 1,000
13. **HR005.B2B_DEALS** — Số deal B2B đóng — Target: 30 deal
14. **HR004.RECIPE_COMPLIANCE** — % món đúng định lượng — Target: ≥ 98%

## A.4. Chart of Accounts (kế toán Việt Nam VAS)

> Antigravity sẽ seed các tài khoản chuẩn VAS — bạn xem lại có cần thêm tài khoản con nào không.

```
111  Tiền mặt
112  Tiền gửi ngân hàng
131  Phải thu khách hàng
152  Nguyên vật liệu  ← QUAN TRỌNG cho F&B
155  Thành phẩm
331  Phải trả nhà cung cấp
334  Phải trả người lao động
338  BHXH/BHYT/BHTN phải nộp
411  Vốn chủ sở hữu
421  Lợi nhuận chưa phân phối
511  Doanh thu bán hàng
521  Chiết khấu thương mại
632  Giá vốn hàng bán
641  Chi phí bán hàng
642  Chi phí quản lý
711  Thu nhập khác
811  Chi phí khác
821  Chi phí thuế TNDN
911  Xác định kết quả kinh doanh
```

## A.5. Tích hợp ngoài (nếu có)

```
POS hiện dùng: [KiotViet / Sapo / POS365 / Khác / Không]
Kế toán hiện dùng: [MISA / Fast / Excel / Khác]
Kênh bán online: [Shopee / Grab / GoFood / Be / Lazada / Web riêng]
CRM nếu có: [tên]
```

---

# PHẦN B — PREAMBLE (COPY VÀO MỖI PROMPT)

```
Bạn đang nâng cấp dự án Next.js tại D:\Kinh doanh\AI\Quan-tri\haco-food-os
(repo local, KHÔNG phải git, đã có vỏ UI 20 trang).

PROJECT: HACO Food OS — hệ vận hành công ty F&B với chuỗi
Task → KPI cá nhân → KPI phòng → KPI công ty → Tài chính.

REFERENCE CODEBASE (study trước khi viết code):
github.com/ungden/bizos-company-os — copy pattern, ĐỪNG reinvent.
Raw URL: https://raw.githubusercontent.com/ungden/bizos-company-os/main/[path]
Demo live: https://bizos-company-os.vercel.app

STACK:
- Next.js 16 (App Router, Server Components, Server Actions, file proxy.ts thay middleware.ts)
- React 19 (useActionState, useOptimistic, useFormStatus, useTransition)
- Tailwind v4 (dùng @theme syntax, không tailwind.config.js)
- TypeScript strict
- Supabase (Postgres + Auth + Storage + RLS) qua @supabase/ssr
- Zod v4 cho validation
- Recharts cho chart, Reactflow cho org/KPI graph
- @anthropic-ai/sdk cho AI layer (claude-sonnet-4-6 chính, claude-opus-4-7 cho phân tích sâu)

NGUYÊN TẮC BẮT BUỘC:
1. ĐỌC node_modules/next/dist/docs/ TRƯỚC mỗi khi viết Next.js code — Next 16 có breaking changes so với 14/15.
2. Server Component MẶC ĐỊNH; "use client" chỉ khi cần state/event.
3. Mọi mutation đi qua Server Action; Zod parse input đầu tiên; requireRole() check trước khi chạm DB; bọc withAudit() để log.
4. KHÔNG skip RLS. Service role key chỉ trong Server Action có requireRole('ceo' hoặc role tương đương).
5. Copy pattern từ BIZOS reference; chỉ viết mới khi BIZOS không có.
6. Mọi page LIST data: dùng React cache() trong lib/queries để dedupe.
7. Mọi form: useActionState + useFormStatus, không useState thủ công.
8. Không tạo tài liệu .md mới trừ khi prompt yêu cầu rõ.
9. KHÔNG dùng emoji trong code/comment trừ khi prompt yêu cầu.
10. Báo "DONE khi: ..." cuối phản hồi, list từng tiêu chí pass/fail.

CONTEXT BUSINESS HACO FOOD:
[PASTE PHẦN A.1 → A.5 vào đây khi gặp prompt cần seed/business logic]
```

---

# PHẦN C — 10 PROMPT BƯỚC (CHẠY TUẦN TỰ)

---

## BƯỚC 1 — HẠ TẦNG DỰ ÁN

```
[PASTE PREAMBLE]

TASK: Bước 1/10 — Hạ tầng nền tảng dự án.

DELIVERABLES (tạo các file sau):

1. proxy.ts (root) — copy nguyên pattern BIZOS:
   https://raw.githubusercontent.com/ungden/bizos-company-os/main/proxy.ts
   Wrap updateSession từ lib/supabase/proxy.ts.

2. lib/supabase/client.ts, lib/supabase/server.ts, lib/supabase/proxy.ts
   Copy 3 file BIZOS pattern @supabase/ssr.

3. app/api/health/route.ts
   GET → return Response.json({status:"ok", version: "0.1.0", timestamp: new Date().toISOString()})

4. .env.example
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   DEMO_MODE=true
   ANTHROPIC_API_KEY=

5. lib/env.ts
   Zod schema parse process.env, export typed env. Nếu DEMO_MODE=true thì supabase keys optional.

6. lib/auth/guards.ts
   - requireUser() — throw nếu chưa login
   - requireRole(role | role[]) — throw nếu role không khớp
   - currentCompanyId() — return company_id từ user_roles
   - getCurrentUser() — return {user, role, company_id} hoặc null

7. Cập nhật package.json:
   pnpm add @supabase/ssr @supabase/supabase-js @anthropic-ai/sdk

8. vercel.json + Dockerfile + railway.json — copy từ BIZOS.

9. next.config.ts: bật experimental.serverActions, set basic CSP headers.

DONE KHI:
- pnpm install thành công, không lỗi peer-dep
- pnpm dev chạy không error
- Truy cập /api/health → 200 với JSON đúng format
- pnpm build pass với DEMO_MODE=true
- File proxy.ts tồn tại, không phải middleware.ts
- TypeScript strict pass: pnpm tsc --noEmit không lỗi

KHÔNG được làm ở bước này:
- Không tạo bảng SQL (Bước 2)
- Không sửa page hiện tại
- Không bỏ file local hiện có trừ khi hỏi user
```

---

## BƯỚC 2 — SCHEMA 66 BẢNG + RLS + SEED HACO

```
[PASTE PREAMBLE]
[PASTE PHẦN A — HACO BANK đầy đủ]

TASK: Bước 2/10 — Database schema, RLS policies, và seed data HACO Food.

DELIVERABLES:

1. db/schema.sql — copy NGUYÊN 66 bảng từ BIZOS:
   https://raw.githubusercontent.com/ungden/bizos-company-os/main/db/schema.sql
   KHÔNG bỏ bớt bảng nào. Bao gồm 11 enum, triggers updated_at.

2. db/schema_haco_extension.sql — bảng F&B-specific (KHÔNG có trong BIZOS):
   - ingredients(id, company_id, code, name, unit, current_stock, safety_stock, cost_per_unit, supplier_id, expiry_tracking)
   - suppliers(id, company_id, name, contact, payment_term_days)
   - dishes(id, company_id, code, name, sku, sale_price, category, recipe_id, active)
   - recipes(id, company_id, dish_id, version, target_food_cost_pct, instructions)
   - recipe_ingredients(recipe_id, ingredient_id, qty, unit)
   - inventory_locations(id, company_id, name, kind enum 'warehouse'|'kitchen'|'store')
   - inventory_movements(id, company_id, ingredient_id, location_id, qty, kind enum 'in'|'out'|'waste'|'transfer', ref_type, ref_id, recorded_at, recorded_by)
   - daily_sales(id, company_id, sale_date, channel enum 'b2b'|'b2c_offline'|'b2c_online'|'partner', dish_id, qty, revenue, cost, source)
   - pos_transactions(id, company_id, external_id, source enum 'kiotviet'|'sapo'|'pos365'|'manual', payload jsonb, synced_at)
   Tất cả bảng có RLS enabled, policy tenant_select theo company_id.

3. db/policies.sql — copy nguyên BIZOS:
   https://raw.githubusercontent.com/ungden/bizos-company-os/main/db/policies.sql
   7 role: ceo, cfo, hr_admin, dept_head, team_lead, employee, auditor
   Helper function current_company_id() và has_role(role[]).
   Thêm policies cho 9 bảng HACO extension theo cùng pattern (vd: ingredients_write cho ceo/dept_head_BEP/dept_head_OPS).

4. db/seed.sql — adapt cho HACO Food (KHÔNG copy BIZOS demo nguyên):
   - 1 company HACO Food (data từ A.1)
   - Phòng ban từ A.1 (dùng code thật)
   - 14 employees từ A.2
   - 14 KPI cascade từ A.3 (đầy đủ formula JSONB)
   - Chart of accounts VAS từ A.4 (~25 tài khoản)
   - 30 task mẫu (10 cho Bếp, 10 cho Sales, 5 cho MKT, 5 cho Ops) — gắn linked_kpi_id đầy đủ
   - 6 tháng accounting_entries (T11/2025 → T4/2026) cân đối debit=credit
   - 6 tháng kpi_actuals đầy đủ
   - 5 alert mẫu (mix severity)
   - 4 approval pending
   - 4 OKR Q2/2026
   - Seed 50 ingredient phổ biến F&B Việt (gạo, thịt heo, rau muống, ...)
   - Seed 20 dish + 20 recipe demo
   - Seed 30 inventory_movement
   - Seed 90 ngày daily_sales

5. db/views.sql — materialized view + view bình thường:
   - pnl_monthly(company_id, period, revenue, cogs, gross_profit, opex, ebitda, net_profit)
   - balance_sheet_snapshot(company_id, period, assets_total, liabilities_total, equity_total, breakdown jsonb)
   - cashflow_monthly(company_id, period, operating, investing, financing, net_change)
   - kpi_status_summary(company_id, period, total, green, yellow, red, na)
   - food_cost_by_dish(company_id, dish_id, period, food_cost_pct)
   - waste_by_category(company_id, period, category, waste_value, waste_pct)

6. README_DB.md ngắn gọn — chỉ ghi cách chạy 5 file SQL theo thứ tự trên Supabase SQL Editor.

DONE KHI:
- 5 file SQL chạy không lỗi trên Supabase project mới
- select count(*) from kpis where company_id = HACO_ID → ≥14
- select count(*) from employees → ≥14
- select count(*) from accounting_entries → ≥30
- select count(*) from ingredients → ≥50
- RLS enabled cho TẤT CẢ bảng (check pg_tables.relrowsecurity)
- Login bằng anon key chưa set role → query employees trả 0 rows (RLS chặn đúng)

LƯU Ý:
- Mọi bảng có company_id PHẢI có policy tenant_select.
- KPI seed phải có formula JSONB hợp lệ — cụ thể KPI cha (NP, GP, REV, FOOD_COST_PCT) phải có formula tham chiếu KPI con qua "ref": "kpi_code".
```

---

## BƯỚC 3 — UNIFIED QUERY LAYER + CHUYỂN PAGE VỀ SERVER COMPONENT

```
[PASTE PREAMBLE]

TASK: Bước 3/10 — Tầng truy vấn thống nhất, mọi page đọc qua đây.

DELIVERABLES:

1. lib/queries/index.ts — copy pattern BIZOS:
   https://raw.githubusercontent.com/ungden/bizos-company-os/main/lib/queries/index.ts
   Mỗi fetcher bọc React cache(). Đầy đủ:
   - fetchCompany, fetchDepartments, fetchEmployees, fetchTeams, fetchPositions
   - fetchKpis, fetchKpiActuals(period?), fetchKpiTargets(period?), fetchKpiTree(period?)
   - fetchTasks(filter?), fetchTaskOutputs, fetchWorkloadSnapshots(period?)
   - fetchPayroll(period?), fetchPayrollPeriods, fetchCompPlans
   - fetchProjects, fetchProjectMembers, fetchMilestones
   - fetchAccounting(dateRange?), fetchPnL(period?), fetchBalanceSheet(period?), fetchCashflow(period?)
   - fetchAlerts(unresolved?), fetchApprovals(status?), fetchAuditLogs(filter?)
   - fetchObjectives, fetchKeyResults
   - fetchRequisitions, fetchCandidates, fetchSops
   - fetchProfileData(userId)
   - HACO-specific: fetchIngredients, fetchDishes, fetchRecipes, fetchInventoryMovements, fetchDailySales, fetchFoodCostByDish

2. lib/queries/repositories/ — 1 file/entity:
   - companies.ts, departments.ts, employees.ts, kpis.ts, tasks.ts, payroll.ts, projects.ts, accounting.ts, alerts.ts, approvals.ts, objectives.ts, requisitions.ts, sops.ts, audit.ts
   - HACO: ingredients.ts, dishes.ts, recipes.ts, inventory.ts, sales.ts
   Mỗi file: import supabase server client, export list/get/insert/update/delete với typed return.

3. lib/queries/demo.ts — REPLACE file 53 dòng hiện có:
   Copy pattern BIZOS demo data nhưng dùng data HACO từ seed.sql.
   Export: demoCompany, demoDepartments, demoEmployees, demoKpis, demoKpiTargets, demoKpiActuals, demoTasks, demoPayroll, demoProjects, demoAccounting, demoAlerts, demoApprovals, demoObjectives, demoKeyResults, demoRequisitions, demoSops, demoIngredients, demoDishes.

4. lib/queries/withDemoFallback.ts:
   export async function withDemoFallback<T>(fn: () => Promise<T>, demoData: T): Promise<T>
   - Nếu DEMO_MODE=true HOẶC supabase chưa cấu hình → return demoData
   - Nếu fn() throw → log + return demoData
   - Else return fn() result

5. SỬA 20 page hiện có (app/(app)/*/page.tsx):
   - Bỏ "use client" ở những trang không cần state (dashboard, kpi, kpi-tree, finance, departments, projects, audit, knowledge, reports, alerts, approvals, okr, recruiting, profile)
   - Chuyển thành async function default export
   - Bỏ mọi import { KPIS, EMPLOYEES, FINANCIALS, TASKS, DEPARTMENTS } from "@/lib/queries/demo"
   - Thay bằng const [...] = await Promise.all([fetchX(), fetchY()])
   - Pages cần state (operations, forecast, compensation, people, settings, notifications) tách thành <ServerPage> + <ClientShell> con
   - Đảm bảo dashboard hiện CÙNG CON SỐ với finance (vd Net Profit) — đọc cùng nguồn từ pnl_monthly view

6. components/EmptyState.tsx + components/Skeleton.tsx — dùng cho mọi list khi data rỗng/loading.

DONE KHI:
- pnpm dev chạy với DEMO_MODE=true → tất cả 20 page render OK với demo data
- Tắt DEMO_MODE + cấu hình Supabase → tất cả 20 page render với DB data
- Dashboard "Net Profit" === Finance "Lợi nhuận ròng" === KPI page "NP" actual value (1 nguồn)
- Risk KPIs trên dashboard (GP, NP, MKT_CAC, OPS_OTD, ...) khớp với KPIS table thật
- Không còn page nào "use client" mà chỉ render data tĩnh
- Grep "import.*queries/demo" trên app/ trả 0 kết quả (chỉ withDemoFallback dùng)

LƯU Ý:
- Page "use client" muốn dùng async data → tạo ServerWrapper wrapper.
- Mọi list dài >50 row → dùng pagination/virtualization (cài @tanstack/react-table nếu cần).
```

---

## BƯỚC 4 — AUTH + RBAC + SIDEBAR FILTER

```
[PASTE PREAMBLE]

TASK: Bước 4/10 — Authentication thật, 7 role, sidebar lọc theo quyền.

DELIVERABLES:

1. app/(auth)/layout.tsx — layout riêng cho auth pages (không sidebar)

2. app/(auth)/login/page.tsx + actions.ts:
   - Form: email + password + button "Đăng nhập"
   - Server Action signInAction(formData):
     * Zod parse {email, password}
     * supabase.auth.signInWithPassword
     * Nếu OK: redirect /dashboard
     * Nếu lỗi: return {error: "Email hoặc mật khẩu sai"}
   - useActionState + useFormStatus
   - Link "Quên mật khẩu" → /reset-password

3. app/(auth)/signup/page.tsx + actions.ts:
   - Chỉ enable nếu env ALLOW_SIGNUP=true
   - Form: email + password + full_name
   - Sau signUp → tạo employee record với status='onboarding', chưa có role (CEO duyệt sau)

4. app/(auth)/reset-password/page.tsx + actions.ts:
   - Step 1: nhập email → supabase.auth.resetPasswordForEmail
   - Step 2 (callback): nhập password mới → supabase.auth.updateUser

5. lib/auth/roles.ts:
   export const ROLE_LABELS: Record<AppRole, string> = {
     ceo: "CEO/Tổng giám đốc",
     cfo: "CFO/Giám đốc tài chính",
     hr_admin: "HR Admin",
     dept_head: "Trưởng phòng",
     team_lead: "Team Lead",
     employee: "Nhân viên",
     auditor: "Kiểm toán/Audit"
   }
   export const ROLE_HIERARCHY: AppRole[] = ['ceo','cfo','hr_admin','dept_head','team_lead','employee','auditor']
   export function hasMinRole(userRole: AppRole, minRole: AppRole): boolean

6. SỬA lib/nav.ts:
   - Thêm field `roles?: AppRole[]` vào mỗi nav item theo matrix:
     * dashboard, alerts, org, departments, people, kpi-tree, operations, projects, knowledge, profile, guide → KHÔNG roles (ai cũng thấy)
     * recruiting → ['ceo','hr_admin','dept_head']
     * forecast → ['ceo','cfo','dept_head']
     * compensation → ['ceo','cfo','hr_admin','dept_head']
     * finance → ['ceo','cfo','auditor']
     * reports → ['ceo','cfo','hr_admin','dept_head','auditor']
     * approvals → ['ceo','cfo','hr_admin','dept_head','team_lead']
     * audit → ['ceo','auditor','cfo']
     * settings → ['ceo','cfo','hr_admin']

7. SỬA components/layout/Sidebar.tsx:
   - Đọc role hiện tại từ Server Component cha (truyền qua prop)
   - Filter NAV_GROUPS items theo `item.roles` (nếu undefined thì show)
   - Hiện badge role bên cạnh tên user ở footer sidebar

8. SỬA components/layout/Topbar.tsx:
   - Hiện avatar + tên + role
   - Dropdown: Profile, Settings, Logout (gọi signOutAction)

9. SỬA proxy.ts (đã có ở Bước 1):
   - Verify session với updateSession
   - Nếu chưa login + không phải /login|/signup|/reset-password → redirect /login
   - Nếu đã login + đang ở /login → redirect /dashboard

10. Tạo demo users qua seed bổ sung db/seed_users.sql:
    - Hướng dẫn chạy bằng Supabase Dashboard Auth UI hoặc supabase admin API
    - 7 user khớp 7 role:
      * ceo@hacofood.local / Demo@2026
      * cfo@hacofood.local / Demo@2026
      * hr@hacofood.local / Demo@2026
      * bep.head@hacofood.local / Demo@2026 (dept_head, scope BEP)
      * sales.head@hacofood.local / Demo@2026 (dept_head, scope SAL_B2B)
      * staff@hacofood.local / Demo@2026 (employee)
      * audit@hacofood.local / Demo@2026 (auditor)

DONE KHI:
- Login với ceo@hacofood.local → thấy đầy đủ 19+ menu
- Login với staff@hacofood.local → KHÔNG thấy /finance, /audit, /compensation, /approvals
- Login với audit@hacofood.local → thấy /finance, /audit, /reports nhưng không thấy /settings
- Truy cập /finance khi chưa login → redirect /login
- Truy cập /finance khi login với role staff → trang 403 (hoặc redirect /dashboard)
- Logout → quay về /login
- /api/health vẫn public

LƯU Ý:
- Dùng @supabase/ssr cookie-based auth, KHÔNG localStorage.
- Server Action throw redirect — KHÔNG return JSON cho redirect.
- Demo users ở .local domain để Supabase không gửi email confirm thật.
```

---

## BƯỚC 5 — KPI ENGINE: FORMULA + CASCADE + RECOMPUTE

```
[PASTE PREAMBLE]

TASK: Bước 5/10 — Trái tim hệ thống. KPI cascade chạy thật.

DELIVERABLES:

1. lib/kpi/formulaEngine.ts — REPLACE file 54 dòng hiện có:
   Copy NGUYÊN BIZOS:
   https://raw.githubusercontent.com/ungden/bizos-company-os/main/lib/kpi/formulaEngine.ts
   Đảm bảo đủ 11 op: const, ref, sum, sub, mul, avg, weighted_avg, ratio, milestone, manual + describeFormula().

2. lib/kpi/cascade.ts — TẠO MỚI:
   Copy NGUYÊN BIZOS:
   https://raw.githubusercontent.com/ungden/bizos-company-os/main/lib/kpi/cascade.ts
   - Type KpiRow (Kpi + target/actual/completion/status)
   - Type KpiNode (KpiRow + children[])
   - buildKpiRows(kpis, targets, actuals): KpiRow[]
   - buildKpiTree(rows): KpiNode[]
   - simulateImpact(deltas, tree): {kpi_code, before, after, delta_pct}[]
     * Iterative recompute up đến 10 vòng, convergence threshold 0.0001
     * Aggregate weighted sum theo kpi_dependencies.weight (default 1)

3. lib/kpi/recompute.ts — TẠO MỚI:
   - recomputeKpiTree(companyId, period): bottom-up
     * Lấy tất cả kpi + formula
     * Topo sort theo parent_kpi_id
     * Với mỗi KPI có formula: evaluate, upsert vào kpi_actuals
     * Tính completion_rate = actual/target
     * Tính status từ kpi_thresholds (default: green ≥100%, yellow ≥85%, red <85%)
     * Log vào kpi_audit_logs
   - integrityCheck(companyId): scan + return:
     * kpi thiếu owner
     * kpi thiếu target cho period hiện tại
     * kpi thiếu data_source
     * kpi cycle (parent loop)

4. app/(app)/kpi/actions.ts:
   - setKpiTargetAction(kpi_id, period, target_value) — requireRole(['ceo','cfo','hr_admin','dept_head'])
   - setKpiActualManualAction(kpi_id, period, actual_value, note) — requireRole(['ceo','cfo','hr_admin','dept_head'])
   - createKpiAction(input) — requireRole(['ceo','cfo'])
   - updateKpiFormulaAction(kpi_id, formula) — requireRole(['ceo','cfo'])
   - recomputeAllAction(period) — requireRole(['ceo','cfo'])
   - integrityCheckAction() — return list issue
   Tất cả: Zod parse + withAudit wrapper.

5. lib/audit/withAudit.ts — TẠO MỚI:
   export function withAudit<T extends (...args: any[]) => Promise<any>>(
     action: string,
     entity: string,
     fn: T
   ): T
   - Trước fn(): snapshot before nếu update
   - Gọi fn()
   - Insert audit_logs(actor, action, entity, entity_id, before, after)

6. SỬA app/(app)/kpi/page.tsx:
   - Server Component, fetchKpis + fetchKpiTargets + fetchKpiActuals
   - Dùng buildKpiRows để render bảng
   - Mỗi row có button "Sửa target" / "Nhập actual" → mở modal client
   - Filter theo level (company/dept/team/employee)
   - Button "Recompute Tree" gọi recomputeAllAction

7. SỬA app/(app)/kpi-tree/page.tsx:
   - Bỏ KPI_NODES hardcoded
   - Server Component, build tree từ DB qua buildKpiTree
   - Render đệ quy như hiện tại
   - Click 1 node → expand chi tiết: formula (qua describeFormula), data_source, history 6 tháng (sparkline)
   - Header thêm card "Integrity Check" hiện số issue

8. components/kpi/KpiFormulaEditor.tsx — TẠO MỚI:
   - Visual builder cho JSONB AST (kéo-thả op + ref)
   - Preview describeFormula realtime
   - Validate trước khi save

DONE KHI:
- Vào /kpi → 14 KPI hiện đúng từ DB
- Vào /kpi-tree → cây 3 cấp (company → dept → leaf), click expand smooth
- Sửa target REV_B2B từ 2.5 tỷ → 3 tỷ → completion REV giảm xuống → status REV chuyển vàng → status NP chuyển vàng (cascade up)
- Bấm "Recompute Tree" → kpi_actuals được update cho mọi KPI có formula
- Integrity check báo đúng kpi nào thiếu owner/target
- describeFormula(NP_formula) trả "Revenue − COGS − OpEx − Tax" (đọc được)

LƯU Ý:
- KPI chiều ngược (lower-is-better như FOOD_COST_PCT, MKT_CAC, WASTE_PCT): completion = target/actual thay vì actual/target.
- Cycle detection: nếu user set parent_kpi_id tạo loop → throw error.
```

---

## BƯỚC 6 — TASK ↔ KPI LINK + AUTO ACTUAL ROLLUP

```
[PASTE PREAMBLE]

TASK: Bước 6/10 — Hoàn task → tự động đẩy KPI lên. Chuỗi truy vết Task → KPI cá nhân → KPI dept → KPI công ty.

DELIVERABLES:

1. SỬA db/schema.sql (đã có ở Bước 2 nhưng bổ sung):
   - tasks thêm: expected_kpi_contribution NUMERIC, actual_kpi_contribution NUMERIC, kpi_period TEXT (vd '2026-05')
   - Đảm bảo task_outputs(task_id, output_type, value NUMERIC, payload JSONB, recorded_at, recorded_by) — đã có
   - workload_snapshots — đã có

2. app/(app)/operations/actions.ts — TẠO MỚI:
   - createTaskAction(input):
     * Zod parse: title, assignee_id, due_date, priority, task_type, linked_kpi_id, expected_kpi_contribution
     * BẮT BUỘC linked_kpi_id nếu task_type='growth'
     * insert tasks + log task_status_logs
   - updateTaskStatusAction(task_id, new_status, note?):
     * requireUser
     * Lấy task hiện tại
     * Nếu chuyển sang 'done' VÀ có linked_kpi_id VÀ có expected_kpi_contribution:
       - insert task_outputs(task_id, output_type='kpi_contribution', value=expected_kpi_contribution)
       - update tasks.actual_kpi_contribution = expected_kpi_contribution
       - upsert kpi_actuals: cộng dồn vào actual_value cho linked_kpi_id ở period hiện tại
       - gọi recomputeKpiTree(companyId, period) async
     * insert task_status_logs(from, to, actor, note)
   - recordTaskOutputAction(task_id, output_type, value, payload?):
     * Cho task hoàn thành nhiều lần đẩy KPI (vd content publish 5 bài)
     * insert task_outputs
     * Nếu output_type='kpi_contribution' → cộng vào kpi_actuals
   - assignTaskAction(task_id, new_assignee_id) — requireRole(['ceo','dept_head','team_lead'])
   - bulkAssignTasksAction(task_ids[], assignee_id) — same
   Tất cả wrap withAudit.

3. SỬA app/(app)/operations/page.tsx:
   - Bỏ "use client", thành Server Component
   - Server: const [tasks, employees, kpis] = await Promise.all([fetchTasks(), fetchEmployees(), fetchKpis()])
   - Tách 2 view qua URL ?view=list | ?view=kanban (default kanban)
   - Kanban: 5 cột (todo, in_progress, review, blocked, done) — copy pattern BIZOS
   - List: bảng có sort/filter qua URL state
   - Mỗi task card hiện: title + assignee avatar + priority badge + due date + KPI badge (kpi.code) nếu có linked_kpi_id
   - Header stats: total / open / overdue / done / "% gắn KPI" / "Task không gắn KPI" (counter cảnh báo)
   - FAB "+ Tạo task" mở modal client gọi createTaskAction
   - Drag-drop card giữa cột (cài @dnd-kit/core) → call updateTaskStatusAction
   - Filter sidebar: assignee, dept, project, priority, kpi, task_type

4. components/operations/TaskCreateForm.tsx — TẠO MỚI:
   - Client modal với useActionState
   - Field linked_kpi: dropdown lọc theo dept của assignee (Combobox)
   - Field expected_kpi_contribution: numeric input, hiện đơn vị KPI bên cạnh
   - Validate: nếu task_type=growth mà không chọn KPI → error

5. components/operations/TaskCard.tsx — TẠO MỚI:
   - Hiện đầy đủ info + drag handle
   - Quick action: change status (dropdown), record output (modal)

6. SỬA app/(app)/people/page.tsx → app/(app)/people/[id]/page.tsx (route động):
   - Server Component fetch employee theo id + workload + kpi của họ + task của họ
   - Thêm tab "Impact Path":
     * Lấy tasks.where(assignee=id, status=done, kpi_period=current)
     * Group by linked_kpi_id
     * Render chuỗi: Task list → KPI cá nhân (đã đẩy bao nhiêu / target) → parent KPI (đóng góp X%) → root KPI (đóng góp Y%)
     * Visualize bằng reactflow/sankey nếu phức tạp

7. lib/cron/dailyWorkload.ts — TẠO MỚI:
   - Tính workload_snapshots cho mỗi employee mỗi ngày
   - open_tasks, overdue_tasks, admin_ratio, growth_ratio

8. app/api/cron/workload/route.ts — Vercel Cron daily 1am:
   - Gọi dailyWorkload cho mọi company

DONE KHI:
- Tạo task "Chạy ad FB tuần 19" gắn linked_kpi_id=MKT_LEADS, expected_contribution=200
- Kéo task sang cột "Hoàn thành" → kpi_actuals của MKT_LEADS tăng 200 → cascade lên REV (tăng theo formula)
- Vào /people/HR007 → tab Impact Path thấy task vừa làm → KPI MKT_LEADS đẩy 200 → đóng góp REV bao nhiêu %
- Header operations hiện "% gắn KPI" tăng khi tạo task có KPI
- Drag-drop card chạy mượt, optimistic UI (useOptimistic)
- Filter URL persist khi reload
- Cron workload chạy → workload_snapshots có row mới mỗi sáng
```

---

## BƯỚC 7 — COMPENSATION ENGINE THẬT

```
[PASTE PREAMBLE]

TASK: Bước 7/10 — Lương thưởng tự tính từ KPI completion + team gating + company gating + employer cost theo luật VN.

DELIVERABLES:

1. lib/compensation/ruleEngine.ts — REPLACE file 49 dòng hiện có:
   Copy NGUYÊN BIZOS:
   https://raw.githubusercontent.com/ungden/bizos-company-os/main/lib/compensation/ruleEngine.ts
   Đảm bảo:
   - 5-tier threshold: 0%→0×, 80%→0.5×, 90%→0.75×, 100%→1.0×, 120%→1.5×
   - Team bonus chỉ giải ngân khi team_completion ≥ 100% (cộng 2% base)
   - Company bonus chỉ giải ngân khi company_completion ≥ 100% (3% base × company_multiplier)
   - Output PayrollBreakdown: base, allowance, commission, kpi_bonus, team_bonus, company_bonus, penalty, adjustment, gross_pay, net_pay (~90% gross), company_cost (~123.5% gross — BHXH 17.5% + BHYT 3% + BHTN 1% + KPCĐ 2%)
   - Tham số deductions config được (lưu app_settings)

2. lib/compensation/payrollRunner.ts — TẠO MỚI:
   export async function runPayroll(companyId: string, period: string): Promise<PayrollEntry[]>
   - Tạo payroll_periods row (status=processing)
   - Lặp qua employees active:
     * Đọc kpi_actuals cá nhân + dept của họ + company → tính 3 completion
     * Đọc compensation_plans + bonus_rules + commission_rules
     * Đọc salary_components hiệu lực trong period
     * Gọi computePayroll()
     * Insert payroll_entries với breakdown JSONB
   - Update payroll_periods status=completed, closed_at

3. app/(app)/compensation/actions.ts — TẠO MỚI:
   - runPayrollAction(period) — requireRole(['ceo','cfo','hr_admin'])
     * Check chưa có payroll_periods status=completed cho period đó
     * Gọi runPayroll
     * withAudit
   - overridePayrollAction(entry_id, kind, amount, reason) — requireRole(['ceo','cfo'])
     * Insert adjustment_entries
     * Update payroll_entries.adjustment_total + recompute net_pay
   - approvePayrollAction(period) — requireRole(['ceo'])
     * payroll_periods.status='approved'
     * Tạo accounting_entries: Dr 642 (CP nhân sự) / Cr 334 (phải trả NLĐ)
     * Tạo accounting_entries: Dr 642 / Cr 338 (BHXH phải nộp)
   - paySalaryAction(period) — requireRole(['ceo','cfo'])
     * Dr 334 / Cr 112 (chuyển khoản)

4. SỬA app/(app)/compensation/page.tsx:
   - Server Component
   - Tab "Bảng lương": fetchPayroll(period) hiện table với breakdown
   - Tab "Chế độ đãi ngộ": list compensation_plans, bonus_rules, commission_rules
   - Tab "Lịch sử chi trả": payroll_periods + status timeline
   - Tab "Cấu hình lương": form sửa salary_components, bonus_rules (CEO/CFO only)
   - Header button "Chạy bảng lương kỳ này" → modal confirm → runPayrollAction
   - Click 1 row → drawer chi tiết breakdown

5. components/compensation/IncentiveSimulator.tsx — TẠO MỚI:
   - Client component
   - Chọn 1 employee → hiện base, bonus rules
   - 3 slider: kpi_completion, team_completion, company_completion (0% → 150%)
   - Realtime call computePayroll() client-side → hiện total breakdown
   - Button "Lưu kịch bản" insert vào scenarios

6. components/compensation/PayslipDrawer.tsx — TẠO MỚI:
   - Hiện chi tiết 1 entry: base + allowance + bonus types + deductions + net + company_cost
   - Print-friendly (CSS @media print)
   - Export PDF (cài @react-pdf/renderer hoặc dùng print)

DONE KHI:
- Bấm "Chạy bảng lương T5/2026" → 14 row payroll_entries tạo ra với số đúng theo formula
- Sample check: employee có kpi=110%, team=105%, company=98% → kpi_bonus=1.0× × team_bonus=2% base, company_bonus=0 (vì company<100%)
- Net pay = gross × ~0.9; company_cost = gross × ~1.235
- Tab Finance/P&L "Chi phí nhân sự" tự tăng đúng tổng company_cost
- IncentiveSimulator đổi slider → con số đổi realtime (không gọi server)
- Print payslip cho 1 employee → A4 sạch, có chi tiết mọi component
- Override payroll log vào adjustment_entries + audit_logs
- Approve payroll → accounting_entries có 2 cặp ghi sổ chính xác
```

---

## BƯỚC 8 — FINANCE LEDGER + P&L/BS/CF + DÒNG TIỀN 13 TUẦN

```
[PASTE PREAMBLE]
[PASTE PHẦN A.4 — Chart of Accounts VAS]

TASK: Bước 8/10 — Sổ kế toán thật, P&L/BS/CF theo VAS, dòng tiền 13 tuần forecast.

DELIVERABLES:

1. db/seed_coa.sql — CoA chuẩn VAS (đã có ở Bước 2 nhưng đầy đủ hơn):
   ~50 tài khoản chi tiết, có account_type (asset, liability, equity, revenue, expense), parent_id để tạo cây.

2. db/migrations/finance_views.sql — refresh nếu cần:
   - pnl_monthly: GROUP BY company_id, month(entry_date), SUM theo account_type
   - balance_sheet_snapshot: lấy số dư cuối kỳ (cumulative debit/credit theo account_type)
   - cashflow_monthly: phân loại theo bucket (operating/investing/financing)
   - ar_aging: bucket theo (0-30, 30-60, 60-90, >90)
   - ap_aging: tương tự
   - cash_runway_view: cash hiện tại / avg monthly burn 3 tháng

3. app/(app)/finance/actions.ts — TẠO MỚI:
   - createAccountingEntryAction(input) — requireRole(['ceo','cfo'])
     * Zod parse: entry_date, lines[]: {account_code, debit, credit, cost_center_id?, dept_id?, project_id?, note}
     * Validate sum(debit) === sum(credit) trong cùng entry
     * Insert atomic vào accounting_entries
   - createInvoiceAction(kind 'in'|'out', counterparty, amount, due_date) — requireRole(['ceo','cfo','sales_dept_head'])
     * Insert ar_ap_records
     * Auto generate accounting_entries (Dr 131/Cr 511 nếu out, Dr 152/Cr 331 nếu in)
   - settleInvoiceAction(record_id, paid_amount, paid_date) — requireRole(['ceo','cfo'])
     * Update ar_ap_records.settled_at
     * Generate accounting_entries (Dr 112/Cr 131 hoặc Dr 331/Cr 112)
   - createBudgetAction + updateBudgetLineAction
   - createCashflowRecordAction (cho dự báo cash chưa vào sổ)

4. SỬA app/(app)/finance/page.tsx:
   - 5 tab thật, mỗi tab Server Component query view tương ứng:
     * **Tổng quan**: cash balance (sum 111+112), AR total, AP total, runway, top 5 chi phí, mini P&L
     * **P&L**: bảng 12 tháng từ pnl_monthly + chart area
     * **BS**: snapshot tháng hiện tại, expand asset/liability/equity tree
     * **Dòng tiền**: cashflow_monthly + 13-week rolling forecast
     * **Ngân sách**: budgets vs actuals, drill-down per dept
   - Header button "Thu/Chi mới" → modal createAccountingEntryAction (có shortcut template: thu B2B, thu B2C, chi NCC, chi lương, chi ads, chi điện nước...)

5. components/finance/CashflowForecast13W.tsx — TẠO MỚI:
   - Lấy 13 tuần tới
   - Mỗi tuần: opening cash + expected inflow (AR đến hạn, daily_sales projection) - expected outflow (AP đến hạn, payroll, fixed cost) = closing cash
   - Render line chart + table
   - Cảnh báo tuần nào closing cash < threshold (vd 500tr)

6. components/finance/AccountingEntryForm.tsx — TẠO MỚI:
   - Multi-line debit/credit
   - Realtime balance check
   - Account picker (search by code/name, hierarchical)
   - Cost center / dept / project tag

7. components/finance/PnLTable.tsx + BalanceSheetTable.tsx + CashflowTable.tsx — chuẩn report VAS:
   - Format số chuẩn VN (dấu chấm thousand, dấu phẩy decimal)
   - Print-friendly
   - Export Excel (cài xlsx)

8. HACO-specific tab thêm "Food Cost Analysis":
   - Query food_cost_by_dish view
   - Chart heatmap: dish × month × food_cost_pct
   - Cảnh báo dish nào vượt target_food_cost_pct
   - Suggestion: đẩy dish margin cao, rà recipe dish margin thấp

DONE KHI:
- Tạo entry "Thu B2B 1 tỷ từ KH X" → AR tăng 1 tỷ; settle → cash tăng 1 tỷ, AR giảm 1 tỷ
- Tab P&L T5/2026 hiện đúng: Revenue = sum 511 credit - sum 521 debit; COGS = sum 632 debit
- Tab BS: tổng asset = tổng liability + equity (cân đối)
- Tab CF: 13-week forecast thấy được, alert tuần nào < 500tr
- Tab Ngân sách: nếu chi MKT 110tr (budget 100tr) → row hiện đỏ, % vượt 10%
- Tab Food Cost: 20 dish có food_cost_pct, dish vượt 35% được flag
- Print P&L → A4 sạch chuẩn báo cáo
- Mọi entry log audit_logs
```

---

## BƯỚC 9 — ALERTS + APPROVALS + AUDIT + FORECAST WHAT-IF

```
[PASTE PREAMBLE]

TASK: Bước 9/10 — Trí thông minh + governance + cron tự động.

DELIVERABLES:

1. db/seed_alert_rules.sql — TẠO MỚI:
   Insert 8-10 alert_rules cho HACO:
   - kpi_red: bất kỳ KPI nào status=red → severity danger
   - kpi_yellow_persistent: KPI status=yellow >7 ngày → warning
   - budget_overrun: dept actual > budget*1.05 → warning
   - budget_critical: dept actual > budget*1.15 → danger
   - task_urgent_overdue: task priority=urgent overdue >24h → critical
   - runway_low: cash runway <6 tháng → danger
   - food_cost_high: FOOD_COST_PCT >35% → warning
   - waste_high: WASTE_PCT >5% → danger
   - ar_aging: AR >60 ngày tổng >100tr → warning
   - workload_overload: employee có >15 open task → warning

2. lib/alerts/scanner.ts — TẠO MỚI:
   export async function scanAlerts(companyId: string): Promise<Alert[]>
   - Lặp qua active alert_rules
   - Mỗi rule: evaluate definition (JSONB chứa SQL fragment hoặc rule code)
   - Nếu match: insert vào alerts (idempotent — nếu rule + payload key đã có alert chưa resolved thì skip)
   - Trigger notification cho owner liên quan

3. app/api/cron/alerts/route.ts — Vercel Cron mỗi 15 phút (hoặc daily 6am tùy):
   - GET /api/cron/alerts với secret header
   - Lặp tất cả company → scanAlerts
   - Return summary

4. SỬA app/(app)/alerts/page.tsx — REPLACE ComingSoon:
   - Server Component
   - Tab unresolved/all/by-severity
   - Bảng: time, severity badge, title, detail, owner, action button "Resolve"
   - Bulk resolve
   - Header card: total unresolved count, breakdown by severity
   - Server Action resolveAlertAction(alert_id, resolution_note)
   - Filter sidebar: severity, rule, dept, date range

5. lib/approvals/workflow.ts — TẠO MỚI:
   - Type ApprovalConfig: {kind, steps: [{role, condition?}]}
   - Vd: bonus_override → [{ceo}]; budget_increase → [{dept_head, condition: amount<50tr}, {ceo, condition: amount>=50tr}]
   - createApproval(kind, payload, requested_by) → tạo approvals + approval_steps theo config
   - actOnApproval(step_id, action 'approve'|'reject', comment) → update step + check next step

6. SỬA app/(app)/approvals/page.tsx:
   - Server Component, tab pending/approved/rejected
   - Mỗi row: kind, title, payload preview, requester, current step + assignee role
   - Action button gọi approveAction/rejectAction (RBAC check theo current step.role)
   - Header create button: "Yêu cầu phê duyệt mới" — chọn kind

7. SỬA app/(app)/audit/page.tsx:
   - Server Component fetchAuditLogs(filter)
   - Filter: actor (employee dropdown), action, entity, date range
   - Bảng: time, actor, action, entity, entity_id (link), before/after diff (collapsible JSON)
   - Export CSV
   - Pagination

8. SỬA app/(app)/forecast/page.tsx:
   - Tách form slider thành Client Component
   - useTransition + useFormState
   - onValueCommit (sau khi user thả slider) → call simulateScenarioAction
   - simulateScenarioAction(assumptions): Server Action
     * Build deltas dict {kpi_code: delta_pct}
     * Gọi simulateImpact(deltas, currentTree) từ lib/kpi/cascade
     * Tính P&L delta
     * Return {newPnL, newKpis, deltas}
   - Render result panel hiện realtime
   - Button "Lưu kịch bản" → insert scenarios(name, assumptions JSONB, result JSONB, created_by)
   - Tab "Lịch sử mô phỏng": list scenarios + so sánh

9. lib/notifications/dispatch.ts — TẠO MỚI:
   - notify(user_id | role | dept_head_of, title, body, link)
   - Insert vào notifications table
   - Topbar đọc notifications có read_at IS NULL → bell badge

10. components/layout/NotificationBell.tsx — TẠO MỚI:
    - Client component, polling 30s hoặc realtime qua Supabase channel
    - Dropdown list 10 noti gần nhất
    - Click → mark as read + navigate link

DONE KHI:
- Cron /api/cron/alerts gọi 1 lần → tạo alert đúng cho KPI red, dept vượt budget, task urgent overdue
- /alerts hiện danh sách, click Resolve → row chuyển sang tab All với resolved_at đã set
- Tạo approval "Bonus override 5tr cho HR007" → vào /approvals của CEO → CEO approve → audit_logs có 2 row (create + approve)
- /audit filter theo actor=ceo → list đầy đủ action của CEO
- /forecast kéo slider "Sales -20%" → result panel hiển thị Net Profit mới giảm tương ứng (theo formula)
- Lưu scenario → reload trang vẫn còn
- Bell topbar có badge số notification chưa đọc
```

---

## BƯỚC 10 — AI LAYER (CLAUDE API)

```
[PASTE PREAMBLE]

TASK: Bước 10/10 — Claude AI quản trị doanh nghiệp HACO Food.
LƯU Ý: Chỉ làm bước này SAU KHI bước 1-9 hoàn tất. AI cần data thật mới có giá trị.

DELIVERABLES:

1. lib/ai/claude.ts — TẠO MỚI:
   import Anthropic from "@anthropic-ai/sdk"
   - Singleton client với env.ANTHROPIC_API_KEY
   - export const MODELS = {
       FAST: "claude-sonnet-4-6",     // briefing thường, scan task
       DEEP: "claude-opus-4-7",       // weekly review, complex analysis
       CHEAP: "claude-haiku-4-5-20251001" // simple summarization
     }
   - export async function callClaude(opts: {
       model, system, messages,
       max_tokens, temperature,
       cache_system?: boolean    // bật prompt caching cho system + KPI context
     })
   - QUAN TRỌNG: system prompt LUÔN bật cache_control: {type:"ephemeral"} cho TTL 5 phút.

2. lib/ai/contextBuilder.ts — TẠO MỚI:
   - buildKpiSummary(companyId, period): string
     * Trả ra markdown ngắn: top KPI red, top yellow, top performers, top decliners, trend 3 tháng
     * Cấu trúc cho AI hiểu nhanh, max 2000 token
   - buildCashflowSummary(companyId): string
     * Cash hiện tại, runway, AR aging, AP overdue, top 5 chi phí lớn nhất tháng
   - buildTaskHealthSummary(companyId): string
     * Task overdue, task không gắn KPI, employee overload, completion rate theo dept
   - buildHacoFoodSpecific(companyId, period): string
     * Food cost % theo dish, waste %, top sellers, AOV theo channel
   - buildFullContext(companyId, period): string
     * Concat 4 cái trên + meta (today's date, company name)

3. lib/ai/prompts.ts — TẠO MỚI:
   - DAILY_BRIEFING_SYSTEM: "Bạn là AI COO của HACO Food..."
   - WORK_AUDITOR_SYSTEM: "Bạn quét task hằng ngày..."
   - KPI_ARCHITECT_SYSTEM: "Bạn giúp thiết kế KPI cho ngành F&B Việt Nam..."
   - WEEKLY_REVIEW_SYSTEM: cho deep analysis
   - RECIPE_OPTIMIZER_SYSTEM: HACO-specific
   Mọi prompt VIẾT BẰNG TIẾNG VIỆT, output dạng JSON schema được định nghĩa rõ.

4. app/api/ai/briefing/route.ts:
   - POST { period?, force_refresh? }
   - Cache 1h (Vercel ISR hoặc Redis nếu có)
   - Build context → call Claude (Sonnet) → parse JSON → return {insights: [{type, title, desc, action}]}
   - Stream SSE để UX mượt

5. app/api/ai/work-auditor/route.ts:
   - POST hoặc cron daily
   - Build task health context → Claude (Sonnet)
   - Return list issue + recommended action
   - Insert vào alerts với severity 'info'

6. app/api/ai/kpi-architect/route.ts:
   - POST { dept_id, kpi_intent }
   - Claude (Opus) gợi ý 3 KPI candidate (name, formula, target gợi ý theo benchmark F&B VN)
   - User chọn 1 → tạo qua createKpiAction

7. app/api/ai/weekly-review/route.ts (cron Sunday 8pm):
   - Build full context + 7 ngày qua
   - Claude (Opus) phân tích sâu, trả 5 phần: top performers, bottom performers, dept health, financial health, recommendations
   - Insert vào reports table
   - Send notification cho CEO

8. app/api/ai/recipe-optimizer/route.ts (HACO-specific):
   - Input: companyId, period
   - Build context: dishes + recipes + food_cost_by_dish + daily_sales
   - Claude (Sonnet) phân tích:
     * Dish margin cao đang bán ít → push marketing
     * Dish food_cost vượt → review recipe
     * Dish waste cao → giảm production
   - Return list recommendation

9. app/api/ai/chat/route.ts — Conversational interface:
   - SSE streaming
   - Multi-turn (lưu vào conversations table)
   - Tool use: AI có thể gọi fetchKpis, fetchTasks, runScenario, etc.
   - RBAC: AI chỉ thấy data trong scope role của user đang chat

10. SỬA components/ai/AIDashboardBriefing.tsx:
    - Bỏ setTimeout fake
    - Call /api/ai/briefing với SWR/use cho cache
    - Stream insights khi nhận từng chunk
    - Click insight → expand action detail + button "Tạo task" / "Tạo approval" / "Mở chi tiết"

11. app/(app)/ai-coo/page.tsx — TẠO MỚI:
    - Chat interface đầy đủ với AI COO
    - Sidebar: lịch sử conversations
    - Suggested prompts: "Phân tích lý do food cost tháng này tăng", "Đề xuất KPI cho team Bếp Q3", "Dự đoán cash 30 ngày tới", "Coach HR007"
    - Thêm vào nav menu Personal group

12. lib/ai/safety.ts — TẠO MỚI:
    - Rate limiting per user (max 50 req/h)
    - Cost tracking → log vào ai_usage table
    - Sanitize input (loại bỏ prompt injection)
    - Refusal cho action sensitive (xóa dữ liệu, gửi email/sms thật)

DONE KHI:
- Mở dashboard buổi sáng → 3 insight Claude phân tích từ data hôm qua, không phải text cứng
- Bấm "Phân tích chi tiết" trên 1 insight → drawer hiện reasoning đầy đủ
- /ai-coo chat: hỏi "Top 3 nhân viên tuần này" → AI trả lời chính xác từ DB
- Cron weekly Sunday → CEO nhận notification "Báo cáo tuần đã sẵn sàng" → click vào /reports thấy
- Recipe optimizer cho ra recommendation cụ thể với tên dish
- AI chỉ thấy data trong scope role: nhân viên hỏi "Lương của CEO" → AI từ chối
- AI usage được log + có rate limit
- Prompt cache hit rate >70% (check Anthropic dashboard)

LƯU Ý:
- Đọc skill claude-api của Claude Code (nếu có) trước khi viết wrapper.
- Prompt caching tiết kiệm 90% cost — bắt buộc bật cho system prompt + context dài.
- KHÔNG để AI thực hiện action sensitive tự động — luôn yêu cầu user confirm.
- Output AI luôn validate qua Zod trước khi insert DB.
```

---

# PHẦN D — POLISH FINAL (sau Bước 10)

```
[PASTE PREAMBLE]

TASK: Polish cuối, mobile, i18n, dark mode, testing.

DELIVERABLES:

1. Mobile responsive:
   - Sidebar: hamburger menu, drawer overlay trên mobile
   - Topbar: collapse search, hide breadcrumb dài
   - Bảng: scroll horizontal có sticky column
   - Card grid: 1 col mobile, 2 tablet, 3-6 desktop
   - Test trên iPhone 12, iPad, Galaxy

2. I18n VI/EN:
   - Cài next-intl
   - Tất cả string dùng useTranslations
   - Toggle ở Topbar
   - Persist vào user_preferences.locale

3. Dark mode:
   - Đã có biến CSS Tailwind v4
   - Toggle ở Topbar + Profile
   - Persist vào user_preferences.theme

4. Toast + confirm dialog:
   - Cài sonner
   - Mọi Server Action thành công/lỗi → toast
   - Mọi delete/destructive → confirm dialog

5. Empty state + loading skeleton mọi list

6. Error boundary mỗi route + global error.tsx

7. Testing:
   - Vitest cho lib/kpi, lib/compensation engine
   - Playwright cho 3 E2E flow:
     * Login → Dashboard
     * Create task → mark done → KPI tăng
     * Run payroll → check P&L
   - GitHub Actions CI

8. Performance:
   - Image: next/image cho avatar, logo
   - Lazy load chart libraries (dynamic import)
   - Lighthouse score >85 cho all pages

9. Documentation cuối:
   - README.md update với hướng dẫn deploy
   - GUIDE.md cho người dùng cuối (CEO, HR, Dept Head, Staff)
   - CHANGELOG.md

10. Production deployment:
    - Vercel project + Supabase production
    - Custom domain hacofood-os.haco.vn (hoặc subdomain)
    - Backup Supabase daily
    - Monitor (Sentry hoặc Logflare)
    - Cron jobs schedule trên Vercel
    - Health check + uptime monitor

DONE KHI:
- pnpm test pass tất cả
- Lighthouse mobile score >85
- Login từ điện thoại OK, layout mượt
- Chuyển VI ↔ EN không reload page
- Toggle dark mode mượt, không flash
- Production URL truy cập được, login với CEO OK
- Backup tự chạy
```

---

# PHẦN E — TIPS & FAQ

## E.1. Khi Antigravity báo lỗi

Copy nguyên log lỗi + paste:
```
Lỗi sau khi chạy: [paste log]
File bị ảnh hưởng: [file path]
ĐỪNG đi tiếp. Hãy:
1. Phân tích root cause
2. Đề xuất 2 cách fix (chọn 1 ít rủi ro hơn)
3. Apply fix
4. Test lại
```

## E.2. Khi muốn skip 1 phần

Đừng skip Phase 0, 1, 2 — đó là nền. Có thể skip:
- Bước 7 (Compensation) nếu chưa cần payroll thật
- Bước 9 (chỉ làm Alerts, skip Approvals/Forecast) nếu HACO chưa có quy trình duyệt
- Bước 10 (AI) — luôn để cuối, không bao giờ làm trước Bước 5

## E.3. Khi data bị "lệch"

```
Số ở /dashboard không khớp với /finance.
ĐỪNG sửa hardcode. Tìm gốc:
1. Cả 2 page đọc cùng query function chưa? (fetchPnL? fetchAccounting?)
2. Có cache cũ không? (revalidatePath, React cache TTL)
3. Có nơi nào còn import demo.ts hardcoded?
Trace, sửa nguồn.
```

## E.4. Khi Supabase RLS chặn query

```
RLS chặn query [bảng X] cho role [Y]. Đúng hay sai?
- Đúng: role này KHÔNG NÊN thấy data này → handle UI hiển thị 403/empty.
- Sai: bổ sung policy hoặc đổi service_role (chỉ cho Server Action có requireRole).
TUYỆT ĐỐI KHÔNG disable RLS.
```

## E.5. Khi cần thêm bảng mới sau Bước 2

```
Tạo file db/migrations/[NNNN]_[description].sql
- CREATE TABLE + ALTER TABLE
- Bật RLS + policies
- Update types/domain.ts
- Update lib/queries/repositories
- Update demo.ts nếu cần
- Run migration trên dev Supabase trước
```

## E.6. Khi gặp Next.js 16 breaking change

```
ĐỌC node_modules/next/dist/docs/[topic].md
Tìm "Migration" hoặc "Breaking" section.
Vd: middleware → proxy, async params, server actions API changes.
KHÔNG dùng pattern Next 14/15 từ training data.
```

---

# PHẦN F — CHECKLIST TỔNG

| Phase | Bước | Trạng thái | Ghi chú |
|---|---|---|---|
| 0 | 1. Hạ tầng | ☐ | |
| 0 | 2. Schema 66 + RLS + Seed | ☐ | Cần điền PHẦN A trước |
| 1 | 3. Query layer + Server Component | ☐ | |
| 1 | 4. Auth + RBAC | ☐ | |
| 2 | 5. KPI Engine | ☐ | ★ trái tim |
| 2 | 6. Task ↔ KPI Link | ☐ | ★ chuỗi truy vết |
| 3 | 7. Compensation thật | ☐ | |
| 3 | 8. Finance VAS + 13W | ☐ | |
| 4 | 9. Alerts + Approvals + Forecast | ☐ | |
| 4 | 10. AI Layer | ☐ | Làm cuối cùng |
| 5 | Polish + Mobile + i18n + Test | ☐ | |

---

**Ước lượng thời gian** (1 dev fulltime):
- Phase 0: 3 ngày
- Phase 1: 3 ngày
- Phase 2: 5 ngày ★ quan trọng nhất
- Phase 3: 4 ngày
- Phase 4: 4 ngày
- Polish: 3 ngày
- **Tổng: ~22 ngày làm việc (4-5 tuần)**

Với Antigravity thì có thể nhanh hơn 30-50% vì code generation tốt.

---

**Liên hệ giúp đỡ:**
- BIZOS reference docs: https://github.com/ungden/bizos-company-os/blob/main/README.md
- Next.js 16 docs: trong node_modules/next/dist/docs/
- Supabase: https://supabase.com/docs
- Anthropic: https://docs.anthropic.com

Chúc bạn thành công với HACO Food OS!
