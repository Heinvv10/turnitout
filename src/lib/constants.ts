import type { Module } from "@/types/paper";

export const MODULES: Module[] = [
  // Semester 1
  { code: "ACDF5150", name: "Academic Development", semester: 1, credits: 15 },
  {
    code: "CALS5150",
    name: "Counselling and Life Skills",
    semester: 1,
    credits: 15,
  },
  {
    code: "DEVP5150",
    name: "Developmental Psychology 1",
    semester: 1,
    credits: 15,
  },
  {
    code: "NTIN5150",
    name: "New Testament: An Introduction",
    semester: 1,
    credits: 15,
  },
  // Semester 2
  {
    code: "NCHC5150",
    name: "Navigating Change and Conflict",
    semester: 2,
    credits: 15,
  },
  {
    code: "PSIN5150",
    name: "Psychology: An Introduction",
    semester: 2,
    credits: 15,
  },
  {
    code: "FDEV5150",
    name: "Family and Development",
    semester: 2,
    credits: 15,
  },
  {
    code: "THIN5150",
    name: "Theology: An Introduction",
    semester: 2,
    credits: 15,
  },
];

export const SA_GRADE_SCALE = [
  { min: 75, label: "First Class", description: "Distinction" },
  {
    min: 70,
    label: "Second Class (Upper)",
    description: "Meritorious Achievement",
  },
  {
    min: 60,
    label: "Second Class (Lower)",
    description: "Significant Achievement",
  },
  { min: 50, label: "Third Class", description: "Adequate Achievement" },
  { min: 0, label: "Fail", description: "Below Minimum Pass" },
] as const;

export const AI_RISK_THRESHOLDS = {
  green: 20,
  yellow: 40,
} as const;

export const RUBRIC_CATEGORIES = [
  {
    category: "Understanding of Concepts",
    maxScore: 25,
    description: "Demonstrates grasp of key theories and psychological concepts",
  },
  {
    category: "Critical Analysis",
    maxScore: 25,
    description:
      "Evaluates and synthesises rather than just describes; shows independent thinking",
  },
  {
    category: "Argument Structure & Flow",
    maxScore: 20,
    description:
      "Logical organisation, clear thesis, coherent paragraphs with transitions",
  },
  {
    category: "Source Quality & Citation",
    maxScore: 15,
    description:
      "Uses peer-reviewed sources, correct APA 7th format, proper in-text citations",
  },
  {
    category: "Academic Tone & Writing Quality",
    maxScore: 15,
    description:
      "Formal register, correct grammar and spelling, appropriate vocabulary",
  },
] as const;

export const SEMESTER_DATES: Record<number, { semester1Start: string; semester2Start: string }> = {
  2026: {
    semester1Start: "2026-02-09", // Week 1 starts
    semester2Start: "2026-07-20", // Approximate
  },
  2027: {
    semester1Start: "2027-02-08",
    semester2Start: "2027-07-19",
  },
};

export function getSAGrade(score: number): string {
  for (const grade of SA_GRADE_SCALE) {
    if (score >= grade.min) {
      return `${score}% - ${grade.label} (${grade.description})`;
    }
  }
  return `${score}% - Fail`;
}
