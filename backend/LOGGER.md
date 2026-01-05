---

# 📋 Standarisasi Logging JSON (Optimized)

Dokumentasi ini menetapkan standar log yang ringkas untuk **Grafana Loki**. Kita mengandalkan **Loki Labels** untuk metadata infrastruktur (`pod`, `service`, `namespace`) dan menggunakan **JSON Body** hanya untuk data transaksional.

---

## 🏗️ 1. Core Fields (Wajib)

Field ini harus ada di setiap entri log tanpa kecuali.

|*Field|Tipe|Deskripsi*|
|---|---|---|
|timestamp|ISO8601|Waktu internal aplikasi (UTC).|
|level|String|info, warn, error.|
|requestId|UUID|ID unik untuk melacak alur request.|
|message|String|Deskripsi singkat aktivitas.|
|method|String|HTTP Method atau INTERNAL / SYSTEM.|
|path|String|Endpoint atau Nama Komponen/Worker.|

---

## 🚀 2. Implementasi Kategori Log

### A. Normal Event (attributes)

Digunakan untuk HTTP Request (GET/POST/PUT/DELETE), Business Logic, Security, dan Background Jobs.

*Contoh: POST Request (Payload) & Security*

JSON


{
  "timestamp": "2026-01-05T08:30:10.123Z",
  "level": "info",
  "requestId": "9a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p",
  "method": "POST",
  "path": "/api/products",
  "message": "Create Product Success",
  "attributes": {
    "payload": { "name": "Smartphone X", "price": 5000000 },
    "user_email": "admin@store.com",
    "ip_address": "192.168.1.1"
  }
}


*Contoh: GET Request (Query Params)*

JSON


{
  "timestamp": "2026-01-05T08:31:00.456Z",
  "level": "info",
  "requestId": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
  "method": "GET",
  "path": "/api/products",
  "message": "Get Product List",
  "attributes": {
    "queryParams": { "page": "1", "limit": "10" },
    "userAgent": "Mozilla/5.0..."
  }
}


---

### B. Error Event (error)

Ditambahkan secara dinamis hanya saat level: error atau terjadi kegagalan sistem.

*Contoh: Exception / Database Failure*

JSON


{
  "timestamp": "2026-01-05T08:35:00.999Z",
  "level": "error",
  "requestId": "7b8c9d0e-1f2a-4b3c-8d9e-f0a1b2c3d4e5",
  "method": "GET",
  "path": "/api/users/profile",
  "message": "Database connection timeout",
  "error": {
    "code": "DB_CONN_ERR_001",
    "details": "Connection lost to postgres-db-01",
    "stackTrace": "at Internal.Database.Connect()... line 45"
  }
}


---

### C. Perf Event (metrics)

Digunakan untuk mencatat latensi, penggunaan resource, atau efisiensi proses.

*Contoh: Slow Query / Processing Time*

JSON


{
  "timestamp": "2026-01-05T08:40:22.789Z",
  "level": "warn",
  "requestId": "3d4e5f6g-7h8i-4j9k-0l1m-2n3o4p5q6r7s",
  "method": "INTERNAL",
  "path": "Database/QueryExecutor",
  "message": "Slow query detected",
  "metrics": {
    "executionTimeMs": 5200,
    "memoryUsageMb": 128,
    "rowCount": 50000,
    "thresholdMs": 1000
  }
}


---

## 🛠️ 3. Contoh Kasus Khusus (Background Job)

Menggunakan attributes untuk data proses di latar belakang.

JSON


{
  "timestamp": "2026-01-05T09:00:01.000Z",
  "level": "info",
  "requestId": "job-worker-8821",
  "method": "INTERNAL",
  "path": "Worker/EmailDispatcher",
  "message": "Monthly Newsletter Sent",
  "attributes": {
    "job_id": "batch_99",
    "recipient_count": 1500,
    "status": "completed"
  }
}


---