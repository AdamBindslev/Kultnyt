import fs from 'fs';
import path from 'path';
import { KultnytDashboard } from '@/components/KultnytDashboard';
import { NewsItem, ReleaseItem, ConcertItem, HarvestMeta } from '@/types';

export const revalidate = 300; // Revalidate every 5 minutes

function readJsonFile<T>(filename: string, fallback: T): T {
  try {
    const filePath = path.join(process.cwd(), 'data', filename);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
  }
  return fallback;
}

export default async function Page() {
  const initialNews = readJsonFile<NewsItem[]>('news.json', []);
  const initialReleases = readJsonFile<ReleaseItem[]>('releases.json', []);
  const initialConcerts = readJsonFile<ConcertItem[]>('concerts.json', []);
  const initialMeta = readJsonFile<HarvestMeta | null>('meta.json', null);

  return (
    <KultnytDashboard
      initialNews={initialNews}
      initialReleases={initialReleases}
      initialConcerts={initialConcerts}
      initialMeta={initialMeta}
    />
  );
}
