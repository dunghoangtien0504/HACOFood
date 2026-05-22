/**
 * HACO Food OS — Master Data Layer (Single Source of Truth)
 * ----------------------------------------------------------
 * Mọi trang trong app PHẢI đọc số liệu từ file này (qua selectors trong
 * `lib/queries/index.ts`). Không hardcode JSX với số riêng.
 *
 * Mô hình ngành: F&B / thực phẩm chế biến (Bếp Cô Hạ).
 * Chuỗi giá trị: Mua hàng → R&D → Sản xuất → QA → Kho → Logistics
 *                → Sales (B2B HORECA / B2C Online / Showroom) → CS.
 *
 * Đơn vị tiền: VND. Đơn vị thời gian mặc định: tháng hiện tại = "2026-05".
 */

export const COMPANY = {
  id: "co_haco",
  name: "Bếp Cô Hạ — HACO Food",
  legalName: "Công ty CP Thực phẩm HACO",
  code: "HACO",
  industry: "Food & Beverage Manufacturing",
  fiscalYear: "2026",
  currency: "VND",
  timezone: "Asia/Ho_Chi_Minh",
  currentPeriod: "2026-05",
  founded: "2019-03-15",
  hqAddress: "Lô C12, KCN Tân Bình, TP.HCM",
};

// =============================================================================
// PHÒNG BAN — 7 đơn vị theo chuỗi giá trị F&B
// =============================================================================

export type DeptId =
  | "dept_exec"
  | "dept_sales"
  | "dept_mkt"
  | "dept_prod"
  | "dept_rnd_qa"
  | "dept_supply"
  | "dept_back";

export type Department = {
  id: DeptId;
  name: string;
  code: string;
  scope: string;          // chức năng cốt lõi
  headEmployeeId: string;
  parentId: DeptId | null;
  budgetMonthly: number;  // ngân sách chi tháng (VND)
  costActual: number;     // chi thực tháng hiện tại
  headcount: number;
  color: string;          // màu primary cho UI
  icon: string;           // tên icon lucide-react
};

export const DEPARTMENTS: Department[] = [
  {
    id: "dept_exec",
    name: "Ban Giám đốc",
    code: "EXEC",
    scope: "Lãnh đạo, chiến lược, ra quyết định cấp công ty.",
    headEmployeeId: "emp_001",
    parentId: null,
    budgetMonthly: 200_000_000,
    costActual: 188_000_000,
    headcount: 3,
    color: "bg-zinc-900",
    icon: "ShieldCheck",
  },
  {
    id: "dept_sales",
    name: "Kinh doanh",
    code: "SALES",
    scope: "Bán B2B HORECA, B2C Online, Showroom & CSKH sau bán.",
    headEmployeeId: "emp_002",
    parentId: "dept_exec",
    budgetMonthly: 480_000_000,
    costActual: 445_000_000,
    headcount: 14,
    color: "bg-emerald-600",
    icon: "TrendingUp",
  },
  {
    id: "dept_mkt",
    name: "Marketing",
    code: "MKT",
    scope: "Thương hiệu, lead generation, performance ads, content.",
    headEmployeeId: "emp_003",
    parentId: "dept_exec",
    budgetMonthly: 320_000_000,
    costActual: 348_000_000, // vượt ngân sách 8.7%
    headcount: 8,
    color: "bg-purple-500",
    icon: "Sparkles",
  },
  {
    id: "dept_prod",
    name: "Sản xuất (Bếp trung tâm)",
    code: "PROD",
    scope: "Vận hành bếp, chế biến, đóng gói, an toàn thực phẩm.",
    headEmployeeId: "emp_004",
    parentId: "dept_exec",
    budgetMonthly: 1_650_000_000,
    costActual: 1_580_000_000,
    headcount: 32,
    color: "bg-orange-500",
    icon: "ChefHat",
  },
  {
    id: "dept_rnd_qa",
    name: "R&D & QA",
    code: "RNDQA",
    scope: "Phát triển sản phẩm mới, kiểm soát chất lượng, HACCP.",
    headEmployeeId: "emp_005",
    parentId: "dept_exec",
    budgetMonthly: 180_000_000,
    costActual: 172_000_000,
    headcount: 6,
    color: "bg-blue-500",
    icon: "FlaskConical",
  },
  {
    id: "dept_supply",
    name: "Mua hàng & Logistics",
    code: "SCM",
    scope: "Mua nguyên liệu, kho vận, giao hàng, quan hệ NCC.",
    headEmployeeId: "emp_006",
    parentId: "dept_exec",
    budgetMonthly: 240_000_000,
    costActual: 229_000_000,
    headcount: 11,
    color: "bg-amber-500",
    icon: "Truck",
  },
  {
    id: "dept_back",
    name: "Nhân sự & Tài chính",
    code: "BACK",
    scope: "Tuyển dụng, C&B, kế toán, ngân quỹ, hành chính.",
    headEmployeeId: "emp_007",
    parentId: "dept_exec",
    budgetMonthly: 220_000_000,
    costActual: 208_000_000,
    headcount: 8,
    color: "bg-rose-500",
    icon: "Wallet",
  },
];

// Convenience map for O(1) lookup
export const DEPT_BY_ID: Record<DeptId, Department> = Object.fromEntries(
  DEPARTMENTS.map((d) => [d.id, d])
) as Record<DeptId, Department>;

// =============================================================================
// NHÂN SỰ — 32 employees đại diện cho 82 headcount thực
// =============================================================================

export type EmployeeStatus = "active" | "onboarding" | "on_leave";

export type Employee = {
  id: string;
  code: string;
  fullName: string;
  email: string;
  phone: string;
  avatarInitials: string;
  position: string;
  level: "C-level" | "Head" | "Lead" | "Senior" | "Staff" | "Junior";
  departmentId: DeptId;
  managerId: string | null;
  joinDate: string;            // ISO
  status: EmployeeStatus;
  baseSalary: number;          // VND/tháng
  targetBonus: number;         // VND/tháng — bonus tối đa nếu đạt 100% KPI
  employmentType: "fulltime" | "parttime" | "contract";
  skills: { name: string; score: number }[];
};

