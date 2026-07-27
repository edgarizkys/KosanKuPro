# KosanKu Pro - API Routes & Architecture Documentation

## Overview
**KosanKu Pro** is a modern Boarding House & Rental Management System built for seamless deployment on **Vercel** serverless architecture.

---

## Architecture & File Structure
```
KosanKu/
├── vercel.json                 # Vercel Cron Configuration (daily 08:00 AM)
├── schema.prisma               # Prisma ORM Database Schemas (User, Room, Invoice, Complaint, NotificationLog)
├── api_create_invoice.ts       # Next.js Serverless API Route: Midtrans Snap Transaction Token Generator
├── api_webhook.ts              # Next.js Serverless API Route: Midtrans Webhook Receiver + Signature Hash Verification
├── api_cron_reminders.ts       # Next.js Serverless API Route: Automated WhatsApp & Email Reminders Engine
├── index.html                  # Responsive UI featuring Glassmorphism & Modern Neo-Minimalism
├── style.css                   # Custom CSS Design System
├── app.js                      # Dual-Role State Machine & Midtrans Simulator Engine
└── API_DOCUMENTATION.md        # API Mapping Specifications
```

---

## Endpoint Specifications

### 1. Midtrans Snap Transaction Generator
- **Route:** `POST /api/invoice/create`
- **Description:** Generates a unique order ID and returns a Snap checkout token for the frontend.
- **Request Body:**
  ```json
  {
    "invoiceId": "INV-2026-0701",
    "amount": 1604500,
    "customerDetails": {
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "phone": "081234567890"
    }
  }
  ```
- **Response:**
  ```json
  {
    "token": "71387d89-983b-4861-8aa2-d3521fd9466e",
    "redirect_url": "https://app.sandbox.midtrans.com/snap/v1/transactions/71387d89...",
    "orderId": "KOSANKU-INV-2026-0701-1721800000"
  }
  ```

---

### 2. Midtrans Webhook Callback Endpoint
- **Route:** `POST /api/payments/webhook`
- **Description:** Receives payment status updates (`settlement`, `pending`, `expire`, `cancel`) from Midtrans.
- **Security:** Verifies `SHA512(order_id + status_code + gross_amount + ServerKey)` signature key.
- **Database Action:** Automatically updates `Invoice.paymentStatus` to `SETTLED` and extends lease period.

---

### 3. Vercel Cron Automated Reminders Endpoint
- **Route:** `GET /api/cron/send-reminders`
- **Schedule (`vercel.json`):** `0 8 * * *` (Every day at 08:00 AM)
- **Security:** Protected by `Authorization: Bearer <CRON_SECRET>`
- **Logic:**
  - Queries database for invoices due in 7 days (H-7), 3 days (H-3), today (H-0), and overdue (H+1).
  - Dispatches automated WhatsApp messages (via Fonnte API) and HTML Emails (via Resend/Nodemailer).
  - Logs notification event in `NotificationLog` table.
