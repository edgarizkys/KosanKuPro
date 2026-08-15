import fs from 'fs';
import path from 'path';

// Generate a standalone, ultra-luxurious, printable HTML Document that automatically triggers print-to-PDF
const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Buku_Panduan_Fitur_Lengkap_KosanKu_Pro_SaaS_2026</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');
    
    @page {
      size: A4 portrait;
      margin: 15mm 15mm 15mm 15mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Plus Jakarta Sans', Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.5;
      font-size: 10.5pt;
      margin: 0;
      padding: 0;
    }

    .page-container {
      max-width: 210mm;
      margin: 0 auto;
      background: #ffffff;
    }

    /* Cover / Header Banner */
    .header-banner {
      background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #0f766e 100%);
      color: white;
      padding: 30px 25px;
      border-radius: 16px;
      margin-bottom: 25px;
      position: relative;
    }

    .header-banner h1 {
      font-size: 24pt;
      font-weight: 900;
      margin: 0 0 6px 0;
      letter-spacing: -0.5px;
    }

    .header-banner .badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.35);
      color: #ffffff;
      font-size: 8.5pt;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }

    .header-banner p {
      font-size: 10.5pt;
      margin: 4px 0 0 0;
      color: #e2e8f0;
      max-width: 90%;
    }

    .meta-bar {
      display: flex;
      justify-content: space-between;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 12px 18px;
      border-radius: 12px;
      margin-bottom: 25px;
      font-size: 9pt;
      color: #475569;
    }

    .meta-bar strong {
      color: #047857;
    }

    /* Section Styling */
    .section-title {
      font-size: 14pt;
      font-weight: 900;
      color: #064e3b;
      border-bottom: 2px solid #047857;
      padding-bottom: 6px;
      margin: 25px 0 14px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      margin-bottom: 20px;
    }

    .feature-card {
      background: #fdfdfd;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 16px;
      page-break-inside: avoid;
    }

    .feature-card.highlight {
      border-left: 4px solid #047857;
      background: #f0fdf4;
    }

    .feature-card h3 {
      font-size: 11pt;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 6px 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .feature-card p {
      font-size: 9pt;
      color: #475569;
      margin: 0 0 8px 0;
      line-height: 1.45;
    }

    .feature-card .tag {
      display: inline-block;
      font-size: 7.5pt;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 6px;
      background: #e2e8f0;
      color: #334155;
    }

    .tag.owner { background: #fef3c7; color: #92400e; }
    .tag.staff { background: #e0e7ff; color: #3730a3; }
    .tag.vendor { background: #dcfce7; color: #166534; }
    .tag.tenant { background: #f3e8ff; color: #6b21a8; }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 9pt;
    }

    th {
      background-color: #047857;
      color: #ffffff;
      font-weight: 800;
      text-align: left;
      padding: 8px 10px;
      border: 1px solid #047857;
      text-transform: uppercase;
      font-size: 8pt;
    }

    td {
      border: 1px solid #e2e8f0;
      padding: 8px 10px;
      color: #334155;
    }

    tr:nth-child(even) td {
      background-color: #f8fafc;
    }

    .workflow-box {
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 12px;
      padding: 16px;
      margin: 15px 0;
    }

    .workflow-step {
      display: flex;
      gap: 12px;
      margin-bottom: 10px;
    }

    .step-num {
      width: 24px;
      height: 24px;
      background: #047857;
      color: white;
      font-weight: 900;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8.5pt;
      flex-shrink: 0;
    }

    .step-text strong {
      display: block;
      color: #0f172a;
      font-size: 9.5pt;
    }

    .step-text span {
      color: #64748b;
      font-size: 8.5pt;
    }

    .page-break {
      page-break-before: always;
    }

    .footer-note {
      text-align: center;
      font-size: 8pt;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      margin-top: 30px;
    }

    /* Print Control Bar (Hidden on Print) */
    .no-print-bar {
      background: #0f172a;
      color: white;
      padding: 14px 20px;
      position: sticky;
      top: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .no-print-bar button {
      background: #047857;
      color: white;
      border: none;
      font-weight: 800;
      padding: 10px 22px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 10pt;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }

    .no-print-bar button:hover {
      background: #059669;
    }

    @media print {
      .no-print-bar {
        display: none !important;
      }
    }
  </style>
</head>
<body>

  <!-- Top Bar for Direct Browser Action -->
  <div class="no-print-bar">
    <div>
      <strong>📄 Panduan & Rangkuman Resmi Fitur KosanKu Pro SaaS 2026</strong>
      <span style="font-size: 8.5pt; color: #94a3b8; margin-left: 10px;">Siap Cetak / Simpan sebagai PDF</span>
    </div>
    <button onclick="window.print()">🖨️ Cetak / Download PDF Sekarang</button>
  </div>

  <div class="page-container" style="padding: 20px;">

    <!-- Header Banner -->
    <div class="header-banner">
      <span class="badge">Enterprise Multi-Tenant SaaS Platform</span>
      <h1>KosanKu Pro</h1>
      <p>Kompilasi & Rangkuman Lengkap Arsitektur Fitur, Alur Plotting Terarah, Finansial P&L, Audit Stock Opname (SO), dan Manajemen Kosan Modern.</p>
    </div>

    <!-- Metadata Bar -->
    <div class="meta-bar">
      <div><strong>Platform:</strong> KosanKu Pro Enterprise v2.5</div>
      <div><strong>Pemilik Properti (Owner):</strong> Ibu Dewi Tri Oktariani</div>
      <div><strong>Status Sistem:</strong> Production Live Ready</div>
      <div><strong>Tanggal Terbit:</strong> 15 Agustus 2026</div>
    </div>

    <!-- 1. EXECUTIVE SUMMARY & ARSITEKTUR MULTI-ROLE -->
    <div class="section-title">🏛️ 1. Matriks Arsitektur Multi-Role & Hak Akses</div>
    <p style="font-size: 9.5pt; color: #475569; margin-bottom: 12px;">
      KosanKu Pro dirancang khusus dengan sistem pemisahan peran (*Multi-Role Isolation*) yang menghubungkan seluruh pemangku kepentingan dalam satu ekosistem real-time terintegrasi:
    </p>

    <table>
      <thead>
        <tr>
          <th>Peran (Role)</th>
          <th>Profil Pengguna</th>
          <th>Tanggung Jawab & Akses Fitur Utama</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>👑 Property Owner</strong></td>
          <td>Ibu Dewi Tri Oktariani</td>
          <td>Approval Pengeluaran, Pusat Plotting Suplai, Laba Rugi (P&L), Verifikasi Tutup Buku SO, Setting Auto-Pilot AI, Kontrol Master Properti.</td>
        </tr>
        <tr>
          <td><strong>🛡️ Admin Operasional</strong></td>
          <td>Siti & Rina (Finance)</td>
          <td>Pusat Keluhan Tiket, Kasir & Invoice QRIS, Manajemen Kamar & Penghuni, Pencatatan Keuangan, Monitoring SLA Vendor.</td>
        </tr>
        <tr>
          <td><strong>👷 Staf Lapangan</strong></td>
          <td>Bambang (Teknisi) & Rudi (Kurir)</td>
          <td>Penerimaan Penugasan Dispatching, Formulir Inspeksi Cek-In / Cek-Out Kamar, Lembar Audit Stock Opname (SO) Gudang, Pengajuan Dana Operasional.</td>
        </tr>
        <tr>
          <td><strong>🏪 Mitra Vendor</strong></td>
          <td>Depot Suci, Laundry Clean, Subur Teknik</td>
          <td>Penerimaan Orderan Galon, Gas, dan Laundry, Tracking Status Pengantaran Kurir, Pencatatan Add-On Tagihan ke Invoice Tenant.</td>
        </tr>
        <tr>
          <td><strong>👤 Penyewa (Tenant)</strong></td>
          <td>Rian (A-101), Siti (B-201), Budi (C-302)</td>
          <td>Pemesanan Suplai Tambahan 1-Klik, Smart Key Access (IoT Lock), Pembayaran Sewa via Midtrans (QRIS/VA), Lapor Kendala Kamar.</td>
        </tr>
      </tbody>
    </table>

    <!-- 2. FITUR UNGGULAN OPERASIONAL -->
    <div class="section-title">⚡ 2. Rangkuman Modul & Fitur Unggulan Operasional</div>

    <div class="feature-grid">
      <div class="feature-card highlight">
        <h3>🛒 Pusat Plotting Permintaan Suplai</h3>
        <p>Tenant memesan galon, gas, atau laundry ➔ Owner / Auto-Pilot mem-plot pesanan ke kurir staf & vendor spesifik ➔ Notifikasi terarah hanya masuk ke pihak yang ditugaskan.</p>
        <span class="tag owner">Owner</span> <span class="tag vendor">Vendor</span> <span class="tag staff">Staf</span>
      </div>

      <div class="feature-card highlight">
        <h3>📋 Laporan Cek-In & Cek-Out (Inspeksi)</h3>
        <p>Staf memeriksa 7 checklist aset kamar (RFID smart lock, remote AC, kasur, sanitasi air panas, fisik dinding) dan mengirim laporan realtime ber-timestamp ke Owner.</p>
        <span class="tag staff">Staf</span> <span class="tag owner">Owner</span>
      </div>

      <div class="feature-card highlight">
        <h3>📦 Stock Opname (SO) Akhir Bulan</h3>
        <p>Audit fisik 6 item pasokan pasokan (Galon, Gas, Bohlam, Remote, Sprei, Kunci Cadangan), kalkulasi selisih stok (discrepancy), bukti foto GPS watermark, dan reminder tutup buku tanggal 27-31.</p>
        <span class="tag staff">Staf</span> <span class="tag owner">Owner</span>
      </div>

      <div class="feature-card highlight">
        <h3>✍️ Approval Pengeluaran Dana Operasional</h3>
        <p>Staf mengajukan anggaran pembelian kebutuhan darurat (misal: perbaikan kran/pipa) ➔ Owner menerima Toast Glassmorphism dan menyetujui / menolak secara instan.</p>
        <span class="tag staff">Staf</span> <span class="tag owner">Owner</span>
      </div>

      <div class="feature-card">
        <h3>💳 Midtrans Payment Gateway (QRIS & VA)</h3>
        <p>Sistem penagihan otomatis yang memadukan sewa dasar kamar dan tagihan add-on vendor (galon/laundry) dalam satu barcode QRIS dinamis.</p>
        <span class="tag tenant">Tenant</span> <span class="tag owner">Owner</span>
      </div>

      <div class="feature-card">
        <h3>🚪 IoT Smart Digital Key Control</h3>
        <p>Integrasi smart door lock berbasis IoT. Tenant dapat membuka pintu kamar secara aman langsung dari aplikasi tanpa kunci fisik konvensional.</p>
        <span class="tag tenant">Tenant</span>
      </div>

      <div class="feature-card">
        <h3>🤖 Auto-Pilot AI Automation Engine</h3>
        <p>5 Aturan otomatisasi: Auto-Dispatch Suplai, Auto-Addon Billing, Auto-Reminder WA Sewa (H-3, H-1), Auto-Status Clearance Kamar, dan Auto-Reminder SO Akhir Bulan.</p>
        <span class="tag owner">Owner</span>
      </div>

      <div class="feature-card">
        <h3>🔔 Glassmorphism Emerald Toast Notifications</h3>
        <p>Sistem notifikasi kartu mewah kaca bercahaya hijau emerald yang interaktif (dapat diklik langsung untuk menuju ke halaman laporan transaksi).</p>
        <span class="tag owner">Semua Role</span>
      </div>
    </div>

    <!-- Page Break for Next Page -->
    <div class="page-break"></div>

    <!-- 3. ALUR BISNIS KONSOLIDASI FINANSIAL & LAPORAN -->
    <div class="section-title">📊 3. Modul Finansial, Laba Rugi (P&L) & Pusat Laporan</div>

    <div class="workflow-box">
      <div class="workflow-step">
        <div class="step-num">1</div>
        <div class="step-text">
          <strong>Pencatatan Otomatis Inflow (Pemasukan)</strong>
          <span>Setiap pembayaran sewa, deposit sewa garansi, dan add-on vendor langsung tercatat di buku besar akuntansi real-time.</span>
        </div>
      </div>
      <div class="workflow-step">
        <div class="step-num">2</div>
        <div class="step-text">
          <strong>Validasi Pengeluaran (Outflow) Berbasis Nota</strong>
          <span>Biaya tagihan PLN, PDAM, WiFi IndiHome, gaji staf, dan pengeluaran operasional diaudit dengan bukti struk/nota digital.</span>
        </div>
      </div>
      <div class="workflow-step">
        <div class="step-num">3</div>
        <div class="step-text">
          <strong>Kalkulasi Net Profit & Margin Laba</strong>
          <span>Otomatis menghitung margin keuntungan bersih properti bulanan serta dividen bagi hasil pemilik & co-investor.</span>
        </div>
      </div>
      <div class="workflow-step">
        <div class="step-num">4</div>
        <div class="step-text">
          <strong>Ekspor Laporan Resmi Eksekutif (Excel & PDF)</strong>
          <span>1-Klik ekspor laporan komprehensif mencakup Keuangan, Okupansi, Stock Opname, Inspeksi, dan Performa Karyawan.</span>
        </div>
      </div>
    </div>

    <!-- 4. PANDUAN EKSPANSI PROPERTI BARU -->
    <div class="section-title">🏢 4. Panduan Menambah Properti Kosan Baru (Multi-Property)</div>

    <table>
      <thead>
        <tr>
          <th style="width: 25%;">Tahapan</th>
          <th>Langkah Operasional di Aplikasi</th>
          <th style="width: 25%;">Output Sistem</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Langkah 1: Identitas & Rekening</strong></td>
          <td>Buka menu <code>Master Data Kosan</code> ➔ Sub-tab <code>🏨 Identitas Kosan</code> ➔ Masukkan Nama Properti, Alamat Lengkap, No WhatsApp Resmi, dan Rekening Bank Pencairan.</td>
          <td>Properti terdaftar & siap menampung payout Midtrans.</td>
        </tr>
        <tr>
          <td><strong>Langkah 2: Katalog Kamar</strong></td>
          <td>Buka menu <code>Kamar & Okupansi</code> ➔ Klik <code>+ Tambah Kamar Baru</code> ➔ Tentukan Nomor Kamar (A-101, B-201), Lantai, Tipe Unit, Tarif Sewa Bulanan, dan Fasilitas.</td>
          <td>Kamar aktif dan siap ditempati tenant baru.</td>
        </tr>
        <tr>
          <td><strong>Langkah 3: Plotting Staf & Vendor</strong></td>
          <td>Di <code>Master Data Kosan</code> ➔ Sub-tab <code>🪪 Karyawan</code> dan <code>🏪 Vendor</code> ➔ Daftarkan staf lapangan dan depo vendor terdekat dari lokasi properti.</td>
          <td>Ekosistem penugasan lokal properti terbentuk.</td>
        </tr>
      </tbody>
    </table>

    <div class="footer-note">
      KosanKu Pro SaaS Platform • Hak Cipta © 2026 PT KosanKu Pro Indonesia • Dokumen Panduan & Arsitektur Resmi
    </div>

  </div>

</body>
</html>
`;

// Save to public folder so it can be viewed and printed directly
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'Rangkuman_Fitur_KosanKuPro_2026.html'), htmlContent, 'utf-8');
console.log('PDF Printable Document Generated Successfully at /Rangkuman_Fitur_KosanKuPro_2026.html');