export const EMPLOYEES: Employee[] = [
  // --- Ban Giám đốc ---
  {
    id: "emp_001",
    code: "HACO-001",
    fullName: "Nguyễn Thị Hạ",
    email: "ha.nguyen@hacofood.vn",
    phone: "0903 111 001",
    avatarInitials: "NH",
    position: "Tổng Giám đốc (CEO)",
    level: "C-level",
    departmentId: "dept_exec",
    managerId: null,
    joinDate: "2019-03-15",
    status: "active",
    baseSalary: 80_000_000,
    targetBonus: 40_000_000,
    employmentType: "fulltime",
    skills: [
      { name: "Strategy", score: 95 },
      { name: "F&B Operations", score: 92 },
      { name: "Leadership", score: 96 },
    ],
  },
  {
    id: "emp_007",
    code: "HACO-007",
    fullName: "Phạm Quốc Vinh",
    email: "vinh.pham@hacofood.vn",
    phone: "0903 111 007",
    avatarInitials: "PV",
    position: "Giám đốc Tài chính (CFO)",
    level: "C-level",
    departmentId: "dept_back",
    managerId: "emp_001",
    joinDate: "2020-01-06",
    status: "active",
    baseSalary: 65_000_000,
    targetBonus: 25_000_000,
    employmentType: "fulltime",
    skills: [
      { name: "Financial Analysis", score: 94 },
      { name: "Treasury", score: 88 },
      { name: "ERP/Accounting", score: 90 },
    ],
  },
  // --- Sales (Head + 4 đại diện) ---
  {
    id: "emp_002",
    code: "HACO-002",
    fullName: "Lê Minh Tuấn",
    email: "tuan.le@hacofood.vn",
    phone: "0903 222 001",
    avatarInitials: "LT",
    position: "Giám đốc Kinh doanh",
    level: "Head",
    departmentId: "dept_sales",
    managerId: "emp_001",
    joinDate: "2019-08-01",
    status: "active",
    baseSalary: 55_000_000,
    targetBonus: 35_000_000,
    employmentType: "fulltime",
    skills: [
      { name: "B2B Selling", score: 92 },
      { name: "Negotiation", score: 90 },
      { name: "HORECA Network", score: 95 },
    ],
  },
  {
    id: "emp_010",
    code: "HACO-010",
    fullName: "Trần Anh Khoa",
    email: "khoa.tran@hacofood.vn",
    phone: "0903 222 010",
    avatarInitials: "TK",
    position: "Trưởng nhóm Sales B2B HORECA",
    level: "Lead",
    departmentId: "dept_sales",
    managerId: "emp_002",
    joinDate: "2020-05-18",
    status: "active",
    baseSalary: 32_000_000,
    targetBonus: 18_000_000,
    employmentType: "fulltime",
    skills: [
      { name: "Account Management", score: 88 },
      { name: "Cold Outreach", score: 82 },
    ],
  },
  {
    id: "emp_011",
    code: "HACO-011",
    fullName: "Vũ Thanh Mai",
    email: "mai.vu@hacofood.vn",
    phone: "0903 222 011",
    avatarInitials: "VM",
    position: "Trưởng nhóm B2C Online",
    level: "Lead",
    departmentId: "dept_sales",
    managerId: "emp_002",
    joinDate: "2021-02-22",
    status: "active",
    baseSalary: 28_000_000,
    targetBonus: 15_000_000,
    employmentType: "fulltime",
    skills: [
      { name: "E-commerce", score: 90 },
      { name: "Livestream", score: 85 },
    ],
  },
  {
    id: "emp_012",
    code: "HACO-012",
    fullName: "Đặng Hữu Phước",
    email: "phuoc.dang@hacofood.vn",
    phone: "0903 222 012",
    avatarInitials: "ĐP",
    position: "Sales Executive HORECA",
    level: "Senior",
    departmentId: "dept_sales",
    managerId: "emp_010",
    joinDate: "2022-04-04",
    status: "active",
    baseSalary: 18_000_000,
    targetBonus: 10_000_000,
    employmentType: "fulltime",
    skills: [
      { name: "Field Sales", score: 80 },
    ],
  },
  {
    id: "emp_013",
    code: "HACO-013",
    fullName: "Hoàng Thu Trang",
    email: "trang.hoang@hacofood.vn",
    phone: "0903 222 013",
    avatarInitials: "HT",
    position: "Customer Success Lead",
    level: "Lead",
    departmentId: "dept_sales",
    managerId: "emp_002",
    joinDate: "2021-09-12",
    status: "active",
    baseSalary: 24_000_000,
    targetBonus: 10_000_000,
    employmentType: "fulltime",
    skills: [
      { name: "Customer Retention", score: 88 },
      { name: "CRM", score: 82 },
    ],
  },
  // --- Marketing ---
  {
    id: "emp_003",
    code: "HACO-003",
    fullName: "Nguyễn Thu Hà",
    email: "ha.nguyenthu@hacofood.vn",
    phone: "0903 333 001",
    avatarInitials: "NH",
    position: "Giám đốc Marketing",
    level: "Head",
    departmentId: "dept_mkt",
    managerId: "emp_001",
    joinDate: "2020-03-01",
    status: "active",
    baseSalary: 50_000_000,
    targetBonus: 25_000_000,
    employmentType: "fulltime",
    skills: [
      { name: "Brand Strategy", score: 92 },
      { name: "Performance Marketing", score: 88 },
    ],
  },
  {
    id: "emp_020",
    code: "HACO-020",
    fullName: "Bùi Hồng Nhung",
    email: "nhung.bui@hacofood.vn",
    phone: "0903 333 020",
    avatarInitials: "BN",
    position: "Performance Ads Lead",
    level: "Lead",
    departmentId: "dept_mkt",
    managerId: "emp_003",
    joinDate: "2021-06-15",
    status: "active",
    baseSalary: 28_000_000,
    targetBonus: 12_000_000,
    employmentType: "fulltime",
    skills: [
      { name: "Meta Ads", score: 92 },
      { name: "Google Ads", score: 88 },
      { name: "Analytics", score: 85 },
    ],
  },
  {
    id: "emp_021",
    code: "HACO-021",
    fullName: "Nguyễn Thị Minh Anh",
    email: "anh.nguyen@hacofood.vn",
    phone: "0903 333 021",
    avatarInitials: "NA",
    position: "Senior Content Marketing",
    level: "Senior",
    departmentId: "dept_mkt",
    managerId: "emp_003",
    joinDate: "2022-03-15",
    status: "active",
    baseSalary: 22_000_000,
    targetBonus: 8_000_000,
    employmentType: "fulltime",
    skills: [
      { name: "Content Marketing", score: 90 },
      { name: "Social Media", score: 88 },
      { name: "Copywriting", score: 86 },
    ],
  },
  {
    id: "emp_022",
    code: "HACO-022",
    fullName: "Đỗ Hải Đăng",
    email: "dang.do@hacofood.vn",
    phone: "0903 333 022",
    avatarInitials: "ĐĐ",
    position: "Brand Designer",
    level: "Senior",
    departmentId: "dept_mkt",
    managerId: "emp_003",
    joinDate: "2022-11-08",
    status: "active",
    baseSalary: 20_000_000,
    targetBonus: 6_000_000,
    employmentType: "fulltime",
    skills: [
      { name: "Branding", score: 88 },
      { name: "UI/UX", score: 78 },
    ],
  },
  // --- Sản xuất (Bếp) ---
  {
    id: "emp_004",
    code: "HACO-004",
    fullName: "Trần Văn Hùng",
    email: "hung.tran@hacofood.vn",
    phone: "0903 444 001",
    avatarInitials: "TH",
    position: "Bếp trưởng / Giám đốc Sản xuất",
    level: "Head",
    departmentId: "dept_prod",
    managerId: "emp_001",
    joinDate: "2019-04-01",
    status: "active",
    baseSalary: 48_000_000,
    targetBonus: 22_000_000,
    employmentType: "fulltime",
    skills: [
      { name: "Culinary", score: 96 },
      { name: "HACCP", score: 90 },
      { name: "Lean Kitchen", score: 84 },
    ],
  },
  {
    id: "emp_030",
    code: "HACO-030",
    fullName: "Lê Quang Dũng",
    email: "dung.le@hacofood.vn",
    phone: "0903 444 030",
    avatarInitials: "LD",
    position: "Trưởng ca bếp",
    level: "Lead",
    departmentId: "dept_prod",
    managerId: "emp_004",
    joinDate: "2020-07-10",
    status: "active",
    baseSalary: 22_000_000,
    targetBonus: 8_000_000,
    employmentType: "fulltime",
    skills: [{ name: "Kitchen Ops", score: 88 }],
  },
  {
    id: "emp_031",
    code: "HACO-031",
    fullName: "Nguyễn Thị Lan",
    email: "lan.nguyen@hacofood.vn",
    phone: "0903 444 031",
    avatarInitials: "NL",
    position: "Trưởng ca đóng gói",
    level: "Lead",
    departmentId: "dept_prod",
    managerId: "emp_004",
    joinDate: "2020-11-22",
    status: "active",
    baseSalary: 18_000_000,
    targetBonus: 5_000_000,
    employmentType: "fulltime",
    skills: [{ name: "Packaging", score: 82 }],
  },
  {
    id: "emp_032",
    code: "HACO-032",
    fullName: "Phan Hữu Nam",
    email: "nam.phan@hacofood.vn",
    phone: "0903 444 032",
    avatarInitials: "PN",
    position: "Đầu bếp chính",
    level: "Senior",
    departmentId: "dept_prod",
    managerId: "emp_030",
    joinDate: "2021-05-15",
    status: "active",
    baseSalary: 16_000_000,
    targetBonus: 4_000_000,
    employmentType: "fulltime",
    skills: [{ name: "Culinary", score: 86 }],
  },
  // --- R&D & QA ---
  {
    id: "emp_005",
    code: "HACO-005",
    fullName: "Đoàn Khánh Linh",
    email: "linh.doan@hacofood.vn",
    phone: "0903 555 001",
    avatarInitials: "ĐL",
    position: "Trưởng phòng R&D & QA",
    level: "Head",
    departmentId: "dept_rnd_qa",
    managerId: "emp_001",
    joinDate: "2020-08-15",
    status: "active",
    baseSalary: 38_000_000,
    targetBonus: 14_000_000,
    employmentType: "fulltime",
    skills: [
      { name: "Food Science", score: 92 },
      { name: "HACCP / ISO 22000", score: 95 },
      { name: "Sensory Evaluation", score: 88 },
    ],
  },
  {
    id: "emp_040",
    code: "HACO-040",
    fullName: "Lý Phương Quỳnh",
    email: "quynh.ly@hacofood.vn",
    phone: "0903 555 040",
    avatarInitials: "LQ",
    position: "QA Specialist",
    level: "Senior",
    departmentId: "dept_rnd_qa",
    managerId: "emp_005",
    joinDate: "2021-12-01",
    status: "active",
    baseSalary: 18_000_000,
    targetBonus: 5_000_000,
    employmentType: "fulltime",
    skills: [{ name: "QC Testing", score: 86 }],
  },
  {
    id: "emp_041",
    code: "HACO-041",
    fullName: "Trịnh Hoàng Sơn",
    email: "son.trinh@hacofood.vn",
    phone: "0903 555 041",
    avatarInitials: "TS",
    position: "R&D Chef",
    level: "Senior",
    departmentId: "dept_rnd_qa",
    managerId: "emp_005",
    joinDate: "2022-02-14",
    status: "active",
    baseSalary: 22_000_000,
    targetBonus: 6_000_000,
    employmentType: "fulltime",
    skills: [{ name: "Recipe Development", score: 90 }],
  },
  // --- Mua hàng & Logistics ---
  {
    id: "emp_006",
    code: "HACO-006",
    fullName: "Lương Tấn Phát",
    email: "phat.luong@hacofood.vn",
    phone: "0903 666 001",
    avatarInitials: "LP",
    position: "Trưởng phòng Mua hàng & Logistics",
    level: "Head",
    departmentId: "dept_supply",
    managerId: "emp_001",
    joinDate: "2020-02-10",
    status: "active",
    baseSalary: 36_000_000,
    targetBonus: 14_000_000,
    employmentType: "fulltime",
    skills: [
      { name: "Procurement", score: 90 },
      { name: "Supplier Management", score: 88 },
      { name: "Warehousing", score: 84 },
    ],
  },
  {
    id: "emp_050",
    code: "HACO-050",
    fullName: "Cao Thanh Tùng",
    email: "tung.cao@hacofood.vn",
    phone: "0903 666 050",
    avatarInitials: "CT",
    position: "Quản lý Kho",
    level: "Lead",
    departmentId: "dept_supply",
    managerId: "emp_006",
    joinDate: "2021-03-22",
    status: "active",
    baseSalary: 18_000_000,
    targetBonus: 5_000_000,
    employmentType: "fulltime",
    skills: [{ name: "Warehouse Mgmt", score: 84 }],
  },
  {
    id: "emp_051",
    code: "HACO-051",
    fullName: "Mai Quỳnh Như",
    email: "nhu.mai@hacofood.vn",
    phone: "0903 666 051",
    avatarInitials: "MN",
    position: "Chuyên viên Mua hàng",
    level: "Senior",
    departmentId: "dept_supply",
    managerId: "emp_006",
    joinDate: "2022-06-01",
    status: "active",
    baseSalary: 16_000_000,
    targetBonus: 4_500_000,
    employmentType: "fulltime",
    skills: [{ name: "Sourcing", score: 82 }],
  },
  // --- HR & Tài chính (back office) ---
  {
    id: "emp_060",
    code: "HACO-060",
    fullName: "Phạm Phương Thảo",
    email: "thao.pham@hacofood.vn",
    phone: "0903 777 060",
    avatarInitials: "PT",
    position: "Trưởng phòng Nhân sự",
    level: "Lead",
    departmentId: "dept_back",
    managerId: "emp_007",
    joinDate: "2020-05-04",
    status: "active",
    baseSalary: 28_000_000,
    targetBonus: 8_000_000,
    employmentType: "fulltime",
    skills: [
      { name: "Recruiting", score: 88 },
      { name: "C&B", score: 85 },
    ],
  },
  {
    id: "emp_061",
    code: "HACO-061",
    fullName: "Ngô Bảo Châu",
    email: "chau.ngo@hacofood.vn",
    phone: "0903 777 061",
    avatarInitials: "NC",
    position: "Kế toán trưởng",
    level: "Lead",
    departmentId: "dept_back",
    managerId: "emp_007",
    joinDate: "2020-09-11",
    status: "active",
    baseSalary: 28_000_000,
    targetBonus: 8_000_000,
    employmentType: "fulltime",
    skills: [
      { name: "Financial Reporting", score: 90 },
      { name: "Tax", score: 86 },
    ],
  },
  {
    id: "emp_062",
    code: "HACO-062",
    fullName: "Đinh Hoài Nam",
    email: "nam.dinh@hacofood.vn",
    phone: "0903 777 062",
    avatarInitials: "ĐN",
    position: "HR Generalist",
    level: "Senior",
    departmentId: "dept_back",
    managerId: "emp_060",
    joinDate: "2022-01-17",
    status: "active",
    baseSalary: 16_000_000,
    targetBonus: 4_000_000,
    employmentType: "fulltime",
    skills: [{ name: "HR Operations", score: 80 }],
  },
];

