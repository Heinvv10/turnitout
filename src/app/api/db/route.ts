import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  upsertStudent,
  getStudent,
  upsertModuleOutline,
  getModuleOutline,
  getAllModuleOutlines,
  savePaper,
  updatePaper,
  getStudentPapers,
  getPaper,
  saveCheckResult,
  getCheckResults,
  saveHistory,
  getHistory,
  upsertSettings,
  getSettings,
  upsertInstitution,
  searchInstitutions,
  shareOutline,
  searchSharedOutlines,
  getSharedOutlinesByInstitution,
  incrementOutlineDownload,
  getSharedOutlineById,
} from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const { action, ...params } = await request.json();

    switch (action) {
      // Student
      case "upsertStudent":
        return NextResponse.json(
          await upsertStudent(params.name, params.studentNumber, params.apiKey),
        );
      case "getStudent":
        return NextResponse.json(
          await getStudent(params.studentNumber),
        );

      // Module Outlines
      case "upsertModuleOutline":
        return NextResponse.json(
          await upsertModuleOutline(
            params.moduleCode,
            params.moduleName,
            params.lecturer,
            params.turnitinThreshold,
            params.referencing,
            params.outlineData,
          ),
        );
      case "getModuleOutline":
        return NextResponse.json(
          await getModuleOutline(params.moduleCode),
        );
      case "getAllModuleOutlines":
        return NextResponse.json(
          await getAllModuleOutlines(),
        );

      // Papers
      case "savePaper":
        return NextResponse.json(
          await savePaper(
            params.studentId,
            params.moduleCode,
            params.title,
            params.contentHtml,
            params.contentPlain,
            params.wordCount,
          ),
        );
      case "updatePaper":
        return NextResponse.json(
          await updatePaper(
            params.paperId,
            params.contentHtml,
            params.contentPlain,
            params.wordCount,
          ),
        );
      case "getStudentPapers":
        return NextResponse.json(
          await getStudentPapers(params.studentId),
        );
      case "getPaper":
        return NextResponse.json(
          await getPaper(params.paperId),
        );

      // Check Results
      case "saveCheckResult":
        return NextResponse.json(
          await saveCheckResult(
            params.paperId,
            params.checkType,
            params.resultData,
            params.score,
            params.trafficLight,
          ),
        );
      case "getCheckResults":
        return NextResponse.json(
          await getCheckResults(params.paperId),
        );

      // History
      case "saveHistory":
        return NextResponse.json(
          await saveHistory(
            params.studentId,
            params.paperTitle,
            params.moduleCode,
            params.wordCount,
            params.overallScore,
            params.trafficLight,
            params.resultsSummary,
          ),
        );
      case "getHistory":
        return NextResponse.json(
          await getHistory(params.studentId),
        );

      // Settings
      case "upsertSettings":
        return NextResponse.json(
          await upsertSettings(params.studentId, params.settings),
        );
      case "getSettings":
        return NextResponse.json(
          await getSettings(params.studentId),
        );

      // Institutions
      case "upsertInstitution":
        return NextResponse.json(
          await upsertInstitution(params.name, params.country),
        );
      case "searchInstitutions":
        return NextResponse.json(
          await searchInstitutions(params.query),
        );

      // Shared Outlines
      case "shareOutline":
        return NextResponse.json(
          await shareOutline(
            params.userId,
            params.institutionId,
            params.moduleCode,
            params.moduleName,
            params.outlineData,
            params.lecturer,
            params.turnitinThreshold,
          ),
        );
      case "searchSharedOutlines":
        return NextResponse.json(
          await searchSharedOutlines(params.institutionName, params.moduleCode),
        );
      case "getSharedOutlinesByInstitution":
        return NextResponse.json(
          await getSharedOutlinesByInstitution(params.institutionId),
        );
      case "incrementOutlineDownload":
        return NextResponse.json(
          await incrementOutlineDownload(params.outlineId),
        );
      case "getSharedOutlineById":
        return NextResponse.json(
          await getSharedOutlineById(params.outlineId),
        );

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 },
        );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Database error";
    console.error("DB error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
