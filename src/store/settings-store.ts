import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StoredTemplate } from "@/types/template";
import type { ModuleRubric } from "@/lib/module-rubrics";
import type { Paper } from "@/types/paper";
import type { SubmissionReadiness } from "@/types/analysis";
import type { SectionSplit } from "@/store/paper-store";

interface SettingsState {
  studentName: string;
  studentNumber: string;
  studentDbId: number | null;
  selectedModule: string;
  selectedAssessment: string;
  template: StoredTemplate | null;
  lecturers: Record<string, string>;
  moduleOutlines: Record<string, ModuleRubric>;
  apiKey: string;
  currentPaperId: number | null;
  modulePapers: Record<string, { paper: Paper; sections: SectionSplit | null; results: SubmissionReadiness }>;
  country: string;
  university: string;
  gradingScale: string;
  referencingStyle: string;
  language: string;
  lowDataMode: boolean;
  onboardingComplete: boolean;

  setLowDataMode: (enabled: boolean) => void;
  setStudentName: (name: string) => void;
  setStudentNumber: (number: string) => void;
  setStudentDbId: (id: number | null) => void;
  setSelectedModule: (code: string) => void;
  setSelectedAssessment: (name: string) => void;
  setTemplate: (template: StoredTemplate | null) => void;
  setLecturer: (moduleCode: string, lecturer: string) => void;
  setModuleOutline: (moduleCode: string, outline: ModuleRubric) => void;
  removeModuleOutline: (moduleCode: string) => void;
  setApiKey: (key: string) => void;
  setCurrentPaperId: (id: number | null) => void;
  saveModulePaper: (moduleCode: string, paper: Paper, sections: SectionSplit | null, results: SubmissionReadiness) => void;
  getModulePaper: (moduleCode: string) => { paper: Paper; sections: SectionSplit | null; results: SubmissionReadiness } | null;
  setCountry: (country: string) => void;
  setUniversity: (university: string) => void;
  setGradingScale: (scale: string) => void;
  setReferencingStyle: (style: string) => void;
  setLanguage: (lang: string) => void;
  setOnboardingComplete: (complete: boolean) => void;
  syncToDb: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      studentName: "",
      studentNumber: "",
      studentDbId: null,
      selectedModule: "ACDF5150",
      selectedAssessment: "",
      template: null,
      lecturers: {},
      moduleOutlines: {},
      apiKey: "",
      currentPaperId: null,
      modulePapers: {},
      country: "ZA",
      university: "Cornerstone Institute",
      gradingScale: "south_africa",
      referencingStyle: "harvard",
      language: "en-ZA",
      lowDataMode: false,
      onboardingComplete: false,

      setLowDataMode: (enabled) => set({ lowDataMode: enabled }),
      setStudentName: (name) => set({ studentName: name }),
      setStudentNumber: (number) => set({ studentNumber: number }),
      setStudentDbId: (id) => set({ studentDbId: id }),
      setSelectedModule: (code) => set({ selectedModule: code, selectedAssessment: "" }),
      setSelectedAssessment: (name) => set({ selectedAssessment: name }),
      setTemplate: (template) => set({ template }),
      setLecturer: (moduleCode, lecturer) =>
        set({ lecturers: { ...get().lecturers, [moduleCode]: lecturer } }),
      setModuleOutline: (moduleCode, outline) =>
        set({
          moduleOutlines: { ...get().moduleOutlines, [moduleCode]: outline },
        }),
      removeModuleOutline: (moduleCode) => {
        const outlines = { ...get().moduleOutlines };
        delete outlines[moduleCode];
        set({ moduleOutlines: outlines });
      },
      setApiKey: (key) => set({ apiKey: key }),
      setCurrentPaperId: (id) => set({ currentPaperId: id }),
      setCountry: (country) => set({ country }),
      setUniversity: (university) => set({ university }),
      setGradingScale: (scale) => set({ gradingScale: scale }),
      setReferencingStyle: (style) => set({ referencingStyle: style }),
      setLanguage: (lang) => set({ language: lang }),
      setOnboardingComplete: (complete) => set({ onboardingComplete: complete }),
      saveModulePaper: (moduleCode, paper, sections, results) =>
        set({
          modulePapers: {
            ...get().modulePapers,
            [moduleCode]: { paper, sections, results },
          },
        }),
      getModulePaper: (moduleCode) => get().modulePapers[moduleCode] || null,

      syncToDb: async () => {
        const { studentName, studentNumber, apiKey } = get();
        if (!studentName || !studentNumber) return;

        try {
          const res = await fetch("/api/db", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "upsertStudent",
              name: studentName,
              studentNumber,
              apiKey,
            }),
          });
          const student = await res.json();
          if (student?.id) {
            set({ studentDbId: student.id });
          }
        } catch (err) {
          console.error("Failed to sync student to DB:", err);
        }
      },
    }),
    { name: "turnitout-settings" },
  ),
);
