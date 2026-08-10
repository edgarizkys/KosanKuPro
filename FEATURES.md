# KosanKu Pro — Full Feature Documentation

> **Platform manajemen kos pintar berbasis AI dengan integrasi pembayaran & WhatsApp otomatis.**
> Dibangun dengan Next.js 14, TypeScript, Prisma + PostgreSQL, Tailwind CSS.

---

## Daftar Isi

1. [Landing Page](#1-landing-page)
2. [Authentication & Role Management](#2-authentication--role-management)
3. [Admin Dashboard](#3-admin-dashboard)
4. [Tenant Dashboard](#4-tenant-dashboard)
5. [AI Chatbot & Concierge](#5-ai-chatbot--concierge)
6. [Payment Gateway — Midtrans](#6-payment-gateway--midtrans)
7. [WhatsApp Automation — Fonnte](#7-whatsapp-automation--fonnte)
8. [OCR Receipt Scanning](#8-ocr-receipt-scanning)
9. [AI Dynamic Pricing](#9-ai-dynamic-pricing)
10. [Expense Tracking & Financial Analytics](#10-expense-tracking--financial-analytics)
11. [Notification System](#11-notification-system)
12. [Cron Job — Automated Reminders](#12-cron-job--automated-reminders)
13. [UI/UX Design System](#13-uiux-design-system)
14. [Database Schema](#14-database-schema)
15. [API Endpoints](#15-api-endpoints)
16. [Tech Stack & Architecture](#16-tech-stack--architecture)

---

## 1. Landing Page

Landing page profesional dengan desain glassmorphism modern, animasi interaktif, dan responsive di semua device.

### Komponen Landing Page

| Komponen | Deskripsi |
|----------|-----------|
| **Navbar** | Glass navbar transparan dengan efek blur, hamburger menu mobile, dark/light theme toggle, tombol notifikasi & login |
| **HeroSection** | Headline animasi rotating words (Standar, Deluks, VIP), CTA "Lihat Kamar" & "Chat Admin", statistik real-time (Kamar, Penghuni, Rating) |
| **MarqueeTicker** | Scroll otomatis fitur unggulan: Midtrans Payment, WhatsApp Reminder, Smart Lock, WiFi, CCTV, AC, Laundry, Co-Working Space |
| **RoomsSection** | Daftar kamar dengan filter (tipe, harga, status), modal detail kamar, visualisasi fasilitas per kamar |
| **AmenitiesSection** | 8 fasilitas premium: WiFi 100Mbps, AC Inverter, Water Heater, Smart Lock, Laundry, CCTV 24/7, Parking, Common Area |
| **ReviewsSection** | Carousel testimoni penghuni (Swiper.js) dengan rating bintang 5, avatar, nama, role, kamar |
| **LocationSection** | Peta Google Maps embed (Dago, Bandung), info kontak, jam operasional |
| **Footer** | Copyright, Privacy, Terms, Status links |

### Fitur Desain

- **Glassmorphism**: Efek kaca transparan dengan backdrop-blur
- **Particle Background**: 20 partikel animasi dengan warna orchid theme
- **Cursor Glow**: Efek cahaya mengikuti kursor
- **Spotlight Cards**: Efek hover spotlight pada kartu fasilitas
- **Magnetic Buttons**: Tombol dengan efek magnetik mengikuti kursor
- **Ripple Effect**: Efek ripple pada klik tombol
- **Scroll Reveal**: Animasi masuk saat scroll (Intersection Observer)
- **Parallax Orbs**: Efek parallax pada elemen dekoratif
- **Dark/Light Theme**: Toggle tema dengan persistensi

---

## 2. Authentication & Role Management

### Login System

- **Endpoint**: `POST /api/auth/login`
- **Autentikasi**: Email + password, verifikasiagainst database via Prisma
- **Token**: Base64 encoded `userId:role:timestamp` (untuk demo; production gunakan JWT)
- **Role Detection**: Otomatis deteksi role (ADMIN / TENANT) dari database

### Quick Login (Demo)

Tombol shortcut untuk demo:
- **Admin**: `admin@kosanku.com` / `password123`
- **Tenant**: `budi@kosanku.com` / `password123`

### Role-Based Access

| Role | Akses |
|------|-------|
| **ADMIN** | Full CRUD kamar, kelola penghuni, buat invoice, kelola pengeluaran, dashboard keuangan, AI pricing |
| **TENANT** | Lihat invoice, bayar via Midtrans, submit komplain, lihat notifikasi |

---

## 3. Admin Dashboard

Dashboard komprehensif untuk pengelola kos dengan 6 modul utama.

### 3.1 Manajemen Kamar (Room CRUD)

**Endpoint**: `GET/POST /api/rooms`, `PUT/DELETE /api/rooms/[id]`

| Fitur | Detail |
|-------|--------|
| **List Kamar** | Tampilan grid/list dengan filter status (Available, Occupied, Booked, Maintenance) |
| **Tambah Kamar** | Form: nomor kamar, tipe (Standard/Deluxe/VIP), harga, lantai, kapasitas, fasilitas, foto |
| **Edit Kamar** | Update semua field termasuk status, harga, assignment penghuni |
| **Hapus Kamar** | Soft delete (status → Maintenance) atau hard delete |
| **Detail Kamar** | Info lengkap: status, penghuni, riwayat invoice |

**Status Kamar**:
- `AVAILABLE` — Siap huni
- `OCCUPIED` — Terisi
- `BOOKED` — Dipesan (DP terbayar)
- `MAINTENANCE` — Dalam perawatan

### 3.2 Manajemen Penghuni (Tenant Management)

**Endpoint**: `GET/POST /api/tenants`

| Fitur | Detail |
|-------|--------|
| **List Penghuni** | Daftar semua tenant dengan pencarian (nama, email, telepon) |
| **Registrasi** | Form: nama, email, telepon, password, assign kamar |
| **Auto Room Update** | Saat registrasi, status kamar otomatis → OCCUPIED |
| **Riwayat** | Invoice terakhir per penghuni (5 terbaru) |

### 3.3 Invoice Management

**Endpoint**: `GET/POST /api/invoices`

| Fitur | Detail |
|-------|--------|
| **Buat Invoice** | Pilih penghuni, kamar, jumlah, denda, jatuh tempo |
| **Nomor Otomatis** | Format `INV-YYYYMMDD-XXXX` |
| **Status Tracking** | PENDING → SETTLED / EXPIRED / CANCELLED / FAILED |
| **Filter** | By status, by userId |

### 3.4 Expense Management

**Endpoint**: `GET/POST /api/expenses`

| Fitur | Detail |
|-------|--------|
| **Input Manual** | Kategori, jumlah, deskripsi, tanggal |
| **OCR Scan** | Upload struk → auto-ekstrak data (vendor, jumlah, kategori) |
| **Filter** | By kategori, by rentang tanggal |
| **Summary** | Total per kategori, grand total |

**Kategori Pengeluaran**: `listrik`, `air`, `perbaikan`, `internet`, `lain_lain`

### 3.5 Financial Dashboard

**Endpoint**: `GET /api/expenses` (summary) + invoice data

| Fitur | Detail |
|-------|--------|
| **Revenue Chart** | Bar chart CSS pure — pendapatan bulanan dari invoice |
| **Expense Chart** | Bar chart pengeluaran per kategori |
| **Occupancy Rate** | Persentase kamar terisi |
| **Recent Invoices** | 5 invoice terbaru dengan status |
| **AI Pricing Button** | Akses ke rekomendasi harga AI |

### 3.6 Complaint Management

**Endpoint**: `GET/POST /api/complaints`

| Fitur | Detail |
|-------|--------|
| **List Komplain** | Semua komplain dari penghuni |
| **Status Tracking** | OPEN → IN_PROGRESS → RESOLVED |
| **Kategori** | Plumbing, Electrical, Furniture, Internet, lain_lain |
| **Assignment** | Link ke kamar & penghuni |

---

## 4. Tenant Dashboard

Dashboard self-service untuk penghuni kos.

### 4.1 Invoice & Pembayaran

| Fitur | Detail |
|-------|--------|
| **Daftar Invoice** | Invoice milik tenant dengan status & jumlah |
| **Bayar via Midtrans** | Klik "Bayar" → redirect ke Midtrans Snap (QRIS, VA, kartu, dll) |
| **Status Real-time** | Webhook Midtrans update status otomatis |
| **Riwayat Pembayaran** | Daftar invoice yang sudah lunas |

### 4.2 Komplain

| Fitur | Detail |
|-------|--------|
| **Buat Komplain** | Judul, deskripsi, kategori |
| **Status Tracking** | Lihat progres komplain |

### 4.3 Notifikasi

| Fitur | Detail |
|-------|--------|
| **In-App Notifikasi** | Daftar notifikasi dari sistem |
| **Real-time** | Update saat drawer dibuka |

---

## 5. AI Chatbot & Concierge

### 5.1 Widget Chat (In-App)

**Endpoint**: `POST /api/ai/chat`

| Fitur | Detail |
|-------|--------|
| **WhatsApp-style Widget** | Floating button, expandable chat window |
| **AI Response** | OpenAI/OpenRouter models (Gemma, Nemotron, GPT-OSS) |
| **Knowledge Base** | FAQ dari database + data kamar real-time |
| **Context History** | Menyimpan percakapan terakhir 10 pesan per telepon |
| **Rate Limit Handling** | Graceful error saat API limit (429) |

### 5.2 WhatsApp Concierge (Webhook)

**Endpoint**: `POST /api/whatsapp/webhook`

| Fitur | Detail |
|-------|--------|
| **Inbound WA** | Menerima pesan WhatsApp dari calon penghuni via Fonnte |
| **AI Concierge** | Menjawab pertanyaan, cek ketersediaan kamar |
| **Function Calling** | Tool `check_availability` & `create_booking_dp` |
| **Booking via Chat** | Calon penghuni bisa booking langsung dari WhatsApp |
| **Conversation History** | Menyimpan riwayat percakapan per nomor telepon |
| **Auto Reply** | Balasan otomatis via Fonnte API |

### 5.3 Model Fallback

Sistem fallback model AI dengan retry otomatis:

```
Primary Models (try in order):
1. google/gemma-4-31b-it:free
2. google/gemma-4-26b-a4b-it:free
3. nvidia/nemotron-3-super-120b-a12b:free
4. nvidia/nemotron-nano-9b-v2:free
5. nvidia/nemotron-nano-12b-v2-vl:free
6. openai/gpt-oss-20b:free

Fallback: google/gemma-4-26b-a4b-it:free (with extended retry)
```

- Retry dengan exponential backoff (1.5s, 3s)
- Auto-skip model yang gagal
- Graceful error message ke user

---

## 6. Payment Gateway — Midtrans

### 6.1 Pembuatan Pembayaran

**Endpoint**: `POST /api/payments/create`

| Fitur | Detail |
|-------|--------|
| **Snap Token** | Generate token Midtrans Snap untuk pembayaran |
| **Metode Bayar** | QRIS, VA (BCA, BRI, Mandiri, BNI), Kartu Kredit, Indomaret, Alfamart |
| **Customer Details** | Nama, email, telepon otomatis dari data penghuni |
| **Item Details** | "Sewa Kamar [nomor] - [tipe]" |
| **Sandbox Mode** | Default ke sandbox untuk development |

### 6.2 Webhook Handler

**Endpoint**: `POST /api/payments/webhook`

| Fitur | Detail |
|-------|--------|
| **Signature Verification** | SHA-512 hash validation |
| **Status Mapping** | capture/settlement → SETTLED, pending → PENDING, deny/cancel/expire → EXPIRED |
| **Payment Log** | Setiap notifikasi dicost ke `PaymentLog` table |
| **Auto Invoice Update** | Status invoice otomatis ter-update |
| **WhatsApp Confirmation** | Kirim notifikasi WA otomatis saat pembayaran berhasil |

### 6.3 Integrasi Midtrans

```typescript
// lib/midtrans.ts
- createSnapTransaction(): Generate Snap token
- verifySignature(): SHA-512 verification
- mapTransactionStatus(): Map status Midtrans → internal
- Sandbox: app.sandbox.midtrans.com
- Production: app.midtrans.com
```

---

## 7. WhatsApp Automation — Fonnte

### 7.1 Kirim Pesan

**Endpoint**: `POST /api/whatsapp/send`

| Fitur | Detail |
|-------|--------|
| **Text Message** | Kirim pesan teks ke nomor target |
| **Image Message** | Kirim pesan dengan gambar (URL) |
| **API** | Fonnte REST API (`api.fonnte.com/send`) |
| **Auth** | Bearer token via `FONNTE_WHATSAPP_TOKEN` |

### 7.2 Webhook Inbound

**Endpoint**: `POST /api/whatsapp/webhook`

| Fitur | Detail |
|-------|--------|
| **Terima Pesan** | Menerima pesan masuk dari Fonnte |
| **AI Processing** | Pesan diproses oleh AI Concierge |
| **Auto Reply** | Balasan otomatis dikirim kembali via Fonnte |

### 7.3 Billing Reminder Templates

Format pesan reminder yang sudah dikonfigurasi:

| Tipe | Trigger | Isi Pesan |
|------|---------|-----------|
| **H-3** | 3 hari sebelum jatuh tempo | Pengingat ramah |
| **H-1** | 1 hari sebelum jatuh tempo | Peringatan penting |
| **H-0** | Hari ini jatuh tempo | Alert hari ini |
| **OVERDUE** | Lewat jatuh tempo (H+1, H+3, H+7) | Peringatan tunggakan |

---

## 8. OCR Receipt Scanning

**Endpoint**: `POST /api/ai/ocr`

| Fitur | Detail |
|-------|--------|
| **Input** | Base64 image ( JPEG/PNG) |
| **Model** | nvidia/nemotron-nano-12b-v2-vl:free (Vision) |
| **Output** | JSON: vendor, date, category, totalAmount, items[], notes |
| **Auto-Kategorikan** | listrik, air, perbaikan, internet, lain_lain |
| **Integrasi Expense** | Hasil OCR langsung bisa di-save sebagai pengeluaran |

### OCR Flow

```
Upload Struk → Base64 Encode → Vision AI → Parse JSON → Auto-fill Form Expense → Save to DB
```

### Kategori OCR

- **listrik**: Tagihan listrik (PLN, token listrik)
- **air**: Tagihan air (PDAM)
- **perbaikan**: Perbaikan, maintenance, hardware
- **internet**: WiFi, internet service
- **lain_lain**: Lainnya

---

## 9. AI Dynamic Pricing

**Endpoint**: `POST /api/ai/pricing`

| Fitur | Detail |
|-------|--------|
| **Input Data** | Total kamar, okupansi, data per tipe, booking 30 hari terakhir |
| **Analisis** | Musim (bulan), tingkat okupansi, tren booking |
| **Output** | Rekomendasi harga per tipe, insight pasar, occupancy trend |
| **Confidence Level** | high / medium / low per rekomendasi |

### Output Format

```json
{
  "recommendations": [
    {
      "roomType": "Standard",
      "currentPrice": 1200000,
      "suggestedPrice": 1350000,
      "reason": "Okupansi tinggi (90%) di bulan Agustus",
      "confidence": "high"
    }
  ],
  "insights": "Okupansi meningkat menjelang tahun ajaran baru...",
  "occupancyTrend": "naik"
}
```

---

## 10. Expense Tracking & Financial Analytics

### 10.1 Expense Management

**Endpoint**: `GET/POST /api/expenses`

| Fitur | Detail |
|-------|--------|
| **CRUD Pengeluaran** | Kategori, jumlah, deskripsi, tanggal |
| **OCR Integration** | Upload struk → auto-ekstrak data |
| **Filter** | By kategori, by rentang tanggal |
| **Summary** | Total per kategori, grand total |

### 10.2 Financial Dashboard

Komponen `FinancialDashboard.tsx`:

| Widget | Deskripsi |
|--------|-----------|
| **Revenue Bar Chart** | CSS pure bar chart — pendapatan vs pengeluaran |
| **Occupancy Rate** | Persentase kamar terisi (warna dinamis) |
| **Total Revenue** | Jumlah pendapatan dari invoice lunas |
| **Total Expenses** | Jumlah pengeluaran dari expense |
| **Recent Invoices** | 5 invoice terbaru dengan badge status |
| **Expense Management** | Tombol tambah expense, filter kategori |
| **OCR Upload** | Drag & drop upload struk dengan preview |

---

## 11. Notification System

### 11.1 In-App Notifications

**Endpoint**: `GET /api/notifications`

| Fitur | Detail |
|-------|--------|
| **Notification Drawer** | Slide-in panel dari kanan |
| **Time Ago** | Format waktu relatif (5m lalu, 2 jam lalu, 3 hari lalu) |
| **Fallback Data** | Default notifikasi jika API gagal |
| **Filter** | By userId, limit |

### 11.2 Multi-Channel

| Channel | Deskripsi |
|---------|-----------|
| **IN_APP** | Notifikasi dalam aplikasi |
| **WHATSAPP** | Pesan WhatsApp via Fonnte |
| **EMAIL** | (Ready untuk integrasi) |

---

## 12. Cron Job — Automated Reminders

**Endpoint**: `GET /api/cron/send-reminders`

**Konfigurasi Vercel** (`vercel.json`):
```json
{
  "crons": [{
    "path": "/api/cron/send-reminders",
    "schedule": "0 8 * * *"
  }]
}
```

### Reminder Schedule

| Hari | Tipe | Status |
|------|------|--------|
| H-3 | Pengingat ramah | PENDING |
| H-1 | Peringatan penting | PENDING |
| H-0 | Hari jatuh tempo | PENDING |
| H+1 | Overdue warning | PENDING |
| H+3 | Overdue reminder | PENDING |
| H+7 | Overdue final | PENDING |

### Fitur Cron

- **Auth**: Bearer token `CRON_SECRET`
- **Deduplication**: Cek `NotificationLog` sebelum kirim (skip jika sudah terkirim hari ini)
- **Logging**: Setiap notifikasi tercatat di `NotificationLog` (channel: WHATSAPP)
- **Retry**: Graceful handling jika Fonnte API gagal

---

## 13. UI/UX Design System

### Orchid Dark Theme

```css
--orchid-dark: #0e0e12       /* Background utama */
--orchid-violet: #8e6e95     /* Primary accent */
--orchid-tint: #e2d9e2       /* Text highlight */
--orchid-gold: #daa520       /* Gold accent (badge, CTA) */
--orchid-mid: #3a3a50        /* Card background */
```

### Komponen UI

| Komponen | Deskripsi |
|----------|-----------|
| **Glass Panel** | `bg-white/5 backdrop-blur-xl border border-white/10` |
| **Glass Card** | Kartu dengan efek kaca, hover spotlight |
| **Badge** | Status badge (Available, Occupied, PENDING, SETTLED) |
| **Modal** | Centered modal dengan backdrop blur |
| **Toast** | Error/success notification inline |
| **Ripple** | Efek ripple material-design-style pada tombol |
| **Spinner** | Loading spinner untuk async operations |

### Animasi

| Animasi | Deskripsi |
|---------|-----------|
| **Scale In** | Modal masuk dengan scale |
| **Slide In** | Navbar, drawer masuk dari arah |
| **Reveal** | Scroll reveal dengan Intersection Observer |
| **Stagger Children** | Animasi berurutan pada list item |
| **Marquee** | Scroll otomatis horizontal |
| **Parallax** | Efek kedalaman pada scroll |
| **Cursor Glow** | Efek cahaya mengikuti kursor |
| **Magnetic** | Efek magnetik pada hover tombol |

### Responsive Breakpoints

- **Mobile**: `< 640px` — Single column, hamburger menu
- **Tablet**: `640px - 1024px` — 2-3 column grid
- **Desktop**: `> 1024px` — Full layout, sidebar

---

## 14. Database Schema

### Entity Relationship

```
Property ──┬── Room ──┬── Invoice ── PaymentLog
            │          ├── Complaint
            │          └── Booking
            └── FaqEntry

User ──┬── Room (tenant)
       ├── Invoice
       ├── Complaint
       └── NotificationLog

Conversation (WhatsApp chat history)
Expense (pengeluaran operasional)
```

### Models

| Model | Fields Utama |
|-------|-------------|
| **Property** | id, name, address, city, totalRooms, rooms[], faqEntries[] |
| **User** | id, name, email, phone, passwordHash, role (ADMIN/TENANT), rooms[], invoices[] |
| **Room** | id, number, type, price, status, floor, capacity, facilities[], tenantId |
| **Invoice** | id, invoiceNumber, userId, roomId, amount, totalAmount, paymentStatus, orderId, snapToken |
| **PaymentLog** | id, invoiceId, rawPayload, transactionStatus, statusCode |
| **Complaint** | id, userId, roomId, title, description, category, status |
| **NotificationLog** | id, userId, title, message, channel, sentAt, isRead |
| **Expense** | id, category, amount, description, receiptUrl, ocrRaw, date |
| **Booking** | id, roomId, tenantName, tenantPhone, checkInDate, dpAmount, status |
| **FaqEntry** | id, propertyId, question, answer, category |
| **Conversation** | id, phone, messages (JSON) |

---

## 15. API Endpoints

### Authentication
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login dengan email & password |

### Rooms
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/rooms` | List kamar (filter: status, floor, type) |
| POST | `/api/rooms` | Tambah kamar baru |
| PUT | `/api/rooms/[id]` | Update kamar |
| DELETE | `/api/rooms/[id]` | Hapus kamar (soft/hard delete) |

### Tenants
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/tenants` | List penghuni (search by name/email/phone) |
| POST | `/api/tenants` | Registrasi penghuni baru |

### Invoices
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/invoices` | List invoice (filter: status, userId) |
| POST | `/api/invoices` | Buat invoice baru |

### Payments
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/payments/create` | Generate Midtrans Snap token |
| POST | `/api/payments/webhook` | Midtrans payment notification |

### Complaints
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/complaints` | List komplain (filter: status, userId) |
| POST | `/api/complaints` | Buat komplain baru |

### Expenses
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/expenses` | List pengeluaran (filter: category, date) |
| POST | `/api/expenses` | Tambah pengeluaran (dengan OCR) |

### Notifications
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/notifications` | List notifikasi |

### WhatsApp
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/whatsapp/send` | Kirim pesan WhatsApp |
| POST | `/api/whatsapp/webhook` | Webhook pesan masuk |

### AI
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/ai/chat` | AI chatbot (admin widget) |
| POST | `/api/ai/ocr` | OCR struk dengan Vision AI |
| POST | `/api/ai/pricing` | AI dynamic pricing |

### Cron
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/cron/send-reminders` | Kirim reminder otomatis (daily 08:00) |

---

## 16. Tech Stack & Architecture

### Frontend

| Teknologi | Versi | Deskripsi |
|-----------|-------|-----------|
| **Next.js** | 14 | React framework (App Router) |
| **TypeScript** | 5 | Type-safe JavaScript |
| **Tailwind CSS** | 3 | Utility-first CSS framework |
| **Swiper.js** | — | Carousel untuk reviews |
| **Font Awesome** | 6 | Icon library |
| **Google Fonts** | — | Inter + JetBrains Mono |

### Backend

| Teknologi | Deskripsi |
|-----------|-----------|
| **Next.js API Routes** | Serverless functions |
| **Prisma** | Type-safe ORM |
| **PostgreSQL** (Supabase) | Relational database |

### Integrasi

| Layanan | Fungsi |
|---------|--------|
| **OpenRouter** | AI model access (Gemma, Nemotron, GPT-OSS) |
| **Midtrans** | Payment gateway (Snap, Webhook) |
| **Fonnte** | WhatsApp Business API |
| **Vercel** | Hosting & deployment |

### Deployment

| Item | Status |
|------|--------|
| **Hosting** | Vercel (Edge Network) |
| **Database** | Supabase (PostgreSQL) |
| **CI/CD** | GitHub → Vercel auto-deploy |
| **Cron** | Vercel Cron (daily 08:00 WIB) |
| **Domain** | `kosan-ku-pro-1-one.vercel.app` |

---

## Summary

KosanKu Pro adalah platform manajemen kos all-in-one yang menggabungkan:

- **AI-Powered Chatbot** — Concierge virtual untuk calon penghuni
- **WhatsApp Automation** — Reminder & konfirmasi otomatis
- **Payment Gateway** — Pembayaran online via Midtrans (QRIS, VA, kartu)
- **OCR Scanning** — Scan struk otomatis dengan Vision AI
- **Smart Pricing** — Rekomendasi harga dinamis berbasis AI
- **Financial Analytics** — Dashboard keuangan real-time
- **Modern UI** — Glassmorphism design dengan animasi interaktif

Dirancang untuk pengelola kos yang ingin **otomatisasi operasional**, **meningkatkan okupansi**, dan **memberikan pengalaman premium** kepada penghuni.
