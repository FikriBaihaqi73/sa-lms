import { calcFinalScore, gradePredicate, gradeStatus } from "./index";

interface GradeSpecCase {
  name: string;
  run: () => void;
}

function check(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

export const gradeSpecCases: GradeSpecCase[] = [
  {
    name: "menghitung nilai akhir dengan bobot 30/30/40",
    run: () => {
      const result = calcFinalScore({ tugas: 88, uts: 88, uas: 92 });
      check(result !== null && Math.abs(result - 89.6) < 0.05, `Nilai akhir ${String(result)} tidak sesuai 89.6`);
    },
  },
  {
    name: "mengembalikan null jika salah satu komponen kosong",
    run: () => {
      check(calcFinalScore({ tugas: 80, uts: 80, uas: null }) === null, "UAS null seharusnya menghasilkan null");
      check(calcFinalScore({ tugas: null, uts: 80, uas: 80 }) === null, "Tugas null seharusnya menghasilkan null");
      check(calcFinalScore({ tugas: 80, uts: null, uas: 80 }) === null, "UTS null seharusnya menghasilkan null");
    },
  },
  {
    name: "menangani nilai batas 0 dan 100",
    run: () => {
      check(calcFinalScore({ tugas: 0, uts: 0, uas: 0 }) === 0, "Batas bawah seharusnya 0");
      check(calcFinalScore({ tugas: 100, uts: 100, uas: 100 }) === 100, "Batas atas seharusnya 100");
    },
  },
  {
    name: "mengembalikan predikat sesuai rentang",
    run: () => {
      check(gradePredicate(95) === "Predikat A", "95 seharusnya Predikat A");
      check(gradePredicate(85) === "Predikat B", "85 seharusnya Predikat B");
      check(gradePredicate(75) === "Predikat C", "75 seharusnya Predikat C");
      check(gradePredicate(60).includes("Predikat D"), "60 seharusnya Predikat D");
    },
  },
  {
    name: "menangani nilai null pada predikat",
    run: () => {
      check(gradePredicate(null) === "Menunggu UAS", "Null seharusnya Menunggu UAS");
    },
  },
  {
    name: "lulus jika >= KKM 70",
    run: () => {
      check(gradeStatus(70) === "Lulus", "70 seharusnya Lulus");
      check(gradeStatus(89.6) === "Lulus", "89.6 seharusnya Lulus");
    },
  },
  {
    name: "remedial jika < KKM",
    run: () => {
      check(gradeStatus(57.4) === "Remedial", "57.4 seharusnya Remedial");
    },
  },
  {
    name: "belum lengkap jika null",
    run: () => {
      check(gradeStatus(null) === "Belum lengkap", "Null seharusnya Belum lengkap");
    },
  },
];

export function runGradeSpecCases(): string[] {
  return gradeSpecCases.map((item) => {
    item.run();
    return item.name;
  });
}

