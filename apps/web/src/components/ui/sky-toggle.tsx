import { useId } from "react";
import { useTheme } from "@/components/theme-provider";

export function SkyToggle() {
  const { theme, toggleTheme } = useTheme();
  const inputId = useId();
  const isDark = theme === "dark";

  return (
    <div className="sky-toggle">
      <input id={inputId} className="sky-toggle__checkbox" type="checkbox" checked={isDark} onChange={toggleTheme} />
      <label className="sky-toggle__container" htmlFor={inputId} title={isDark ? "Ganti ke tema terang" : "Ganti ke tema gelap"}>
        <span className="sky-toggle__clouds" />
        <span className="sky-toggle__stars" aria-hidden="true">✦ · ✧ · ✦</span>
        <span className="sky-toggle__circle"><span className="sky-toggle__sun-moon"><span className="sky-toggle__moon"><span /><span /><span /></span></span></span>
        <span className="sr-only">{isDark ? "Ganti ke tema terang" : "Ganti ke tema gelap"}</span>
      </label>
    </div>
  );
}
