import { Component, computed, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

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

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
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

  updateSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }
}
