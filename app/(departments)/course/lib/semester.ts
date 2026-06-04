const ROMAN_NUMERALS = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
  "XVI",
];

export function getSemesterLabel(semesterNumber: number) {
  const roman =
    semesterNumber >= 1 && semesterNumber <= ROMAN_NUMERALS.length
      ? ROMAN_NUMERALS[semesterNumber - 1]
      : String(semesterNumber);
  return `Semester ${roman}`;
}

export function buildSemesterLabels(durationYears: number) {
  if (!Number.isFinite(durationYears) || durationYears <= 0) {
    return [];
  }
  const totalSemesters = durationYears * 2;
  return Array.from({ length: totalSemesters }, (_, index) =>
    getSemesterLabel(index + 1),
  );
}
