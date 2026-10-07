# 🛡️ Admin API Documentation (CRUD)

Dokumen ini berisi panduan penggunaan **REST API khusus untuk Admin**. 

> **💡 Info Penting (Customer vs Admin API):**
> - **Customer API**: Semua operasi **Membaca Data (GET)** seperti `GET /api/projects` bersifat *Public* (tidak memerlukan token) dan ditujukan untuk *Frontend* Portofolio Customer. Panduannya ada di file `CUSTOMER_API_GUIDE.md`.
> - **Admin API**: Semua operasi **Mengubah Data (POST, PUT, DELETE)** bersifat *Private* (wajib menggunakan token) dan dikhususkan untuk *Frontend* Admin (Dashboard). Dokumen inilah panduannya.

### 🔑 Authentication Header
Setiap *request* yang mengubah data (POST, PUT, DELETE) **wajib** menyertakan token JWT yang didapatkan dari proses Login.
```http
Authorization: Bearer <admin_jwt_token>
```

---

## 🖼️ Upload Foto / File
Sebelum membuat data yang membutuhkan foto (seperti Profile, Journal, Apple Gallery, UI Projects, dll), foto **HARUS** di-upload terlebih dahulu ke endpoint terpisah. API akan mengembalikan URL gambar yang *hosted* di Cloudflare R2, dan URL inilah yang kemudian dikirimkan ke endpoint-endpoint lain.

### Upload Endpoint
**POST** `/api/upload`
**Headers:** `Authorization: Bearer <admin_jwt_token>`
**Content-Type:** `multipart/form-data`

**Request Body (Form Data):**
- `file`: (Pilih file gambar Anda)

**Response (200 OK):**
```json
{
    "message": "File uploaded successfully",
    "data": {
        "url": "https://pub-xxxxxxxx.r2.dev/file-1234.jpg"
    }
}
```
*(Gunakan nilai `url` di atas untuk dikirim sebagai `image_url`, `cover_image_url`, atau parameter foto lainnya pada endpoint di bawah ini).*

---

## 🔐 Authentication & Akun Admin

### Login
**POST** `/api/login` (Tanpa Auth)
**Request Body:**
```json
{
    "email": "admin@example.com",
    "password": "yourpassword"
}
```
**Response (200 OK):**
```json
{
    "message": "Login berhasil",
    "data": {
        "token": "eyJhbGciOiJIUzI1...",
        "user": { "id": "...", "email": "admin@example.com", "role": "admin" }
    }
}
```

### Lupa Password (Forgot Password)
**POST** `/api/forgot-password` (Tanpa Auth)
**Request Body:**
```json
{
    "email": "admin@example.com"
}
```
**Response (200 OK):** Sistem akan mengirimkan OTP ke email tersebut.

### Reset Password
**POST** `/api/reset-password` (Tanpa Auth)
**Request Body:**
```json
{
    "email": "admin@example.com",
    "otp": "123456",
    "new_password": "newsecurepassword"
}
```

### Update Admin Profile (Ubah Data Diri Admin)
**PUT** `/api/admin-profile`
**Headers:** `Authorization: Bearer <admin_jwt_token>`
**Request Body:**
```json
{
    "name": "Rayhan",
    "email": "admin@example.com"
}
```

---

## 🚀 1. Projects (Portofolio Utama)

### Create Project
**POST** `/api/projects`
**Request Body:**
```json
{
    "number": "01",
    "category": "EdTech Platform",
    "title": "Magangku",
    "tags": ["React", "Firebase", "Tailwind", "Vite"],
    "link": "https://magangku.web.id",
    "desc_en": "Web-based internship platform focusing on UI/UX...",
    "desc_id": "Platform magang berbasis web yang berfokus pada UI/UX..."
}
```
**Response (201 Created):**
```json
{
    "message": "Project created successfully",
    "data": { "id": "d440ff79-b7dc-41ec-8353-cfc4c1e0c400", ... }
}
```

### Update Project
**PUT** `/api/projects/{id}`
**Request Body:** *(Sama seperti POST, kirim field yang ingin diubah)*
```json
{
    "title": "Magangku Updated",
    "category": "EdTech & Career"
}
```
**Response (200 OK):**
```json
{
    "message": "Project updated successfully"
}
```

### Delete Project
**DELETE** `/api/projects/{id}`
**Response (200 OK):**
```json
{
    "message": "Project deleted successfully"
}
```

---

## 👤 2. Profile & Identitas

### Create Profile
**POST** `/api/profile`
**Request Body:**
```json
{
    "name": "Rayhan Rizky Widi Ananta",
    "role": "Software Engineer & Tech Lead",
    "description_en": "A passionate Software Engineer...",
    "description_id": "Seorang Software Engineer yang antusias...",
    "image_url": "https://.../profile.jpg"
}
```

### Update Profile
**PUT** `/api/profile/{id}`
**Request Body:**
```json
{
    "role": "Senior Software Engineer"
}
```

### Delete Profile
**DELETE** `/api/profile/{id}`

---

## 📝 3. Journal / Blog

### Create Journal
**POST** `/api/journal`
**Request Body:**
```json
{
    "title": "How to Build a Scalable Backend in Go",
    "content": "In this article, we will explore...",
    "tags": ["Go", "Backend", "Scalability"],
    "slug": "how-to-build-scalable-backend-go",
    "image_url": "https://.../cover.jpg",
    "published_at": "2026-10-01T10:00:00Z"
}
```

### Update & Delete Journal
- **PUT** `/api/journal/{id}`
- **DELETE** `/api/journal/{id}`

---

## 🎵 4. Archive Tracks

