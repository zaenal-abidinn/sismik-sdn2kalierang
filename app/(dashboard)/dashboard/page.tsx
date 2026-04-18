import { Metadata } from 'next';
import { getCurrentUser } from '@/app/actions/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Beranda | Sistem Akademik SD N 2 Kalierang',
};
import {
  Users,
  GraduationCap,
  ClipboardCheck,
  CalendarDays,
  BookOpen,
  BarChart3,
} from 'lucide-react';
import { StatCard } from './_components/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { OverviewChart } from '../_components/overview-chart';
import { EVENT_TYPE_LABELS } from '@/types';

export default async function DashboardPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect('/login');

  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  // Fetch stats & chart data
  const startOfThisWeek = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  const endOfThisWeek = endOfWeek(new Date(), { weekStartsOn: 1 });

  const [
    { count: totalStudents },
    { count: totalTeachers },
    { data: todayAttendance },
    { data: upcomingEvents },
    { data: weeklyAttendance },
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'aktif'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'guru'),
    supabase.from('attendances').select('status').eq('date', today),
    supabase
      .from('academic_events')
      .select('*')
      .gte('end_date', today)
      .order('start_date', { ascending: true })
      .limit(5),
    supabase
      .from('attendances')
      .select('date, status')
      .gte('date', startOfThisWeek.toISOString().split('T')[0])
      .lte('date', endOfThisWeek.toISOString().split('T')[0]),
  ]);

  // Process chart data
  const weekDays = eachDayOfInterval({ start: startOfThisWeek, end: endOfThisWeek }).slice(0, 6); // Senin-Sabtu
  const chartData = weekDays.map((day) => {
    const dayName = format(day, 'EEEE', { locale: idLocale });
    const count = weeklyAttendance?.filter(
      (a) => isSameDay(new Date(a.date), day) && a.status === 'hadir'
    ).length ?? 0;
    return { name: dayName, total: count };
  });

  // Calculate attendance summary
  const attendanceSummary = {
    hadir: todayAttendance?.filter((a) => a.status === 'hadir').length ?? 0,
    sakit: todayAttendance?.filter((a) => a.status === 'sakit').length ?? 0,
    izin: todayAttendance?.filter((a) => a.status === 'izin').length ?? 0,
    alpha: todayAttendance?.filter((a) => a.status === 'alpha').length ?? 0,
  };
  const totalAttendanceToday =
    attendanceSummary.hadir +
    attendanceSummary.sakit +
    attendanceSummary.izin +
    attendanceSummary.alpha;

  const greetingName = profile.full_name.split(' ')[0];

  const eventTypeColors: Record<string, string> = {
    libur: 'bg-red-100 text-red-700 border-red-200',
    ujian: 'bg-amber-100 text-amber-700 border-amber-200',
    kegiatan: 'bg-blue-100 text-blue-700 border-blue-200',
    rapat: 'bg-purple-100 text-purple-700 border-purple-200',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Selamat datang, ${greetingName}! 👋`}
        description={`${format(new Date(), "EEEE, dd MMMM yyyy", { locale: idLocale })} — ${profile.role === 'superadmin' ? 'Panel Super Admin' : profile.role === 'kepala_sekolah' ? 'Panel Kepala Sekolah' : profile.role === 'guru' ? 'Panel Guru' : 'Panel Tata Usaha'}`}
      />

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Siswa Aktif"
          value={totalStudents ?? 0}
          description="Siswa terdaftar aktif"
          icon={Users}
        />
        {profile.role === 'kepala_sekolah' && (
          <StatCard
            title="Total Guru"
            value={totalTeachers ?? 0}
            description="Guru aktif mengajar"
            icon={GraduationCap}
          />
        )}
        <StatCard
          title="Kehadiran Hari Ini"
          value={totalAttendanceToday > 0 ? `${Math.round((attendanceSummary.hadir / totalAttendanceToday) * 100)}%` : '-'}
          description={totalAttendanceToday > 0 ? `${attendanceSummary.hadir} dari ${totalAttendanceToday} siswa hadir` : 'Belum ada data absensi'}
          icon={ClipboardCheck}
        />
        <StatCard
          title="Agenda Mendatang"
          value={upcomingEvents?.length ?? 0}
          description="Kegiatan yang akan datang"
          icon={CalendarDays}
        />
        {profile.role !== 'kepala_sekolah' && (
          <StatCard
            title="Mata Pelajaran"
            value="-"
            description="Mata pelajaran diampu"
            icon={BookOpen}
          />
        )}
      </div>

      <OverviewChart data={chartData} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Attendance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Ringkasan Kehadiran Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalAttendanceToday > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <p className="text-2xl font-bold text-emerald-600">{attendanceSummary.hadir}</p>
                  <p className="text-xs text-emerald-600/70 mt-0.5">Hadir</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <p className="text-2xl font-bold text-amber-600">{attendanceSummary.sakit}</p>
                  <p className="text-xs text-amber-600/70 mt-0.5">Sakit</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-2xl font-bold text-blue-600">{attendanceSummary.izin}</p>
                  <p className="text-xs text-blue-600/70 mt-0.5">Izin</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-red-50 border border-red-100">
                  <p className="text-2xl font-bold text-red-600">{attendanceSummary.alpha}</p>
                  <p className="text-xs text-red-600/70 mt-0.5">Alpha</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Belum ada data absensi hari ini
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Agenda Mendatang
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents && upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center min-w-[3rem] h-12 rounded-lg bg-primary/10 text-primary">
                      <span className="text-xs font-medium leading-none">
                        {format(new Date(event.start_date), 'dd', { locale: idLocale })}
                      </span>
                      <span className="text-[10px] uppercase mt-0.5">
                        {format(new Date(event.start_date), 'MMM', { locale: idLocale })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${eventTypeColors[event.event_type] || ''}`}
                        >
                          {EVENT_TYPE_LABELS[event.event_type]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(event.start_date), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Tidak ada agenda mendatang
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
