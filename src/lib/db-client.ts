/**
 * Client-side helper to call the /api/db endpoint.
 */
async function dbCall(action: string, params: Record<string, unknown> = {}) {
  const res = await fetch("/api/db", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...params }),
  });
  const data = await res.json();
  if (data?.error) throw new Error(data.error);
  return data;
}

export const db = {
  // Student
  upsertStudent: (name: string, studentNumber: string, apiKey?: string) =>
    dbCall("upsertStudent", { name, studentNumber, apiKey }),
  getStudent: (studentNumber: string) =>
    dbCall("getStudent", { studentNumber }),

  // Module Outlines
  upsertModuleOutline: (
    moduleCode: string,
    moduleName: string,
    lecturer: string,
    turnitinThreshold: number,
    referencing: string,
    outlineData: unknown,
  ) =>
    dbCall("upsertModuleOutline", {
      moduleCode,
      moduleName,
      lecturer,
      turnitinThreshold,
      referencing,
      outlineData,
    }),
  getModuleOutline: (moduleCode: string) =>
    dbCall("getModuleOutline", { moduleCode }),
  getAllModuleOutlines: () => dbCall("getAllModuleOutlines"),

  // Papers
  savePaper: (
    studentId: number,
    moduleCode: string,
    title: string,
    contentHtml: string,
    contentPlain: string,
    wordCount: number,
  ) =>
    dbCall("savePaper", {
      studentId,
      moduleCode,
      title,
      contentHtml,
      contentPlain,
      wordCount,
    }),
  updatePaper: (
    paperId: number,
    contentHtml: string,
    contentPlain: string,
    wordCount: number,
  ) => dbCall("updatePaper", { paperId, contentHtml, contentPlain, wordCount }),
  getStudentPapers: (studentId: number) =>
    dbCall("getStudentPapers", { studentId }),
  getPaper: (paperId: number) => dbCall("getPaper", { paperId }),

  // Check Results
  saveCheckResult: (
    paperId: number,
    checkType: string,
    resultData: unknown,
    score: number | null,
    trafficLight: string | null,
  ) =>
    dbCall("saveCheckResult", {
      paperId,
      checkType,
      resultData,
      score,
      trafficLight,
    }),
  getCheckResults: (paperId: number) =>
    dbCall("getCheckResults", { paperId }),

  // History
  saveHistory: (
    studentId: number,
    paperTitle: string,
    moduleCode: string,
    wordCount: number,
    overallScore: number,
    trafficLight: string,
    resultsSummary: unknown,
  ) =>
    dbCall("saveHistory", {
      studentId,
      paperTitle,
      moduleCode,
      wordCount,
      overallScore,
      trafficLight,
      resultsSummary,
    }),
  getHistory: (studentId: number) => dbCall("getHistory", { studentId }),

  // Settings
  upsertSettings: (studentId: number, settings: Record<string, unknown>) =>
    dbCall("upsertSettings", { studentId, settings }),
  getSettings: (studentId: number) => dbCall("getSettings", { studentId }),
};
