import { Metadata } from 'next';
import { PageHeader } from '@/components/shared/page-header';

export const metadata: Metadata = {
  title: 'Kalender Akademik | Sistem Akademik SD N 2 Kalierang',
};
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getEvents } from '@/app/actions/events';
import { EVENT_TYPE_LABELS } from '@/types';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { CalendarDays } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';

const eventTypeColors: Record<string, string> = {
  libur: 'bg-red-100 text-red-700 border-red-200',
  ujian: 'bg-amber-100 text-amber-700 border-amber-200',
  kegiatan: 'bg-blue-100 text-blue-700 border-blue-200',
  rapat: 'bg-purple-100 text-purple-700 border-purple-200',
};

export default async function KalenderPage() {
  const events = await getEvents();

  // Group events by month
  const grouped = new Map<string, typeof events>();
  for (const event of events) {
    const monthKey = format(new Date(event.start_date), 'yyyy-MM');
    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, []);
    }
    grouped.get(monthKey)!.push(event);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kalender Akademik"
        description="Jadwal kegiatan dan acara sekolah"
      />

      {events.length > 0 ? (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([monthKey, monthEvents]) => (
            <div key={monthKey}>
              <h2 className="text-lg font-semibold mb-4 text-foreground">
                {format(new Date(monthKey + '-01'), 'MMMM yyyy', { locale: idLocale })}
              </h2>
              <div className="space-y-3">
                {monthEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className="flex flex-col items-center justify-center min-w-[3.5rem] h-14 rounded-xl bg-primary/10 text-primary">
                        <span className="text-lg font-bold leading-none">
                          {format(new Date(event.start_date), 'dd')}
                        </span>
                        <span className="text-[10px] uppercase mt-0.5">
                          {format(new Date(event.start_date), 'MMM', { locale: idLocale })}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-sm">{event.title}</h3>
                          <Badge
                            variant="outline"
                            className={eventTypeColors[event.event_type] || ''}
                          >
                            {EVENT_TYPE_LABELS[event.event_type]}
                          </Badge>
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(event.start_date), 'dd/MM/yyyy')}
                          {event.start_date !== event.end_date &&
                            ` — ${format(new Date(event.end_date), 'dd/MM/yyyy')}`}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CalendarDays}
          title="Belum ada acara"
          description="Tambahkan acara akademik untuk ditampilkan di kalender."
        />
      )}
    </div>
  );
}
