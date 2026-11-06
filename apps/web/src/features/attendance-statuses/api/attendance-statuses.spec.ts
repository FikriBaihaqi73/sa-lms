import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch } from '@/lib/api';
import { createAttendanceStatus, getAttendanceStatuses } from './attendance-statuses';

vi.mock('@/lib/api', () => ({ apiFetch: vi.fn() }));

describe('attendance statuses API client', () => {
  beforeEach(() => vi.resetAllMocks());

  it('requests scoped statuses with pagination and search without institution_id', async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      data: [{ id: 'status-1', name: 'Hadir', description: null }],
      meta: { currentPage: 1, perPage: 10, totalData: 1, totalPages: 1 },
    });

    await getAttendanceStatuses({ page: 1, limit: 10, search: 'Hadir' });

    expect(apiFetch).toHaveBeenCalledWith('/attendance-statuses?page=1&limit=10&search=Hadir');
    expect(JSON.stringify(vi.mocked(apiFetch).mock.calls[0])).not.toContain('institution_id');
  });

  it('sends only the status fields when creating', async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      data: { id: 'status-1', name: 'Hadir', description: 'Present' },
    });

    await createAttendanceStatus({ name: 'Hadir', description: 'Present' });

    expect(apiFetch).toHaveBeenCalledWith('/attendance-statuses', {
      method: 'POST',
      body: JSON.stringify({ name: 'Hadir', description: 'Present' }),
    });
  });
});
