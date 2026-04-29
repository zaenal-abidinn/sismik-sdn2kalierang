-- Migration: Revoke Tata Usaha Role for Report Cards

DROP POLICY IF EXISTS "Authorized roles can manage report cards" ON report_cards;

CREATE POLICY "Kepala sekolah and guru can insert report cards" ON report_cards 
  FOR INSERT WITH CHECK (get_user_role() IN ('kepala_sekolah', 'guru', 'superadmin'));

CREATE POLICY "Kepala sekolah and guru can update report cards" ON report_cards 
  FOR UPDATE USING (get_user_role() IN ('kepala_sekolah', 'guru', 'superadmin'));

CREATE POLICY "Kepala sekolah and guru can delete report cards" ON report_cards 
  FOR DELETE USING (get_user_role() IN ('kepala_sekolah', 'guru', 'superadmin'));