### Create Track
**POST** `/api/archive-tracks`
**Request Body:**
```json
{
    "title": "Midnight City",
    "artist": "M83",
    "spotify_url": "https://open.spotify.com/track/...",
    "apple_music_url": "https://music.apple.com/...",
    "cover_image_url": "https://.../cover.jpg"
}
```

### Update & Delete Track
- **PUT** `/api/archive-tracks/{id}`
- **DELETE** `/api/archive-tracks/{id}`

---

## 💻 5. Core Stack

### Create Core Stack
**POST** `/api/core-stack`
**Request Body:**
```json
{
    "name": "Golang",
    "category": "Backend",
    "icon_url": "https://.../golang.png",
    "proficiency": 90
}
```

### Update & Delete Core Stack
- **PUT** `/api/core-stack/{id}`
- **DELETE** `/api/core-stack/{id}`

---

## 📊 6. Stats

### Create Stat
**POST** `/api/stats`
**Request Body:**
```json
{
    "label_en": "Years of Experience",
    "label_id": "Tahun Pengalaman",
    "value": "3+",
    "icon": "clock"
}
```

### Update & Delete Stat
- **PUT** `/api/stats/{id}`
- **DELETE** `/api/stats/{id}`

---

## 💬 7. Archive Quotes

### Create Quote
**POST** `/api/archive-quotes`
**Request Body:**
```json
{
    "text_en": "Stay hungry, stay foolish.",
    "text_id": "Tetap merasa lapar, tetap merasa bodoh.",
    "author": "Steve Jobs",
    "context": "Stanford Commencement Address, 2005"
}
```

### Update & Delete Quote
- **PUT** `/api/archive-quotes/{id}`
- **DELETE** `/api/archive-quotes/{id}`

---

## 🏆 8. Certifications

### Create Certification
**POST** `/api/certifications`
**Request Body:**
```json
{
    "name": "Google Cloud Professional Cloud Architect",
    "issuer": "Google",
    "issue_date": "2025-05-10",
    "credential_url": "https://...",
    "image_url": "https://.../cert.png"
}
```

### Update & Delete Certification
- **PUT** `/api/certifications/{id}`
- **DELETE** `/api/certifications/{id}`

---

## 📸 9. Lightroom Edits

### Create Lightroom Edit
**POST** `/api/lightroom`
**Request Body:**
```json
{
    "title": "Moody Tokyo Streets",
    "before_image_url": "https://.../before.jpg",
    "after_image_url": "https://.../after.jpg",
    "preset_name": "Cyberpunk Neon"
}
```

### Update & Delete Lightroom Edit
- **PUT** `/api/lightroom/{id}`
- **DELETE** `/api/lightroom/{id}`

---

## 📱 10. Apple Gallery

### Create Image
**POST** `/api/apple-gallery`
**Request Body:**
```json
{
    "title": "Sunset at Bali",
    "image_url": "https://.../bali.jpg",
    "location": "Bali, Indonesia",
    "date_taken": "2024-12-01"
}
```

### Update & Delete Image
- **PUT** `/api/apple-gallery/{id}`
- **DELETE** `/api/apple-gallery/{id}`

---

## 🌐 11. Socials

### Create Social Link
**POST** `/api/socials`
**Request Body:**
```json
{
    "platform": "LinkedIn",
    "username": "rayhanrwa",
    "url": "https://linkedin.com/in/rayhanrwa",
    "icon": "linkedin"
}
```

### Update & Delete Social Link
- **PUT** `/api/socials/{id}`
- **DELETE** `/api/socials/{id}`

---

## 🔗 12. Nav Links

### Create Nav Link
**POST** `/api/nav-links`
**Request Body:**
```json
{
    "name_en": "About Me",
    "name_id": "Tentang Saya",
    "path": "/about",
    "order": 1
}
```

### Update & Delete Nav Link
- **PUT** `/api/nav-links/{id}`
- **DELETE** `/api/nav-links/{id}`

---

## 🎨 13. UI Projects

### Create UI Project
**POST** `/api/ui-projects`
**Request Body:**
```json
{
    "title": "E-Commerce Mobile App",
    "dribbble_url": "https://dribbble.com/shots/...",
    "image_url": "https://.../ui-shot.png"
}
```

### Update & Delete UI Project
- **PUT** `/api/ui-projects/{id}`
- **DELETE** `/api/ui-projects/{id}`

---

## 🎥 14. Video Edits

### Create Video Edit
**POST** `/api/video-edits`
**Request Body:**
```json
{
    "title": "Cinematic Travel Vlog - Japan",
    "youtube_url": "https://youtube.com/watch?v=...",
    "thumbnail_url": "https://.../thumbnail.jpg"
}
```

### Update & Delete Video Edit
- **PUT** `/api/video-edits/{id}`
- **DELETE** `/api/video-edits/{id}`

---

## ℹ️ Panduan Tambahan untuk Frontend (Admin)

1. **Gunakan Axios Interceptors**: Agar tidak perlu menambahkan header `Authorization` di setiap *request* secara manual, Anda bisa menggunakan Axios Interceptors di Frontend.
   ```javascript
   axios.interceptors.request.use((config) => {
       const token = localStorage.getItem('admin_token');
       if (token) {
           config.headers.Authorization = `Bearer ${token}`;
       }
       return config;
   });
   ```
2. **Error Handling (401 Unauthorized)**: Jika API mengembalikan status `401`, berarti token admin kedaluwarsa atau tidak valid. Di sinilah frontend harus secara otomatis menghapus token dari `localStorage` dan menendang (redirect) pengguna kembali ke halaman `/login`.
