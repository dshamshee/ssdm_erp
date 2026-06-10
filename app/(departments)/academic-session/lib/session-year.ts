const MIN_ACADEMIC_SESSION_YEAR = 2000;
const MAX_ACADEMIC_SESSION_YEAR = 2100;
const START_YEAR_BACK_OFFSET = 2;
const START_YEAR_FORWARD_OFFSET = 10;
const END_YEAR_FORWARD_OFFSET = 12;

export const DEFAULT_ACADEMIC_SESSION_DURATION_YEARS = 4;

function getYearRange(startYear: number, endYear: number) {
  return Array.from(
    { length: endYear - startYear + 1 },
    (_, index) => startYear + index,
  );
}

export function getStartYearOptions(selectedYear?: number) {
  const currentYear = new Date().getFullYear();
  const minYear = Math.max(
    MIN_ACADEMIC_SESSION_YEAR,
    currentYear - START_YEAR_BACK_OFFSET,
  );
  const maxYear =
    Math.max(
      currentYear,
      selectedYear !== undefined ? selectedYear : currentYear,
    ) + START_YEAR_FORWARD_OFFSET;

  return getYearRange(minYear, Math.min(maxYear, MAX_ACADEMIC_SESSION_YEAR));
}

export function getEndYearOptions(startYear: number, selectedYear?: number) {
  const currentYear = new Date().getFullYear();
  const minEndYear = startYear + 1;
  const maxEndYear = Math.min(
    MAX_ACADEMIC_SESSION_YEAR,
    currentYear + END_YEAR_FORWARD_OFFSET,
  );

  let endYear = maxEndYear;
  if (selectedYear !== undefined && selectedYear > endYear) {
    endYear = selectedYear;
  }

  return getYearRange(minEndYear, endYear);
}

export function getAcademicSessionDetails(startYear: number, endYear: number) {
  return {
    name: `${startYear}-${endYear}`,
    startDate: `${startYear}-07-01`,
    endDate: `${endYear}-06-30`,
  };
}

export function getStartYearFromDate(startDate: string) {
  return Number(startDate.slice(0, 4));
}

export function getEndYearFromDate(endDate: string) {
  return Number(endDate.slice(0, 4));
}

export function getDefaultEndYear(startYear: number) {
  return Math.min(
    startYear + DEFAULT_ACADEMIC_SESSION_DURATION_YEARS,
    MAX_ACADEMIC_SESSION_YEAR,
  );
}
