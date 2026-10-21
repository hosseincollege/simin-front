export type WorkshopRecord = Record<string, any> & { id: number | string; title: string };

const seeds = [
  { id: 1, title: 'توسعه خط تولید قطعات خودرو', category: 'صنعت', province: 'اصفهان', location: 'شهرک صنعتی مبارکه', product: 'قطعات خودرو', capital: 12_000_000_000, rent: 180_000_000, area: 2400, volume: 18500, sales: 2_450_000_000, team: [['تولید', 24], ['فنی و مهندسی', 6], ['فروش و اداری', 5]], manager: 'مدیر تولید', customers: [['قطعه‌سازان سپاهان', 7200], ['تأمین خودرو اصفهان', 5100], ['سایر مشتریان', 3400]] },
  { id: 2, title: 'گلخانه هوشمند سبزینه', category: 'کشاورزی', province: 'یزد', location: 'مهریز، منطقه کشاورزی', product: 'محصولات گلخانه‌ای', capital: 4_500_000_000, rent: 75_000_000, area: 5200, volume: 9400, sales: 890_000_000, team: [['تولید و کشت', 14], ['فنی و نگهداری', 3], ['بسته‌بندی و فروش', 5]], manager: 'مدیر گلخانه', customers: [['بازار میوه و تره‌بار', 4200], ['فروشگاه‌های زنجیره‌ای', 3000], ['سایر مشتریان', 1500]] },
  { id: 3, title: 'تجهیز کارگاه تولید تجهیزات پزشکی', category: 'سلامت', province: 'تهران', location: 'شهرک صنعتی چهاردانگه', product: 'تجهیزات پزشکی', capital: 8_000_000_000, rent: 130_000_000, area: 1650, volume: 6200, sales: 1_620_000_000, team: [['تولید', 18], ['کنترل کیفیت', 7], ['فروش و اداری', 6]], manager: 'مدیرعامل', customers: [['مراکز درمانی', 2400], ['توزیع‌کنندگان تجهیزات', 2100], ['سایر مشتریان', 1100]] },
  { id: 4, title: 'بازیافت و تولید مواد پلیمری', category: 'صنعت', province: 'قزوین', location: 'شهرک صنعتی لیا', product: 'مواد پلیمری بازیافتی', capital: 6_200_000_000, rent: 95_000_000, area: 3100, volume: 14200, sales: 1_280_000_000, team: [['بازیافت و تولید', 20], ['آزمایشگاه و فنی', 4], ['فروش و اداری', 4]], manager: 'مدیر کارخانه', customers: [['تولیدکنندگان لوازم پلاستیکی', 5800], ['صنایع بسته‌بندی', 4300], ['سایر مشتریان', 2800]] },
];

function makeWorkshop(seed: typeof seeds[number]): WorkshopRecord {
  const monthlyReports = Array.from({ length: 12 }, (_, index) => {
    const sales = Math.round(seed.sales * (0.79 + index * 0.035));
    const production = Math.round(seed.volume * (0.76 + index * 0.018));
    const equipment = Math.round(seed.rent * 0.32);
    const materials = Math.round(sales * 0.48);
    const salary = Math.round(seed.team.reduce((sum, [, count]) => sum + Number(count), 0) * 18_000_000);
    const total = seed.rent + equipment + materials + salary;
    const profit = sales - total;
    return {
      year: 1404, month: index + 1, sales, production_amount: production,
      sold_amount: Math.round(production * 0.88), fixed_workshop_rent: seed.rent,
      equipment_rent: equipment, material_costs: materials, salary_maintenance: salary,
      total_monthly_value: total, profit,
      profit_percentage: sales ? Math.round((profit / sales) * 10000) / 10000 : 0,
    };
  });

  return {
    id: seed.id, title: seed.title, description: `این پروندهٔ نمایشی، اطلاعات عملیاتی نمونهٔ کارگاه ${seed.product} را برای نمایش ساختار جزئیات و گزارش‌های ماهانه نشان می‌دهد.`,
    category: seed.category, province: seed.province, location: seed.location,
    product_type: seed.product, products: [{ name: seed.product, monthly_volume: seed.volume, customers: seed.customers.map(([name, monthly_order_volume]) => ({ name, monthly_order_volume })) }],
    required_capital: seed.capital, ownership_type: 'خصوصی', area: seed.area,
    monthly_costs: { rent: seed.rent }, start_date: '1402/08/12',
    contact_number: '', website: '', email: '', sales_representative: '',
    manager: { name: seed.manager, description: 'مدیریت عملیات تولید، کنترل کیفیت و برنامه‌ریزی ظرفیت کارگاه.' },
    team_categories: seed.team.map(([category_name, count]) => ({ category_name, count })),
    investments: [
      { amount: Math.round(seed.capital * 0.55), purpose: 'خرید و نوسازی ماشین‌آلات تولید' },
      { amount: Math.round(seed.capital * 0.3), purpose: 'تأمین مواد اولیه و سرمایه در گردش' },
      { amount: Math.round(seed.capital * 0.15), purpose: 'توسعه بسته‌بندی و شبکهٔ فروش' },
    ],
    monthly_reports: monthlyReports,
    images: [],
  };
}

export const DEMO_WORKSHOPS: WorkshopRecord[] = seeds.map(makeWorkshop);
export function findDemoWorkshop(id: string | number): WorkshopRecord | undefined {
  return DEMO_WORKSHOPS.find((workshop) => String(workshop.id) === String(id));
}