export const EMP_BY_ID: Record<string, Employee> = Object.fromEntries(
  EMPLOYEES.map((e) => [e.id, e])
);

// =============================================================================
// KPI CATALOG — Cây KPI 4 tầng (company → dept → team → cá nhân)
// =============================================================================

export type KpiLevel = "company" | "department" | "team" | "employee";
export type KpiUnit = "VND" | "%" | "ngày" | "đơn" | "kg" | "người" | "điểm" | "lần";
export type KpiDirection = "increase" | "decrease"; // tăng tốt hay giảm tốt
export type KpiFrequency = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

export type Kpi = {
  id: string;
  code: string;             // mã ngắn để hiển thị/badge
  name: string;
  description: string;
  level: KpiLevel;
  parentId: string | null;
  ownerEmployeeId: string;
  ownerDepartmentId: DeptId;
  unit: KpiUnit;
  direction: KpiDirection;
  weight: number;           // 0..1 — trọng số đóng góp lên cha
  frequency: KpiFrequency;
  target: number;           // mục tiêu kỳ hiện tại
  actual: number;           // thực tế kỳ hiện tại
  dataSource: string;       // ai/đâu cập nhật số
};

/**
 * Cấu trúc cây:
 *  kpi_np (Net Profit, công ty)
 *   ├─ kpi_rev (Revenue tổng)
 *   │   ├─ kpi_rev_b2b      (Sales · HORECA)
 *   │   ├─ kpi_rev_b2c      (Sales · Online)
 *   │   ├─ kpi_rev_show     (Sales · Showroom)
 *   │   └─ kpi_mkt_leads    (MKT · Leads)  ──> feeder cho conversion
 *   ├─ kpi_cogs (COGS)
 *   │   ├─ kpi_food_cost    (Sản xuất)
 *   │   ├─ kpi_wastage      (Sản xuất)
 *   │   └─ kpi_supplier_cost (Mua hàng)
 *   └─ kpi_opex (OpEx)
 *       ├─ kpi_mkt_spend
 *       ├─ kpi_payroll
 *       └─ kpi_logistics_cost
 */
