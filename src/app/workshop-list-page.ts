import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DEMO_WORKSHOPS } from './workshop-demo-data';
import { readLocalWorkshops } from './workshop-store';

const API_BASE_URL = (globalThis as typeof globalThis & { SIMIN_API_URL?: string }).SIMIN_API_URL
  ?? 'http://localhost:3001';

type WorkshopCard = Record<string, any> & { id: number | string; title?: string };

@Component({
  selector: 'app-workshop-list-page',
  imports: [RouterLink],
  template: `
    <main class="list-page" dir="rtl">
      <header><div><span class="eyebrow">سیمین پلاس</span>@if (demoMode()) { <span class="demo-badge">داده‌های نمایشی</span> }<h1>کارگاه‌های تولیدی</h1><p>پروندهٔ هر کارگاه، اطلاعات تولید و فرصت سرمایه‌گذاری همان‌جا.</p></div>@if (authUser()) { <a routerLink="/workshops/new">ایجاد کارگاه</a> }</header>
      @if (loading()) { <section class="state">در حال دریافت فهرست کارگاه‌ها…</section> }
      @else if (error()) { <section class="state error">{{ error() }}</section> }
      @else if (!workshops().length) { <section class="state">هنوز کارگاهی ثبت نشده است.</section> }
      @else { <section class="cards">@for (workshop of workshops(); track workshop.id) {
        <a class="card" [routerLink]="['/workshops', workshop.id]">
          @if (workshop['cover_image']) { <img [src]="imageUrl(workshop['cover_image'])" [alt]="workshop.title || 'تصویر کارگاه'" /> } @else { <div class="image-placeholder">کارگاه تولیدی</div> }
          <div class="content"><span class="tag">{{ workshop['category'] || 'حوزه ثبت نشده' }}</span><h2>{{ workshop.title || 'کارگاه بدون عنوان' }}</h2><p>{{ workshop['province'] || 'استان نامشخص' }} · {{ workshop['location'] || 'موقعیت ثبت نشده' }}</p>
            <div class="stats"><span><small>سرمایهٔ موردنیاز</small><b>{{ money(workshop['required_capital']) }}</b></span><span><small>نوع مالکیت</small><b>{{ workshop['ownership_type'] || 'ثبت نشده' }}</b></span></div>
            <span class="details-link">مشاهدهٔ پروندهٔ کارگاه ←</span>
          </div>
        </a>
      }</section> }
    </main>
  `,
  styles: [`
    :host{display:block;font-family:'Vazirmatn',Tahoma,sans-serif;color:#18352b}.list-page{width:100%;max-width:none;margin:0;padding:38px 28px 70px}header{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:25px}header h1{font-size:30px;margin:5px 0}header p{font-size:13px;color:#75837a}.eyebrow{font-size:11px;font-weight:700;color:#39825d}.demo-badge{display:inline-block;margin-inline-start:9px;padding:4px 8px;border-radius:20px;background:#fff5df;color:#8c6821;font-size:9px}header>a{background:#1e6950;color:#fff;padding:12px 17px;border-radius:9px;text-decoration:none;font-size:12px}.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.card{display:block;overflow:hidden;background:#fff;border:1px solid #e4ece6;border-radius:16px;text-decoration:none;color:inherit;transition:transform .15s,box-shadow .15s}.card:hover{transform:translateY(-3px);box-shadow:0 12px 30px #173e2d18}.card>img,.image-placeholder{display:grid;width:100%;height:180px;object-fit:cover;background:#e9f1eb;place-items:center;color:#688271}.content{padding:17px}.tag{font-size:10px;color:#39825d;background:#edf6ef;padding:5px 8px;border-radius:20px}.content h2{font-size:16px;margin:12px 0 6px}.content>p{font-size:11px;color:#75837a}.stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:15px 0}.stats span{padding:10px;border:1px solid #edf1ed;border-radius:9px}.stats small,.stats b{display:block}.stats small{font-size:9px;color:#829087;margin-bottom:5px}.stats b{font-size:11px}.details-link{font-size:11px;color:#26734e;font-weight:700}.state{background:#fff;border:1px solid #e4ece6;border-radius:14px;padding:45px;text-align:center;color:#748279}.error{color:#a33939}@media(max-width:800px){.cards{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.list-page{padding:24px 14px}header{align-items:flex-start;flex-direction:column}.cards{grid-template-columns:1fr}}
    :host,.list-page{color:var(--text)}.list-page header p{color:var(--text-muted)}.list-page header h1{color:var(--text)}.list-page header>a{background:var(--accent);color:var(--page-bg)}.card,.state{background:var(--surface);border-color:var(--border);color:var(--text)}.card:hover{box-shadow:0 12px 30px #0003}.content h2,.stats b{color:var(--text)}.content>p,.stats small{color:var(--text-muted)}.stats span{border-color:var(--border);background:var(--surface-alt)}.details-link{color:var(--accent)}.tag,.demo-badge{background:var(--green-soft);color:var(--accent)}.card>img,.image-placeholder{background:var(--surface-alt);color:var(--text-muted)}.state{color:var(--text-muted)}.error{color:#d55}
  `],
})
export class WorkshopListPage {
  readonly loading = signal(true);
  readonly error = signal('');
  readonly demoMode = signal(false);
  readonly workshops = signal<WorkshopCard[]>([]);
  readonly authUser = signal(false);
  constructor() { try { this.authUser.set(!!localStorage.getItem('simin.auth.user')); } catch {} void this.load(); }
  private async load() {
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/api/workshops/`);
        if (response.ok) {
          const data = await response.json() as WorkshopCard[] | { results?: WorkshopCard[] };
          const records = Array.isArray(data) ? data : data.results || [];
          if (records.length) { this.workshops.set([...readLocalWorkshops(), ...records]); return; }
        }
      } catch { /* Fall back to the sample records while the workshop API is being built. */ }
      this.demoMode.set(true);
      this.workshops.set([...readLocalWorkshops(), ...DEMO_WORKSHOPS]);
      if (!this.workshops().length) this.error.set('دریافت فهرست کارگاه‌ها ناموفق بود.');
    }
    finally { this.loading.set(false); }
  }
  imageUrl(path: unknown): string { const value = String(path || ''); return value.startsWith('http') ? value : `${API_BASE_URL}${value}`; }
  money(value: unknown): string { return value === null || value === undefined || value === '' ? 'ثبت نشده' : `${(Number(value) || 0).toLocaleString('fa-IR')} تومان`; }
}
