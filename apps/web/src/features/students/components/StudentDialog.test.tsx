import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { StudentDialog } from './StudentDialog';
import { useStudentProfilesForInstitution } from '../hooks/useStudentProfilesForInstitution';
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';

vi.mock('../hooks/useStudentProfilesForInstitution');

const mockProfiles = {
  data: {
    pages: [{ data: [
      { id: 'prof-1', fullName: 'Alice', email: 'alice@example.com', institutionId: 'inst-1' },
      { id: 'prof-2', fullName: '', email: 'bob@example.com', institutionId: 'inst-1' },
    ] }],
  },
  isLoading: false,
  isError: false,
  error: null,
};

describe('StudentDialog profile selection', () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.mocked(useStudentProfilesForInstitution).mockReturnValue(mockProfiles as unknown as ReturnType<typeof useStudentProfilesForInstitution>);
  });

  it('renders profile dropdown with options', async () => {
    render(
      <StudentDialog
        open={true}
        onClose={() => {}}
        onSave={async () => {}}
        isSaving={false}
        departments={[]}
        academicStatuses={[]}
      />
    );

    // Wait for the select to be in the document
    const select = await screen.findByRole('combobox', { name: /Profil Siswa/i });
    expect(select).toBeTruthy();
    expect(screen.getAllByRole('combobox', { name: /Profil Siswa/i })).toHaveLength(1);
    // Options should be rendered
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /Alice \(alice@example.com\)/i })).toBeTruthy();
      expect(screen.getByRole('option', { name: /bob@example.com/i })).toBeTruthy();
    });
  });

  it('clears the selected profile when search changes', () => {
    render(<StudentDialog open onClose={() => {}} onSave={async () => {}} isSaving={false} departments={[]} academicStatuses={[]} />);
    const select = screen.getByRole('combobox', { name: /Profil Siswa/i }) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'prof-1' } });
    expect(select.value).toBe('prof-1');
    fireEvent.change(screen.getByLabelText('Cari profil siswa'), { target: { value: 'Bob' } });
    expect(select.value).toBe('');
  });

  it('submits the selected profile and student fields on create', async () => {
    const profileId = '11111111-1111-4111-8111-111111111111';
    const statusId = '22222222-2222-4222-8222-222222222222';
    vi.mocked(useStudentProfilesForInstitution).mockReturnValue({ ...mockProfiles, data: { pages: [{ data: [{ id: profileId, fullName: 'Alice', email: null }] }] } } as unknown as ReturnType<typeof useStudentProfilesForInstitution>);
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<StudentDialog open onClose={() => {}} onSave={onSave} isSaving={false} departments={[]} academicStatuses={[{ id: statusId, name: 'Aktif' }]} />);
    fireEvent.change(screen.getByRole('combobox', { name: /Profil Siswa/i }), { target: { value: profileId } });
    fireEvent.change(screen.getByLabelText(/Nomor Siswa/i), { target: { value: '20260001' } });
    fireEvent.change(screen.getByLabelText(/Status Akademik/i), { target: { value: statusId } });
    fireEvent.change(screen.getByLabelText(/Tahun Masuk/i), { target: { value: '2026' } });
    fireEvent.click(screen.getByRole('button', { name: /Tambah Siswa/i }));
    await waitFor(() => expect(onSave.mock.calls[0]?.[0]).toEqual(expect.objectContaining({ profileId, academicStatusId: statusId, studentNumber: '20260001', enrollmentYear: 2026 })));
  });

  it('retains the linked profile in edit form values', async () => {
    const profileId = '11111111-1111-4111-8111-111111111111';
    const statusId = '22222222-2222-4222-8222-222222222222';
    const onSave = vi.fn().mockResolvedValue(undefined);
    const student = { id: 'student-1', profileId, profile: { id: profileId, fullName: 'Alice' }, academicStatusId: statusId, studentNumber: '123', createdAt: '', updatedAt: '' };
    render(<StudentDialog open student={student} onClose={() => {}} onSave={onSave} isSaving={false} departments={[]} academicStatuses={[{ id: statusId, name: 'Aktif' }]} />);
    expect(screen.getByText('Alice')).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/Nomor Siswa/i), { target: { value: '456' } });
    fireEvent.click(screen.getByRole('button', { name: /Simpan Perubahan/i }));
    await waitFor(() => expect(onSave.mock.calls[0]?.[0]).toEqual(expect.objectContaining({ profileId, academicStatusId: statusId, studentNumber: '456' })));
  });

  it.each([
    ['loading', { ...mockProfiles, isLoading: true }, /Memuat profil/i],
    ['error', { ...mockProfiles, isError: true }, /Gagal memuat profil/i],
    ['empty', { ...mockProfiles, data: { pages: [{ data: [] }] } }, /Tidak ada profil tersedia/i],
  ])('shows %s state', (_name, state, message) => {
    vi.mocked(useStudentProfilesForInstitution).mockReturnValue(state as unknown as ReturnType<typeof useStudentProfilesForInstitution>);
    render(<StudentDialog open onClose={() => {}} onSave={async () => {}} isSaving={false} departments={[]} academicStatuses={[]} />);
    expect(screen.getByText(message)).toBeTruthy();
  });

  it('requires profile selection on submit', async () => {
    const onSave = vi.fn();
    render(
      <StudentDialog
        open={true}
        onClose={() => {}}
        onSave={onSave}
        isSaving={false}
        departments={[]}
        academicStatuses={[]}
      />
    );
    const submitBtn = screen.getByRole('button', { name: /Tambah Siswa/i });
    fireEvent.click(submitBtn);
    // Validation error should appear
    const errorMsg = await screen.findByText(/Profil Mahasiswa wajib dipilih/i);
    expect(errorMsg).toBeTruthy();
    expect(onSave).not.toHaveBeenCalled();
  });
});