export const KPIS: Kpi[] = [
  // ===== ROOT — Công ty =====
  {
    id: "kpi_np",
    code: "NP",
    name: "Lợi nhuận ròng (Net Profit)",
    description: "Lợi nhuận sau thuế của công ty trong kỳ.",
    level: "company",
    parentId: null,
    ownerEmployeeId: "emp_001",
    ownerDepartmentId: "dept_exec",
    unit: "VND",
    direction: "increase",
    weight: 1,
    frequency: "monthly",
    target: 1_200_000_000,
    actual: 860_000_000,
    dataSource: "Bảng kết quả kinh doanh — kế toán đối soát",
  },
  // ===== Tầng 2 — Doanh thu / COGS / OpEx =====
  {
    id: "kpi_rev",
    code: "REV",
    name: "Tổng doanh thu",
    description: "Tổng doanh thu thuần từ 3 kênh: HORECA + Online + Showroom.",
    level: "company",
    parentId: "kpi_np",
    ownerEmployeeId: "emp_002",
    ownerDepartmentId: "dept_sales",
    unit: "VND",
    direction: "increase",
    weight: 0.55,
    frequency: "monthly",
    target: 5_000_000_000,
    actual: 5_200_000_000,
    dataSource: "Tổng hợp 3 KPI doanh thu kênh con",
  },
  {
    id: "kpi_cogs",
    code: "COGS",
    name: "Giá vốn hàng bán",
    description: "Chi phí nguyên vật liệu + bao bì + nhân công sản xuất trực tiếp.",
    level: "company",
    parentId: "kpi_np",
    ownerEmployeeId: "emp_004",
    ownerDepartmentId: "dept_prod",
    unit: "VND",
    direction: "decrease",
    weight: 0.25,
    frequency: "monthly",
    target: 2_500_000_000,
    actual: 2_400_000_000, // tốt hơn target → đỡ ăn vào lợi nhuận
    dataSource: "Tổng hợp Food Cost + Wastage + Supplier Cost",
  },
  {
    id: "kpi_opex",
    code: "OPEX",
    name: "Chi phí vận hành",
    description: "Marketing + lương + logistics + thuê mặt bằng + khác.",
    level: "company",
    parentId: "kpi_np",
    ownerEmployeeId: "emp_007",
    ownerDepartmentId: "dept_back",
    unit: "VND",
    direction: "decrease",
    weight: 0.2,
    frequency: "monthly",
    target: 1_300_000_000,
    actual: 1_375_000_000, // vượt 5.8%
    dataSource: "Sổ chi tiết tài khoản 641-642",
  },

  // ===== Tầng 3 — Doanh thu theo kênh (Sales) =====
  {
    id: "kpi_rev_b2b",
    code: "REV.B2B",
    name: "Doanh thu HORECA (B2B)",
    description: "Bán cho nhà hàng, khách sạn, chuỗi quán ăn.",
    level: "department",
    parentId: "kpi_rev",
    ownerEmployeeId: "emp_010",
    ownerDepartmentId: "dept_sales",
    unit: "VND",
    direction: "increase",
    weight: 0.5,
    frequency: "monthly",
    target: 2_500_000_000,
    actual: 2_650_000_000,
    dataSource: "Hệ thống CRM Sales B2B",
  },
  {
    id: "kpi_rev_b2c",
    code: "REV.B2C",
    name: "Doanh thu Online (B2C)",
    description: "Sàn TMĐT (Shopee/Lazada/Tiki) + website + livestream.",
    level: "department",
    parentId: "kpi_rev",
    ownerEmployeeId: "emp_011",
    ownerDepartmentId: "dept_sales",
    unit: "VND",
    direction: "increase",
    weight: 0.3,
    frequency: "monthly",
    target: 1_500_000_000,
    actual: 1_620_000_000,
    dataSource: "Tổng hợp đơn hàng từ các sàn",
  },
  {
    id: "kpi_rev_show",
    code: "REV.SHOW",
    name: "Doanh thu Showroom",
    description: "Bán trực tiếp tại 2 cửa hàng showroom.",
    level: "department",
    parentId: "kpi_rev",
    ownerEmployeeId: "emp_002",
    ownerDepartmentId: "dept_sales",
    unit: "VND",
    direction: "increase",
    weight: 0.2,
    frequency: "monthly",
    target: 1_000_000_000,
    actual: 930_000_000,
    dataSource: "POS Showroom",
  },

  // ===== Tầng 3 — Marketing feeders =====
  {
    id: "kpi_mkt_leads",
    code: "MKT.LEADS",
    name: "Số Lead Marketing",
    description: "Số lead mới do MKT tạo ra (ads + content + referral).",
    level: "department",
    parentId: "kpi_rev",
    ownerEmployeeId: "emp_003",
    ownerDepartmentId: "dept_mkt",
    unit: "đơn",
    direction: "increase",
    weight: 0,        // không cộng tiền trực tiếp, là feeder
    frequency: "monthly",
    target: 2_200,
    actual: 2_480,
    dataSource: "CRM + GA4",
  },
  {
    id: "kpi_mkt_cpl",
    code: "MKT.CPL",
    name: "Chi phí / Lead (CPL)",
    description: "Tổng MKT spend chia số lead.",
    level: "department",
    parentId: "kpi_mkt_leads",
    ownerEmployeeId: "emp_020",
    ownerDepartmentId: "dept_mkt",
    unit: "VND",
    direction: "decrease",
    weight: 0,
    frequency: "monthly",
    target: 48_000,
    actual: 52_000, // vượt ngưỡng
    dataSource: "Meta + Google Ads / Số lead",
  },
  {
    id: "kpi_mkt_roas",
    code: "MKT.ROAS",
    name: "ROAS (Return on Ad Spend)",
    description: "Doanh thu attributable / chi phí quảng cáo.",
    level: "department",
    parentId: "kpi_mkt_leads",
    ownerEmployeeId: "emp_020",
    ownerDepartmentId: "dept_mkt",
    unit: "lần",
    direction: "increase",
    weight: 0,
    frequency: "monthly",
    target: 4.5,
    actual: 4.8,
    dataSource: "GA4 + Meta Pixel",
  },
  {
    id: "kpi_mkt_qual",
    code: "MKT.QUAL",
    name: "Qualified Leads",
    description: "Lead được Sales xác nhận đủ tiêu chuẩn.",
    level: "department",
    parentId: "kpi_mkt_leads",
    ownerEmployeeId: "emp_021",
    ownerDepartmentId: "dept_mkt",
    unit: "đơn",
    direction: "increase",
    weight: 0,
    frequency: "monthly",
    target: 900,
    actual: 855,
    dataSource: "Sales CRM marking",
  },

  // ===== Tầng 3 — Sản xuất (COGS feeders) =====
  {
    id: "kpi_food_cost",
    code: "PROD.FCOST",
    name: "Food Cost %",
    description: "Tỷ lệ giá vốn nguyên liệu trên doanh thu sản xuất.",
    level: "department",
    parentId: "kpi_cogs",
    ownerEmployeeId: "emp_004",
    ownerDepartmentId: "dept_prod",
    unit: "%",
    direction: "decrease",
    weight: 0.5,
    frequency: "monthly",
    target: 38,
    actual: 36.5,
    dataSource: "BOM × thực xuất kho",
  },
  {
    id: "kpi_wastage",
    code: "PROD.WASTE",
    name: "Wastage %",
    description: "Tỷ lệ hao hụt nguyên liệu trong chế biến.",
    level: "department",
    parentId: "kpi_cogs",
    ownerEmployeeId: "emp_030",
    ownerDepartmentId: "dept_prod",
    unit: "%",
    direction: "decrease",
    weight: 0.2,
    frequency: "weekly",
    target: 2.5,
    actual: 3.1, // vượt ngưỡng → cảnh báo
    dataSource: "Cân thực tế cuối ca",
  },
  {
    id: "kpi_oee",
    code: "PROD.OEE",
    name: "OEE Bếp",
    description: "Hiệu suất tổng hợp thiết bị bếp (Availability × Performance × Quality).",
    level: "department",
    parentId: "kpi_food_cost",
    ownerEmployeeId: "emp_004",
    ownerDepartmentId: "dept_prod",
    unit: "%",
    direction: "increase",
    weight: 0,
    frequency: "monthly",
    target: 80,
    actual: 78.5,
    dataSource: "MES bếp",
  },
  {
    id: "kpi_haccp",
    code: "PROD.HACCP",
    name: "Điểm tuân thủ HACCP/5S",
    description: "Điểm audit nội bộ vệ sinh an toàn thực phẩm.",
    level: "department",
    parentId: "kpi_food_cost",
    ownerEmployeeId: "emp_005",
    ownerDepartmentId: "dept_rnd_qa",
    unit: "điểm",
    direction: "increase",
    weight: 0,
    frequency: "monthly",
    target: 95,
    actual: 92,
    dataSource: "Checklist QA hàng tuần",
  },

  // ===== Tầng 3 — Mua hàng / Supply Chain =====
  {
    id: "kpi_supplier_cost",
    code: "SCM.SAVE",
    name: "Tiết kiệm chi phí NCC",
    description: "Tiết kiệm so với giá baseline đầu năm.",
    level: "department",
    parentId: "kpi_cogs",
    ownerEmployeeId: "emp_006",
    ownerDepartmentId: "dept_supply",
    unit: "%",
    direction: "increase",
    weight: 0.3,
    frequency: "monthly",
    target: 4,
    actual: 5.2,
    dataSource: "Báo giá NCC vs baseline",
  },
  {
    id: "kpi_otif",
    code: "SCM.OTIF",
    name: "Supplier OTIF %",
    description: "Tỷ lệ NCC giao hàng đúng hạn & đủ số lượng.",
    level: "department",
    parentId: "kpi_supplier_cost",
    ownerEmployeeId: "emp_051",
    ownerDepartmentId: "dept_supply",
    unit: "%",
    direction: "increase",
    weight: 0,
    frequency: "monthly",
    target: 95,
    actual: 91,
    dataSource: "Sổ nhận hàng kho",
  },
  {
    id: "kpi_inv_turn",
    code: "SCM.TURN",
    name: "Vòng quay tồn kho",
    description: "Số lần xoay tồn kho nguyên liệu trong tháng.",
    level: "department",
    parentId: "kpi_supplier_cost",
    ownerEmployeeId: "emp_050",
    ownerDepartmentId: "dept_supply",
    unit: "lần",
    direction: "increase",
    weight: 0,
    frequency: "monthly",
    target: 8,
    actual: 7.4,
    dataSource: "WMS",
  },

  // ===== Tầng 3 — OpEx feeders =====
  {
    id: "kpi_mkt_spend",
    code: "OPEX.MKT",
    name: "Chi phí Marketing",
    description: "Tổng chi MKT (ads + content + agency + công cụ).",
    level: "department",
    parentId: "kpi_opex",
    ownerEmployeeId: "emp_003",
    ownerDepartmentId: "dept_mkt",
    unit: "VND",
    direction: "decrease",
    weight: 0.35,
    frequency: "monthly",
    target: 320_000_000,
    actual: 348_000_000,
    dataSource: "Sổ chi MKT + Ads Manager",
  },
  {
    id: "kpi_payroll_cost",
    code: "OPEX.PAY",
    name: "Quỹ lương",
    description: "Tổng chi lương + thưởng + BHXH.",
    level: "department",
    parentId: "kpi_opex",
    ownerEmployeeId: "emp_007",
    ownerDepartmentId: "dept_back",
    unit: "VND",
    direction: "decrease",
    weight: 0.45,
    frequency: "monthly",
    target: 720_000_000,
    actual: 705_000_000,
    dataSource: "Bảng lương payroll engine",
  },
  {
    id: "kpi_logistics_cost",
    code: "OPEX.LOG",
    name: "Chi phí Logistics",
    description: "Phí vận chuyển nội + ngoại + đối tác giao hàng.",
    level: "department",
    parentId: "kpi_opex",
    ownerEmployeeId: "emp_006",
    ownerDepartmentId: "dept_supply",
    unit: "VND",
    direction: "decrease",
    weight: 0.2,
    frequency: "monthly",
    target: 180_000_000,
    actual: 175_000_000,
    dataSource: "Hóa đơn 3PL",
  },

  // ===== Sales conversion KPIs =====
  {
    id: "kpi_close_rate",
    code: "SAL.CLOSE",
    name: "Tỷ lệ chốt đơn B2B",
    description: "Số deal won / tổng opportunity.",
    level: "department",
    parentId: "kpi_rev_b2b",
    ownerEmployeeId: "emp_010",
    ownerDepartmentId: "dept_sales",
    unit: "%",
    direction: "increase",
    weight: 0,
    frequency: "monthly",
    target: 28,
    actual: 24, // dưới target → đỏ
    dataSource: "CRM",
  },
  {
    id: "kpi_aov",
    code: "SAL.AOV",
    name: "Giá trị đơn TB (AOV)",
    description: "Doanh thu / số đơn hàng.",
    level: "department",
    parentId: "kpi_rev_b2c",
    ownerEmployeeId: "emp_011",
    ownerDepartmentId: "dept_sales",
    unit: "VND",
    direction: "increase",
    weight: 0,
    frequency: "monthly",
    target: 480_000,
    actual: 512_000,
    dataSource: "TMĐT export",
  },
  {
    id: "kpi_repurchase",
    code: "SAL.REPEAT",
    name: "Repurchase Rate (90 ngày)",
    description: "Tỷ lệ KH mua lại trong 90 ngày.",
    level: "department",
    parentId: "kpi_rev_b2c",
    ownerEmployeeId: "emp_013",
    ownerDepartmentId: "dept_sales",
    unit: "%",
    direction: "increase",
    weight: 0,
    frequency: "monthly",
    target: 35,
    actual: 38,
    dataSource: "Customer DB",
  },

  // ===== R&D / People KPIs =====
  {
    id: "kpi_new_sku",
    code: "RND.SKU",
    name: "SKU mới ra mắt / quý",
    description: "Số sản phẩm mới đưa ra thị trường mỗi quý.",
    level: "department",
    parentId: null,
    ownerEmployeeId: "emp_005",
    ownerDepartmentId: "dept_rnd_qa",
    unit: "đơn",
    direction: "increase",
    weight: 0,
    frequency: "quarterly",
    target: 4,
    actual: 3,
    dataSource: "Roadmap R&D",
  },
  {
    id: "kpi_defect_rate",
    code: "QA.DEFECT",
    name: "Tỷ lệ lỗi (Defect rate)",
    description: "Số lô bị trả/hỏng / tổng lô.",
    level: "department",
    parentId: null,
    ownerEmployeeId: "emp_040",
    ownerDepartmentId: "dept_rnd_qa",
    unit: "%",
    direction: "decrease",
    weight: 0,
    frequency: "monthly",
    target: 0.5,
    actual: 0.7,
    dataSource: "QC log",
  },
  {
    id: "kpi_turnover_rate",
    code: "HR.TURN",
    name: "Turnover Rate",
    description: "Tỷ lệ nghỉ việc / headcount tháng.",
    level: "department",
    parentId: null,
    ownerEmployeeId: "emp_060",
    ownerDepartmentId: "dept_back",
    unit: "%",
    direction: "decrease",
    weight: 0,
    frequency: "monthly",
    target: 3,
    actual: 2.4,
    dataSource: "HR system",
  },
  {
    id: "kpi_enps",
    code: "HR.ENPS",
    name: "Employee NPS",
    description: "Khảo sát mức độ giới thiệu nơi làm việc.",
    level: "department",
    parentId: null,
    ownerEmployeeId: "emp_060",
    ownerDepartmentId: "dept_back",
    unit: "điểm",
    direction: "increase",
    weight: 0,
    frequency: "quarterly",
    target: 40,
    actual: 46,
    dataSource: "Khảo sát Q",
  },
  {
    id: "kpi_dso",
    code: "FIN.DSO",
    name: "Days Sales Outstanding",
    description: "Số ngày bình quân thu hồi công nợ.",
    level: "department",
    parentId: null,
    ownerEmployeeId: "emp_061",
    ownerDepartmentId: "dept_back",
    unit: "ngày",
    direction: "decrease",
    weight: 0,
    frequency: "monthly",
    target: 30,
    actual: 34,
    dataSource: "Sổ công nợ",
  },
];

export const KPI_BY_ID: Record<string, Kpi> = Object.fromEntries(
  KPIS.map((k) => [k.id, k])
);

// =============================================================================
// CÔNG VIỆC — task → KPI mapping
// =============================================================================

export type TaskStatus = "todo" | "in_progress" | "review" | "done" | "blocked";
export type TaskPriority = "low" | "normal" | "high" | "urgent";
export type TaskType = "growth" | "maintenance" | "admin" | "urgent";

export type Task = {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  reviewerId: string | null;
  departmentId: DeptId;
  projectId: string | null;
  linkedKpiId: string | null;   // task này phục vụ KPI nào → cốt lõi cascade
  priority: TaskPriority;
  taskType: TaskType;
  status: TaskStatus;
  dueDate: string;              // ISO
  createdAt: string;
  estimatedHours: number;
  actualHours: number;
  progress: number;             // 0..100
};

