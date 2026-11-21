# 0158 — Student Grades API & Eager Loading Implementation Guide

This document provides a detailed integration guide for Frontend Developers working with the `student_grades` (Nilai Siswa) API endpoints, featuring eager-loaded relations (`student`, `classSubject`, `academicYear`, `grade`), pagination, search, and JWT authentication.

Implementation note: the current student-grade API is restricted to institution admins and is scoped to the caller's institution. See `docs/student-grades-page-implementation.md`; teacher, student, and guardian access remains deferred pending ownership rules.

---

## 1. Authentication & API Reference

All requests to `/student-grades` require JWT authentication header:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Interactive Scalar documentation is available at `http://localhost:5000/api` under tag **Student Grades**.

---

## 2. Endpoints Summary (`/student-grades`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/student-grades` | List paginated student grades with eager loading & multi-field search |
| `GET` | `/student-grades/:id` | Get single student grade record detail by ID |
| `GET` | `/student-grades/student/:studentId` | Get student grades for a specific student ID |
| `GET` | `/student-grades/class-subject/:classSubjectId` | Get student grades for a specific class subject ID |
| `GET` | `/student-grades/academic-year/:academicYearId` | Get student grades for a specific academic year ID |
| `POST` | `/student-grades` | Create a new student grade record |
| `PATCH` | `/student-grades/:id` | Update an existing student grade record |
| `DELETE` | `/student-grades/:id` | Soft-delete a student grade record |

---

## 3. Query Parameters: Pagination & Search

The main list endpoint (`GET /student-grades`) supports pagination and multi-field search:

- `page` (number, default `1`): Page number.
- `limit` (number, default `10`): Items per page.
- `search` (string, optional): Multi-field search keyword matching:
  - `student.studentNumber` (e.g. "STD-2026-001")
  - `student.profile.fullName` (e.g. "Ahmad Student")
  - `classSubject.subject.name`, `classSubject.subject.code` (e.g. "Mathematics", "MATH101")
  - `classSubject.class.name` (e.g. "X IPA 1")
  - `academicYear.academic_year` (e.g. "2024/2025")
  - `grade.grade` (e.g. "A", "B+")
  - `remarks` (e.g. "Good performance")

### Example Query
`GET /student-grades?page=1&limit=10&search=STD-2026-001`

---

## 4. Request & Response Examples

### A. List Student Grades (`GET /student-grades`)

**Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Student grades retrieved successfully",
  "data": [
    {
      "id": "e9b1c7d2-3f4a-5b6c-7d8e-9f0a1b2c3d4e",
      "studentId": "11111111-1111-1111-1111-111111111111",
      "classSubjectId": "22222222-2222-2222-2222-222222222222",
      "academicYearId": "33333333-3333-3333-3333-333333333333",
      "assignmentScore": 85.00,
      "quizScore": 90.00,
      "midExamScore": 80.00,
      "finalExamScore": 88.00,
      "finalScore": 85.50,
      "gradeId": "44444444-4444-4444-4444-444444444444",
      "remarks": "Excellent academic performance",
      "createdAt": "2026-09-19T04:00:00.000Z",
      "updatedAt": "2026-09-19T04:00:00.000Z",
      "deletedAt": null,
      "student": {
        "id": "11111111-1111-1111-1111-111111111111",
        "studentNumber": "STD-2026-001",
        "enrollmentYear": 2026,
        "profile": {
          "fullName": "Ahmad Student"
        }
      },
      "classSubject": {
        "id": "22222222-2222-2222-2222-222222222222",
        "class": {
          "name": "X IPA 1"
        },
        "subject": {
          "code": "MATH101",
          "name": "Mathematics"
        }
      },
      "academicYear": {
        "id": "33333333-3333-3333-3333-333333333333",
        "academic_year": "2024/2025"
      },
      "grade": {
        "id": "44444444-4444-4444-4444-444444444444",
        "grade": "A",
        "minimumScore": 85,
        "maximumScore": 100
      }
    }
  ],
  "code": 200,
  "meta": {
    "totalData": 1,
    "totalPages": 1,
    "currentPage": 1,
    "perPage": 10
  }
}
```

### B. Create Student Grade (`POST /student-grades`)

**Request Body**:
```json
{
  "studentId": "11111111-1111-1111-1111-111111111111",
  "classSubjectId": "22222222-2222-2222-2222-222222222222",
  "academicYearId": "33333333-3333-3333-3333-333333333333",
  "assignmentScore": 85,
  "quizScore": 90,
  "midExamScore": 80,
  "finalExamScore": 88,
  "finalScore": 85.5,
  "gradeId": "44444444-4444-4444-4444-444444444444",
  "remarks": "Excellent academic performance"
}
```

**Response (201 Created)**:
```json
{
  "status": "success",
  "message": "Student grade created successfully",
  "data": { ... },
  "code": 201
}
```

---

## 5. Frontend Integration & Error Edge Cases

1. **Validation & Referentials**:
   - `studentId`, `classSubjectId`, and `academicYearId` must be valid active UUIDs. If any non-existent ID is sent, HTTP `404` is returned (`Student not found`, `Class subject not found`, `Academic year not found`, `Grade letter not found`).
   - If a student grade record already exists for the combination `[studentId, classSubjectId, academicYearId]`, HTTP `409` Conflict is returned.

2. **Scores Validation**:
   - `assignmentScore`, `quizScore`, `midExamScore`, `finalExamScore`, and `finalScore` must be numbers between `0` and `100`.
