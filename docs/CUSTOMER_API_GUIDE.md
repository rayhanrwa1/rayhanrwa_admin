# 🚀 Panduan Implementasi API (Sisi Customer / Frontend)

Dokumen ini berisi panduan ringkas beserta contoh data respons nyata untuk menghubungkan frontend (`rayhanrwa_journey`) dengan Backend API.

## 🔗 Base URL
```javascript
const BASE_URL = "https://api.rayhanrwa.my.id/api";
```

---

## 📂 1. Projects (Portofolio Utama)

### Get All Projects
**GET** `/api/projects`

**Response:**
```json
{
    "message": "Data retrieved successfully",
    "data": [
        {
            "id": "d440ff79-b7dc-41ec-8353-cfc4c1e0c400",
            "number": "01",
            "category": "EdTech Platform",
            "title": "Magangku",
            "tags": ["React", "Firebase", "Google Cloud Platform", "Tailwind", "Vite"],
            "link": "https://magangku.web.id",
            "desc_en": "Web-based internship platform focusing on UI/UX...",
            "desc_id": "Platform magang berbasis web yang berfokus pada UI/UX..."
        }
    ]
}
```

### Get Project Detail
**GET** `/api/projects/{id}`

**Request:**
`id = string (UUID)`

**Response:**
```json
{
    "message": "Data retrieved successfully",
    "data": {
        "id": "d440ff79-b7dc-41ec-8353-cfc4c1e0c400",
        "number": "01",
        "category": "EdTech Platform",
        "title": "Magangku",
        "tags": ["React", "Firebase", "Google Cloud Platform", "Tailwind", "Vite"],
        "link": "https://magangku.web.id",
        "desc_en": "Web-based internship platform focusing on UI/UX...",
        "desc_id": "Platform magang berbasis web yang berfokus pada UI/UX..."
    }
}
```

---

## 👤 2. Profile & Identitas

### Get All Profile
**GET** `/api/profile`

**Response:**
```json
{
    "message": "Data retrieved successfully",
    "data": [
        {
            "id": "57800c8d-5c8e-42c8-9891-f4e969fb7e1c",
            "name": "Rayhan Rizky Widi Ananta",
            "role": "Software Engineer & Tech Lead",
            "tagline": "Software Engineer, Mobile Developer & Tech Lead...",
            "bio": ["Hi, I'm Rayhan Rizky Widi Ananta."],
            "email": "rayhanrwa1@gmail.com",
            "phone": "+62 851 6172 4229",
            "bio_en": ["Hi, I'm Rayhan Rizky Widi Ananta."],
            "bio_id": ["Halo, perkenalkan. Nama saya Rayhan Rizky Widi Ananta."],
            "photos": [
                {
                    "location": "Kuala Lumpur, Malaysia",
                    "title": "Petronas Twin Tower",
                    "url": "https://fvfncvatumezcuizxovp.supabase.co/storage/v1/.../photo.jpeg"
                }
            ]
        }
    ]
}
```

### Get Profile Detail
**GET** `/api/profile/{id}`

**Request:**
`id = string (UUID)`

**Response:**
```json
{
    "message": "Data retrieved successfully",
    "data": {
        "id": "57800c8d-5c8e-42c8-9891-f4e969fb7e1c",
        "name": "Rayhan Rizky Widi Ananta",
        "role": "Software Engineer & Tech Lead",
        "tagline": "Software Engineer, Mobile Developer & Tech Lead...",
        "bio": ["Hi, I'm Rayhan Rizky Widi Ananta."],
        "email": "rayhanrwa1@gmail.com",
        "phone": "+62 851 6172 4229",
        "bio_en": ["Hi, I'm Rayhan Rizky Widi Ananta."],
        "bio_id": ["Halo, perkenalkan. Nama saya Rayhan Rizky Widi Ananta."],
        "photos": [
            {
                "location": "Kuala Lumpur, Malaysia",
                "title": "Petronas Twin Tower",
                "url": "https://fvfncvatumezcuizxovp.supabase.co/storage/v1/.../photo.jpeg"
            }
        ]
    }
}
```

---

## 📝 3. Journal / Blog

### Get All Journal
**GET** `/api/journal`