export const TASKS: Task[] = [
  // Marketing
  { id: "tsk_001", title: "Chiến dịch ads Hè 2026 — phase 2", description: "Scale chiến dịch Meta ads sau khi A/B test thắng creative B.", assigneeId: "emp_020", reviewerId: "emp_003", departmentId: "dept_mkt", projectId: "prj_summer", linkedKpiId: "kpi_mkt_leads", priority: "high", taskType: "growth", status: "in_progress", dueDate: "2026-05-20", createdAt: "2026-05-02", estimatedHours: 40, actualHours: 28, progress: 70 },
  { id: "tsk_002", title: "Tối ưu landing page SKU mới Cá kho làng Vũ Đại", description: "Giảm CPL <48k, tăng conversion lên 4.5%.", assigneeId: "emp_021", reviewerId: "emp_003", departmentId: "dept_mkt", projectId: "prj_summer", linkedKpiId: "kpi_mkt_cpl", priority: "high", taskType: "growth", status: "in_progress", dueDate: "2026-05-15", createdAt: "2026-05-01", estimatedHours: 24, actualHours: 18, progress: 75 },
  { id: "tsk_003", title: "Sản xuất 12 video TikTok review món", description: "Loạt content reels short cho B2C Online.", assigneeId: "emp_022", reviewerId: "emp_003", departmentId: "dept_mkt", projectId: null, linkedKpiId: "kpi_mkt_qual", priority: "normal", taskType: "growth", status: "todo", dueDate: "2026-05-25", createdAt: "2026-05-08", estimatedHours: 30, actualHours: 0, progress: 0 },
  { id: "tsk_004", title: "Báo cáo MKT funnel tháng 4", description: "Tổng hợp toàn funnel cho CEO meeting.", assigneeId: "emp_021", reviewerId: "emp_003", departmentId: "dept_mkt", projectId: null, linkedKpiId: null, priority: "low", taskType: "admin", status: "done", dueDate: "2026-05-05", createdAt: "2026-05-01", estimatedHours: 6, actualHours: 5, progress: 100 },

  // Sales
  { id: "tsk_010", title: "Đàm phán hợp đồng chuỗi Coffee House (Q3)", description: "Mở rộng cung cấp 18 món sốt cho 145 cửa hàng.", assigneeId: "emp_010", reviewerId: "emp_002", departmentId: "dept_sales", projectId: "prj_horeca_x", linkedKpiId: "kpi_rev_b2b", priority: "urgent", taskType: "growth", status: "in_progress", dueDate: "2026-05-18", createdAt: "2026-04-22", estimatedHours: 50, actualHours: 36, progress: 60 },
  { id: "tsk_011", title: "Đào tạo 6 sales mới về quy trình HORECA", description: "Onboarding batch tháng 5.", assigneeId: "emp_002", reviewerId: null, departmentId: "dept_sales", projectId: null, linkedKpiId: "kpi_close_rate", priority: "high", taskType: "maintenance", status: "in_progress", dueDate: "2026-05-22", createdAt: "2026-05-05", estimatedHours: 20, actualHours: 12, progress: 55 },
  { id: "tsk_012", title: "Push livestream Tiktok 3 phiên/tuần", description: "Lên lịch livestream cố định tăng B2C.", assigneeId: "emp_011", reviewerId: "emp_002", departmentId: "dept_sales", projectId: null, linkedKpiId: "kpi_rev_b2c", priority: "high", taskType: "growth", status: "in_progress", dueDate: "2026-05-31", createdAt: "2026-05-01", estimatedHours: 60, actualHours: 22, progress: 35 },
  { id: "tsk_013", title: "Khảo sát 50 khách Showroom Q1", description: "Lấy NPS và ý kiến mở rộng menu.", assigneeId: "emp_013", reviewerId: "emp_002", departmentId: "dept_sales", projectId: null, linkedKpiId: "kpi_repurchase", priority: "normal", taskType: "maintenance", status: "review", dueDate: "2026-05-12", createdAt: "2026-04-25", estimatedHours: 16, actualHours: 14, progress: 90 },
  { id: "tsk_014", title: "Pitch 3 chuỗi nhà hàng mới ở Hà Nội", description: "Mở rộng thị trường phía Bắc.", assigneeId: "emp_012", reviewerId: "emp_010", departmentId: "dept_sales", projectId: "prj_horeca_x", linkedKpiId: "kpi_rev_b2b", priority: "high", taskType: "growth", status: "todo", dueDate: "2026-05-28", createdAt: "2026-05-09", estimatedHours: 30, actualHours: 0, progress: 0 },

  // Sản xuất
  { id: "tsk_020", title: "Giảm wastage rau củ khu sơ chế", description: "Áp dụng SOP bảo quản mới + nhiệt độ kho.", assigneeId: "emp_030", reviewerId: "emp_004", departmentId: "dept_prod", projectId: "prj_lean_kitchen", linkedKpiId: "kpi_wastage", priority: "urgent", taskType: "growth", status: "in_progress", dueDate: "2026-05-17", createdAt: "2026-04-28", estimatedHours: 24, actualHours: 16, progress: 65 },
  { id: "tsk_021", title: "Cập nhật BOM 8 SKU mới quý 2", description: "Đồng bộ BOM với hệ thống kế toán.", assigneeId: "emp_004", reviewerId: "emp_005", departmentId: "dept_prod", projectId: null, linkedKpiId: "kpi_food_cost", priority: "high", taskType: "maintenance", status: "in_progress", dueDate: "2026-05-20", createdAt: "2026-05-04", estimatedHours: 20, actualHours: 12, progress: 60 },
  { id: "tsk_022", title: "Bảo trì lò chiên công suất lớn", description: "Theo lịch bảo trì định kỳ.", assigneeId: "emp_031", reviewerId: "emp_004", departmentId: "dept_prod", projectId: null, linkedKpiId: "kpi_oee", priority: "normal", taskType: "maintenance", status: "todo", dueDate: "2026-05-26", createdAt: "2026-05-08", estimatedHours: 6, actualHours: 0, progress: 0 },
  { id: "tsk_023", title: "Đào tạo HACCP cho 18 nhân viên bếp", description: "Sau audit nội bộ tháng 4 — yếu mục lưu kho.", assigneeId: "emp_004", reviewerId: "emp_005", departmentId: "dept_prod", projectId: null, linkedKpiId: "kpi_haccp", priority: "high", taskType: "maintenance", status: "in_progress", dueDate: "2026-05-24", createdAt: "2026-05-02", estimatedHours: 16, actualHours: 8, progress: 50 },
  { id: "tsk_024", title: "Tối ưu line đóng gói khay nhỏ", description: "Đạt 480 khay/giờ thay vì 410.", assigneeId: "emp_031", reviewerId: "emp_004", departmentId: "dept_prod", projectId: "prj_lean_kitchen", linkedKpiId: "kpi_oee", priority: "normal", taskType: "growth", status: "blocked", dueDate: "2026-05-19", createdAt: "2026-05-05", estimatedHours: 18, actualHours: 6, progress: 30 },

  // R&D & QA
  { id: "tsk_030", title: "Phát triển 4 SKU sốt chấm cao cấp", description: "Roadmap Q2 — ra mắt tháng 6.", assigneeId: "emp_041", reviewerId: "emp_005", departmentId: "dept_rnd_qa", projectId: "prj_premium_sauce", linkedKpiId: "kpi_new_sku", priority: "high", taskType: "growth", status: "in_progress", dueDate: "2026-05-30", createdAt: "2026-04-12", estimatedHours: 80, actualHours: 52, progress: 65 },
  { id: "tsk_031", title: "Audit chất lượng định kỳ tháng 5", description: "Audit toàn bộ 12 line + kho lạnh.", assigneeId: "emp_040", reviewerId: "emp_005", departmentId: "dept_rnd_qa", projectId: null, linkedKpiId: "kpi_defect_rate", priority: "high", taskType: "maintenance", status: "todo", dueDate: "2026-05-25", createdAt: "2026-05-08", estimatedHours: 24, actualHours: 0, progress: 0 },
  { id: "tsk_032", title: "Test panel cảm quan SKU sốt me", description: "20 panellist nội bộ + 30 khách hàng B2C.", assigneeId: "emp_041", reviewerId: "emp_005", departmentId: "dept_rnd_qa", projectId: "prj_premium_sauce", linkedKpiId: "kpi_new_sku", priority: "normal", taskType: "growth", status: "review", dueDate: "2026-05-14", createdAt: "2026-04-30", estimatedHours: 12, actualHours: 12, progress: 95 },

  // Mua hàng & Logistics
  { id: "tsk_040", title: "Đàm phán giảm giá NCC nguyên liệu chính", description: "3 NCC top — mục tiêu giảm 4-6%.", assigneeId: "emp_051", reviewerId: "emp_006", departmentId: "dept_supply", projectId: null, linkedKpiId: "kpi_supplier_cost", priority: "high", taskType: "growth", status: "in_progress", dueDate: "2026-05-16", createdAt: "2026-04-25", estimatedHours: 30, actualHours: 22, progress: 75 },
  { id: "tsk_041", title: "Triển khai WMS phase 2 (kho lạnh)", description: "Tích hợp barcode kho lạnh.", assigneeId: "emp_050", reviewerId: "emp_006", departmentId: "dept_supply", projectId: "prj_wms", linkedKpiId: "kpi_inv_turn", priority: "high", taskType: "growth", status: "in_progress", dueDate: "2026-05-31", createdAt: "2026-04-15", estimatedHours: 60, actualHours: 28, progress: 45 },
  { id: "tsk_042", title: "Kiểm kê tồn cuối tháng", description: "Đối soát kho thực vs kế toán.", assigneeId: "emp_050", reviewerId: "emp_006", departmentId: "dept_supply", projectId: null, linkedKpiId: null, priority: "normal", taskType: "admin", status: "todo", dueDate: "2026-05-31", createdAt: "2026-05-01", estimatedHours: 16, actualHours: 0, progress: 0 },
  { id: "tsk_043", title: "Tìm thêm 2 NCC backup cho cá fillet", description: "OTIF NCC chính giảm còn 91%.", assigneeId: "emp_051", reviewerId: "emp_006", departmentId: "dept_supply", projectId: null, linkedKpiId: "kpi_otif", priority: "urgent", taskType: "urgent", status: "in_progress", dueDate: "2026-05-15", createdAt: "2026-05-06", estimatedHours: 14, actualHours: 8, progress: 55 },

  // HR & Finance
  { id: "tsk_050", title: "Tuyển 2 sales B2B HORECA cho Hà Nội", description: "Mở văn phòng đại diện phía Bắc.", assigneeId: "emp_062", reviewerId: "emp_060", departmentId: "dept_back", projectId: null, linkedKpiId: null, priority: "high", taskType: "growth", status: "in_progress", dueDate: "2026-05-30", createdAt: "2026-05-01", estimatedHours: 40, actualHours: 16, progress: 40 },
  { id: "tsk_051", title: "Chạy payroll tháng 5", description: "Hoàn tất bảng lương + chốt KPI bonus.", assigneeId: "emp_060", reviewerId: "emp_007", departmentId: "dept_back", projectId: null, linkedKpiId: "kpi_payroll_cost", priority: "urgent", taskType: "admin", status: "todo", dueDate: "2026-05-28", createdAt: "2026-05-10", estimatedHours: 12, actualHours: 0, progress: 0 },
  { id: "tsk_052", title: "Đối soát công nợ KH Q1", description: "Gửi reminder 18 KH đang quá hạn 30+ ngày.", assigneeId: "emp_061", reviewerId: "emp_007", departmentId: "dept_back", projectId: null, linkedKpiId: "kpi_dso", priority: "urgent", taskType: "urgent", status: "in_progress", dueDate: "2026-05-15", createdAt: "2026-05-04", estimatedHours: 16, actualHours: 10, progress: 60 },
  { id: "tsk_053", title: "Khảo sát eNPS Q2", description: "Triển khai survey toàn công ty.", assigneeId: "emp_060", reviewerId: "emp_007", departmentId: "dept_back", projectId: null, linkedKpiId: "kpi_enps", priority: "normal", taskType: "maintenance", status: "todo", dueDate: "2026-06-15", createdAt: "2026-05-09", estimatedHours: 8, actualHours: 0, progress: 0 },
];

