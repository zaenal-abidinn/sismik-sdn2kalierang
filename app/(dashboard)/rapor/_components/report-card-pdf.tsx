'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { ReportCard } from '@/types';

// Register font (optional, using default is fine too)
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333',
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a5f',
  },
  schoolInfo: {
    fontSize: 8,
    color: '#666',
    marginTop: 2,
  },
  title: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  studentSection: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  studentCol: {
    flexDirection: 'column',
    gap: 4,
  },
  label: {
    color: '#666',
    width: 80,
  },
  value: {
    fontWeight: 'bold',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '10%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f3f4f6',
    padding: 5,
    fontWeight: 'bold',
  },
  tableColSubject: {
    width: '60%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f3f4f6',
    padding: 5,
    fontWeight: 'bold',
  },
  tableColGrade: {
    width: '15%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f3f4f6',
    padding: 5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tableCell: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  attendanceBox: {
    width: '40%',
    borderWidth: 1,
    padding: 10,
    gap: 5,
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footer: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: 150,
    textAlign: 'center',
    gap: 40,
  },
});

interface ReportCardPDFProps {
  data: ReportCard;
}

export function ReportCardPDF({ data }: ReportCardPDFProps) {
  const finalGrades = data.final_grades ? Object.values(data.final_grades) : [];
  const attendance = data.attendance_summary || { hadir: 0, sakit: 0, izin: 0, alpha: 0 };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* School Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.schoolName}>SD NEGERI 2 KALIERANG</Text>
            <Text style={styles.schoolInfo}>Alamat: Jl. Raya Kalierang No. 45, Wonosobo, Jawa Tengah</Text>
            <Text style={styles.schoolInfo}>Telp: (0286) 123456 | Email: sdn2kalierang@sch.id</Text>
          </View>
        </View>

        <Text style={styles.title}>Laporan Hasil Belajar Siswa (Rapor)</Text>

        {/* Student Info */}
        <View style={styles.studentSection}>
          <View style={styles.studentCol}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.label}>Nama Siswa</Text>
              <Text style={styles.value}>: {data.student?.full_name}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.label}>NIS</Text>
              <Text style={styles.value}>: {data.student?.nis}</Text>
            </View>
          </View>
          <View style={styles.studentCol}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.label}>Semester</Text>
              <Text style={styles.value}>: {data.semester?.name}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.label}>Tahun Pelajaran</Text>
              <Text style={styles.value}>: {data.semester?.school_year?.name}</Text>
            </View>
          </View>
        </View>

        {/* Grades Table */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableColHeader}>No</Text>
            <Text style={styles.tableColSubject}>Mata Pelajaran</Text>
            <Text style={styles.tableColGrade}>Nilai</Text>
            <Text style={styles.tableColGrade}>Predikat</Text>
          </View>
          {finalGrades.map((g, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '10%' }]}>{i + 1}</Text>
              <Text style={[styles.tableCell, { width: '60%' }]}>{g.subject_name}</Text>
              <Text style={[styles.tableCell, { width: '15%', textAlign: 'center' }]}>{g.score}</Text>
              <Text style={[styles.tableCell, { width: '15%', textAlign: 'center' }]}>{g.grade}</Text>
            </View>
          ))}
        </View>

        {/* Attendance Summary */}
        <View style={{ flexDirection: 'row', gap: 20 }}>
          <View style={styles.attendanceBox}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Ketidakhadiran</Text>
            <View style={styles.attendanceRow}>
              <Text>Sakit</Text>
              <Text>: {attendance.sakit} hari</Text>
            </View>
            <View style={styles.attendanceRow}>
              <Text>Izin</Text>
              <Text>: {attendance.izin} hari</Text>
            </View>
            <View style={styles.attendanceRow}>
              <Text>Alpha</Text>
              <Text>: {attendance.alpha} hari</Text>
            </View>
          </View>
          <View style={{ flex: 1, borderWidth: 1, padding: 10 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Catatan Wali Kelas</Text>
            <Text style={{ color: '#666', fontStyle: 'italic' }}>
              {data.homeroom_notes || 'Tingkatkan terus prestasimu dan rajinlah belajar.'}
            </Text>
          </View>
        </View>

        {/* Footer / Signatures */}
        <View style={styles.footer}>
          <View style={styles.signatureBox}>
            <Text>Mengetahui,</Text>
            <Text>Orang Tua/Wali</Text>
            <Text>( ............................ )</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text>Wonosobo, {new Date().toLocaleDateString('id-ID')}</Text>
            <Text>Wali Kelas</Text>
            <Text>( ............................ )</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
