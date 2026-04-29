-- Migration: Expand Tata Usaha Role for Report Cards

DROP POLICY IF EXISTS "Kepala sekolah and guru can insert report cards" ON report_cards;
DROP POLICY IF EXISTS "Kepala sekolah and guru can update report cards" ON report_cards;
DROP POLICY IF EXISTS "Kepala sekolah and guru can delete report cards" ON report_cards;
DROP POLICY IF EXISTS "Tata usaha can manage report cards" ON report_cards;

CREATE POLICY "Authorized roles can manage report cards" ON report_cards 
  FOR ALL 
  USING (get_user_role() IN ('kepala_sekolah', 'guru', 'tata_usaha', 'superadmin'))
  WITH CHECK (get_user_role() IN ('kepala_sekolah', 'guru', 'tata_usaha', 'superadmin'));
