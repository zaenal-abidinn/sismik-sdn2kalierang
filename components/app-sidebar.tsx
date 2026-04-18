'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  BookOpen,
  FileText,
  GraduationCap,
  CalendarDays,
  UserCog,
  UserCircle,
  LogOut,
  ChevronUp,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { logout } from '@/app/actions/auth';
import type { Profile, UserRole } from '@/types';
import { ROLE_LABELS } from '@/types';

interface AppSidebarProps {
  profile: Profile;
}

type MenuItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
};

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    roles: ['superadmin', 'kepala_sekolah', 'guru', 'tata_usaha'],
  },
  {
    title: 'Data Siswa',
    url: '/siswa',
    icon: Users,
    roles: ['superadmin', 'kepala_sekolah', 'guru', 'tata_usaha'],
  },
  {
    title: 'Jadwal Pelajaran',
    url: '/jadwal',
    icon: Calendar,
    roles: ['superadmin', 'kepala_sekolah', 'guru'],
  },
  {
    title: 'Absensi',
    url: '/absensi',
    icon: ClipboardList,
    roles: ['superadmin', 'kepala_sekolah', 'guru'],
  },
  {
    title: 'Penilaian',
    url: '/penilaian',
    icon: BookOpen,
    roles: ['superadmin', 'kepala_sekolah', 'guru'],
  },
  {
    title: 'Rapor',
    url: '/rapor',
    icon: FileText,
    roles: ['superadmin', 'kepala_sekolah', 'guru'],
  },
  {
    title: 'Guru & Mapel',
    url: '/guru',
    icon: GraduationCap,
    roles: ['superadmin', 'kepala_sekolah'],
  },
  {
    title: 'Kalender Akademik',
    url: '/kalender',
    icon: CalendarDays,
    roles: ['superadmin', 'kepala_sekolah', 'guru', 'tata_usaha'],
  },
  {
    title: 'Manajemen Pengguna',
    url: '/pengguna',
    icon: UserCog,
    roles: ['superadmin', 'kepala_sekolah'],
  },
];

export function AppSidebar({ profile }: AppSidebarProps) {
  const pathname = usePathname();
  const userRole = profile.role as UserRole;
  const initials = profile.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const filteredItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-4 pb-2">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary/20 transition-colors group-hover:bg-sidebar-primary/30">
            <GraduationCap className="h-5 w-5 text-sidebar-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
              Sistem Akademik
            </span>
            <span className="text-xs text-sidebar-foreground/60">
              SD N 2 Kalierang
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-xs uppercase tracking-wider px-3">
            Menu Utama
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => {
                const isActive =
                  pathname === item.url ||
                  (item.url !== '/dashboard' && pathname.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={isActive}
                      className="h-10 transition-all duration-150"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuButton className="h-14 px-3" />}>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-sidebar-primary/20 text-sidebar-primary text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="text-sm font-medium truncate w-full text-sidebar-foreground">
                      {profile.full_name}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-4 px-1.5 bg-sidebar-primary/10 text-sidebar-primary border-0"
                    >
                      {ROLE_LABELS[profile.role]}
                    </Badge>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4 text-sidebar-foreground/40" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem render={<Link href="/profil" className="cursor-pointer" />}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profil Saya
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
