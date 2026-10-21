import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AccountCredentials } from './account-credentials';
import { readLocalWorkshops, saveLocalWorkshop } from './workshop-store';

const API_BASE_URL = (globalThis as typeof globalThis & { SIMIN_API_URL?: string }).SIMIN_API_URL
  ?? 'http://localhost:3001';

@Component({ selector: 'app-landing-route', template: '' })
export class LandingRoute {}

@Component({
  selector: 'app-portal-page',
  imports: [RouterLink],
  template: `
    <main class="page-overlay" dir="rtl">
      <section class="page-card">
        <a class="page-brand" routerLink="/">سیمین <span>سرمایه‌گذاری در تولید</span></a>
        <a class="page-back" routerLink="/">بازگشت به خانه ←</a>
        @if (kind === 'login' || kind === 'register') {
          <div class="page-heading"><span class="page-kicker">{{ kind === 'login' ? 'خوش برگشتید' : 'به جمع سیمین بپیوندید' }}</span><h1>{{ kind === 'login' ? 'ورود به حساب کاربری' : 'ایجاد حساب کاربری' }}</h1><p>برای دسترسی به فرصت‌های سرمایه‌گذاری اطلاعات خود را وارد کنید.</p></div>
          <form (submit)="submit($event)">
            @if (kind === 'register') { <label>نام و نام خانوادگی<input required name="name" placeholder="نام شما" /></label> }
            <label>{{ kind === 'login' ? 'نام کاربری' : 'نام کاربری مدیر' }}<input required name="username" autocomplete="username" placeholder="نام کاربری" /></label>
            <label>رمز عبور<input required name="password" type="password" placeholder="رمز عبور" /></label>
            <button type="submit">{{ kind === 'login' ? 'ورود' : 'ثبت‌نام' }} <span>←</span></button>
            @if (message) { <p class="page-message">{{ message }}</p> }
          </form>
          @if (kind === 'login') {
            <button class="fill-admin-button" type="button" (click)="fillAdminCredentials()">پر کردن اطلاعات ادمین</button>
          }
          @if (kind === 'register') {
            <button class="fill-admin-button" type="button" (click)="fillRegistrationFields()">پر کردن همهٔ فیلدها برای ساخت مدیر</button>
          }
          <p class="page-switch">{{ kind === 'login' ? 'حساب کاربری ندارید؟' : 'قبلاً ثبت‌نام کرده‌اید؟' }} <a [routerLink]="kind === 'login' ? '/register' : '/login'">{{ kind === 'login' ? 'ثبت‌نام' : 'ورود' }}</a></p>
        } @else if (kind === 'create' || kind === 'edit') {
          <div class="page-heading"><span class="page-kicker">ویژهٔ تولیدکنندگان</span><h1>معرفی کارگاه تولیدی</h1><p>اطلاعات پایهٔ کارگاه را ثبت کنید تا برای بررسی و انتشار آماده شود.</p></div>
          <form (submit)="submit($event)">
            <label>نام کارگاه<input required name="name" [value]="editRecord?.['title'] || ''" placeholder="مثلاً کارگاه قطعه‌سازی سپهر" /></label>
            <label>حوزهٔ فعالیت<input required name="sector" [value]="editRecord?.['category'] || ''" placeholder="صنعت، کشاورزی، سلامت و ..." /></label>
            <label>استان و شهر<input required name="location" [value]="editRecord?.['location'] || ''" placeholder="استان، شهر" /></label>
            <label>شرح فعالیت<textarea required name="description" rows="4" [value]="editRecord?.['description'] || ''" placeholder="محصول، ظرفیت تولید و سابقهٔ کارگاه را توضیح دهید"></textarea></label>
            <label>سرمایهٔ موردنیاز (تومان)<input required name="capital" inputmode="numeric" [value]="editRecord?.['required_capital'] || ''" placeholder="مبلغ موردنیاز برای توسعه یا تولید" /></label>
            <button type="submit">{{ kind === 'edit' ? 'ذخیرهٔ تغییرات' : 'ایجاد کارگاه' }} <span>←</span></button>
            @if (message) { <p class="page-message">{{ message }}</p> }
          </form>
          <p class="detail-copy">اطلاعات در این نسخه روی همین مرورگر ذخیره می‌شود؛ فرصت سرمایه‌گذاری در پروندهٔ خود کارگاه نمایش داده می‌شود.</p>
        } @else if (kind === 'dashboard') {
          <div class="page-heading"><span class="page-kicker">فضای کاربری</span><h1>پنل سیمین</h1><p>مدیریت کارگاه‌ها، بررسی گزارش‌ها و پیگیری فرصت‌های سرمایه‌گذاری.</p></div>
          <div class="page-project-list"><a routerLink="/workshops/new"><b>ثبت کارگاه</b><span>معرفی طرح تولیدی برای ارزیابی</span></a><a routerLink="/workshops"><b>کارگاه‌های عمومی</b><span>مشاهدهٔ طرح‌های ثبت‌شده</span></a><a routerLink="/projects"><b>فرصت‌های سرمایه‌گذاری</b><span>بررسی فرصت‌های فعال</span></a></div>
          <div class="detail-summary"><span class="detail-icon">◈</span><div><h2>دسترسی مدیریتی</h2><p>نقش ادمین، تأیید کارگاه و مدیریت کاربران باید از بک‌اند تعیین شود.</p></div></div>
        } @else {
          <div class="page-heading"><span class="page-kicker">فرصت سرمایه‌گذاری</span><h1>{{ kind === 'detail' ? 'جزئیات پروژه تولیدی' : 'همه فرصت‌های سرمایه‌گذاری' }}</h1><p>پروژه‌های تولیدی با اطلاعات روشن برای تصمیم‌گیری مطمئن‌تر.</p></div>
          @if (kind === 'detail') {
            <div class="detail-summary"><span class="detail-icon">⚙</span><div><h2>توسعه خط تولید قطعات خودرو</h2><p>اصفهان · صنعت · ارزیابی‌شده</p></div></div>
            <div class="detail-stats"><div><small>سرمایه موردنیاز</small><b>۱۲ میلیارد تومان</b></div><div><small>بازده هدف سالانه</small><b>۲۸٪</b></div><div><small>مدت طرح</small><b>۱۸ ماه</b></div></div>
            <p class="detail-copy">این فرصت با هدف افزایش ظرفیت تولید قطعات خودرو و نوسازی تجهیزات کارگاه ارائه شده است. اطلاعات مالی و مدارک طرح پس از تکمیل فرایند ارزیابی در این صفحه در دسترس سرمایه‌گذاران قرار می‌گیرد.</p>
          } @else {
            <div class="page-project-list"><a routerLink="/projects/1"><b>توسعه خط تولید قطعات خودرو</b><span>اصفهان · صنعت · بازده هدف ۲۸٪</span></a><a routerLink="/projects/2"><b>گلخانه هوشمند سبزینه</b><span>یزد · کشاورزی · بازده هدف ۳۲٪</span></a><a routerLink="/projects/3"><b>تجهیز کارگاه تولید تجهیزات پزشکی</b><span>تهران · سلامت · بازده هدف ۲۴٪</span></a><a routerLink="/projects/4"><b>بازیافت و تولید مواد پلیمری</b><span>قزوین · صنعت · بازده هدف ۳۰٪</span></a></div>
          }
        }
      </section>
    </main>
  `,
  styles: [`
    :host{font-family:'Vazirmatn',Tahoma,sans-serif}.page-overlay{position:fixed;inset:0;z-index:10;overflow:auto;background:#f4f7f4;display:grid;place-items:center;padding:24px}.page-card{position:relative;width:min(100%,620px);background:#fff;border:1px solid #e8ede9;border-radius:22px;padding:40px;box-shadow:0 24px 80px #173e2d20}.page-brand{display:inline-flex;flex-direction:column;text-decoration:none;color:#142d27;font-size:22px;font-weight:800}.page-brand span{font-size:10px;color:#87938c;font-weight:500}.page-back{position:absolute;left:40px;top:48px;text-decoration:none;color:#1e6950;font-size:12px}.page-heading{margin:35px 0 25px}.page-kicker{color:#1e6950;font-size:11px;font-weight:700}.page-heading h1{font-size:25px;margin:8px 0}.page-heading p,.detail-copy{color:#7c8982;font-size:12px;line-height:2}.page-card form{display:grid;gap:15px}.page-card label{display:grid;gap:7px;font-size:11px;font-weight:700}.page-card input,.page-card textarea{border:1px solid #e4eae5;border-radius:9px;padding:12px;font:inherit;font-size:12px;outline-color:#1e6950}.page-card form button{border:0;border-radius:9px;background:#1e6950;color:white;padding:13px;font:inherit;font-size:13px;cursor:pointer}.page-switch{text-align:center;color:#75827b;font-size:11px;margin-top:20px}.page-switch a{color:#1e6950;font-weight:700}.page-message{color:#9a6d22;font-size:11px;text-align:center}.page-project-list{display:grid;gap:10px}.page-project-list a{display:flex;justify-content:space-between;gap:15px;padding:16px;border:1px solid #e8ede9;border-radius:11px;text-decoration:none}.page-project-list b{font-size:12px}.page-project-list span{font-size:10px;color:#829088}.detail-summary{display:flex;align-items:center;gap:16px;background:#f2f7f3;border-radius:13px;padding:17px}.detail-icon{display:grid;place-items:center;width:52px;height:52px;background:#dcece0;border-radius:14px;font-size:27px;color:#1e6950}.detail-summary h2{font-size:15px;margin:0 0 5px}.detail-summary p{font-size:11px;color:#7b8981;margin:0}.detail-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:18px 0}.detail-stats div,.detail-grid>div{padding:12px;border:1px solid #e8ede9;border-radius:10px}.detail-stats small,.detail-stats b,.detail-grid small,.detail-grid b{display:block}.detail-stats small,.detail-grid small{font-size:9px;color:#89958e;margin-bottom:7px}.detail-stats b,.detail-grid b{font-size:11px}.workshop-cover{width:100%;max-height:330px;object-fit:cover;border-radius:14px;margin:16px 0}.workshop-section{margin-top:22px;padding-top:17px;border-top:1px solid #edf0ed}.workshop-section h2{font-size:15px}.workshop-section>p{font-size:12px;line-height:2;color:#66756d}.detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.workshop-gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.workshop-gallery img{width:100%;height:110px;object-fit:cover;border-radius:9px}.report-controls{display:flex;gap:12px}.report-controls select{font:inherit;padding:7px;border:1px solid #dfe7e1;border-radius:8px}.report-bars{height:140px;display:flex;align-items:end;gap:5px;margin-top:18px;border-bottom:1px solid #dfe7e1}.report-bar{height:100%;flex:1;display:flex;flex-direction:column;justify-content:end;align-items:center;gap:5px}.report-bar i{width:70%;max-width:30px;min-height:3px;background:#458b62;border-radius:5px 5px 0 0}.report-bar small{font-size:8px;color:#78867e}@media(max-width:600px){.page-card{padding:28px 21px}.page-back{left:21px;top:34px;font-size:10px}.page-project-list a{flex-direction:column}.detail-stats{grid-template-columns:1fr}.detail-grid{grid-template-columns:1fr}.workshop-gallery{grid-template-columns:repeat(2,1fr)}}
    .fill-admin-button{display:block;width:100%;margin-top:10px;border:1px solid #dce7de;border-radius:9px;background:#f2f7f3;color:#245d42;padding:11px;text-align:center;font:inherit;font-size:11px;cursor:pointer}
    .page-overlay{position:relative;inset:auto;z-index:auto;display:block;min-height:calc(100vh - 180px);padding:24px 0;background:transparent!important}.page-card{margin-inline:auto}
  `],
})
export class PortalPage {
  readonly kind: string;
  readonly editRecord: Record<string, unknown> | undefined;
  private readonly messageState = signal('');
  get message() { return this.messageState(); }
  set message(value: string) { this.messageState.set(value); }
  constructor(route: ActivatedRoute, private readonly credentials: AccountCredentials, private readonly router: Router) {
    this.kind = route.snapshot.data['kind'] ?? (route.snapshot.paramMap.has('id') ? 'detail' : 'projects');
    const editId = route.snapshot.paramMap.get('id');
    this.editRecord = editId ? readLocalWorkshops().find((item) => item.id === editId) : undefined;
  }

