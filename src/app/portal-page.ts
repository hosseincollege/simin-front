import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

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
            <label>شماره همراه<input required name="phone" inputmode="tel" placeholder="09xxxxxxxxx" /></label>
            <label>رمز عبور<input required name="password" type="password" placeholder="رمز عبور" /></label>
            <button type="submit">{{ kind === 'login' ? 'ورود' : 'ثبت‌نام' }} <span>←</span></button>
            @if (message) { <p class="page-message">{{ message }}</p> }
          </form>
          <p class="page-switch">{{ kind === 'login' ? 'حساب کاربری ندارید؟' : 'قبلاً ثبت‌نام کرده‌اید؟' }} <a [routerLink]="kind === 'login' ? '/register' : '/login'">{{ kind === 'login' ? 'ثبت‌نام' : 'ورود' }}</a></p>
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
    :host{font-family:'Vazirmatn',Tahoma,sans-serif}.page-overlay{position:fixed;inset:0;z-index:10;overflow:auto;background:#f4f7f4;display:grid;place-items:center;padding:24px}.page-card{position:relative;width:min(100%,620px);background:#fff;border:1px solid #e8ede9;border-radius:22px;padding:40px;box-shadow:0 24px 80px #173e2d20}.page-brand{display:inline-flex;flex-direction:column;text-decoration:none;color:#142d27;font-size:22px;font-weight:800}.page-brand span{font-size:10px;color:#87938c;font-weight:500}.page-back{position:absolute;left:40px;top:48px;text-decoration:none;color:#1e6950;font-size:12px}.page-heading{margin:35px 0 25px}.page-kicker{color:#1e6950;font-size:11px;font-weight:700}.page-heading h1{font-size:25px;margin:8px 0}.page-heading p,.detail-copy{color:#7c8982;font-size:12px;line-height:2}.page-card form{display:grid;gap:15px}.page-card label{display:grid;gap:7px;font-size:11px;font-weight:700}.page-card input{border:1px solid #e4eae5;border-radius:9px;padding:12px;font:inherit;font-size:12px;outline-color:#1e6950}.page-card form button{border:0;border-radius:9px;background:#1e6950;color:white;padding:13px;font:inherit;font-size:13px;cursor:pointer}.page-switch{text-align:center;color:#75827b;font-size:11px;margin-top:20px}.page-switch a{color:#1e6950;font-weight:700}.page-message{color:#9a6d22;font-size:11px;text-align:center}.page-project-list{display:grid;gap:10px}.page-project-list a{display:flex;justify-content:space-between;gap:15px;padding:16px;border:1px solid #e8ede9;border-radius:11px;text-decoration:none}.page-project-list b{font-size:12px}.page-project-list span{font-size:10px;color:#829088}.detail-summary{display:flex;align-items:center;gap:16px;background:#f2f7f3;border-radius:13px;padding:17px}.detail-icon{display:grid;place-items:center;width:52px;height:52px;background:#dcece0;border-radius:14px;font-size:27px;color:#1e6950}.detail-summary h2{font-size:15px;margin:0 0 5px}.detail-summary p{font-size:11px;color:#7b8981;margin:0}.detail-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:18px 0}.detail-stats div{padding:12px;border:1px solid #e8ede9;border-radius:10px}.detail-stats small,.detail-stats b{display:block}.detail-stats small{font-size:9px;color:#89958e;margin-bottom:7px}.detail-stats b{font-size:11px}@media(max-width:600px){.page-card{padding:28px 21px}.page-back{left:21px;top:34px;font-size:10px}.page-project-list a{flex-direction:column}.detail-stats{grid-template-columns:1fr}}
  `],
})
export class PortalPage {
  readonly kind: string;
  message = '';

  constructor(route: ActivatedRoute) {
    this.kind = route.snapshot.data['kind'] ?? (route.snapshot.paramMap.has('id') ? 'detail' : 'projects');
  }

  submit(event: Event) {
    event.preventDefault();
    this.message = 'اتصال به سامانه احراز هویت پس از راه‌اندازی API تکمیل می‌شود.';
  }
}
