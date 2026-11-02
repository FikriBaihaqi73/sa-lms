import { apiFetch } from "@/lib/api";
import type {
  CreateScheduleInput,
  GetSchedulesParams,
  Schedule,
  ScheduleClassroomOption,
  ScheduleClassSubjectOption,
  ScheduleListResponse,
  ScheduleOptions,
  SchedulePageMeta,
  UpdateScheduleInput,
} from "../types";

interface ApiResponse<T> {
  data: T;
  meta?: SchedulePageMeta;
}

export const getSchedulesApi = async (
  params?: GetSchedulesParams,
): Promise<ScheduleListResponse> => {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search?.trim()) query.set("search", params.search.trim());
  if (params?.day && params.day !== "all") query.set("day", params.day);
  if (params?.classroomId) query.set("classroomId", params.classroomId);
  if (params?.classSubjectId) query.set("classSubjectId", params.classSubjectId);

  const response = (await apiFetch(`/schedules?${query.toString()}`)) as {
    data?: Schedule[] | { data?: Schedule[]; meta?: SchedulePageMeta } | null;
    meta?: SchedulePageMeta;
  };

  if (Array.isArray(response?.data)) {
    const meta = (response.meta as SchedulePageMeta) ?? {
      currentPage: params?.page ?? 1,
      perPage: params?.limit ?? 10,
      totalData: response.data.length,
      totalPages: Math.ceil(response.data.length / (params?.limit ?? 10)) || 1,
    };
    return {
      data: response.data,
      meta,
    };
  }

  if (response?.data && Array.isArray(response.data.data)) {
    const meta = (response.data.meta as SchedulePageMeta) ?? {
      currentPage: params?.page ?? 1,
      perPage: params?.limit ?? 10,
      totalData: response.data.data.length,
      totalPages: Math.ceil(response.data.data.length / (params?.limit ?? 10)) || 1,
    };
    return {
      data: response.data.data,
      meta,
    };
  }

  return {
    data: [],
    meta: {
      currentPage: params?.page ?? 1,
      perPage: params?.limit ?? 10,
      totalData: 0,
      totalPages: 0,
    },
  };
};

export const getScheduleByIdApi = async (id: string): Promise<Schedule> => {
  const response: ApiResponse<Schedule> = await apiFetch(`/schedules/${id}`);
  return response.data;
};

export const createScheduleApi = async (
  input: CreateScheduleInput,
): Promise<Schedule> => {
  const payload = {
    classSubjectId: input.classSubjectId,
    classroomId: input.classroomId,
    day: input.day,
    ...(input.startTime ? { startTime: input.startTime } : {}),
    ...(input.endTime ? { endTime: input.endTime } : {}),
  };

  const response: ApiResponse<Schedule> = await apiFetch("/schedules", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data;
};

export const updateScheduleApi = async (
  id: string,
  input: UpdateScheduleInput,
): Promise<Schedule> => {
  const payload = {
    ...(input.classSubjectId ? { classSubjectId: input.classSubjectId } : {}),
    ...(input.classroomId ? { classroomId: input.classroomId } : {}),
    ...(input.day ? { day: input.day } : {}),
    startTime: input.startTime || null,
    endTime: input.endTime || null,
  };

  const response: ApiResponse<Schedule> = await apiFetch(`/schedules/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return response.data;
};

export const deleteScheduleApi = async (
  id: string,
): Promise<{ success: boolean; id: string }> => {
  const response: ApiResponse<{ success: boolean; id: string }> =
    await apiFetch(`/schedules/${id}`, {
      method: "DELETE",
    });
  return response.data;
};

interface RawClassSubjectItem {
  id: string;
  class?: { name?: string } | null;
  subject?: { name?: string; code?: string | null } | null;
  teacher?: {
    teacher_number?: string | null;
    profile?: { fullName?: string } | null;
  } | null;
  academic_year?: { academic_year?: string } | null;
}

interface RawClassroomItem {
  id: string;
  roomCode: string;
  roomName: string;
  building?: string | null;
  capacity?: number | null;
}

export const getScheduleOptionsApi = async (): Promise<ScheduleOptions> => {
  const [classSubjectsRes, classroomsRes] = await Promise.all([
    apiFetch("/class-subjects?page=1&limit=100").catch(() => ({ data: [] })),
    apiFetch("/classrooms?page=1&limit=100").catch(() => ({ data: [] })),
  ]);

  const rawClassSubjects: RawClassSubjectItem[] = Array.isArray(
    classSubjectsRes?.data,
  )
    ? classSubjectsRes.data
    : Array.isArray(classSubjectsRes?.data?.data)
      ? classSubjectsRes.data.data
      : [];

  const classSubjects: ScheduleClassSubjectOption[] = rawClassSubjects.map(
    (item) => {
      const className = item.class?.name || "Tanpa Kelas";
      const subjectName = item.subject?.name || "Mata Pelajaran";
      const subjectCode = item.subject?.code || undefined;
      const teacherName =
        item.teacher?.profile?.fullName ||
        item.teacher?.teacher_number ||
        "Belum ditentukan";
      const academicYear =
        item.academic_year?.academic_year || "Tahun Ajaran Aktif";

      const label = `[${className}] ${subjectName} — ${teacherName} (${academicYear})`;

      return {
        id: item.id,
        label,
        className,
        subjectName,
        subjectCode,
        teacherName,
        academicYear,
      };
    },
  );

  const rawClassrooms: RawClassroomItem[] = Array.isArray(classroomsRes?.data)
    ? classroomsRes.data
    : Array.isArray(classroomsRes?.data?.data)
      ? classroomsRes.data.data
      : [];

  const classrooms: ScheduleClassroomOption[] = rawClassrooms.map((room) => ({
    id: room.id,
    roomCode: room.roomCode,
    roomName: room.roomName,
    building: room.building,
    capacity: room.capacity,
  }));

  return {
    classSubjects,
    classrooms,
  };
};