  async submit(event: Event) {
    event.preventDefault();
    if (!['login', 'register', 'create', 'edit'].includes(this.kind)) {
      this.message = 'این فرم هنوز به API مربوطه متصل نشده است.';
      return;
    }
    const form = event.target as HTMLFormElement;
    const values = new FormData(form);
    const payload: Record<string, string> = {};
    values.forEach((value, key) => { payload[key] = String(value).trim(); });
    if (this.kind === 'create' || this.kind === 'edit') {
      const locationParts = (payload['location'] || '').split(/[،,]/).map((part) => part.trim());
      saveLocalWorkshop({
        ...(this.editRecord?.['id'] ? { id: String(this.editRecord['id']) } : {}),
        title: payload['name'], category: payload['sector'], province: locationParts[0] || '',
        location: locationParts.slice(1).join('، ') || locationParts[0] || '',
        description: payload['description'], required_capital: Number(payload['capital']) || 0,
        investments: [{ purpose: 'سرمایهٔ موردنیاز برای توسعهٔ همین کارگاه', amount: Number(payload['capital']) || 0 }],
      });
      await this.router.navigateByUrl('/workshops');
      return;
    }
    this.message = 'در حال ارتباط با سرور…';
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/${this.kind}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as { message?: string | string[]; token?: string; user?: { name: string; username: string; role: string } };
      if (!response.ok) throw new Error(Array.isArray(result.message) ? result.message.join(' ') : result.message || 'درخواست انجام نشد.');
      if (this.kind === 'register') {
        this.credentials.saveAdmin(payload['username'], payload['password']);
        this.message = 'حساب کاربری با موفقیت ساخته شد. حالا می‌توانید وارد شوید.';
        form.reset();
      } else if (result.token && result.user) {
        localStorage.setItem('simin.auth.token', result.token);
        localStorage.setItem('simin.auth.user', JSON.stringify(result.user));
        this.message = `ورود موفق بود. خوش آمدید ${result.user.name}.`;
        await this.router.navigateByUrl('/');
      }
    } catch (error) {
      this.message = error instanceof TypeError
        ? 'ارتباط با بک‌اند برقرار نشد. مطمئن شوید سرور بک‌اند روی پورت ۳۰۰۱ اجراست.'
        : (error as Error).message;
    }
  }

  fillRegistrationFields() {
    const random = new Uint8Array(12);
    crypto.getRandomValues(random);
    const suffix = Array.from(random.slice(0, 4), (value) => value.toString(16).padStart(2, '0')).join('');
    const password = Array.from(random, (value) => value.toString(16).padStart(2, '0')).join('');
    const account = { name: 'مدیر سیمین', username: `admin-${suffix}`, password };
    const name = document.querySelector<HTMLInputElement>('input[name="name"]');
    const username = document.querySelector<HTMLInputElement>('input[name="username"]');
    const passwordInput = document.querySelector<HTMLInputElement>('input[name="password"]');
    if (name) name.value = account.name;
    if (username) username.value = account.username;
    if (passwordInput) passwordInput.value = account.password;
    this.credentials.saveAdmin(account.username, account.password);
    this.message = 'اطلاعات حساب مدیر پر شد؛ ثبت‌نام را بزنید.';
  }

  fillAdminCredentials() {
    const account = this.credentials.readAdmin();
    if (!account) {
      this.message = 'ابتدا در صفحهٔ ثبت‌نام «پر کردن همهٔ فیلدها» و سپس ثبت‌نام را بزنید.';
      return;
    }
    const username = document.querySelector<HTMLInputElement>('input[name="username"]');
    const password = document.querySelector<HTMLInputElement>('input[name="password"]');
    if (username) username.value = account.username;
    if (password) password.value = account.password;
    this.message = 'اطلاعات ادمین وارد شد.';
  }
}
