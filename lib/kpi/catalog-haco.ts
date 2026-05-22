/**
 * HACO Food OS — KPI Catalog (F&B vertical)
 * -----------------------------------------
 * Định nghĩa "thư viện KPI chuẩn" cho ngành thực phẩm chế biến.
 * Khác với KPIS trong demo.ts (là instance đang chạy), file này là *catalog*
 * — phục vụ trang `/kpi-tree` khi cần "Thêm KPI từ thư viện" và làm tài liệu
 * cho từng phòng ban biết KPI nào nên owner.
 *
 * Mỗi entry mô tả: tên · ý nghĩa · công thức · đơn vị · benchmark ngành.
 */

import type { DeptId } from "@/lib/queries/demo";

export type CatalogKpi = {
  code: string;
  name: string;
  departmentId: DeptId;
  unit: string;
  direction: "increase" | "decrease";
  formula: string;
  why: string;
  benchmark: string;
};

export const KPI_CATALOG: CatalogKpi[] = [
  // ---------------- SALES ----------------
  {
    code: "SAL.REV.B2B",
    name: "Doanh thu HORECA",
    departmentId: "dept_sales",
    unit: "VND",
    direction: "increase",
    formula: "Σ doanh thu thuần từ khách HORECA trong kỳ",
    why: "Kênh có biên gross cao nhất, ổn định dòng tiền.",
    benchmark: "Tăng trưởng tháng ≥ 8-12% MoM khi mở rộng thị trường.",
  },
  {
    code: "SAL.REV.B2C",
    name: "Doanh thu Online B2C",
    departmentId: "dept_sales",
    unit: "VND",
    direction: "increase",
    formula: "GMV TMĐT + Web + Livestream (đã trừ refund)",
    why: "Kênh tăng trưởng nhanh, cơ hội mở rộng tệp KH.",
    benchmark: "Đóng góp ≥ 30% tổng revenue khi đã ổn định.",
  },
  {
    code: "SAL.REV.SHOWROOM",
    name: "Doanh thu Showroom",
    departmentId: "dept_sales",
    unit: "VND",
    direction: "increase",
    formula: "Σ POS + đặt hàng tại showroom",
    why: "Touchpoint trải nghiệm trực tiếp giúp tăng brand love.",
    benchmark: "12-18% tổng revenue cho thương hiệu có 2-3 cửa hàng.",
  },
  {
    code: "SAL.CLOSE",
    name: "Tỷ lệ chốt đơn B2B",
    departmentId: "dept_sales",
    unit: "%",
    direction: "increase",
    formula: "Số deal won / số opportunity",
    why: "Phản ánh chất lượng pipeline + năng lực sales.",
    benchmark: "F&B HORECA: 22-30%.",
  },
  {
    code: "SAL.AOV",
    name: "Average Order Value (B2C)",
    departmentId: "dept_sales",
    unit: "VND",
    direction: "increase",
    formula: "Doanh thu B2C / số đơn",
    why: "Tăng AOV nhanh hơn tăng số đơn (thường ít chi phí hơn).",
    benchmark: "F&B online VN: 350.000-550.000đ.",
  },
  {
    code: "SAL.REPEAT",
    name: "Repurchase Rate (90 ngày)",
    departmentId: "dept_sales",
    unit: "%",
    direction: "increase",
    formula: "% KH mua trở lại trong 90 ngày",
    why: "Chỉ số sống còn của LTV — giảm phụ thuộc paid acquisition.",
    benchmark: "≥ 30% là tốt với F&B đóng gói.",
  },

  // ---------------- MARKETING ----------------
  {
    code: "MKT.LEADS",
    name: "Số Lead Marketing",
    departmentId: "dept_mkt",
    unit: "đơn",
    direction: "increase",
    formula: "Số form/inbox/inquiry đủ thông tin tối thiểu",
    why: "Đầu vào funnel — kéo theo doanh thu sau 14-30 ngày.",
    benchmark: "Volume cần khớp với capacity Sales (lead/sales/tháng).",
  },
  {
    code: "MKT.CPL",
    name: "Cost per Lead (CPL)",
    departmentId: "dept_mkt",
    unit: "VND",
    direction: "decrease",
    formula: "Tổng MKT spend / số lead",
    why: "Giữ CPL ổn định khi scale là dấu hiệu engine khoẻ.",
    benchmark: "F&B B2C VN: 30.000-60.000đ tuỳ kênh.",
  },
  {
    code: "MKT.ROAS",
    name: "Return on Ad Spend",
    departmentId: "dept_mkt",
    unit: "lần",
    direction: "increase",
    formula: "Doanh thu attributable / chi phí quảng cáo",
    why: "ROAS phản ánh hiệu quả creative + audience + offer.",
    benchmark: "F&B: ≥ 4.0 ổn định, ≥ 5.0 tốt.",
  },
  {
    code: "MKT.QUAL",
    name: "Qualified Leads",
    departmentId: "dept_mkt",
    unit: "đơn",
    direction: "increase",
    formula: "Lead được Sales đánh dấu đủ tiêu chuẩn",
    why: "Tỉ lệ MQL/Lead nói lên chất lượng targeting.",
    benchmark: "MQL/Lead ≥ 35%.",
  },

  // ---------------- SẢN XUẤT (BẾP) ----------------
  {
    code: "PROD.FCOST",
    name: "Food Cost %",
    departmentId: "dept_prod",
    unit: "%",
    direction: "decrease",
    formula: "Giá vốn nguyên liệu / doanh thu sản xuất",
    why: "Đòn bẩy lớn nhất lên Gross Margin của F&B.",
    benchmark: "Bếp công nghiệp: 32-38% là tốt.",
  },
  {
    code: "PROD.WASTE",
    name: "Wastage %",
    departmentId: "dept_prod",
    unit: "%",
    direction: "decrease",
    formula: "(NL nhập − NL chế biến hợp lệ) / NL nhập",
    why: "Hao hụt là tiền mất không sinh doanh thu.",
    benchmark: "Bếp công nghiệp: 1.5-3%.",
  },
  {
    code: "PROD.OEE",
    name: "OEE Bếp",
    departmentId: "dept_prod",
    unit: "%",
    direction: "increase",
    formula: "Availability × Performance × Quality",
    why: "Đo công suất hữu ích thực tế của line bếp.",
    benchmark: "Lean Kitchen: ≥ 80% là tốt, world-class ≥ 85%.",
  },
  {
    code: "PROD.HACCP",
    name: "Điểm tuân thủ HACCP/5S",
    departmentId: "dept_prod",
    unit: "điểm",
    direction: "increase",
    formula: "Điểm audit nội bộ thang 100",
    why: "Bảo vệ thương hiệu, tránh thu hồi sản phẩm.",
    benchmark: "≥ 95 với F&B chứng nhận xuất khẩu.",
  },
  {
    code: "PROD.OTD",
    name: "On-time Production %",
    departmentId: "dept_prod",
    unit: "%",
    direction: "increase",
    formula: "Đơn sản xuất hoàn thành đúng hạn / tổng đơn",
    why: "Đảm bảo cam kết giao hàng với Sales/CS.",
    benchmark: "≥ 95%.",
  },

  // ---------------- R&D & QA ----------------
  {
    code: "RND.SKU",
    name: "SKU mới ra mắt / quý",
    departmentId: "dept_rnd_qa",
    unit: "đơn",
    direction: "increase",
    formula: "Số SKU launched chính thức trong quý",
    why: "Đa dạng menu, làm mới demand, mở rộng tệp KH.",
    benchmark: "F&B vừa: 3-6 SKU/quý.",
  },
  {
    code: "RND.TTM",
    name: "Time to Market",
    departmentId: "dept_rnd_qa",
    unit: "ngày",
    direction: "decrease",
    formula: "Thời gian từ ý tưởng đến SKU launched",
    why: "Tốc độ ra sản phẩm là lợi thế cạnh tranh.",
    benchmark: "60-120 ngày là tốt với F&B đóng gói.",
  },
  {
    code: "QA.DEFECT",
    name: "Defect Rate",
    departmentId: "dept_rnd_qa",
    unit: "%",
    direction: "decrease",
    formula: "Số lô bị trả/khiếu nại / tổng lô",
    why: "Liên quan trực tiếp brand trust và chi phí thu hồi.",
    benchmark: "≤ 0.5% là chấp nhận được.",
  },

  // ---------------- MUA HÀNG / SUPPLY CHAIN ----------------
  {
    code: "SCM.SAVE",
    name: "Tiết kiệm chi phí NCC",
    departmentId: "dept_supply",
    unit: "%",
    direction: "increase",
    formula: "(Baseline cost − actual cost) / baseline",
    why: "Đo trực tiếp giá trị mà Procurement tạo ra.",
    benchmark: "3-6% năm là tốt.",
  },
  {
    code: "SCM.OTIF",
    name: "Supplier OTIF %",
    departmentId: "dept_supply",
    unit: "%",
    direction: "increase",
    formula: "% lô giao đúng hạn & đủ số lượng",
    why: "Bảo vệ kế hoạch sản xuất khỏi đứt gãy.",
    benchmark: "≥ 95%.",
  },
  {
    code: "SCM.TURN",
    name: "Vòng quay tồn kho",
    departmentId: "dept_supply",
    unit: "lần",
    direction: "increase",
    formula: "COGS / tồn kho TB",
    why: "Quay càng nhanh càng giảm vốn chôn.",
    benchmark: "F&B nguyên liệu tươi: 8-12 lần/tháng.",
  },
  {
    code: "SCM.STOCKOUT",
    name: "Stock-out Rate",
    departmentId: "dept_supply",
    unit: "%",
    direction: "decrease",
    formula: "% SKU mất hàng tại bất kỳ thời điểm",
    why: "Mất doanh thu trực tiếp + ảnh hưởng SLA.",
    benchmark: "≤ 1.5%.",
  },

  // ---------------- HR & FINANCE ----------------
  {
    code: "HR.TURN",
    name: "Turnover Rate",
    departmentId: "dept_back",
    unit: "%",
    direction: "decrease",
    formula: "Số nghỉ việc / headcount TB",
    why: "Turnover cao = chi phí ẩn rất lớn.",
    benchmark: "F&B sản xuất: ≤ 3%/tháng.",
  },
  {
    code: "HR.ENPS",
    name: "Employee NPS",
    departmentId: "dept_back",
    unit: "điểm",
    direction: "increase",
    formula: "% Promoter − % Detractor (thang -100..+100)",
    why: "Phong vũ biểu sức khoẻ tổ chức.",
    benchmark: "≥ 30 là tốt, ≥ 50 xuất sắc.",
  },
  {
    code: "HR.TTH",
    name: "Time to Hire",
    departmentId: "dept_back",
    unit: "ngày",
    direction: "decrease",
    formula: "Số ngày trung bình mở job → ký offer",
    why: "Quyết định tốc độ scale.",
    benchmark: "Position senior: 30-45 ngày.",
  },
  {
    code: "FIN.DSO",
    name: "Days Sales Outstanding",
    departmentId: "dept_back",
    unit: "ngày",
    direction: "decrease",
    formula: "AR × ngày trong kỳ / doanh thu",
    why: "DSO cao = vốn lưu động bị chiếm.",
    benchmark: "B2B HORECA: 25-35 ngày.",
  },
  {
    code: "FIN.PAYRATIO",
    name: "Payroll / Revenue",
    departmentId: "dept_back",
    unit: "%",
    direction: "decrease",
    formula: "Tổng quỹ lương / doanh thu",
    why: "Đo hiệu quả chi phí nhân sự.",
    benchmark: "F&B sản xuất: 12-18%.",
  },
];

export function catalogByDepartment(deptId: DeptId): CatalogKpi[] {
  return KPI_CATALOG.filter((k) => k.departmentId === deptId);
}
