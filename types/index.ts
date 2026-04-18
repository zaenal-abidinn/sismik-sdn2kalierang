export * from './database';

export interface ActionResponse<T = void> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SelectOption {
  value: string;
  label: string;
}

export const ROLE_LABELS: Record<string, string> = {
  superadmin: 'Super Admin',
  kepala_sekolah: 'Kepala Sekolah',
  guru: 'Guru',
  tata_usaha: 'Tata Usaha',
};

export const ATTENDANCE_LABELS: Record<string, string> = {
  hadir: 'Hadir',
  sakit: 'Sakit',
  izin: 'Izin',
  alpha: 'Alpha',
};

export const EVENT_TYPE_LABELS: Record<string, string> = {
  libur: 'Libur',
  ujian: 'Ujian',
  kegiatan: 'Kegiatan',
  rapat: 'Rapat',
};

export const GENDER_LABELS: Record<string, string> = {
  L: 'Laki-laki',
  P: 'Perempuan',
};

export const RELIGION_OPTIONS: SelectOption[] = [
  { value: 'Islam', label: 'Islam' },
  { value: 'Kristen', label: 'Kristen' },
  { value: 'Katolik', label: 'Katolik' },
  { value: 'Hindu', label: 'Hindu' },
  { value: 'Buddha', label: 'Buddha' },
  { value: 'Konghucu', label: 'Konghucu' },
];

export const DAYS_OF_WEEK: SelectOption[] = [
  { value: '1', label: 'Senin' },
  { value: '2', label: 'Selasa' },
  { value: '3', label: 'Rabu' },
  { value: '4', label: 'Kamis' },
  { value: '5', label: 'Jumat' },
  { value: '6', label: 'Sabtu' },
];
