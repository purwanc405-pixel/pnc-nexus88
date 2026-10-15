-- Notifikasi P0 — migrasi ADITIF (tabel baru saja; tidak ada drop/rename).
-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Demo notifikasi HANYA untuk akun demo (jika ada). Tidak menyentuh data lain.
INSERT INTO "Notification" ("id","userId","type","title","body","link","readAt","createdAt")
SELECT 'demo_' || md5(u."id" || v.k), u."id", v.type, v.title, v.body, v.link, NULL, CURRENT_TIMESTAMP - (v.k || ' minutes')::interval
FROM "User" u
JOIN (VALUES
  ('admin@pnc.nexus','1','mitra_daftar','Mitra baru menunggu verifikasi: Budi Santoso','Budi (demo) menyelesaikan onboarding dan menunggu verifikasi.','/mitra'),
  ('admin@pnc.nexus','2','aplikasi_baru','Minat kerja baru dari mitra demo','Rina (demo) mengirim minat untuk peluang kerja.','/kerja'),
  ('admin@pnc.nexus','3','listing_baru','Ringkasan: notifikasi in-app aktif','Notifikasi kini tampil di ikon lonceng dan halaman /notifikasi.','/notifikasi'),
  ('ops@pnc.nexus','1','mitra_daftar','Mitra baru menunggu verifikasi: Budi Santoso','Budi (demo) menunggu verifikasi.','/mitra'),
  ('ops@pnc.nexus','2','aplikasi_baru','Minat kerja baru dari mitra demo','Rina (demo) mengirim minat untuk peluang kerja.','/kerja'),
  ('ops@pnc.nexus','3','listing_baru','Listing komoditi baru dari mitra demo','Agus (demo) membuat listing komoditi.','/komoditi'),
  ('budi.wait@demo.nexus','1','mitra_status','Profil Anda sedang diverifikasi','Tim kami sedang meninjau profil Anda. Pendaftaran mitra gratis, tanpa biaya.','/profil'),
  ('budi.wait@demo.nexus','2','mitra_status','Selamat datang di PNC Nexus','Lengkapi profil agar proses verifikasi lebih cepat.','/profil'),
  ('rina.kerja@demo.nexus','1','aplikasi_status','Status minat kerja: sedang ditinjau','Minat Anda sedang ditinjau oleh tim operator.','/kerja'),
  ('rina.kerja@demo.nexus','2','mitra_status','Status mitra: terverifikasi','Profil mitra Anda telah terverifikasi.','/profil'),
  ('agus.komoditi@demo.nexus','1','mitra_status','Status mitra: terverifikasi','Anda dapat membuat listing komoditi.','/komoditi'),
  ('agus.komoditi@demo.nexus','2','listing_baru','Listing Anda tercatat','Listing komoditi Anda tercatat dan dapat dilihat mitra lain.','/komoditi')
) AS v(email,k,type,title,body,link) ON u."email" = v.email
ON CONFLICT ("id") DO NOTHING;
