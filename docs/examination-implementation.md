# Examination Module Implementation

## Overview
This document outlines the API endpoints for managing `Examinations`.

## Endpoints

### 1. Create Examination
- **Method:** `POST`
- **URL:** `/api/examinations`
- **Body:**
```json
{
  "classSubjectId": "uuid",
  "assignmentTypeId": "uuid",
  "title": "Midterm Exam",
  "description": "Covers chapters 1-3",
  "examinationDate": "2026-10-15T09:00:00Z",
  "duration": 120,
  "maximumScore": 100
}
```
- **Response:**
```json
{
  "status": "success",
  "code": 201,
  "message": "Examination created successfully",
  "data": {
    "id": "uuid",
    "title": "Midterm Exam",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### 2. Get All Examinations (Paginated with Search)
- **Method:** `GET`
- **URL:** `/api/examinations?page=1&limit=10&search=Midterm`
- **Response:**
```json
{
  "status": "success",
  "code": 200,
  "message": "Examinations retrieved successfully",
  "data": {
    "data": [
      {
        "id": "uuid",
        "title": "Midterm Exam",
        "classSubject": { ... },
        "assignmentType": { ... },
        "creator": { ... },
        "updater": { ... }
      }
    ],
    "meta": {
      "totalData": 1,
      "totalPages": 1,
      "currentPage": 1,
      "perPage": 10
    }
  }
}
```

### 3. Get Specific Examination
- **Method:** `GET`
- **URL:** `/api/examinations/:id`

### 4. Update Examination
- **Method:** `PUT`
- **URL:** `/api/examinations/:id`
- **Body:** Same structure as Create (fields are optional).

### 5. Soft Delete Examination
- **Method:** `DELETE`
- **URL:** `/api/examinations/:id`

## Frontend Implementation Flow
1. **List View:** Use `GET /api/examinations` and provide pagination controls and a search input. The backend searches against `title` and `description`.
2. **Details View:** Eagerly loaded relations (`classSubject`, `assignmentType`, `creator`, `updater`) allow displaying full context directly from the single list response or detail response without extra calls.

Untuk implementasi halaman Admin Institusi terbaru, lihat [0239-examinations-page-implementation.md](0239-examinations-page-implementation.md).
