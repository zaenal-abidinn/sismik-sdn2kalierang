import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, Users, BarChart3, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-20 flex items-center sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <Link className="flex items-center justify-center group" href="/">
          <div className="bg-[#8B0000] p-2 rounded-lg mr-3 group-hover:rotate-3 transition-transform">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-[#8B0000]">SISMIK SD N 2 Kalierang</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-[#8B0000] transition-colors hidden md:block" href="#features">
            Fitur
          </Link>
          <Link className="text-sm font-medium hover:text-[#8B0000] transition-colors hidden md:block" href="#about">
            Tentang
          </Link>
          <Link href="/login">
            <Button className="bg-[#8B0000] hover:bg-[#7c0000] text-white rounded-full px-6">
              Masuk
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-red-50 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="flex flex-col justify-center space-y-8 animate-in fade-in slide-in-from-left duration-700">
                <div className="space-y-4">
                  <div className="inline-block rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-[#8B0000]">
                    Pusat Informasi Akademik Digital
                  </div>
                  <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl leading-tight">
                    Mewujudkan <span className="text-[#8B0000]">Pendidikan Modern</span> yang Terpadu
                  </h1>
                  <p className="max-w-[600px] text-slate-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Sistem Manajemen Informasi Akademik (SISMIK) SD Negeri 2 Kalierang. 
                    Kelola data siswa, jadwal, nilai, dan absensi dalam satu platform yang elegan.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/login">
                    <Button className="bg-[#8B0000] hover:bg-[#7c0000] text-white h-14 px-8 text-lg rounded-xl shadow-xl shadow-red-900/20 group">
                      Mulai Sekarang
                      <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="#about">
                    <Button variant="outline" className="h-14 px-8 text-lg rounded-xl border-slate-200">
                      Pelajari Lebih Lanjut
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                        <Users className="h-4 w-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                  <span>Dipercaya oleh guru, orang tua, dan siswa SD N 2 Kalierang.</span>
                </div>
              </div>
              <div className="relative animate-in fade-in zoom-in duration-1000 delay-200">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                  <div className="aspect-video bg-gradient-to-br from-[#8B0000] to-[#b91c1c] flex items-center justify-center">
                    <GraduationCap className="h-32 w-32 text-white opacity-20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 text-white text-center">
                         <h3 className="text-2xl font-bold mb-2">SD N 2 Kalierang</h3>
                         <p className="text-white/80 italic">"Cerdas, Berkarakter, Berkualitas"</p>
                       </div>
                    </div>
                  </div>
                </div>
                {/* Decorative floating elements */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce duration-[3000ms]">
                  <div className="bg-green-100 p-2 rounded-lg text-green-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Sistem Aman</div>
                    <div className="text-sm font-bold">Terproteksi SSL</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-slate-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Fitur Utama Platform Kami</h2>
              <p className="text-slate-500 text-lg">
                Didesain khusus untuk memenuhi kebutuhan administrasi dan kegiatan belajar mengajar di sekolah dasar.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "E-Rapor Digital",
                  desc: "Penghitungan nilai otomatis dan cetak rapor satu semester penuh dengan satu klik.",
                  icon: BarChart3,
                  color: "bg-blue-50 text-blue-600"
                },
                {
                  title: "Manajemen Jadwal",
                  desc: "Atur jadwal harian (Senin-Sabtu) dengan mudah untuk setiap guru dan kelas.",
                  icon: Clock,
                  color: "bg-purple-50 text-purple-600"
                },
                {
                  title: "Absensi Presisi",
                  desc: "Rekapitulasi kehadiran harian hingga tahunan dengan visualisasi persentase.",
                  icon: Users,
                  color: "bg-red-50 text-red-600"
                },
                {
                  title: "Data Siswa Terpadu",
                  desc: "Penyimpanan data profil siswa lengkap beserta riwayat kelas dan prestasinya.",
                  icon: GraduationCap,
                  color: "bg-orange-50 text-orange-600"
                },
                {
                  title: "Kurikulum Terkini",
                  desc: "Dukungan mata pelajaran yang fleksibel sesuai dengan kurikulum nasional.",
                  icon: BookOpen,
                  color: "bg-emerald-50 text-emerald-600"
                },
                {
                  title: "Keamanan Data",
                  desc: "Akses login berlapis untuk melindungi privasi data guru dan siswa.",
                  icon: ShieldCheck,
                  color: "bg-indigo-50 text-indigo-600"
                }
              ].map((feature, idx) => (
                <div key={idx} className="group bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className={`${feature.color} w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-[#8B0000]">Tentang SD Negeri 2 Kalierang</h2>
                <div className="space-y-4 text-slate-500 text-lg leading-relaxed">
                  <p>
                    SD Negeri 2 Kalierang adalah lembaga pendidikan dasar yang berlokasi di wilayah Kalierang, berkomitmen untuk mencetak generasi penerus bangsa yang unggul dalam prestasi dan luhur dalam budi pekerti.
                  </p>
                  <p>
                    Melalui implementasi SISMIK, kami melangkah maju dalam digitalisasi sekolah untuk memberikan transparansi data dan kemudahan akses bagi seluruh civitas akademika.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div className="border-l-4 border-[#8B0000] pl-4">
                    <div className="text-3xl font-bold">120+</div>
                    <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Siswa Aktif</div>
                  </div>
                  <div className="border-l-4 border-[#8B0000] pl-4">
                    <div className="text-3xl font-bold">10+</div>
                    <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Tenaga Pengajar</div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-3xl p-8 lg:p-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                   <GraduationCap className="h-40 w-40 text-[#8B0000]" />
                </div>
                <div className="relative z-10 space-y-8">
                   <blockquote className="text-2xl font-medium italic text-slate-700 leading-relaxed">
                     "Teknologi hanyalah alat. Dalam membimbing anak-anak dan memotivasi mereka, guru adalah yang paling utama."
                   </blockquote>
                   <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-full bg-[#8B0000] flex items-center justify-center text-white font-bold">K</div>
                     <div>
                       <div className="font-bold">Kepala Sekolah</div>
                       <div className="text-sm text-slate-500">SD Negeri 2 Kalierang</div>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 container px-4 md:px-6 mx-auto">
          <div className="bg-[#8B0000] rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none"></div>
             <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Siap Memulai Digitalisasi Sekolah?</h2>
                <p className="text-red-100 text-lg md:text-xl max-w-2xl">
                  Bergabunglah dengan sistem manajemen akademik tercanggih kami dan rasakan kemudahan dalam pengelolaan administrasi harian.
                </p>
                <Link href="/login">
                  <Button className="bg-white text-[#8B0000] hover:bg-red-50 h-16 px-10 text-xl rounded-2xl shadow-2xl transition-all">
                    Masuk ke Sistem Sekarang
                  </Button>
                </Link>
             </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-slate-100">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="bg-[#8B0000] p-1.5 rounded-md">
                <GraduationCap className="h-5 w-5 text-white" />
             </div>
             <span className="font-bold text-slate-900 tracking-tight text-lg">SISMIK SD N 2 Kalierang</span>
          </div>
          <p className="text-sm text-slate-500">
            © 2026 SD Negeri 2 Kalierang. Hak cipta dilindungi.
          </p>
          <div className="flex gap-6">
             <Link className="text-sm text-slate-500 hover:text-[#8B0000]" href="#">Privacy</Link>
             <Link className="text-sm text-slate-500 hover:text-[#8B0000]" href="#">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