// =============================================================================
// DỰ ÁN — initiative & ROI
// =============================================================================

export type ProjectStatus = "planning" | "active" | "paused" | "done" | "cancelled";

export type Project = {
  id: string;
  code: string;
  name: string;
  ownerId: string;
  departmentId: DeptId;
  businessCase: string;
  linkedKpiId: string | null;
  status: ProjectStatus;
  startsAt: string;
  endsAt: string;
  budget: number;
  spent: number;
  progress: number;
};

export const PROJECTS: Project[] = [
  { id: "prj_summer", code: "MKT-2026-S", name: "Chiến dịch Hè 2026 — Bữa ăn gia đình", ownerId: "emp_003", departmentId: "dept_mkt", businessCase: "Đẩy doanh thu B2C +25% mùa hè + xây brand love.", linkedKpiId: "kpi_rev_b2c", status: "active", startsAt: "2026-04-15", endsAt: "2026-08-15", budget: 480_000_000, spent: 188_000_000, progress: 42 },
  { id: "prj_horeca_x", code: "SALES-HX", name: "HORECA Expansion — Bắc & Trung", ownerId: "emp_002", departmentId: "dept_sales", businessCase: "Mở 25 khách HORECA mới ở Hà Nội + Đà Nẵng trong 6 tháng.", linkedKpiId: "kpi_rev_b2b", status: "active", startsAt: "2026-03-01", endsAt: "2026-09-30", budget: 350_000_000, spent: 142_000_000, progress: 38 },
  { id: "prj_lean_kitchen", code: "PROD-LK", name: "Lean Kitchen — Giảm wastage 30%", ownerId: "emp_004", departmentId: "dept_prod", businessCase: "Tiết kiệm ~180tr/tháng nguyên liệu nhờ giảm hao hụt + tối ưu line.", linkedKpiId: "kpi_wastage", status: "active", startsAt: "2026-02-15", endsAt: "2026-07-15", budget: 220_000_000, spent: 95_000_000, progress: 55 },
  { id: "prj_premium_sauce", code: "RND-PS", name: "Dòng sốt cao cấp Bếp Cô Hạ Premium", ownerId: "emp_005", departmentId: "dept_rnd_qa", businessCase: "Ra mắt 4 SKU sốt cao cấp, biên gross 55%+.", linkedKpiId: "kpi_new_sku", status: "active", startsAt: "2026-01-10", endsAt: "2026-06-30", budget: 280_000_000, spent: 168_000_000, progress: 65 },
  { id: "prj_wms", code: "SCM-WMS", name: "WMS Phase 2 — Kho lạnh", ownerId: "emp_006", departmentId: "dept_supply", businessCase: "Quản lý lot/expiry kho lạnh, giảm hỏng hàng 50%.", linkedKpiId: "kpi_inv_turn", status: "active", startsAt: "2026-03-15", endsAt: "2026-06-15", budget: 320_000_000, spent: 145_000_000, progress: 48 },
  { id: "prj_north_office", code: "EXEC-NO", name: "Văn phòng & kho phía Bắc", ownerId: "emp_001", departmentId: "dept_exec", businessCase: "Đặt cứ điểm Hà Nội phục vụ HORECA + B2C miền Bắc.", linkedKpiId: "kpi_rev_b2b", status: "planning", startsAt: "2026-06-01", endsAt: "2026-12-31", budget: 1_200_000_000, spent: 35_000_000, progress: 8 },
];

// =============================================================================
// TÀI CHÍNH — P&L 6 tháng + Cash flow + Balance sheet snapshot
// =============================================================================

export const FINANCE_HISTORY = [
  { period: "2025-12", revenue: 4_200_000_000, cogs: 1_950_000_000, opex: 1_180_000_000, profit: 720_000_000, cashIn: 4_350_000_000, cashOut: 3_980_000_000 },
  { period: "2026-01", revenue: 4_500_000_000, cogs: 2_080_000_000, opex: 1_220_000_000, profit: 820_000_000, cashIn: 4_410_000_000, cashOut: 4_020_000_000 },
  { period: "2026-02", revenue: 4_800_000_000, cogs: 2_220_000_000, opex: 1_260_000_000, profit: 920_000_000, cashIn: 4_650_000_000, cashOut: 4_150_000_000 },
  { period: "2026-03", revenue: 5_000_000_000, cogs: 2_310_000_000, opex: 1_300_000_000, profit: 1_010_000_000, cashIn: 4_900_000_000, cashOut: 4_280_000_000 },
  { period: "2026-04", revenue: 5_100_000_000, cogs: 2_360_000_000, opex: 1_340_000_000, profit: 980_000_000, cashIn: 5_050_000_000, cashOut: 4_360_000_000 },
  { period: "2026-05", revenue: 5_200_000_000, cogs: 2_400_000_000, opex: 1_375_000_000, profit: 860_000_000, cashIn: 5_180_000_000, cashOut: 4_590_000_000 },
];

export const FINANCE_SNAPSHOT = {
  period: "2026-05",
  revenue: 5_200_000_000,
  cogs: 2_400_000_000,
  grossProfit: 2_800_000_000,
  opex: 1_375_000_000,
  ebitda: 1_425_000_000,
  tax: 285_000_000,
  netProfit: 860_000_000,
  // Balance Sheet
  cash: 2_450_000_000,
  ar: 1_840_000_000,                  // accounts receivable
  inventory: 980_000_000,
  fixedAssets: 4_200_000_000,
  ap: 720_000_000,                    // accounts payable
  shortTermDebt: 600_000_000,
  longTermDebt: 1_800_000_000,
  equity: 6_350_000_000,
};

export const COST_BREAKDOWN = [
  { name: "Nguyên liệu", value: 1_650_000_000, color: "#1b5e20" },
  { name: "Lương & BHXH", value: 705_000_000, color: "#10b981" },
  { name: "Marketing", value: 348_000_000, color: "#8b5cf6" },
  { name: "Logistics", value: 175_000_000, color: "#3b82f6" },
  { name: "Mặt bằng + tiện ích", value: 142_000_000, color: "#f59e0b" },
  { name: "Khác", value: 105_000_000, color: "#94a3b8" },
];

// Sample accounting transactions cho trang Finance
export type TxType = "income" | "expense";
export type Transaction = {
  id: string;
  date: string;
  title: string;
  departmentId: DeptId;
  type: TxType;
  amount: number;
  status: "posted" | "pending" | "rejected";
  account: string;
};

export const TRANSACTIONS: Transaction[] = [
  { id: "tx_001", date: "2026-05-09", title: "Thu tiền hợp đồng Coffee House đợt 2", departmentId: "dept_sales", type: "income", amount: 820_000_000, status: "posted", account: "1311" },
  { id: "tx_002", date: "2026-05-08", title: "Thanh toán NCC Cá Fillet Phú Quốc", departmentId: "dept_supply", type: "expense", amount: 152_000_000, status: "posted", account: "3311" },
  { id: "tx_003", date: "2026-05-08", title: "Phí ads Meta tháng 5 batch 1", departmentId: "dept_mkt", type: "expense", amount: 96_000_000, status: "posted", account: "6418" },
  { id: "tx_004", date: "2026-05-07", title: "Doanh thu Shopee tuần 1/5", departmentId: "dept_sales", type: "income", amount: 412_000_000, status: "posted", account: "5111" },
  { id: "tx_005", date: "2026-05-07", title: "Phí điện + nước nhà bếp T4", departmentId: "dept_prod", type: "expense", amount: 38_500_000, status: "posted", account: "6428" },
  { id: "tx_006", date: "2026-05-06", title: "Mua sắm thiết bị bếp lò công suất lớn", departmentId: "dept_prod", type: "expense", amount: 185_000_000, status: "pending", account: "2113" },
  { id: "tx_007", date: "2026-05-06", title: "Thu tiền showroom Q.Bình Thạnh", departmentId: "dept_sales", type: "income", amount: 215_000_000, status: "posted", account: "1111" },
  { id: "tx_008", date: "2026-05-05", title: "Chi phí logistics 3PL ATX tuần 1", departmentId: "dept_supply", type: "expense", amount: 42_000_000, status: "posted", account: "6418" },
  { id: "tx_009", date: "2026-05-05", title: "Lương ứng kỳ 1 tháng 5", departmentId: "dept_back", type: "expense", amount: 320_000_000, status: "posted", account: "3341" },
  { id: "tx_010", date: "2026-05-04", title: "Hợp đồng dịch vụ agency content", departmentId: "dept_mkt", type: "expense", amount: 48_000_000, status: "pending", account: "6428" },
];

// =============================================================================
// PAYROLL — kỳ tháng 5/2026 (sẽ được Re-compute bằng ruleEngine)
// =============================================================================

export const PAYROLL_PERIOD = {
  id: "pay_2026_05",
  period: "2026-05",
  status: "draft" as "draft" | "approved" | "paid",
  generatedAt: "2026-05-09T15:00:00+07:00",
};

export type PayrollOverride = {
  employeeId: string;
  manualKpiCompletion?: number; // override KPI completion (0..1+)
  bonusAdjustment?: number;     // VND, cộng/trừ
  penalty?: number;             // VND, trừ
  note?: string;
};

