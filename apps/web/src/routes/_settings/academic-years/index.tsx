import { createRoute } from '@tanstack/react-router';
import { AcademicYearsPage } from '@/features/academic-years/components/AcademicYearsPage';
import { settingsRoute } from '../../settingsLayout';

export const academicYearsRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/academic-years',
  component: AcademicYearsPage,
});
