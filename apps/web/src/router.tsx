import { createRouter } from "@tanstack/react-router";
import { rootRoute } from "./routes/__root";
import { academicStatusesRoute } from "./routes/_settings/academic-statuses/index";
import { academicYearsRoute } from "./routes/_settings/academic-years/index";
import { activityLogsRoute } from "./routes/_settings/activity-logs";
import { assignmentTypesRoute } from "./routes/_settings/assignment-types/index";
import { attendanceStatusesRoute } from "./routes/_settings/attendance-statuses/index";
import { classStudentsRoute } from "./routes/_settings/class-students/index";
import { classSubjectsRoute } from "./routes/_settings/class-subjects/index";
import { classesRoute } from "./routes/_settings/classes/index";
import { departmentsRoute } from "./routes/_settings/departments/index";
import { employmentStatusesRoute } from "./routes/_settings/employment-statuses/index";
import { gradesRoute } from "./routes/_settings/grades/index";
import { institutionLevelsRoute } from "./routes/_settings/jenjang-institusi/index";
import { nationalitiesRoute } from "./routes/_settings/nationalities/index";
import { permissionsRoute } from "./routes/_settings/permissions/index";
import { profileRoute } from "./routes/_settings/profile/index";
import { religionsRoute } from "./routes/_settings/religions/index";
import { rolePermissionsRoute } from "./routes/_settings/role-permissions/index";
import { rolesRoute } from "./routes/_settings/roles/index";
import { semestersRoute } from "./routes/_settings/semesters/index";
import { settingsRouteDef } from "./routes/_settings/settings/index";
import { teachersRoute } from "./routes/_settings/teachers/index";
import { usersRoute } from "./routes/_settings/users/index";
import { indexRoute } from "./routes/_user/index";
import { guardiansRoute } from "./routes/guardians/index";
import { institutionsRoute } from "./routes/institutions/index";
import { loginRoute } from "./routes/login/index";
import { referralCodesRoute } from "./routes/referral-codes/index";
import { registerRoute } from "./routes/register/index";
import { settingsRoute } from "./routes/settingsLayout";
import {
	specializationStatusesRoute,
	specializationsRoute,
} from "./routes/specialization-statuses/index";
import { studentGuardiansRoute } from "./routes/student-guardians/index";
import { studentsRoute } from "./routes/students/index";
import { userRoute } from "./routes/userLayout";

const settingsTree = settingsRoute.addChildren([
	rolesRoute,
	permissionsRoute,
	activityLogsRoute,
	gradesRoute,
	rolePermissionsRoute,
	institutionLevelsRoute,
	usersRoute,
	nationalitiesRoute,
	academicStatusesRoute,
	employmentStatusesRoute,
	religionsRoute,
	settingsRouteDef,
	specializationStatusesRoute,
	specializationsRoute,
	attendanceStatusesRoute,
	assignmentTypesRoute,
	profileRoute,
	teachersRoute,
	departmentsRoute,
	academicYearsRoute,
	classesRoute,
	classStudentsRoute,
	classSubjectsRoute,
	semestersRoute,
]);

const userTree = userRoute.addChildren([indexRoute]);

const routeTree = rootRoute.addChildren([
	settingsTree,
	userTree,
	institutionsRoute,
	studentsRoute,
	referralCodesRoute,
	studentGuardiansRoute,
	guardiansRoute,
	loginRoute,
	registerRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
