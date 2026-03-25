import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StoredTemplate } from "@/types/template";
import type { ModuleRubric } from "@/lib/module-rubrics";

interface SettingsState {
  studentName: string;
  studentNumber: string;
  selectedModule: string;
  template: StoredTemplate | null;
  lecturers: Record<string, string>;
  moduleOutlines: Record<string, ModuleRubric>;
  apiKey: string;

  setStudentName: (name: string) => void;
  setStudentNumber: (number: string) => void;
  setSelectedModule: (code: string) => void;
  setTemplate: (template: StoredTemplate | null) => void;
  setLecturer: (moduleCode: string, lecturer: string) => void;
  setModuleOutline: (moduleCode: string, outline: ModuleRubric) => void;
  removeModuleOutline: (moduleCode: string) => void;
  setApiKey: (key: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      studentName: "",
      studentNumber: "",
      selectedModule: "ACDF5150",
      template: null,
      lecturers: {},
      moduleOutlines: {},
      apiKey: "",

      setStudentName: (name) => set({ studentName: name }),
      setStudentNumber: (number) => set({ studentNumber: number }),
      setSelectedModule: (code) => set({ selectedModule: code }),
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
    }),
    { name: "turnitout-settings" },
  ),
);
