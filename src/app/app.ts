import { Component, computed, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

type Project = {
  id: number;
  title: string;
  sector: string;
  city: string;
  requested: string;
  funded: number;
  returnLabel: string;
  duration: string;
  tone: string;
  icon: string;
};

type ThemeMode = 'system' | 'light' | 'dark';
type ContrastLevel = 'low' | 'standard' | 'high';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly currentPath = signal('/');
  readonly isHomeRoute = computed(() => this.currentPath() === '/');
  readonly mobileMenuOpen = signal(false);
  readonly themeMenuOpen = signal(false);
  readonly contrastMenuOpen = signal(false);
  readonly themeMode = signal<ThemeMode>('system');
  readonly lightContrast = signal<ContrastLevel>('standard');
  readonly darkContrast = signal<ContrastLevel>('standard');
  readonly themeModes: { value: ThemeMode; label: string }[] = [
    { value: 'system', label: 'سیستم' },
    { value: 'light', label: 'روشن' },
    { value: 'dark', label: 'تاریک' },
  ];
  readonly contrastLevels: { value: ContrastLevel; label: string }[] = [
    { value: 'low', label: 'کم' },
    { value: 'standard', label: 'معمولی' },
    { value: 'high', label: 'زیاد' },
  ];
  readonly selectedCategory = signal('همه');
  readonly searchTerm = signal('');
  readonly categories = ['همه', 'صنعت', 'کشاورزی', 'فناوری', 'سلامت'];
  readonly projects: Project[] = [
    { id: 1, title: 'توسعه خط تولید قطعات خودرو', sector: 'صنعت', city: 'اصفهان', requested: '۱۲ میلیارد تومان', funded: 68, returnLabel: '۲۸٪', duration: '۱۸ ماه', tone: 'blue', icon: '⚙' },
    { id: 2, title: 'گلخانه هوشمند سبزینه', sector: 'کشاورزی', city: 'یزد', requested: '۴.۵ میلیارد تومان', funded: 42, returnLabel: '۳۲٪', duration: '۱۲ ماه', tone: 'green', icon: '✳' },
    { id: 3, title: 'تجهیز کارگاه تولید تجهیزات پزشکی', sector: 'سلامت', city: 'تهران', requested: '۸ میلیارد تومان', funded: 81, returnLabel: '۲۴٪', duration: '۲۴ ماه', tone: 'violet', icon: '✚' },
    { id: 4, title: 'بازیافت و تولید مواد پلیمری', sector: 'صنعت', city: 'قزوین', requested: '۶.۲ میلیارد تومان', funded: 35, returnLabel: '۳۰٪', duration: '۲۰ ماه', tone: 'amber', icon: '⟳' },
  ];

  readonly filteredProjects = computed(() => {
    const category = this.selectedCategory();
    const query = this.searchTerm().trim();
    return this.projects.filter((project) =>
      (category === 'همه' || project.sector === category) &&
      (!query || `${project.title} ${project.city} ${project.sector}`.includes(query)),
    );
  });

  private darkModeQuery: MediaQueryList | null = null;

  constructor(router: Router) {
    this.currentPath.set(router.url.split('?')[0] || '/');
    router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe((event) => {
      this.currentPath.set(event.urlAfterRedirects.split('?')[0] || '/');
    });
    if (typeof window !== 'undefined') {
      try {
        const savedMode = window.localStorage.getItem('simin.theme.mode');
        const savedLightContrast = window.localStorage.getItem('simin.theme.light-contrast');
        const savedDarkContrast = window.localStorage.getItem('simin.theme.dark-contrast');
        if (savedMode === 'system' || savedMode === 'light' || savedMode === 'dark') {
          this.themeMode.set(savedMode);
        }
        if (savedLightContrast === 'low' || savedLightContrast === 'standard' || savedLightContrast === 'high') {
          this.lightContrast.set(savedLightContrast);
        }
        if (savedDarkContrast === 'low' || savedDarkContrast === 'standard' || savedDarkContrast === 'high') {
          this.darkContrast.set(savedDarkContrast);
        }
      } catch {
        // Theme settings still work for this session when browser storage is unavailable.
      }
      this.darkModeQuery = window.matchMedia?.('(prefers-color-scheme: dark)') ?? null;
      this.darkModeQuery?.addEventListener('change', this.applyTheme);
    }
    this.applyTheme();
  }

  setThemeMode(mode: ThemeMode) {
    this.themeMode.set(mode);
    this.saveThemePreferences();
    this.applyTheme();
  }

  toggleThemeMenu() {
    this.contrastMenuOpen.set(false);
    this.themeMenuOpen.update((open) => !open);
  }

  toggleContrastMenu() {
    this.themeMenuOpen.set(false);
    this.contrastMenuOpen.update((open) => !open);
  }

  setContrast(theme: 'light' | 'dark', level: ContrastLevel) {
    if (theme === 'light') this.lightContrast.set(level);
    else this.darkContrast.set(level);
    this.saveThemePreferences();
    this.applyTheme();
  }

  private readonly applyTheme = () => {
    if (typeof document === 'undefined') return;
    const preference = this.themeMode();
    const theme = preference === 'system'
      ? (this.darkModeQuery?.matches ? 'dark' : 'light')
      : preference;
    const contrast = theme === 'dark' ? this.darkContrast() : this.lightContrast();
    document.documentElement.dataset['theme'] = theme;
    document.documentElement.dataset['contrast'] = contrast;
  };

  private saveThemePreferences() {
    try {
      localStorage.setItem('simin.theme.mode', this.themeMode());
      localStorage.setItem('simin.theme.light-contrast', this.lightContrast());
      localStorage.setItem('simin.theme.dark-contrast', this.darkContrast());
    } catch {
      // Keep the selected settings active for this session if storage is unavailable.
    }
  }

  updateSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update((open) => !open);
  }
}
