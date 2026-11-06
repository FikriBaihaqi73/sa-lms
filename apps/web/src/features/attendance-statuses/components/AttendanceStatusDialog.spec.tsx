// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AttendanceStatusDialog } from './AttendanceStatusDialog';

describe('AttendanceStatusDialog', () => {
  afterEach(() => cleanup());

  it('shows server duplicate errors and clears them when the field changes', () => {
    const onFieldChange = vi.fn();
    render(
      <AttendanceStatusDialog
        open
        isSaving={false}
        serverError={{ field: 'name', message: 'Nama status sudah dipakai di institusi ini' }}
        onFieldChange={onFieldChange}
        onClose={vi.fn()}
        onSave={vi.fn(async () => undefined)}
      />,
    );

    expect(screen.getByText('Nama status sudah dipakai di institusi ini')).not.toBeNull();
    fireEvent.change(screen.getByLabelText(/Nama/), { target: { value: 'Hadir Baru' } });
    expect(onFieldChange).toHaveBeenCalledTimes(1);
  });

  it('submits create and edit forms through the same callback', async () => {
    const onSave = vi.fn(async () => undefined);
    render(
      <AttendanceStatusDialog
        open
        attendanceStatus={{ id: 'status-1', institution_id: 'inst-1', name: 'Hadir', description: null }}
        isSaving={false}
        onClose={vi.fn()}
        onSave={onSave}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Nama/), { target: { value: 'Hadir Baru' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan Perubahan' }));
    await waitFor(() => expect(onSave).toHaveBeenCalled());
  });
});
