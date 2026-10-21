import { Component, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { findDemoWorkshop, type WorkshopRecord } from './workshop-demo-data';
import { readLocalWorkshops } from './workshop-store';

const API_BASE_URL = (globalThis as typeof globalThis & { SIMIN_API_URL?: string }).SIMIN_API_URL
  ?? 'http://localhost:3001';

type Workshop = Record<string, any>;
type MonthlyReport = Record<string, any> & { year: number; month: number };

@Component({
  selector: 'app-workshop-detail-page',
  imports: [RouterLink],
  template: `
    <main class="workshop-page" dir="rtl">
      <a class="back-link" routerLink="/workshops">← بازگشت به کارگاه‌ها</a>
      @if (loading()) {
        <section class="state-card">در حال دریافت اطلاعات کارگاه…</section>
      } @else if (error()) {
        <section class="state-card error">{{ error() }}</section>
      } @else if (workshop(); as w) {
        <header class="workshop-heading">
          <div><span class="eyebrow">پروندهٔ کارگاه</span>@if (demoMode()) { <span class="demo-badge">دادهٔ نمایشی</span> }<h1>{{ w['title'] || 'کارگاه تولیدی' }}</h1>
            <p>{{ w['category'] || 'حوزه نامشخص' }} · {{ w['province'] || 'استان ثبت نشده' }} · {{ w['location'] || 'موقعیت ثبت نشده' }}</p></div>
          @if (isLocalWorkshop(w['id'])) { <a class="edit-link" [routerLink]="['/workshops', w['id'], 'edit']">ویرایش کارگاه</a> }
          @if (w['cover_image']) { <img class="cover" [src]="imageUrl(w['cover_image'])" [alt]="w['title'] || 'تصویر کارگاه'" /> }
        </header>

        <section class="summary-grid" aria-label="خلاصه کارگاه">
          <article><small>سرمایهٔ موردنیاز</small><b>{{ money(w['required_capital']) }}</b></article>
          <article><small>مساحت سالن/کارگاه</small><b>{{ w['area'] ? number(w['area']) + ' متر مربع' : 'ثبت نشده' }}</b></article>
          <article><small>تعداد نیروها</small><b>{{ totalMembers(w) }} نفر</b></article>
          <article><small>نوع مالکیت</small><b>{{ w['ownership_type'] || 'ثبت نشده' }}</b></article>
          <article><small>تاریخ شروع فعالیت</small><b>{{ w['start_date'] || 'ثبت نشده' }}</b></article>
          <article><small>نوع محصول</small><b>{{ w['product_type'] || 'ثبت نشده' }}</b></article>
        </section>

        <section class="panel"><h2>معرفی و مشخصات</h2><p class="description">{{ w['description'] || 'توضیحی برای این کارگاه ثبت نشده است.' }}</p>
          <div class="data-grid"><div><small>دسته‌بندی</small><b>{{ w['category'] || 'ثبت نشده' }}</b></div><div><small>استان</small><b>{{ w['province'] || 'ثبت نشده' }}</b></div><div><small>موقعیت مکانی</small><b>{{ w['location'] || 'ثبت نشده' }}</b></div><div><small>تاریخ شروع</small><b>{{ w['start_date'] || 'ثبت نشده' }}</b></div><div><small>اجارهٔ ماهانهٔ کارگاه</small><b>{{ w['monthly_costs']?.['rent'] ? money(w['monthly_costs']['rent']) : 'ثبت نشده' }}</b></div></div>
        </section>

        <section class="panel"><h2>راه‌های ارتباطی</h2><div class="data-grid"><div><small>شماره تماس</small><b>{{ w['contact_number'] || 'ثبت نشده' }}</b></div><div><small>ایمیل</small><b>{{ w['email'] || 'ثبت نشده' }}</b></div><div><small>وب‌سایت</small>@if (w['website']) { <a [href]="externalUrl(w['website'])" target="_blank" rel="noopener noreferrer">{{ w['website'] }}</a> } @else { <b>ثبت نشده</b> }</div><div><small>نمایندگی فروش</small><b>{{ w['sales_representative'] || 'ثبت نشده' }}</b></div></div>
        </section>

        @if (asArray(w['investments']).length) { <section class="panel"><h2>فرصت سرمایه‌گذاری این کارگاه</h2><div class="card-grid">@for (investment of asArray(w['investments']); track $index) { <article class="mini-card"><small>هدف: {{ investment['purpose'] || 'ثبت نشده' }}</small><b>{{ money(investment['amount']) }}</b></article> }</div></section> }

        @if (asArray(w['products']).length) { <section class="panel"><h2>محصولات و سفارش مشتریان</h2><div class="card-grid">@for (product of asArray(w['products']); track $index) { <article class="product-card"><h3>{{ product['name'] || 'محصول' }}</h3><p>ظرفیت ماهانه: <b>{{ number(product['monthly_volume']) }}</b> عدد</p>
          @if (asArray(product['customers']).length) { <div class="customer-list"><small>سفارش مشتریان</small>@for (customer of asArray(product['customers']); track $index) { <div><span>{{ customer['name'] || 'مشتری' }}</span><b>{{ number(customer['monthly_order_volume']) }} عدد</b></div> }</div> }
        </article> }</div></section> }

        @if (w['manager'] || asArray(w['team_categories']).length) { <section class="panel"><h2>مدیریت و نیروی انسانی</h2><div class="card-grid">
          @if (w['manager']; as manager) { <article class="mini-card"><small>مدیرعامل / مدیر کارگاه</small><b>{{ manager['name'] || 'نام ثبت نشده' }}</b><p>{{ manager['description'] || '' }}</p></article> }
          @if (asArray(w['team_categories']).length) { <article class="mini-card"><small>ترکیب نیروی انسانی</small>@for (team of asArray(w['team_categories']); track $index) { <div class="row"><span>{{ team['category_name'] || 'گروه کاری' }}</span><b>{{ team['count'] || 0 }} نفر</b></div> }</article> }
        </div></section> }

        @if (asArray(w['images']).length) { <section class="panel"><h2>گالری تصاویر</h2><div class="gallery">@for (image of asArray(w['images']); track $index) { <img [src]="imageUrl(image['image'] || image)" alt="تصویر کارگاه" /> }</div></section> }

        @if (reports().length) { <section class="panel"><div class="panel-heading"><div><span class="eyebrow">عملکرد واقعی کارگاه</span><h2>گزارش‌های مالی و تولید</h2></div>
          <div class="selectors"><label>سال<select [value]="year()" (change)="setYear($event)">@for (y of years(); track y) { <option [value]="y">{{ y }}</option> }</select></label><label>ماه<select [value]="month()" (change)="setMonth($event)">@for (r of reportsForYear(); track r['month']) { <option [value]="r['month']">{{ monthName(r['month']) }}</option> }</select></label></div>
        </div>
        @if (selectedReport(); as report) { <div class="report-grid">@for (metric of metrics; track metric.key) { <article><small>{{ metric.label }}</small><b>{{ metric.key === 'profit_percentage' ? number(report[metric.key]) + '٪' : money(report[metric.key]) }}</b></article> }</div>
          <h3 class="chart-title">مقایسهٔ فروش ماهانه</h3><div class="bars">@for (r of reportsForYear(); track r['month']) { <div class="bar-column"><div class="bar" [style.height.%]="barHeight(r['sales'])" [title]="money(r['sales'])"></div><small>{{ monthName(r['month']) }}</small></div> }</div>
        } @else { <p class="empty">برای این سال و ماه گزارشی ثبت نشده است.</p> }
        </section> }

        @if (reports().length) { <section class="panel calculator"><h2>برآورد سهم سرمایه‌گذار</h2><p>برآورد بر اساس سود و هزینهٔ کل ماه انتخاب‌شده محاسبه می‌شود.</p>
          <label>مبلغ سرمایه‌گذاری (تومان)<input inputmode="numeric" [value]="investorAmount() || ''" (input)="setInvestorAmount($event)" placeholder="مثلاً ۵۰۰۰۰۰۰۰۰" /></label>
          <div class="result-grid"><div><small>سود خالص ماه</small><b>{{ money(selectedReport()?.['profit']) }}</b></div><div><small>درصد سهم محاسباتی</small><b>{{ investorShare() }}٪</b></div><div><small>سود/زیان برآوردی این سهم</small><b>{{ money(investorReturn()) }}</b></div><div><small>بازده نسبت به مبلغ سرمایه</small><b>{{ investorRoi() }}٪</b></div></div>
        </section> }
      }
    </main>
  `,
  styles: [`
    :host{display:block;font-family:'Vazirmatn',Tahoma,sans-serif;color:#18352b}.workshop-page{width:100%;max-width:none;margin:0;padding:34px 28px 70px}.back-link{display:inline-block;color:#28734f;text-decoration:none;font-size:13px;margin-bottom:20px}.workshop-heading{display:flex;align-items:center;justify-content:space-between;gap:25px;background:#fff;border:1px solid #e5ece6;border-radius:20px;padding:26px;margin-bottom:18px}.eyebrow{font-size:11px;color:#39825d;font-weight:700}.demo-badge{display:inline-block;margin-inline-start:9px;padding:4px 8px;border-radius:20px;background:#fff5df;color:#8c6821;font-size:9px}.workshop-heading h1{font-size:28px;margin:7px 0}.workshop-heading p,.description,.calculator>p{color:#718078;line-height:2;font-size:13px}.cover{width:240px;height:150px;object-fit:cover;border-radius:13px}.summary-grid,.report-grid,.result-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:18px}.summary-grid article,.report-grid article,.result-grid>div{padding:15px;background:#fff;border:1px solid #e5ece6;border-radius:12px}.summary-grid small,.summary-grid b,.report-grid small,.report-grid b,.result-grid small,.result-grid b{display:block}.summary-grid small,.report-grid small,.result-grid small,.data-grid small,.mini-card small{font-size:10px;color:#839188;margin-bottom:7px}.summary-grid b,.report-grid b,.result-grid b{font-size:13px}.panel,.state-card{background:#fff;border:1px solid #e5ece6;border-radius:17px;padding:23px;margin:14px 0}.panel h2{font-size:17px;margin:0 0 17px}.data-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.data-grid>div{background:#f8faf8;padding:12px;border-radius:10px;min-width:0;overflow-wrap:anywhere}.data-grid b,.data-grid a{display:block;font-size:12px;color:#284a38}.card-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.mini-card,.product-card{border:1px solid #e8eee9;border-radius:12px;padding:15px}.mini-card>b{display:block;margin-top:5px}.mini-card p,.product-card p{font-size:12px;color:#718078}.row,.customer-list>div{display:flex;justify-content:space-between;gap:12px;border-top:1px solid #edf1ed;padding:8px 0;font-size:12px}.customer-list{margin-top:14px}.customer-list>small{display:block;color:#738178;margin-bottom:6px}.gallery{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.gallery img{width:100%;height:140px;object-fit:cover;border-radius:10px}.panel-heading{display:flex;align-items:center;justify-content:space-between;gap:20px}.panel-heading h2{margin:5px 0 0}.selectors{display:flex;gap:10px}.selectors label,.calculator label{display:grid;gap:6px;font-size:11px}.selectors select,.calculator input{font:inherit;border:1px solid #dce6de;border-radius:8px;padding:9px;background:#fff}.report-grid{grid-template-columns:repeat(5,minmax(0,1fr));margin-top:20px}.report-grid article{background:#f8faf8;padding:12px}.report-grid b{overflow-wrap:anywhere}.chart-title{font-size:13px;margin-top:24px}.bars{height:160px;display:flex;align-items:stretch;gap:8px;border-bottom:1px solid #dfe8e1;padding:8px 0 0}.bar-column{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:end;gap:6px;min-width:0}.bar{width:min(70%,32px);min-height:3px;background:#438b61;border-radius:5px 5px 0 0}.bar-column small{font-size:9px;color:#718078}.calculator>label{max-width:360px;margin:18px 0}.result-grid{grid-template-columns:repeat(4,minmax(0,1fr));margin:0}.empty,.state-card{color:#718078}.error{color:#a33939}.state-card{text-align:center;padding:50px}@media(max-width:760px){.workshop-page{padding:20px 14px}.workshop-heading{align-items:flex-start;flex-direction:column}.cover{width:100%;height:190px}.summary-grid,.report-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.data-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.panel-heading{align-items:flex-start;flex-direction:column}.result-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.gallery{grid-template-columns:repeat(2,minmax(0,1fr))}}
    :host,.workshop-page{color:var(--text)}.back-link{color:var(--accent)}.workshop-heading,.summary-grid article,.panel,.state-card,.result-grid>div{background:var(--surface);border-color:var(--border);color:var(--text)}.report-grid article,.data-grid>div,.mini-card,.product-card{background:var(--surface-alt);border-color:var(--border);color:var(--text)}.workshop-heading h1,.panel h2,.chart-title,.product-card h3,.summary-grid b,.report-grid b,.result-grid b,.data-grid b,.mini-card b,.row b,.customer-list b{color:var(--text)}.workshop-heading p,.description,.calculator>p,.summary-grid small,.report-grid small,.result-grid small,.data-grid small,.mini-card small,.mini-card p,.product-card p,.row,.customer-list>small,.customer-list>div,.bar-column small,.empty{color:var(--text-muted)}.data-grid b,.data-grid a{color:var(--text)}.row,.customer-list>div,.bars{border-color:var(--border)}.selectors select,.calculator input{background:var(--surface);border-color:var(--border);color:var(--text);color-scheme:inherit}.bar{background:var(--accent)}.demo-badge{background:var(--green-soft);color:var(--accent)}.error{color:#d55}
  `],
})
export class WorkshopDetailPage {
  readonly loading = signal(true);
  readonly error = signal('');
  readonly demoMode = signal(false);
  readonly workshop = signal<Workshop | null>(null);
  readonly year = signal(new Date().getFullYear());
  readonly month = signal(1);
  readonly investorAmount = signal(0);
  readonly metrics = [
    { key: 'sales', label: 'فروش ماهانه' }, { key: 'profit', label: 'سود خالص' },
    { key: 'profit_percentage', label: 'درصد سود ماهانه' },
    { key: 'production_amount', label: 'مقدار تولید' }, { key: 'sold_amount', label: 'مقدار فروش محصول' },
    { key: 'fixed_workshop_rent', label: 'اجارهٔ زمین و کارگاه' }, { key: 'equipment_rent', label: 'اجارهٔ تجهیزات' },
    { key: 'material_costs', label: 'هزینهٔ مواد اولیه' }, { key: 'salary_maintenance', label: 'حقوق و نگهداری' },
    { key: 'total_monthly_value', label: 'جمع هزینهٔ ماهانه' },
  ];

  constructor(route: ActivatedRoute) {
    const id = route.snapshot.paramMap.get('id');
    if (!id) { this.error.set('شناسهٔ کارگاه در نشانی صفحه وجود ندارد.'); this.loading.set(false); return; }
    void this.load(id);
  }

  private async load(id: string) {
    const local = readLocalWorkshops().find((item) => item.id === id);
    if (local) { this.demoMode.set(true); this.setWorkshop(local); this.loading.set(false); return; }
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/api/workshops/${encodeURIComponent(id)}/`);
        if (response.ok) { this.setWorkshop(await response.json() as Workshop); return; }
      } catch { /* The current API has no workshop endpoint yet; use the local demo records. */ }
      const demo = findDemoWorkshop(id);
      if (demo) { this.demoMode.set(true); this.setWorkshop(demo); }
      else this.error.set('کارگاه پیدا نشد.');
    }
    finally { this.loading.set(false); }
  }

  private setWorkshop(data: Workshop) {
    this.workshop.set(data);
    const reports = this.asArray(data['monthly_reports']) as MonthlyReport[];
    if (reports.length) {
      const latest = [...reports].sort((a, b) => Number(b.year) - Number(a.year) || Number(b.month) - Number(a.month))[0];
      this.year.set(Number(latest.year)); this.month.set(Number(latest.month));
    }
  }

  asArray(value: unknown): Workshop[] { return Array.isArray(value) ? value : []; }
  isLocalWorkshop(id: unknown): boolean { return String(id || '').startsWith('local-'); }
  reports(): MonthlyReport[] { return this.asArray(this.workshop()?.['monthly_reports']) as MonthlyReport[]; }
  years(): number[] { return [...new Set(this.reports().map(r => Number(r.year)))].sort((a, b) => b - a); }
  reportsForYear(): MonthlyReport[] { return this.reports().filter(r => Number(r.year) === this.year()).sort((a, b) => Number(a.month) - Number(b.month)); }
  selectedReport(): MonthlyReport | undefined { return this.reports().find(r => Number(r.year) === this.year() && Number(r.month) === this.month()); }
  setYear(event: Event) { this.year.set(Number((event.target as HTMLSelectElement).value)); const first = this.reportsForYear()[0]; if (first) this.month.set(Number(first.month)); }
  setMonth(event: Event) { this.month.set(Number((event.target as HTMLSelectElement).value)); }
  setInvestorAmount(event: Event) { this.investorAmount.set(Number((event.target as HTMLInputElement).value.replace(/[^\d]/g, '')) || 0); }
  monthName(month: number): string { return ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'][Number(month) - 1] || String(month); }
  number(value: unknown): string { return (Number(value) || 0).toLocaleString('fa-IR'); }
  money(value: unknown): string { return value === null || value === undefined || value === '' ? 'ثبت نشده' : `${this.number(value)} تومان`; }
  totalMembers(w: Workshop): number { return this.asArray(w['team_categories']).reduce((sum, item) => sum + (Number(item['count']) || 0), w['manager']?.['name'] ? 1 : 0); }
  imageUrl(path: unknown): string { const value = String(path || ''); return value.startsWith('http') ? value : `${API_BASE_URL}${value}`; }
  externalUrl(value: unknown): string { const url = String(value || ''); return /^https?:\/\//i.test(url) ? url : `https://${url}`; }
  barHeight(value: unknown): number { const max = Math.max(1, ...this.reportsForYear().map(r => Number(r['sales']) || 0)); return Math.max(3, (Number(value) || 0) / max * 100); }
  investorShare(): string { const cost = Number(this.selectedReport()?.['total_monthly_value']) || 0; return (cost > 0 ? this.investorAmount() / (this.investorAmount() + cost) * 100 : 0).toFixed(2); }
  investorReturn(): number { return (Number(this.selectedReport()?.['profit']) || 0) * Number(this.investorShare()) / 100; }
  investorRoi(): string { return this.investorAmount() ? (this.investorReturn() / this.investorAmount() * 100).toFixed(2) : '0.00'; }
}
