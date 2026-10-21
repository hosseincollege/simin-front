import { Component, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AccountCredentials } from './account-credentials';
import { readLocalWorkshops, saveLocalWorkshop } from './workshop-store';

const API_BASE_URL = (globalThis as typeof globalThis & { SIMIN_API_URL?: string }).SIMIN_API_URL
  ?? 'http://localhost:3001';

@Component({ selector: 'app-landing-route', template: '' })
export class LandingRoute {}

@Component({
  selector: 'app-portal-page',
  imports: [RouterLink, DatePipe],
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
            @if (loadingEdit()) { <p class="page-message">در حال دریافت پروندهٔ کارگاه…</p> }
            <label>نام کارگاه<input required name="name" [value]="editRecord()?.['title'] || ''" placeholder="مثلاً کارگاه قطعه‌سازی سپهر" /></label>
            <label>حوزهٔ فعالیت<input required name="sector" [value]="editRecord()?.['category'] || ''" placeholder="صنعت، کشاورزی، سلامت و ..." /></label>
            <label>استان و شهر<input required name="location" [value]="editRecord()?.['location'] || ''" placeholder="استان، شهر" /></label>
            <label>شرح فعالیت<textarea required name="description" rows="4" [value]="editRecord()?.['description'] || ''" placeholder="محصول، ظرفیت تولید و سابقهٔ کارگاه را توضیح دهید"></textarea></label>
            <label>سرمایهٔ موردنیاز (تومان)<input required name="capital" inputmode="numeric" [value]="editRecord()?.['required_capital'] || ''" placeholder="مبلغ موردنیاز برای توسعه یا تولید" /></label>
            <button type="submit">{{ kind === 'edit' ? 'ذخیرهٔ تغییرات' : 'ایجاد کارگاه' }} <span>←</span></button>
            @if (message) { <p class="page-message">{{ message }}</p> }
          </form>
          <p class="detail-copy">&#1662;&#1585;&#1608;&#1606;&#1583;&#1607; &#1662;&#1587; &#1575;&#1586; &#1579;&#1576;&#1578; &#1576;&#1607; &#1589;&#1608;&#1585;&#1578; &#1662;&#1740;&#1588;&#8204;&#1606;&#1608;&#1740;&#1587; &#1584;&#1582;&#1740;&#1585;&#1607; &#1605;&#1740;&#8204;&#1588;&#1608;&#1583; &#1608; &#1578;&#1575; &#1586;&#1605;&#1575;&#1606; &#1576;&#1585;&#1585;&#1587;&#1740; &#1605;&#1583;&#1740;&#1585; &#1583;&#1585; &#1601;&#1607;&#1585;&#1587;&#1578; &#1593;&#1605;&#1608;&#1605;&#1740; &#1606;&#1605;&#1740;&#8204;&#1570;&#1740;&#1583;.</p>
        } @else if (kind === 'manage-workshops') {
          <div class="page-heading"><span class="page-kicker">&#1605;&#1583;&#1740;&#1585;&#1740;&#1578; &#1705;&#1575;&#1585;&#1711;&#1575;&#1607;</span><h1>&#1705;&#1575;&#1585;&#1711;&#1575;&#1607;&#8204;&#1607;&#1575;&#1740; &#1605;&#1606;</h1><p>&#1608;&#1590;&#1593;&#1740;&#1578; &#1608; &#1575;&#1591;&#1604;&#1575;&#1593;&#1575;&#1578; &#1705;&#1575;&#1585;&#1711;&#1575;&#1607;&#8204;&#1607;&#1575;&#1740; &#1579;&#1576;&#1578;&#8204;&#1588;&#1583;&#1607; &#1585;&#1575; &#1576;&#1576;&#1740;&#1606; &#1608; &#1605;&#1583;&#1740;&#1585;&#1740;&#1578; &#1705;&#1606;&#1740;&#1583;.</p></div>
          <div class="management-toolbar"><span>{{ managedWorkshops().length }} &#1705;&#1575;&#1585;&#1711;&#1575;&#1607;</span><a routerLink="/workshops/new">&#65291; &#1579;&#1576;&#1578; &#1705;&#1575;&#1585;&#1711;&#1575;&#1607;</a></div>
          @if (managementLoading()) { <div class="management-empty">&#1583;&#1585; &#1581;&#1575;&#1604; &#1583;&#1585;&#1740;&#1575;&#1601;&#1578; &#1662;&#1585;&#1608;&#1606;&#1583;&#1607;&#8204;&#1607;&#1575;...</div> }
          @else if (managementError()) { <div class="management-empty">{{ managementError() }}</div> }
          @else if (managedWorkshops().length) { <div class="page-project-list">@for (workshop of managedWorkshops(); track workshop['id']) { <article class="management-card"><div><b>{{ workshop['title'] }}</b><span>{{ workshop['category'] || '&#1581;&#1608;&#1586;&#1607; &#1606;&#1575;&#1605;&#1588;&#1582;&#1589;' }} &#183; {{ workshop['province'] || '&#1575;&#1587;&#1578;&#1575;&#1606; &#1606;&#1575;&#1605;&#1588;&#1582;&#1589;' }}</span><small>{{ statusLabel(workshop['status']) }} &#183; {{ formatCapital(workshop['required_capital']) }} &#1578;&#1608;&#1605;&#1575;&#1606;</small>@if (workshop['review_note']) { <small>{{ workshop['review_note'] }}</small> }<details (toggle)="loadReviewHistory(workshop['id'], $event)"><summary>&#1587;&#1575;&#1576;&#1602;&#1607; &#1576;&#1585;&#1585;&#1587;&#1740;</summary>@for (event of reviewEvents(workshop['id']); track event['id']) { <small>{{ reviewActionLabel(event['action']) }} &#183; {{ event['actor_name'] }} &#183; {{ event['created_at'] | date:'short' }}</small>@if (event['note']) { <small>{{ event['note'] }}</small> } }</details></div><div class="management-actions"><a [routerLink]="['/workshops', workshop['id'], 'edit']">&#1608;&#1740;&#1585;&#1575;&#1740;&#1588;</a>@if (canSubmit(workshop)) { <button type="button" (click)="submitForReview(workshop['id'])">&#1575;&#1585;&#1587;&#1575;&#1604; &#1576;&#1585;&#1575;&#1740; &#1576;&#1585;&#1585;&#1587;&#1740;</button> }</div></article> }</div> }
          @else { <div class="management-empty"><span class="detail-icon">&#9881;</span><h2>&#1607;&#1606;&#1608;&#1586; &#1705;&#1575;&#1585;&#1711;&#1575;&#1607;&#1740; &#1579;&#1576;&#1578; &#1606;&#1705;&#1585;&#1583;&#1607;&#8204;&#1575;&#1740;&#1583;</h2><p>&#1575;&#1608;&#1604;&#1740;&#1606; &#1662;&#1585;&#1608;&#1606;&#1583;&#1607; &#1585;&#1575; &#1576;&#1587;&#1575;&#1586;&#1740;&#1583; &#1578;&#1575; &#1575;&#1591;&#1604;&#1575;&#1593;&#1575;&#1578; &#1608; &#1585;&#1608;&#1606;&#1583; &#1705;&#1575;&#1585; &#1705;&#1575;&#1585;&#1711;&#1575;&#1607; &#1585;&#1575; &#1662;&#1740;&#1711;&#1740;&#1585;&#1740; &#1705;&#1606;&#1740;&#1583;.</p><a routerLink="/workshops/new">&#1588;&#1585;&#1608;&#1593; &#1579;&#1576;&#1578; &#1705;&#1575;&#1585;&#1711;&#1575;&#1607;</a></div> }
        } @else if (kind === 'review-workshops') {
          <div class="page-heading"><span class="page-kicker">&#1605;&#1583;&#1740;&#1585;&#1740;&#1578;</span><h1>&#1585;&#1587;&#1740;&#1583;&#1711;&#1740; &#1576;&#1607; &#1662;&#1585;&#1608;&#1606;&#1583;&#1607;&#8204;&#1607;&#1575;</h1><p>&#1662;&#1585;&#1608;&#1606;&#1583;&#1607;&#8204;&#1607;&#1575;&#1740; &#1575;&#1585;&#1587;&#1575;&#1604;&#8204;&#1588;&#1583;&#1607; &#1585;&#1575; &#1576;&#1585;&#1585;&#1587;&#1740; &#1705;&#1606;&#1740;&#1583;&#1548; &#1575;&#1585;&#1587;&#1575;&#1604; &#1576;&#1585;&#1575;&#1740; &#1575;&#1589;&#1604;&#1575;&#1581; &#1740;&#1575; &#1605;&#1606;&#1578;&#1588;&#1585; &#1705;&#1606;&#1740;&#1583;.</p></div>
          @if (reviewLoading()) { <div class="management-empty">&#1583;&#1585; &#1581;&#1575;&#1604; &#1583;&#1585;&#1740;&#1575;&#1601;&#1578; &#1589;&#1601; &#1576;&#1585;&#1585;&#1587;&#1740;...</div> }
          @else if (managementError()) { <div class="management-empty">{{ managementError() }}</div> }
          @else if (reviewQueue().length) { <div class="page-project-list">@for (item of reviewQueue(); track item['id']) { <article class="management-card review-card"><div><b>{{ item['title'] }}</b><span>{{ item['category'] }} &#183; {{ item['province'] }} &#183; {{ formatCapital(item['required_capital']) }} &#1578;&#1608;&#1605;&#1575;&#1606;</span><p>{{ item['description'] }}</p><label>&#1588;&#1585;&#1581; &#1575;&#1589;&#1604;&#1575;&#1581;<textarea #reviewNote rows="2" minlength="5" maxlength="1000" placeholder="&#1606;&#1602;&#1589; &#1605;&#1583;&#1575;&#1585;&#1705; &#1740;&#1575; &#1605;&#1608;&#1585;&#1583; &#1606;&#1740;&#1575;&#1586;&#1605;&#1606;&#1583; &#1575;&#1589;&#1604;&#1575;&#1581;..."></textarea></label><small>&#1576;&#1585;&#1575;&#1740; &#1575;&#1585;&#1587;&#1575;&#1604; &#1576;&#1585;&#1575;&#1740; &#1575;&#1589;&#1604;&#1575;&#1581;&#1548; &#1588;&#1585;&#1581; &#1585;&#1575; &#1576;&#1606;&#1608;&#1740;&#1587;&#1740;&#1583;.</small><div class="management-actions"><button type="button" (click)="requestRevision(item['id'], reviewNote.value)" [disabled]="reviewNote.value.trim().length < 5">&#1583;&#1585;&#1582;&#1608;&#1575;&#1587;&#1578; &#1575;&#1589;&#1604;&#1575;&#1581;</button><button type="button" class="review-publish" (click)="publishWorkshop(item['id'])">&#1605;&#1606;&#1578;&#1588;&#1585; &#1705;&#1585;&#1583;&#1606;</button></div></div></article> }</div> }
          @else { <div class="management-empty"><h2>&#1589;&#1601; &#1576;&#1585;&#1585;&#1587;&#1740; &#1582;&#1575;&#1604;&#1740; &#1575;&#1587;&#1578;</h2><p>&#1607;&#1606;&#1608;&#1586; &#1662;&#1585;&#1608;&#1606;&#1583;&#1607;&#8204;&#1575;&#1740; &#1576;&#1585;&#1575;&#1740; &#1576;&#1585;&#1585;&#1587;&#1740; &#1575;&#1585;&#1587;&#1575;&#1604; &#1606;&#1588;&#1583;&#1607;.</p></div> }
        } @else if (kind === 'investments') {
          <div class="page-heading"><span class="page-kicker">&#1587;&#1585;&#1605;&#1575;&#1740;&#1607;&#8204;&#1711;&#1584;&#1575;&#1585;&#1740; &#1588;&#1601;&#1575;&#1601;</span><h1>&#1605;&#1583;&#1740;&#1585;&#1740;&#1578; &#1587;&#1585;&#1605;&#1575;&#1740;&#1607;</h1><p>&#1662;&#1740;&#1711;&#1740;&#1585;&#1740; &#1587;&#1585;&#1605;&#1575;&#1740;&#1607;&#8204;&#1711;&#1584;&#1575;&#1585;&#1740;&#8204;&#1607;&#1575;&#1548; &#1711;&#1586;&#1575;&#1585;&#1588;&#8204;&#1607;&#1575; &#1608; &#1608;&#1590;&#1593;&#1740;&#1578; &#1587;&#1607;&#1575;&#1605; &#1588;&#1605;&#1575;.</p></div>
          <div class="investment-notice"><span>&#9432;</span><div><b>&#1587;&#1576;&#1583; &#1587;&#1585;&#1605;&#1575;&#1740;&#1607;&#8204;&#1711;&#1584;&#1575;&#1585;&#1740; &#1607;&#1606;&#1608;&#1586; &#1582;&#1575;&#1604;&#1740; &#1575;&#1587;&#1578;</b><p>&#1575;&#1605;&#1705;&#1575;&#1606; &#1579;&#1576;&#1578; &#1608; &#1662;&#1740;&#1711;&#1740;&#1585;&#1740; &#1605;&#1593;&#1575;&#1605;&#1604;&#1607; &#1583;&#1585; &#1575;&#1740;&#1606; &#1606;&#1587;&#1582;&#1607; &#1601;&#1593;&#1575;&#1604; &#1606;&#1740;&#1587;&#1578;&#1563; &#1607;&#1740;&#1670; &#1593;&#1605;&#1604;&#1740;&#1575;&#1578; &#1605;&#1575;&#1604;&#1740; &#1575;&#1606;&#1580;&#1575;&#1605; &#1606;&#1605;&#1740;&#8204;&#1588;&#1608;&#1583;. &#1605;&#1740;&#8204;&#1578;&#1608;&#1575;&#1606;&#1740;&#1583; &#1601;&#1585;&#1589;&#1578;&#8204;&#1607;&#1575;&#1740; &#1578;&#1608;&#1604;&#1740;&#1583;&#1740; &#1585;&#1575; &#1576;&#1585;&#1585;&#1587;&#1740; &#1705;&#1606;&#1740;&#1583;.</p><a routerLink="/workshops">&#1576;&#1585;&#1585;&#1587;&#1740; &#1705;&#1575;&#1585;&#1711;&#1575;&#1607;&#8204;&#1607;&#1575; &#8592;</a></div></div>
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
    .management-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:-8px 0 16px;color:var(--text-muted);font-size:11px}.management-toolbar>a,.management-empty>a,.management-card>a{padding:9px 13px;border:1px solid var(--border);border-radius:9px;color:var(--accent);text-decoration:none;font-size:11px;font-weight:700}.management-card{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:16px;border:1px solid var(--border);border-radius:12px;background:var(--surface)}.management-card b,.management-card span,.management-card small{display:block}.management-card b{color:var(--text);font-size:13px}.management-card span,.management-card small{margin-top:5px;color:var(--text-muted);font-size:10px}.management-empty{display:grid;justify-items:center;text-align:center;padding:35px 20px;border:1px dashed var(--border);border-radius:14px}.management-empty h2{margin:14px 0 0;font-size:16px;color:var(--text)}.management-empty p{max-width:420px;color:var(--text-muted);font-size:11px;line-height:1.9}.investment-notice{display:flex;gap:13px;padding:18px;border:1px solid var(--border);border-radius:13px;background:var(--surface-alt);color:var(--text)}.investment-notice>span{color:var(--accent);font-size:20px}.investment-notice b{font-size:13px}.investment-notice p{color:var(--text-muted);font-size:11px;line-height:1.9}.investment-notice a{color:var(--accent);font-size:11px;font-weight:700;text-decoration:none}@media(max-width:600px){.management-toolbar{align-items:flex-start;flex-direction:column}.management-card{align-items:flex-start;flex-direction:column}}
    .management-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.management-actions button{padding:9px 12px;border:1px solid var(--border);border-radius:9px;background:var(--surface-alt);color:var(--accent);font:inherit;font-size:11px;cursor:pointer}.management-actions button:disabled{opacity:.45;cursor:not-allowed}.management-actions .review-publish{background:var(--accent);color:var(--background,#111)}.review-card{align-items:stretch}.review-card>div{width:100%}.review-card p{color:var(--text-muted);font-size:12px;line-height:1.8}.review-card label{display:block;margin:12px 0 5px;color:var(--text-muted);font-size:11px}.review-card textarea{display:block;width:100%;margin-top:6px;padding:10px;border:1px solid var(--border);border-radius:9px;background:var(--surface);color:var(--text);font:inherit;resize:vertical}.page-overlay{position:relative;inset:auto;z-index:auto;display:block;min-height:calc(100vh - 180px);padding:24px 0;background:transparent!important}.page-card{margin-inline:auto}
  `],
})
export class PortalPage {
  readonly kind: string;
  readonly editRecord = signal<Record<string, unknown> | undefined>(undefined);
  readonly managedWorkshops = signal<Record<string, any>[]>([]);
  readonly managementLoading = signal(false);
  readonly managementError = signal('');
  readonly loadingEdit = signal(false);
  readonly reviewQueue = signal<Record<string, any>[]>([]);
  readonly reviewLoading = signal(false);
  readonly reviewHistoryByWorkshop = signal<Record<string, Record<string, any>[]>>({});
  private readonly messageState = signal('');
  get message() { return this.messageState(); }
  set message(value: string) { this.messageState.set(value); }
  constructor(route: ActivatedRoute, private readonly credentials: AccountCredentials, private readonly router: Router) {
    this.kind = route.snapshot.data['kind'] ?? (route.snapshot.paramMap.has('id') ? 'detail' : 'projects');
    const editId = route.snapshot.paramMap.get('id');
    if (this.kind === 'manage-workshops') void this.loadOwnedWorkshops();
    if (this.kind === 'review-workshops') void this.loadReviewQueue();
    if (this.kind === 'edit' && editId) void this.loadEditRecord(editId);
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
      const locationParts = (payload['location'] || '').split(new RegExp('[' + String.fromCharCode(0x60c) + ',]')).map((part) => part.trim());
      const workshop = { title: payload['name'], category: payload['sector'], province: locationParts[0] || '', location: locationParts.slice(1).join(String.fromCharCode(0x60c) + ' ') || locationParts[0] || '', description: payload['description'], requiredCapital: payload['capital'] };
      const id = String(this.editRecord()?.['id'] || '');
      if (this.kind === 'edit' && id.startsWith('local-')) {
        saveLocalWorkshop({ id, title: workshop.title, category: workshop.category, province: workshop.province, location: workshop.location, description: workshop.description, required_capital: Number(workshop.requiredCapital) || 0 });
        await this.router.navigateByUrl('/manage-workshops'); return;
      }
      const token = localStorage.getItem('simin.auth.token');
      if (!token) { await this.router.navigateByUrl('/login'); return; }
      this.message = 'Saving workshop draft?';
      try {
        const response = await fetch(API_BASE_URL + '/api/workshops' + (this.kind === 'edit' ? '/' + encodeURIComponent(id) : ''), { method: this.kind === 'edit' ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(workshop) });
        const result = await response.json().catch(() => ({})) as { message?: string | string[] };
        if (!response.ok) throw new Error(Array.isArray(result.message) ? result.message.join(' ') : result.message || 'Could not save the workshop.');
        await this.router.navigateByUrl('/manage-workshops');
      } catch (error) { this.message = error instanceof TypeError ? 'Could not connect to the server.' : (error as Error).message; }
      return;
    }    this.message = 'در حال ارتباط با سرور…';
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

  editLocation(): string { const record = this.editRecord(); return [record?.['province'], record?.['location']].filter(Boolean).join(String.fromCharCode(0x60c) + ' '); }

  statusLabel(status: unknown): string {
    if (status === 'submitted') return 'در صف بررسی';
    const labels: Record<string, string> = { draft: 'پیش‌نویس', revision: 'نیازمند اصلاح', published: 'منتشرشده' };
    return labels[String(status || '')] || 'پیش‌نویس محلی';
  }

  formatCapital(value: unknown): string {
    const amount = Number(value);
    return amount > 0 ? amount.toLocaleString('fa-IR') : '—';
  }

  canSubmit(workshop: Record<string, any>): boolean {
    return !String(workshop['id']).startsWith('local-') && ['draft', 'revision'].includes(String(workshop['status']));
  }

  reviewEvents(id: unknown): Record<string, any>[] {
    return this.reviewHistoryByWorkshop()[String(id)] || [];
  }

  reviewActionLabel(action: unknown): string {
    const labels: Record<string, string> = {
      created: 'پرونده ساخته شد', updated: 'پرونده ویرایش شد', submitted: 'برای بررسی ارسال شد',
      revision_requested: 'درخواست اصلاح ثبت شد', published: 'پرونده منتشر شد',
    };
    return labels[String(action)] || String(action);
  }

  async loadReviewHistory(id: unknown, event: Event) {
    const details = event.currentTarget as HTMLDetailsElement;
    const key = String(id);
    if (!details.open || Object.prototype.hasOwnProperty.call(this.reviewHistoryByWorkshop(), key)) return;
    const token = localStorage.getItem('simin.auth.token');
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/workshops/${encodeURIComponent(key)}/review-history`, { headers: { Authorization: 'Bearer ' + token } });
      if (!response.ok) throw new Error('Could not load review history.');
      const history = await response.json() as Record<string, any>[];
      this.reviewHistoryByWorkshop.update((all) => ({ ...all, [key]: history }));
    } catch {
      this.reviewHistoryByWorkshop.update((all) => ({ ...all, [key]: [] }));
    }
  }

  async submitForReview(id: unknown) {
    const token = localStorage.getItem('simin.auth.token');
    if (!token) { await this.router.navigateByUrl('/login'); return; }
    try {
      const response = await fetch(`${API_BASE_URL}/api/workshops/${encodeURIComponent(String(id))}/submit`, {
        method: 'POST', headers: { Authorization: 'Bearer ' + token },
      });
      const result = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) throw new Error(result.message || 'Could not submit workshop for review.');
      await this.loadOwnedWorkshops();
    } catch (error) {
      this.managementError.set(error instanceof TypeError ? 'Could not connect to the server.' : (error as Error).message);
    }
  }

  private async reviewRequest(id: unknown, action: 'publish' | 'request-revision', note?: string) {
    const token = localStorage.getItem('simin.auth.token');
    if (!token) { await this.router.navigateByUrl('/login'); return; }
    try {
      const response = await fetch(`${API_BASE_URL}/api/workshops/${encodeURIComponent(String(id))}/${action === 'publish' ? 'publish' : 'request-revision'}`, {
        method: 'POST', headers: { Authorization: 'Bearer ' + token, ...(note ? { 'Content-Type': 'application/json' } : {}) },
        ...(note ? { body: JSON.stringify({ note }) } : {}),
      });
      const result = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) throw new Error(result.message || 'Review action failed.');
      await this.loadReviewQueue();
    } catch (error) {
      this.managementError.set(error instanceof TypeError ? 'Could not connect to the server.' : (error as Error).message);
    }
  }

  publishWorkshop(id: unknown) { return this.reviewRequest(id, 'publish'); }

  requestRevision(id: unknown, note: string) {
    const cleaned = note.trim();
    if (cleaned.length < 5) return;
    return this.reviewRequest(id, 'request-revision', cleaned);
  }

  private async loadReviewQueue() {
    this.reviewLoading.set(true);
    this.managementError.set('');
    try {
      const token = localStorage.getItem('simin.auth.token');
      if (!token) throw new Error('Please sign in as an administrator.');
      const response = await fetch(`${API_BASE_URL}/api/workshops/review-queue`, { headers: { Authorization: 'Bearer ' + token } });
      if (!response.ok) throw new Error(response.status === 403 ? 'Administrator access is required.' : 'Could not load the review queue.');
      this.reviewQueue.set(await response.json() as Record<string, any>[]);
    } catch (error) {
      this.managementError.set(error instanceof TypeError ? 'Could not connect to the server.' : (error as Error).message);
    } finally { this.reviewLoading.set(false); }
  }

  private async loadEditRecord(id: string) {
    const local = readLocalWorkshops().find((item) => String(item.id) === id); if (local) { this.editRecord.set(local); return; }
    this.loadingEdit.set(true);
    try { const token = localStorage.getItem('simin.auth.token'); if (!token) return; const response = await fetch(API_BASE_URL + '/api/workshops/mine/' + encodeURIComponent(id), { headers: { Authorization: 'Bearer ' + token } }); if (!response.ok) throw new Error('Could not load the workshop.'); this.editRecord.set(await response.json() as Record<string, unknown>); }
    catch (error) { this.message = (error as Error).message; } finally { this.loadingEdit.set(false); }
  }
  private async loadOwnedWorkshops() {
    this.managementLoading.set(true);
    try { const token = localStorage.getItem('simin.auth.token'); if (!token) throw new Error('Please sign in to manage workshops.'); const response = await fetch(API_BASE_URL + '/api/workshops/mine', { headers: { Authorization: 'Bearer ' + token } }); if (!response.ok) throw new Error('Could not load your workshops from the server.'); const records = await response.json() as Record<string, any>[]; this.managedWorkshops.set([...readLocalWorkshops(), ...records]); }
    catch (error) { this.managementError.set(error instanceof TypeError ? 'Could not connect to the server.' : (error as Error).message); } finally { this.managementLoading.set(false); }
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
