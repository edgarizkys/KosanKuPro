const fs = require('fs');
const XLSX = require('xlsx');

const wb = XLSX.utils.book_new();

// Sheet 0: 00_Panduan_Konsultasi
const ws0_data = [
  ['=== FORM ONBOARDING & SETUP MASTER DATA KOSANKU PRO ==='],
  [''],
  ['ANDA PUNYA KOSAN TAPI BELUM PUNYA SISTEM DIGITAL OTOMATIS?'],
  ['Daftar sekarang atau Konsultasi Gratis bersama Tim Konsultan KosanKu Pro:'],
  ['WhatsApp Hotline:', '+6282114242634', 'https://wa.me/6282114242634?text=Halo%20Admin%20KosanKu%20Pro,%20saya%20tertarik%20setup%20sistem%20kos%20saya'],
  ['Website:', 'https://kosankupro.cloud'],
  [''],
  ['--- PETUNJUK PENGISIAN FORMULIR (UNTUK OWNER / PENGELOLA) ---'],
  ['1. Sheet 01_Identitas_Kosan: Isi data nama kosan, alamat, kontak resmi WhatsApp kosan, dan nomor rekening penerimaan uang sewa.'],
  ['2. Sheet 02_Master_Kamar: Isi daftar unit kamar, nomor kamar, lantai, tipe kamar, tarif bulanan, dan fasilitas bawaan kamar.'],
  ['3. Sheet 03_Data_Penghuni: Isi data penghuni yang saat ini aktif berjalan (opsional jika kamar masih kosong).'],
  ['4. Sheet 04_Staf_Vendor: Isi daftar penjaga kos / staf maintenance dan toko langganan (galon, laundry, gas) jika ada.'],
  ['5. Kolom bertanda bintang (*) adalah kolom esensial/wajib.'],
  ['6. Setelah selesai diisi, kirim kembali file ini atau bagikan link Google Sheets ke WhatsApp: +6282114242634']
];
const ws0 = XLSX.utils.aoa_to_sheet(ws0_data);
ws0['!cols'] = [{ wch: 35 }, { wch: 30 }, { wch: 60 }];
XLSX.utils.book_append_sheet(wb, ws0, '00_Panduan_Konsultasi');

// Sheet 1: 01_Identitas_Kosan (Kosong Siap Isi)
const ws1_data = [
  ['=== KOSANKU PRO - DATA PROPERTI & REKENING PENCAIRAN ==='],
  ['Konsultasi & Bantuan Setup WhatsApp: +6282114242634 (https://wa.me/6282114242634)'],
  [''],
  ['PARAMETER / FIELD PENGATURAN*', 'ISIAN DATA OWNER', 'PETUNJUK PENGISIAN'],
  ['Nama Properti / Kosan*', '', 'Contoh: Kosan Asri Residence Bandung'],
  ['Tagline / Slogan Kosan', '', 'Contoh: Hunian Nyaman & Tenang Dekat Kampus'],
  ['Alamat Lengkap Properti*', '', 'Contoh: Jl. Anggrek No. 12, RT 02/05, Kel. Sukajadi'],
  ['Kota / Wilayah*', '', 'Contoh: Bandung / Jakarta Selatan'],
  ['No. WhatsApp Resmi Kosan*', '', 'No WA pengelola/admin untuk notifikasi tagihan & komplain'],
  ['Email Resmi Pengelola', '', 'Email operasional kos (opsional)'],
  ['Link Google Maps', '', 'Link titik maps lokasi kos (opsional)'],
  ['Nama Bank Rekening Pencairan*', '', 'Contoh: BCA / Mandiri / BRI / BNI'],
  ['Nomor Rekening Bank*', '', 'Nomor rekening penampung uang sewa masuk'],
  ['Nama Pemilik Rekening (Holder)*', '', 'Nama yang tertera di buku tabungan / rekening'],
  ['Batas Tanggal Jatuh Tempo Tagihan', 'Tanggal 1 s/d 5 setiap bulan', 'Default tanggal penagihan invoice otomatis'],
  ['Jatah Kuota Laundry Free (Kg/Bln)', 0, 'Isi 0 jika tidak ada kuota laundry gratis']
];
const ws1 = XLSX.utils.aoa_to_sheet(ws1_data);
ws1['!cols'] = [{ wch: 35 }, { wch: 45 }, { wch: 45 }];
XLSX.utils.book_append_sheet(wb, ws1, '01_Identitas_Kosan');

// Sheet 2: 02_Master_Kamar (Kosong Siap Isi)
const ws2_data = [
  ['=== KOSANKU PRO - DAFTAR UNIT KAMAR ==='],
  ['Konsultasi & Bantuan Setup WhatsApp: +6282114242634 (https://wa.me/6282114242634)'],
  [''],
  ['No Kamar*', 'Lantai*', 'Tipe Kamar*', 'Harga Sewa / Bulan (Rp)*', 'Status Saat Ini (Kosong / Terisi / Renovasi)*', 'Ukuran Kamar', 'Fasilitas Kamar (Pisahkan Koma)', 'Kapasitas (Orang)'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '']
];
const ws2 = XLSX.utils.aoa_to_sheet(ws2_data);
ws2['!cols'] = [{ wch: 15 }, { wch: 10 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 20 }, { wch: 45 }, { wch: 18 }];
XLSX.utils.book_append_sheet(wb, ws2, '02_Master_Kamar');

// Sheet 3: 03_Data_Penghuni (Kosong Siap Isi)
const ws3_data = [
  ['=== KOSANKU PRO - DATA PENGHUNI AKTIF SAAT INI ==='],
  ['Konsultasi & Bantuan Setup WhatsApp: +6282114242634 (https://wa.me/6282114242634)'],
  [''],
  ['No Kamar*', 'Nama Lengkap Penghuni*', 'No WhatsApp Aktif*', 'Email*', 'Tanggal Masuk (DD/MM/YYYY)*', 'Periode Sewa (Bulanan / 3 Bulan / Tahunan)', 'Deposit Masuk (Rp)', 'No KTP / NIK', 'Pekerjaan / Instansi'],
  ['', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '']
];
const ws3 = XLSX.utils.aoa_to_sheet(ws3_data);
ws3['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 30 }, { wch: 25 }, { wch: 25 }, { wch: 20 }, { wch: 22 }, { wch: 30 }];
XLSX.utils.book_append_sheet(wb, ws3, '03_Data_Penghuni');

// Sheet 4: 04_Staf_Vendor (Kosong Siap Isi)
const ws4_data = [
  ['=== KOSANKU PRO - DATA KARYAWAN & VENDOR MITRA ==='],
  ['Konsultasi & Bantuan Setup WhatsApp: +6282114242634 (https://wa.me/6282114242634)'],
  [''],
  ['Tipe (KARYAWAN / VENDOR)*', 'Nama Lengkap / Nama Usaha Toko*', 'Kontak No WhatsApp*', 'Posisi / Bidang Layanan*', 'Gaji / Biaya Langganan (Rp)', 'Alamat / Catatan Tambahan'],
  ['', '', '', '', '', ''],
  ['', '', '', '', '', ''],
  ['', '', '', '', '', ''],
  ['', '', '', '', '', '']
];
const ws4 = XLSX.utils.aoa_to_sheet(ws4_data);
ws4['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 22 }, { wch: 30 }, { wch: 25 }, { wch: 35 }];
XLSX.utils.book_append_sheet(wb, ws4, '04_Staf_Vendor');

const outPath = 'public/Template_Master_Data_KosanKu_Pro.xlsx';
XLSX.writeFile(wb, outPath);
console.log('Successfully generated blank onboarding template at ' + outPath);
