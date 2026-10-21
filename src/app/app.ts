import { Component, computed, HostListener, signal } from '@angular/core';
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
  readonly accountMenuOpen = signal(false);
  readonly authUser = signal<{ name: string; username: string; role: string } | null>(null);

  @HostListener('document:click', ['$event'])
  closeAccountMenuOnOutsideClick(event: MouseEvent) {
    if (!(event.target as HTMLElement | null)?.closest('.account-menu')) this.accountMenuOpen.set(false);
  }
  readonly themeMode = signal<ThemeMode>('system');
  readonly lightContrast = signal<ContrastLevel>('standard');
  readonly darkContrast = signal<ContrastLevel>('standard');
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
    this.loadAuthUser();
    router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe((event) => {
      this.currentPath.set(event.urlAfterRedirects.split('?')[0] || '/');
      this.loadAuthUser();
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

  cycleTheme() {
    const cycle: ThemeMode[] = ['system', 'dark', 'light'];
    const next = (cycle.indexOf(this.themeMode()) + 1) % cycle.length;
    this.setThemeMode(cycle[next]);
  }

  themeModeLabel(): string {
    return { system: 'سیستم', dark: 'تیره', light: 'روشن' }[this.themeMode()];
  }

  themeModeIcon(): string {
    return { system: '🖥', dark: '☾', light: '☀' }[this.themeMode()];
  }

  private loadAuthUser() {
    try {
      const value = localStorage.getItem('simin.auth.user');
      this.authUser.set(value ? JSON.parse(value) as { name: string; username: string; role: string } : null);
    } catch {
      this.authUser.set(null);
    }
  }

  logout() {
    localStorage.removeItem('simin.auth.token');
    localStorage.removeItem('simin.auth.user');
    this.authUser.set(null);
  }

  activeThemeLabel(): string {
    return this.effectiveTheme() === 'dark' ? 'تیره' : 'روشن';
  }

  contrastLabel(): string {
    const level = this.effectiveTheme() === 'dark' ? this.darkContrast() : this.lightContrast();
    return { low: 'کم', standard: 'معمولی', high: 'زیاد' }[level];
  }

  contrastIcon(): string {
    const level = this.effectiveTheme() === 'dark' ? this.darkContrast() : this.lightContrast();
    return { low: '◔', standard: '◑', high: '●' }[level];
  }

  cycleContrast() {
    const theme = this.effectiveTheme();
    const current = theme === 'dark' ? this.darkContrast() : this.lightContrast();
    const cycle: ContrastLevel[] = ['low', 'standard', 'high'];
    const next = (cycle.indexOf(current) + 1) % cycle.length;
    this.setContrast(theme, cycle[next]);
  }

  setContrast(theme: 'light' | 'dark', level: ContrastLevel) {
    if (theme === 'light') this.lightContrast.set(level);
    else this.darkContrast.set(level);
    this.saveThemePreferences();
    this.applyTheme();
  }

  private readonly applyTheme = () => {
    if (typeof document === 'undefined') return;
    const theme = this.effectiveTheme();
    const contrast = theme === 'dark' ? this.darkContrast() : this.lightContrast();
    document.documentElement.dataset['theme'] = theme;
    document.documentElement.dataset['contrast'] = contrast;
  };

  private effectiveTheme(): 'light' | 'dark' {
    const preference = this.themeMode();
    return preference === 'system' ? (this.darkModeQuery?.matches ? 'dark' : 'light') : preference;
  }

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