export const PAYROLL_OVERRIDES: PayrollOverride[] = [
  { employeeId: "emp_020", bonusAdjustment: 3_000_000, note: "Bonus đặc biệt — campaign Hè vượt KPI" },
  { employeeId: "emp_010", manualKpiCompletion: 1.06, note: "Đạt deal Coffee House sớm hơn dự kiến" },
];

// KPI completion thực tế từng nhân sự (sẽ dùng để chạy payroll)
export const EMPLOYEE_KPI_COMPLETION: Record<string, number> = {
  emp_001: 0.95,
  emp_002: 0.98,
  emp_003: 0.92,
  emp_004: 0.94,
  emp_005: 0.90,
  emp_006: 0.97,
  emp_007: 0.93,
  emp_010: 1.06,
  emp_011: 1.08,
  emp_012: 0.85,
  emp_013: 1.02,
  emp_020: 1.10,
  emp_021: 0.95,
  emp_022: 0.92,
  emp_030: 0.85, // wastage chưa đạt
  emp_031: 0.88,
  emp_032: 0.92,
  emp_040: 0.88,
  emp_041: 0.96,
  emp_050: 0.90,
  emp_051: 1.00,
  emp_060: 0.94,
  emp_061: 0.90,
  emp_062: 0.86,
};

// =============================================================================
// OKR — Mục tiêu chiến lược Q2/2026
// =============================================================================

export type Objective = {
  id: string;
  level: "company" | "department";
  ownerId: string;
  ownerDepartmentId: DeptId | null;
  title: string;
  description: string;
  period: string;
  progress: number;
  keyResults: { id: string; title: string; target: number; actual: number; unit: string }[];
};

export const OBJECTIVES: Objective[] = [
  {
    id: "obj_co_q2",
    level: "company",
    ownerId: "emp_001",
    ownerDepartmentId: null,
    title: "Đạt 16 tỷ doanh thu Q2/2026 với biên ròng ≥17%",
    description: "Tăng trưởng song song B2B + B2C, kiểm soát Food Cost ≤38%.",
    period: "2026-Q2",
    progress: 62,
    keyResults: [
      { id: "kr_1", title: "Doanh thu Q2 ≥ 16 tỷ", target: 16_000_000_000, actual: 10_300_000_000, unit: "VND" },
      { id: "kr_2", title: "Net Profit Margin ≥ 17%", target: 17, actual: 16.5, unit: "%" },
      { id: "kr_3", title: "Food Cost ≤ 38%", target: 38, actual: 36.5, unit: "%" },
    ],
  },
  {
    id: "obj_sales_q2",
    level: "department",
    ownerId: "emp_002",
    ownerDepartmentId: "dept_sales",
    title: "Mở rộng HORECA và scale B2C Online",
    description: "Ký 25 khách B2B mới + đẩy GMV B2C 1.6 tỷ/tháng.",
    period: "2026-Q2",
    progress: 56,
    keyResults: [
      { id: "kr_s1", title: "25 khách HORECA mới", target: 25, actual: 14, unit: "đơn" },
      { id: "kr_s2", title: "Doanh thu B2C ≥ 4.8 tỷ Q2", target: 4_800_000_000, actual: 3_220_000_000, unit: "VND" },
      { id: "kr_s3", title: "Repurchase rate ≥ 35%", target: 35, actual: 38, unit: "%" },
    ],
  },
  {
    id: "obj_prod_q2",
    level: "department",
    ownerId: "emp_004",
    ownerDepartmentId: "dept_prod",
    title: "Lean Kitchen Phase 1",
    description: "Giảm wastage còn 2.5% và nâng OEE lên 80%.",
    period: "2026-Q2",
    progress: 48,
    keyResults: [
      { id: "kr_p1", title: "Wastage ≤ 2.5%", target: 2.5, actual: 3.1, unit: "%" },
      { id: "kr_p2", title: "OEE ≥ 80%", target: 80, actual: 78.5, unit: "%" },
      { id: "kr_p3", title: "Điểm HACCP ≥ 95", target: 95, actual: 92, unit: "điểm" },
    ],
  },
  {
    id: "obj_mkt_q2",
    level: "department",
    ownerId: "emp_003",
    ownerDepartmentId: "dept_mkt",
    title: "Brand uplift + Performance hiệu quả",
    description: "Giữ CPL ≤ 48k, ROAS ≥ 4.5, đẩy 8000 lead Q2.",
    period: "2026-Q2",
    progress: 70,
    keyResults: [
      { id: "kr_m1", title: "Lead Q2 ≥ 8.000", target: 8000, actual: 5680, unit: "đơn" },
      { id: "kr_m2", title: "CPL ≤ 48k", target: 48000, actual: 52000, unit: "VND" },
      { id: "kr_m3", title: "ROAS ≥ 4.5", target: 4.5, actual: 4.8, unit: "lần" },
    ],
  },
  {
    id: "obj_supply_q2",
    level: "department",
    ownerId: "emp_006",
    ownerDepartmentId: "dept_supply",
    title: "Supply chain resilience",
    description: "Tăng OTIF NCC + giảm 5% chi phí mua hàng.",
    period: "2026-Q2",
    progress: 60,
    keyResults: [
      { id: "kr_sc1", title: "OTIF NCC ≥ 95%", target: 95, actual: 91, unit: "%" },
      { id: "kr_sc2", title: "Tiết kiệm NCC ≥ 5%", target: 5, actual: 5.2, unit: "%" },
      { id: "kr_sc3", title: "Triển khai WMS Phase 2", target: 100, actual: 48, unit: "%" },
    ],
  },
];

// =============================================================================
// CẢNH BÁO — Tự động generate từ KPI deviation
// =============================================================================

export type AlertSeverity = "info" | "warning" | "danger" | "critical";
export type Alert = {
  id: string;
  severity: AlertSeverity;
  title: string;
  detail: string;
  source: "kpi" | "task" | "finance" | "hr";
  linkedKpiId?: string;
  linkedTaskId?: string;
  createdAt: string;
  resolvedAt: string | null;
};

export const ALERTS: Alert[] = [
  { id: "alr_001", severity: "danger", title: "CPL Marketing vượt ngưỡng 8.3%", detail: "CPL thực tế 52.000đ vs mục tiêu 48.000đ. Nguy cơ thâm hụt MKT spend +28tr cuối tháng.", source: "kpi", linkedKpiId: "kpi_mkt_cpl", createdAt: "2026-05-08T08:30:00+07:00", resolvedAt: null },
  { id: "alr_002", severity: "danger", title: "Wastage Sản xuất 3.1% (vượt 24%)", detail: "Khu sơ chế rau củ wastage tăng do nhiệt độ kho lạnh dao động.", source: "kpi", linkedKpiId: "kpi_wastage", createdAt: "2026-05-07T16:00:00+07:00", resolvedAt: null },
  { id: "alr_003", severity: "warning", title: "OPEX vượt ngân sách 5.8%", detail: "Tổng OpEx 1.375 tỷ vs target 1.300 tỷ. Cần cắt giảm hoặc đẩy doanh thu bù.", source: "finance", createdAt: "2026-05-09T07:30:00+07:00", resolvedAt: null },
  { id: "alr_004", severity: "warning", title: "DSO 34 ngày — vượt target 30", detail: "18 KH HORECA quá hạn 30+ ngày. Cần đẩy mạnh thu hồi.", source: "kpi", linkedKpiId: "kpi_dso", createdAt: "2026-05-05T09:00:00+07:00", resolvedAt: null },
  { id: "alr_005", severity: "warning", title: "OTIF NCC giảm còn 91%", detail: "NCC cá fillet trễ 3 lô liên tiếp. Đã đề xuất tìm NCC backup.", source: "kpi", linkedKpiId: "kpi_otif", createdAt: "2026-05-06T11:00:00+07:00", resolvedAt: null },
  { id: "alr_006", severity: "critical", title: "Sales close rate B2B chỉ đạt 24%", detail: "Dưới mục tiêu 28% — ảnh hưởng trực tiếp doanh thu HORECA Q2.", source: "kpi", linkedKpiId: "kpi_close_rate", createdAt: "2026-05-04T14:00:00+07:00", resolvedAt: null },
  { id: "alr_007", severity: "info", title: "Repurchase rate B2C đạt 38% (vượt 8.5%)", detail: "Giữ chân khách tốt — có thể đẩy upsell SKU premium.", source: "kpi", linkedKpiId: "kpi_repurchase", createdAt: "2026-05-03T10:00:00+07:00", resolvedAt: null },
  { id: "alr_008", severity: "info", title: "Runway tài chính 14 tháng", detail: "Cash 2.45 tỷ, burn rate trung bình 175tr/tháng.", source: "finance", createdAt: "2026-05-09T07:35:00+07:00", resolvedAt: null },
];

// =============================================================================
// PHÊ DUYỆT
// =============================================================================

export type ApprovalKind = "bonus" | "budget" | "hire" | "purchase" | "expense";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export type Approval = {
  id: string;
  kind: ApprovalKind;
  title: string;
  amount: number;
  requesterId: string;
  approverId: string;
  departmentId: DeptId;
  status: ApprovalStatus;
  createdAt: string;
  decidedAt: string | null;
  note: string;
};

