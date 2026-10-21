export type LocalWorkshop = Record<string, unknown> & { id: string; title: string };

const STORAGE_KEY = 'simin.workshops.local';

export function readLocalWorkshops(): LocalWorkshop[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function saveLocalWorkshop(workshop: Omit<LocalWorkshop, 'id'> & { id?: string }): LocalWorkshop {
  const workshops = readLocalWorkshops();
  const id = workshop.id || `local-${Date.now()}`;
  const saved = { ...workshop, id } as LocalWorkshop;
  const index = workshops.findIndex((item) => item.id === id);
  if (index < 0) workshops.unshift(saved);
  else workshops[index] = saved;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workshops));
  return saved;
}