**Response:**
```json
{
    "message": "Data retrieved successfully",
    "data": [
        {
            "id": 1,
            "slug": "understanding-react-hooks",
            "is_active": true,
            "title_en": "Understanding React Hooks",
            "title_id": "Memahami React Hooks",
            "date": "2026-10-06T00:00:00Z",
            "excerpt_en": "A deep dive into useEffect and useState.",
            "excerpt_id": "Pembahasan mendalam tentang useEffect dan useState.",
            "content_en": "<p>React hooks are...</p>",
            "content_id": "<p>React hooks adalah...</p>",
            "link": "https://medium.com/@rayhanrwa/hooks",
            "authors": "Rayhan Rizky",
            "publisher": "Medium",
            "tags": ["React", "Frontend"]
        }
    ]
}
```

### Get Journal Detail
**GET** `/api/journal/{id}`

**Request:**
`id = int (Number)`

**Response:**
```json
{
    "message": "Data retrieved successfully",
    "data": {
        "id": 1,
        "slug": "understanding-react-hooks",
        "is_active": true,
        "title_en": "Understanding React Hooks",
        "title_id": "Memahami React Hooks",
        "date": "2026-10-06T00:00:00Z",
        "excerpt_en": "A deep dive into useEffect and useState.",
        "excerpt_id": "Pembahasan mendalam tentang useEffect dan useState.",
        "content_en": "<p>React hooks are...</p>",
        "content_id": "<p>React hooks adalah...</p>",
        "link": "https://medium.com/@rayhanrwa/hooks",
        "authors": "Rayhan Rizky",
        "publisher": "Medium",
        "tags": ["React", "Frontend"]
    }
}
```

---

## 🎵 4. Archive Tracks (Musik / Audio)

### Get All Archive Tracks
**GET** `/api/archive_tracks`

**Response:**
```json
{
    "message": "Data retrieved successfully",
    "data": [
        {
            "id": 1,
            "title": "Midnight City",
            "artist": "M83",
            "photo": "https://api.rayhanrwa.my.id/uploads/m83.jpg",
            "audio": "https://api.rayhanrwa.my.id/uploads/midnight.mp3",
            "type": "Indie Pop",
            "url": "https://open.spotify.com/track/...",
            "text_id": "Lagu favorit saat coding malam hari.",
            "text_en": "Favorite track for late-night coding.",
            "order_index": 1
        }
    ]
}
```

### Get Archive Track Detail
**GET** `/api/archive_tracks/{id}`

**Request:**
`id = int (Number)`

**Response:**
```json
{
    "message": "Data retrieved successfully",
    "data": {
        "id": 1,
        "title": "Midnight City",
        "artist": "M83",
        "photo": "https://api.rayhanrwa.my.id/uploads/m83.jpg",
        "audio": "https://api.rayhanrwa.my.id/uploads/midnight.mp3",
        "type": "Indie Pop",
        "url": "https://open.spotify.com/track/...",
        "text_id": "Lagu favorit saat coding malam hari.",
        "text_en": "Favorite track for late-night coding.",
        "order_index": 1
    }
}
```

---

## 🛠 5. Core Stack (Teknologi)

### Get All Core Stack
**GET** `/api/core_stack`

**Response:**
```json
{
    "message": "Data retrieved successfully",
    "data": [
        {
            "id": "e2a1b945-3123-4b56-8a9d-123456789abc",
            "name": "Flutter",
            "size": "90%"
        },
        {
            "id": "f5c2b945-3123-4b56-8a9d-987654321def",
            "name": "React JS",
            "size": "85%"
        }
    ]
}
```

### Get Core Stack Detail
**GET** `/api/core_stack/{id}`

**Request:**
`id = string (UUID)`

**Response:**
```json
{
    "message": "Data retrieved successfully",
    "data": {
        "id": "e2a1b945-3123-4b56-8a9d-123456789abc",
        "name": "Flutter",
        "size": "90%"
    }
}
```

---

## 📊 6. Stats (Statistik Angka)

### Get All Stats
**GET** `/api/stats`

**Response:**
```json
{
    "message": "Data retrieved successfully",
    "data": [
        {
            "id": "c1d086a7-3f87-47dd-98e0-9d7c5566dc08",
            "label": "EXPERIENCE",
            "value": "4+ Years",
            "desc": "Mobile Developer, Frontend Developer & Tech Lead"
        },
        {
            "id": "d9a875ce-a4c7-4416-991f-784bf3156fd1",
            "label": "PROJECTS",
            "value": "10+",
            "desc": "Delivered across Indonesia & Malaysia"
        }
    ]
}
```

### Get Stat Detail
**GET** `/api/stats/{id}`

**Request:**
`id = string (UUID)`

