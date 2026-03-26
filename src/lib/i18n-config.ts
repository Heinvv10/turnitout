// Grading scale presets
export const GRADING_SCALES = {
  south_africa: {
    label: "South Africa",
    pass: 50,
    scale: [
      { min: 75, label: "First Class", description: "Distinction" },
      { min: 70, label: "Second Class (Upper)", description: "Merit" },
      { min: 60, label: "Second Class (Lower)", description: "Significant" },
      { min: 50, label: "Third Class", description: "Pass" },
      { min: 0, label: "Fail", description: "Below minimum" },
    ],
  },
  uk: {
    label: "United Kingdom",
    pass: 40,
    scale: [
      { min: 70, label: "First Class Honours", description: "1st" },
      { min: 60, label: "Upper Second Class", description: "2:1" },
      { min: 50, label: "Lower Second Class", description: "2:2" },
      { min: 40, label: "Third Class", description: "3rd" },
      { min: 0, label: "Fail", description: "Below pass" },
    ],
  },
  us: {
    label: "United States",
    pass: 60,
    scale: [
      { min: 93, label: "A", description: "Excellent" },
      { min: 90, label: "A-", description: "Excellent" },
      { min: 87, label: "B+", description: "Good" },
      { min: 83, label: "B", description: "Good" },
      { min: 80, label: "B-", description: "Good" },
      { min: 77, label: "C+", description: "Satisfactory" },
      { min: 73, label: "C", description: "Satisfactory" },
      { min: 70, label: "C-", description: "Satisfactory" },
      { min: 67, label: "D+", description: "Below average" },
      { min: 60, label: "D", description: "Minimum pass" },
      { min: 0, label: "F", description: "Fail" },
    ],
  },
  australia: {
    label: "Australia",
    pass: 50,
    scale: [
      { min: 85, label: "High Distinction", description: "HD" },
      { min: 75, label: "Distinction", description: "D" },
      { min: 65, label: "Credit", description: "C" },
      { min: 50, label: "Pass", description: "P" },
      { min: 0, label: "Fail", description: "F" },
    ],
  },
  europe_ects: {
    label: "Europe (ECTS)",
    pass: 50,
    scale: [
      { min: 90, label: "A", description: "Excellent" },
      { min: 80, label: "B", description: "Very Good" },
      { min: 70, label: "C", description: "Good" },
      { min: 60, label: "D", description: "Satisfactory" },
      { min: 50, label: "E", description: "Sufficient" },
      { min: 0, label: "F", description: "Fail" },
    ],
  },
};

export const REFERENCING_STYLES = [
  { id: "harvard", label: "Harvard", description: "Author-date system (Author Year)" },
  { id: "apa7", label: "APA 7th Edition", description: "Author-date system (Author, Year)" },
  { id: "mla9", label: "MLA 9th Edition", description: "Author-page system (Author Page)" },
  { id: "chicago", label: "Chicago/Turabian", description: "Notes-bibliography or Author-date" },
  { id: "vancouver", label: "Vancouver", description: "Numbered citations [1]" },
  { id: "ieee", label: "IEEE", description: "Numbered citations [1]" },
  { id: "oscola", label: "OSCOLA", description: "Law referencing (footnotes)" },
];

export const COUNTRIES = [
  { code: "ZA", label: "South Africa", defaultScale: "south_africa", defaultRef: "harvard", defaultLang: "en-ZA" },
  { code: "GB", label: "United Kingdom", defaultScale: "uk", defaultRef: "harvard", defaultLang: "en-GB" },
  { code: "US", label: "United States", defaultScale: "us", defaultRef: "apa7", defaultLang: "en-US" },
  { code: "AU", label: "Australia", defaultScale: "australia", defaultRef: "apa7", defaultLang: "en-AU" },
  { code: "NZ", label: "New Zealand", defaultScale: "australia", defaultRef: "apa7", defaultLang: "en-NZ" },
  { code: "CA", label: "Canada", defaultScale: "us", defaultRef: "apa7", defaultLang: "en-US" },
  { code: "IE", label: "Ireland", defaultScale: "uk", defaultRef: "harvard", defaultLang: "en-GB" },
  { code: "DE", label: "Germany", defaultScale: "europe_ects", defaultRef: "apa7", defaultLang: "en-GB" },
  { code: "NL", label: "Netherlands", defaultScale: "europe_ects", defaultRef: "apa7", defaultLang: "en-GB" },
  { code: "FR", label: "France", defaultScale: "europe_ects", defaultRef: "apa7", defaultLang: "en-GB" },
  { code: "IN", label: "India", defaultScale: "us", defaultRef: "apa7", defaultLang: "en-GB" },
  { code: "NG", label: "Nigeria", defaultScale: "south_africa", defaultRef: "apa7", defaultLang: "en-GB" },
  { code: "KE", label: "Kenya", defaultScale: "south_africa", defaultRef: "apa7", defaultLang: "en-GB" },
  { code: "GH", label: "Ghana", defaultScale: "uk", defaultRef: "apa7", defaultLang: "en-GB" },
  { code: "OTHER", label: "Other", defaultScale: "uk", defaultRef: "apa7", defaultLang: "en-GB" },
];

// Helper to get grade label from score
export function getGradeLabel(score: number, scaleId: string): string {
  const scaleConfig = GRADING_SCALES[scaleId as keyof typeof GRADING_SCALES];
  if (!scaleConfig) return `${score}%`;
  for (const grade of scaleConfig.scale) {
    if (score >= grade.min) {
      return `${score}% - ${grade.label} (${grade.description})`;
    }
  }
  return `${score}% - Fail`;
}

// Helper to get referencing style info
export function getReferencingStyle(styleId: string) {
  return REFERENCING_STYLES.find(s => s.id === styleId) || REFERENCING_STYLES[0];
}
