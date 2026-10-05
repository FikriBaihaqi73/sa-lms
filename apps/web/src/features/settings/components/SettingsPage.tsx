import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateSettingSchema } from "../schemas";
import type { CreateSettingInput } from "../types";
import { useSettings, useCreateSetting } from "../hooks/useSettings";

const defaultValues: Partial<CreateSettingInput> = {
  settingKey: "",
  settingValue: "",
  description: "",
};

export function SettingsPage() {
  const [page] = useState(1);
  const { data: settingsData, isLoading } = useSettings({ page, limit: 10 });
  const createMutation = useCreateSetting();

  const { register, handleSubmit, reset } = useForm<CreateSettingInput>({
    defaultValues,
    resolver: zodResolver(CreateSettingSchema),
  });

  const onSubmit = (data: CreateSettingInput) => {
    createMutation.mutate(data, {
      onSuccess: () => reset(),
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings Data Management</h1>
        <p className="text-sm text-slate-500">Manage application settings and configuration.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Add New Setting</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Setting Key</label>
            <input
              {...register("settingKey")}
              className="w-full h-10 px-3 rounded-lg border focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. MAX_USERS"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Setting Value</label>
            <input
              {...register("settingValue")}
              className="w-full h-10 px-3 rounded-lg border focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 1000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              {...register("description")}
              className="w-full h-10 px-3 rounded-lg border focus:ring-2 focus:ring-blue-500"
              placeholder="Description..."
            />
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {createMutation.isPending ? "Saving..." : "Save Setting"}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Existing Settings</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-3">
            {settingsData?.data.map((setting) => (
              <div key={setting.id} className="p-4 border rounded-lg">
                <p className="font-bold">{setting.settingKey}</p>
                <p className="text-sm text-slate-600">Value: {setting.settingValue}</p>
                <p className="text-sm text-slate-500">{setting.description}</p>
              </div>
            ))}
            {settingsData?.data.length === 0 && (
              <p className="text-sm text-slate-500">No settings found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