**Response:**
```json
{
    "message": "Data retrieved successfully",
    "data": {
        "id": "c1d086a7-3f87-47dd-98e0-9d7c5566dc08",
        "label": "EXPERIENCE",
        "value": "4+ Years",
        "desc": "Mobile Developer, Frontend Developer & Tech Lead"
    }
}
```

---

## 💬 7. Archive Quotes

### Get All Quotes
**GET** `/api/archive_quotes`

**Response:**
```json
{
    "message": "Data retrieved successfully",
    "data": [
        {
            "id": 1,
            "quote_id": "Tetaplah merasa bodoh agar terus belajar.",
            "quote_en": "Stay foolish to keep learning.",
            "author": "Steve Jobs",
            "style_type": "italic",
            "order_index": 1
        }
    ]
}
```

### Get Quote Detail
**GET** `/api/archive_quotes/{id}`

**Request:**
`id = int (Number)`

**Response:**
```json
{
    "message": "Data retrieved successfully",
    "data": {
        "id": 1,
        "quote_id": "Tetaplah merasa bodoh agar terus belajar.",
        "quote_en": "Stay foolish to keep learning.",
        "author": "Steve Jobs",
        "style_type": "italic",
        "order_index": 1
    }
}
```

---

## 📜 8. Certifications

### Get All Certifications
**GET** `/api/certifications`

**Response:**
```json
{
    "message": "Data retrieved successfully",
    "data": [
        {
            "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
            "title": "Google Certified Professional Cloud Architect",
            "issuer": "Google Cloud",
            "date": "2024-05-12",
            "score": "Pass"
        }
    ]
}
```

### Get Certification Detail
**GET** `/api/certifications/{id}`

**Request:**
`id = string (UUID)`

**Response:**
```json
{
    "message": "Data retrieved successfully",
    "data": {
        "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "title": "Google Certified Professional Cloud Architect",
        "issuer": "Google Cloud",
        "date": "2024-05-12",
        "score": "Pass"
    }
}
```

---

## 📸 9. Lightroom Edits & Apple Gallery

### Get All Lightroom Edits
**GET** `/api/lightroom_edits`

**Response:**
```json
{
    "message": "Data retrieved successfully",
    "data": [
        {
            "id": 1,
            "title": "Moody Cinematic",
            "photo_before": "https://api.rayhanrwa.my.id/uploads/before1.jpg",
            "photo_after": "https://api.rayhanrwa.my.id/uploads/after1.jpg",
            "preset_link": "https://drive.google.com/...",
            "order_index": 1
        }
    ]
}
```

### Get All Apple Gallery
**GET** `/api/apple_gallery`

**Response:**
```json
{
    "message": "Data retrieved successfully",
    "data": [
        {
            "id": 1,
            "url": "https://api.rayhanrwa.my.id/uploads/gallery1.jpg",
            "type": "image",
            "order_index": 1
        }
    ]
}
```

---

## 🌍 10. Socials & Nav Links

### Get All Socials
**GET** `/api/socials`

**Response:**
```json
{
    "message": "Data retrieved successfully",
    "data": [
        {
            "id": "7f8b9c2a-1e4d-5f6g-7h8i-9j0k1l2m3n4o",
            "name": "LinkedIn",
            "url": "https://linkedin.com/in/rayhanrwa"
        }
    ]
}
```

### Get All Nav Links
**GET** `/api/nav_links`

**Response:**
```json
{
    "message": "Data retrieved successfully",
    "data": [
        {
            "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
            "label": "About Me",
            "path": "/about"
        }
    ]
}
```

---

## 🎨 11. UI Projects & Video Edits

### Get All UI Projects
**GET** `/api/ui_projects`

**Response:**
```json
{
    "message": "Data retrieved successfully",
    "data": [
        {
            "id": 1,
            "title": "Medicare Redesign",
            "images": [
                "https://api.rayhanrwa.my.id/uploads/ui1.png",
                "https://api.rayhanrwa.my.id/uploads/ui2.png"
            ],
            "order_index": 1
        }
    ]
}
```

### Get All Video Edits
**GET** `/api/video_edits`

**Response:**
```json
{
    "message": "Data retrieved successfully",
    "data": [
        {
            "id": 1,
            "title_en": "Cinematic B-Roll",
            "title_id": "B-Roll Sinematik",
            "video_url": "https://youtube.com/watch?v=...",
            "thumbnail_url": "https://api.rayhanrwa.my.id/uploads/thumb.jpg",
            "duration": "02:30",
            "order_index": 1,
            "created_at": "2026-10-06T10:00:00Z"
        }
    ]
}
```
