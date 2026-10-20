import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatScoreRange, getGradeColorBadge } from "../types";
import type { StandardGrade } from "../types";

interface GradesScaleVisualProps {
  grades: StandardGrade[];
}

export function GradesScaleVisual({ grades }: GradesScaleVisualProps) {
  if (grades.length === 0) return null;

  // Urutkan dari nilai tertinggi ke terendah
  const sorted = [...grades].sort((a, b) => {
    const minA = a.minimumScore ?? 0;
    const minB = b.minimumScore ?? 0;
    return minB - minA;
  });

  return (
    <Card className="border-slate-200/80 bg-white/90 backdrop-blur-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
      <CardHeader className="pb-3 pt-4 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="size-4 text-blue-600 dark:text-blue-400" />
            Visualisasi Rentang Skala Penilaian
          </CardTitle>
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
            Diurutkan dari batas tertinggi ke terendah
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 sm:px-6 sm:pb-5">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {sorted.map((item) => {
            const theme = getGradeColorBadge(item.grade);
            const rangeText = formatScoreRange(item.minimumScore, item.maximumScore);

            return (
              <div
                key={item.id}
                className={`relative flex flex-col justify-between rounded-xl border p-3 transition-all hover:scale-[1.02] ${theme.bg} ${theme.border} ${theme.glow}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-base font-extrabold tracking-tight ${theme.text}`}>
                    {item.grade}
                  </span>
                  <span className={`size-2.5 rounded-full ${theme.dot}`} />
                </div>
                <div className="mt-2">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {rangeText}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1" title={item.description ?? "Tanpa keterangan"}>
                    {item.description || "Tanpa keterangan"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
