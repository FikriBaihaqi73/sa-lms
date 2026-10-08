
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCreateAcademicYear, useUpdateAcademicYear } from "../hooks/useAcademicYears";
import { academicYearSchema, type AcademicYearFormValues } from "../schemas/academicYearSchema";
import type { AcademicYear } from "../types";

interface AcademicYearDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	academicYear?: AcademicYear | null;
}

export function AcademicYearDialog({
	open,
	onOpenChange,
	academicYear,
}: AcademicYearDialogProps) {
	const isEditing = !!academicYear;

	const form = useForm<AcademicYearFormValues>({
		resolver: zodResolver(academicYearSchema),
		defaultValues: {
			academic_year: "",
			is_active: false,
		},
	});

	const { mutate: createAcademicYear, isPending: isCreating } = useCreateAcademicYear();
	const { mutate: updateAcademicYear, isPending: isUpdating } = useUpdateAcademicYear();

	useEffect(() => {
		if (open && academicYear) {
			form.reset({
				academic_year: academicYear.academic_year,
				is_active: academicYear.is_active,
			});
		} else if (open && !academicYear) {
			form.reset({
				academic_year: "",
				is_active: false,
			});
		}
	}, [open, academicYear, form]);

	const applyFieldErrors = (error: Error) => {
		if (!(error instanceof ApiError)) return;
		for (const { field, message } of error.fieldErrors) {
			if (field === "academic_year" || field === "is_active") {
				form.setError(field, { type: "server", message });
			}
		}
	};

	const onSubmit = (data: AcademicYearFormValues) => {
		if (isEditing) {
			updateAcademicYear(
				{ id: academicYear.id, data },
				{
					onSuccess: () => {
						onOpenChange(false);
					},
					onError: applyFieldErrors,
				},
			);
		} else {
			createAcademicYear(data, {
				onSuccess: () => {
					onOpenChange(false);
				},
				onError: applyFieldErrors,
			});
		}
	};

	const isPending = isCreating || isUpdating;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Edit Academic Year" : "Add Academic Year"}
					</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="academic_year"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Academic Year (e.g. 2023/2024)</FormLabel>
									<FormControl>
										<Input placeholder="Enter academic year" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						
						<FormField
							control={form.control}
							name="is_active"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
									<div className="space-y-0.5">
										<FormLabel className="text-base">Active Status</FormLabel>
									</div>
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						
						<DialogFooter className="pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending ? "Saving..." : "Save"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