export const APPROVALS: Approval[] = [
  { id: "apv_001", kind: "bonus", title: "Bonus đặc biệt cho Performance Ads Lead — chiến dịch Hè vượt KPI", amount: 3_000_000, requesterId: "emp_003", approverId: "emp_001", departmentId: "dept_mkt", status: "pending", createdAt: "2026-05-09T10:00:00+07:00", decidedAt: null, note: "Bùi Hồng Nhung — KPI 110%." },
  { id: "apv_002", kind: "purchase", title: "Mua lò chiên công suất lớn cho line đóng gói", amount: 185_000_000, requesterId: "emp_004", approverId: "emp_001", departmentId: "dept_prod", status: "pending", createdAt: "2026-05-08T14:30:00+07:00", decidedAt: null, note: "Tăng OEE từ 78.5% lên ~85% theo dự kiến." },
  { id: "apv_003", kind: "hire", title: "Tuyển 2 sales B2B HORECA cho Hà Nội", amount: 0, requesterId: "emp_002", approverId: "emp_001", departmentId: "dept_sales", status: "pending", createdAt: "2026-05-07T09:00:00+07:00", decidedAt: null, note: "Phục vụ kế hoạch mở rộng Bắc — Project HX." },
  { id: "apv_004", kind: "budget", title: "Tăng ngân sách Marketing thêm 50tr cho campaign Hè", amount: 50_000_000, requesterId: "emp_003", approverId: "emp_007", departmentId: "dept_mkt", status: "approved", createdAt: "2026-05-04T11:00:00+07:00", decidedAt: "2026-05-05T08:30:00+07:00", note: "Đã duyệt — phân bổ T5+T6." },
  { id: "apv_005", kind: "expense", title: "Hợp đồng dịch vụ agency content tháng 5", amount: 48_000_000, requesterId: "emp_022", approverId: "emp_003", departmentId: "dept_mkt", status: "pending", createdAt: "2026-05-04T16:00:00+07:00", decidedAt: null, note: "Cần ký gấp để chạy timeline tháng 5." },
  { id: "apv_006", kind: "purchase", title: "Đặt 200kg cá fillet từ NCC backup", amount: 95_000_000, requesterId: "emp_051", approverId: "emp_006", departmentId: "dept_supply", status: "approved", createdAt: "2026-05-06T13:00:00+07:00", decidedAt: "2026-05-06T15:00:00+07:00", note: "Backup do NCC chính trễ." },
];

// =============================================================================
// AUDIT LOG
// =============================================================================

export type AuditEntry = {
  id: string;
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  summary: string;
  createdAt: string;
};

export const AUDIT_LOG: AuditEntry[] = [
  { id: "aud_001", actorId: "emp_001", action: "approve", entity: "Approval", entityId: "apv_004", summary: "Duyệt tăng ngân sách MKT 50tr", createdAt: "2026-05-09T08:30:00+07:00" },
  { id: "aud_002", actorId: "emp_007", action: "update", entity: "Kpi", entityId: "kpi_payroll_cost", summary: "Cập nhật actual quỹ lương 705tr", createdAt: "2026-05-09T07:50:00+07:00" },
  { id: "aud_003", actorId: "emp_003", action: "request", entity: "Approval", entityId: "apv_001", summary: "Yêu cầu bonus đặc biệt 3tr", createdAt: "2026-05-09T10:00:00+07:00" },
  { id: "aud_004", actorId: "emp_004", action: "create", entity: "Task", entityId: "tsk_023", summary: "Tạo task đào tạo HACCP", createdAt: "2026-05-02T09:15:00+07:00" },
  { id: "aud_005", actorId: "emp_002", action: "update", entity: "Project", entityId: "prj_horeca_x", summary: "Cập nhật progress 38%", createdAt: "2026-05-08T17:30:00+07:00" },
  { id: "aud_006", actorId: "emp_005", action: "approve", entity: "Task", entityId: "tsk_032", summary: "Duyệt kết quả test cảm quan SKU sốt me", createdAt: "2026-05-09T11:00:00+07:00" },
  { id: "aud_007", actorId: "emp_060", action: "create", entity: "Employee", entityId: "emp_062", summary: "Onboarding HR Generalist Đinh Hoài Nam", createdAt: "2022-01-17T08:00:00+07:00" },
  { id: "aud_008", actorId: "emp_006", action: "approve", entity: "Approval", entityId: "apv_006", summary: "Duyệt đặt 200kg cá fillet NCC backup", createdAt: "2026-05-06T15:00:00+07:00" },
];

// =============================================================================
// TUYỂN DỤNG
// =============================================================================

export type JobReqStatus = "open" | "screening" | "interview" | "closed";
export type JobReq = {
  id: string;
  departmentId: DeptId;
  title: string;
  level: string;
  headcount: number;
  filled: number;
  candidates: number;
  status: JobReqStatus;
  openedAt: string;
  reason: string;
};

export const JOB_REQS: JobReq[] = [
  { id: "job_001", departmentId: "dept_sales", title: "Sales Executive HORECA — Hà Nội", level: "Senior", headcount: 2, filled: 0, candidates: 12, status: "interview", openedAt: "2026-04-20", reason: "Mở rộng thị trường phía Bắc — Project HX." },
  { id: "job_002", departmentId: "dept_prod", title: "Đầu bếp chính ca tối", level: "Senior", headcount: 1, filled: 0, candidates: 8, status: "screening", openedAt: "2026-05-01", reason: "Tăng ca sản xuất phục vụ B2B mới." },
  { id: "job_003", departmentId: "dept_mkt", title: "Performance Marketing Specialist", level: "Senior", headcount: 1, filled: 0, candidates: 18, status: "interview", openedAt: "2026-04-25", reason: "Hỗ trợ scale ads campaign Hè." },
  { id: "job_004", departmentId: "dept_rnd_qa", title: "QA Inspector", level: "Junior", headcount: 1, filled: 1, candidates: 6, status: "closed", openedAt: "2026-03-10", reason: "Bổ sung tuần 3 ca audit." },
  { id: "job_005", departmentId: "dept_supply", title: "Chuyên viên Mua hàng", level: "Senior", headcount: 1, filled: 0, candidates: 9, status: "open", openedAt: "2026-05-05", reason: "Tách team sourcing nguyên liệu chính & phụ." },
];

// =============================================================================
// SOP / Knowledge
// =============================================================================

export type SOP = {
  id: string;
  departmentId: DeptId;
  title: string;
  category: string;
  version: number;
  updatedAt: string;
  author: string;
  views: number;
  published: boolean;
  excerpt: string;
};

export const SOPS: SOP[] = [
  { id: "sop_001", departmentId: "dept_prod", title: "SOP — Quy trình HACCP bếp trung tâm", category: "An toàn thực phẩm", version: 4, updatedAt: "2026-04-12", author: "Đoàn Khánh Linh", views: 248, published: true, excerpt: "Quy trình 12 bước kiểm soát mối nguy CCP từ nhập NL đến đóng gói." },
  { id: "sop_002", departmentId: "dept_prod", title: "SOP — Bảo quản nguyên liệu kho lạnh", category: "Vận hành", version: 2, updatedAt: "2026-03-28", author: "Trần Văn Hùng", views: 156, published: true, excerpt: "Nhiệt độ, sắp xếp lot, FIFO/FEFO cho từng nhóm SKU." },
  { id: "sop_003", departmentId: "dept_sales", title: "Playbook — Pitch HORECA", category: "Bán hàng", version: 3, updatedAt: "2026-04-20", author: "Lê Minh Tuấn", views: 198, published: true, excerpt: "Khung 5 bước qualify → demo → propose → negotiate → close." },
  { id: "sop_004", departmentId: "dept_mkt", title: "SOP — Brief & sản xuất content", category: "Marketing", version: 5, updatedAt: "2026-04-30", author: "Nguyễn Thu Hà", views: 312, published: true, excerpt: "Quy trình từ ý tưởng đến phát hành, checklist brand voice." },
  { id: "sop_005", departmentId: "dept_supply", title: "SOP — Đánh giá NCC định kỳ", category: "Mua hàng", version: 2, updatedAt: "2026-04-05", author: "Lương Tấn Phát", views: 102, published: true, excerpt: "Tiêu chí 6 trục: giá, chất lượng, OTIF, dịch vụ, ESG, tài chính." },
  { id: "sop_006", departmentId: "dept_back", title: "SOP — Quy trình tuyển dụng", category: "Nhân sự", version: 3, updatedAt: "2026-03-18", author: "Phạm Phương Thảo", views: 134, published: true, excerpt: "Job brief → sourcing → screening → interview → offer." },
  { id: "sop_007", departmentId: "dept_back", title: "Playbook — Đối soát công nợ", category: "Tài chính", version: 1, updatedAt: "2026-04-22", author: "Ngô Bảo Châu", views: 78, published: false, excerpt: "Lịch reminder, escalation matrix, ngưỡng nhắc luật sư." },
  { id: "sop_008", departmentId: "dept_rnd_qa", title: "SOP — Kiểm nghiệm cảm quan SKU mới", category: "R&D", version: 2, updatedAt: "2026-04-15", author: "Đoàn Khánh Linh", views: 94, published: true, excerpt: "Quy trình panel test 5 trục cảm quan + scoring." },
];

// =============================================================================
// REPORTS — Snapshot báo cáo
// =============================================================================

export type Report = {
  id: string;
  title: string;
  category: "weekly" | "monthly" | "quarterly" | "ad_hoc";
  ownerId: string;
  departmentId: DeptId | "company";
  period: string;
  generatedAt: string;
  format: "PDF" | "Excel" | "Dashboard";
  status: "ready" | "generating" | "scheduled";
};

export const REPORTS: Report[] = [
  { id: "rep_001", title: "Báo cáo KQKD tháng 5/2026", category: "monthly", ownerId: "emp_007", departmentId: "company", period: "2026-05", generatedAt: "2026-05-09T07:00:00+07:00", format: "PDF", status: "ready" },
  { id: "rep_002", title: "Báo cáo Sales tuần 19", category: "weekly", ownerId: "emp_002", departmentId: "dept_sales", period: "W19-2026", generatedAt: "2026-05-09T08:00:00+07:00", format: "Dashboard", status: "ready" },
  { id: "rep_003", title: "Báo cáo Wastage & OEE bếp", category: "weekly", ownerId: "emp_004", departmentId: "dept_prod", period: "W19-2026", generatedAt: "2026-05-09T09:00:00+07:00", format: "Excel", status: "ready" },
  { id: "rep_004", title: "Báo cáo MKT Funnel & ROAS", category: "weekly", ownerId: "emp_003", departmentId: "dept_mkt", period: "W19-2026", generatedAt: "2026-05-09T08:30:00+07:00", format: "Dashboard", status: "ready" },
  { id: "rep_005", title: "Báo cáo OKR Q2 (mid-quarter)", category: "quarterly", ownerId: "emp_001", departmentId: "company", period: "2026-Q2", generatedAt: "2026-05-08T14:00:00+07:00", format: "PDF", status: "ready" },
  { id: "rep_006", title: "Báo cáo công nợ KH HORECA", category: "ad_hoc", ownerId: "emp_061", departmentId: "dept_back", period: "2026-05", generatedAt: "2026-05-09T10:00:00+07:00", format: "Excel", status: "ready" },
  { id: "rep_007", title: "Forecast Q3 (đang tạo)", category: "quarterly", ownerId: "emp_007", departmentId: "company", period: "2026-Q3", generatedAt: "2026-05-09T07:50:00+07:00", format: "Dashboard", status: "generating" },
];
