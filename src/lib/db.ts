import { neon } from "@neondatabase/serverless";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

// ── Students ──

export async function upsertStudent(
  name: string,
  studentNumber: string,
  apiKey?: string,
) {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO students (name, student_number, api_key)
    VALUES (${name}, ${studentNumber}, ${apiKey || null})
    ON CONFLICT (student_number)
    DO UPDATE SET name = EXCLUDED.name, api_key = COALESCE(EXCLUDED.api_key, students.api_key), updated_at = NOW()
    RETURNING id, name, student_number, api_key
  `;
  return rows[0];
}

export async function getStudent(studentNumber: string) {
  const sql = getDb();
  const rows = await sql`
    SELECT id, name, student_number, api_key FROM students WHERE student_number = ${studentNumber}
  `;
  return rows[0] || null;
}

// ── Module Outlines ──

export async function upsertModuleOutline(
  moduleCode: string,
  moduleName: string,
  lecturer: string,
  turnitinThreshold: number,
  referencing: string,
  outlineData: unknown,
) {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO module_outlines (module_code, module_name, lecturer, turnitin_threshold, referencing, outline_data)
    VALUES (${moduleCode}, ${moduleName}, ${lecturer}, ${turnitinThreshold}, ${referencing}, ${JSON.stringify(outlineData)})
    ON CONFLICT (module_code)
    DO UPDATE SET module_name = EXCLUDED.module_name, lecturer = EXCLUDED.lecturer,
      turnitin_threshold = EXCLUDED.turnitin_threshold, referencing = EXCLUDED.referencing,
      outline_data = EXCLUDED.outline_data
    RETURNING *
  `;
  return rows[0];
}

export async function getModuleOutline(moduleCode: string) {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM module_outlines WHERE module_code = ${moduleCode}
  `;
  return rows[0] || null;
}

export async function getAllModuleOutlines() {
  const sql = getDb();
  return await sql`SELECT module_code, module_name, lecturer, turnitin_threshold FROM module_outlines ORDER BY module_code`;
}

// ── Papers ──

export async function savePaper(
  studentId: number,
  moduleCode: string,
  title: string,
  contentHtml: string,
  contentPlain: string,
  wordCount: number,
) {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO papers (student_id, module_code, title, content_html, content_plain, word_count)
    VALUES (${studentId}, ${moduleCode}, ${title}, ${contentHtml}, ${contentPlain}, ${wordCount})
    RETURNING id
  `;
  return rows[0];
}

export async function updatePaper(
  paperId: number,
  contentHtml: string,
  contentPlain: string,
  wordCount: number,
) {
  const sql = getDb();
  await sql`
    UPDATE papers SET content_html = ${contentHtml}, content_plain = ${contentPlain},
    word_count = ${wordCount}, updated_at = NOW() WHERE id = ${paperId}
  `;
}

export async function getStudentPapers(studentId: number) {
  const sql = getDb();
  return await sql`
    SELECT id, module_code, title, word_count, created_at, updated_at
    FROM papers WHERE student_id = ${studentId} ORDER BY updated_at DESC LIMIT 50
  `;
}

export async function getPaper(paperId: number) {
  const sql = getDb();
  const rows = await sql`SELECT * FROM papers WHERE id = ${paperId}`;
  return rows[0] || null;
}

// ── Check Results ──

export async function saveCheckResult(
  paperId: number,
  checkType: string,
  resultData: unknown,
  score: number | null,
  trafficLight: string | null,
) {
  const sql = getDb();
  await sql`
    INSERT INTO check_results (paper_id, check_type, result_data, score, traffic_light)
    VALUES (${paperId}, ${checkType}, ${JSON.stringify(resultData)}, ${score}, ${trafficLight})
  `;
}

export async function getCheckResults(paperId: number) {
  const sql = getDb();
  return await sql`
    SELECT check_type, result_data, score, traffic_light, created_at
    FROM check_results WHERE paper_id = ${paperId} ORDER BY created_at DESC
  `;
}

// ── Check History ──

export async function saveHistory(
  studentId: number,
  paperTitle: string,
  moduleCode: string,
  wordCount: number,
  overallScore: number,
  trafficLight: string,
  resultsSummary: unknown,
) {
  const sql = getDb();
  await sql`
    INSERT INTO check_history (student_id, paper_title, module_code, word_count, overall_score, traffic_light, results_summary)
    VALUES (${studentId}, ${paperTitle}, ${moduleCode}, ${wordCount}, ${overallScore}, ${trafficLight}, ${JSON.stringify(resultsSummary)})
  `;
}

export async function getHistory(studentId: number) {
  const sql = getDb();
  return await sql`
    SELECT * FROM check_history WHERE student_id = ${studentId} ORDER BY created_at DESC LIMIT 50
  `;
}

// ── Student Settings ──

export async function upsertSettings(
  studentId: number,
  settings: {
    selectedModule?: string;
    lecturers?: Record<string, string>;
    templateFilename?: string;
    templateData?: string;
  },
) {
  const sql = getDb();
  await sql`
    INSERT INTO student_settings (student_id, selected_module, lecturers, template_filename, template_data)
    VALUES (${studentId}, ${settings.selectedModule || 'ACDF5150'}, ${JSON.stringify(settings.lecturers || {})},
      ${settings.templateFilename || null}, ${settings.templateData || null})
    ON CONFLICT (student_id)
    DO UPDATE SET
      selected_module = COALESCE(EXCLUDED.selected_module, student_settings.selected_module),
      lecturers = COALESCE(EXCLUDED.lecturers, student_settings.lecturers),
      template_filename = COALESCE(EXCLUDED.template_filename, student_settings.template_filename),
      template_data = COALESCE(EXCLUDED.template_data, student_settings.template_data),
      updated_at = NOW()
  `;
}

export async function getSettings(studentId: number) {
  const sql = getDb();
  const rows = await sql`SELECT * FROM student_settings WHERE student_id = ${studentId}`;
  return rows[0] || null;
}

// ── Institutions ──

export async function upsertInstitution(name: string, country: string) {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO institutions (name, country)
    VALUES (${name}, ${country})
    ON CONFLICT (name)
    DO UPDATE SET country = EXCLUDED.country
    RETURNING *
  `;
  return rows[0];
}

export async function searchInstitutions(query: string) {
  const sql = getDb();
  return await sql`
    SELECT * FROM institutions
    WHERE name ILIKE ${"%" + query + "%"}
    ORDER BY name
    LIMIT 50
  `;
}

// ── Shared Outlines ──

export async function shareOutline(
  userId: number | null,
  institutionId: number,
  moduleCode: string,
  moduleName: string,
  outlineData: unknown,
  lecturer?: string,
  turnitinThreshold?: number,
) {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO shared_outlines (uploaded_by, institution_id, module_code, module_name, lecturer, turnitin_threshold, outline_data)
    VALUES (${userId}, ${institutionId}, ${moduleCode}, ${moduleName}, ${lecturer || null}, ${turnitinThreshold || 25}, ${JSON.stringify(outlineData)})
    ON CONFLICT (institution_id, module_code)
    DO UPDATE SET
      module_name = EXCLUDED.module_name,
      lecturer = COALESCE(EXCLUDED.lecturer, shared_outlines.lecturer),
      turnitin_threshold = COALESCE(EXCLUDED.turnitin_threshold, shared_outlines.turnitin_threshold),
      outline_data = EXCLUDED.outline_data
    RETURNING *
  `;
  return rows[0];
}

export async function searchSharedOutlines(
  institutionName?: string,
  moduleCode?: string,
) {
  const sql = getDb();

  if (institutionName && moduleCode) {
    return await sql`
      SELECT so.*, i.name as institution_name, i.country
      FROM shared_outlines so
      JOIN institutions i ON so.institution_id = i.id
      WHERE i.name ILIKE ${"%" + institutionName + "%"}
        AND so.module_code ILIKE ${"%" + moduleCode + "%"}
        AND so.approved = true
      ORDER BY so.download_count DESC
      LIMIT 50
    `;
  }

  if (institutionName) {
    return await sql`
      SELECT so.*, i.name as institution_name, i.country
      FROM shared_outlines so
      JOIN institutions i ON so.institution_id = i.id
      WHERE i.name ILIKE ${"%" + institutionName + "%"}
        AND so.approved = true
      ORDER BY so.download_count DESC
      LIMIT 50
    `;
  }

  if (moduleCode) {
    return await sql`
      SELECT so.*, i.name as institution_name, i.country
      FROM shared_outlines so
      JOIN institutions i ON so.institution_id = i.id
      WHERE so.module_code ILIKE ${"%" + moduleCode + "%"}
        AND so.approved = true
      ORDER BY so.download_count DESC
      LIMIT 50
    `;
  }

  return await sql`
    SELECT so.*, i.name as institution_name, i.country
    FROM shared_outlines so
    JOIN institutions i ON so.institution_id = i.id
    WHERE so.approved = true
    ORDER BY so.download_count DESC
    LIMIT 50
  `;
}

export async function getSharedOutlinesByInstitution(institutionId: number) {
  const sql = getDb();
  return await sql`
    SELECT so.*, i.name as institution_name, i.country
    FROM shared_outlines so
    JOIN institutions i ON so.institution_id = i.id
    WHERE so.institution_id = ${institutionId}
      AND so.approved = true
    ORDER BY so.module_code
  `;
}

export async function incrementOutlineDownload(outlineId: number) {
  const sql = getDb();
  await sql`
    UPDATE shared_outlines
    SET download_count = download_count + 1
    WHERE id = ${outlineId}
  `;
}

export async function getSharedOutlineById(outlineId: number) {
  const sql = getDb();
  const rows = await sql`
    SELECT so.*, i.name as institution_name, i.country
    FROM shared_outlines so
    JOIN institutions i ON so.institution_id = i.id
    WHERE so.id = ${outlineId}
  `;
  return rows[0] || null;
}

// ── Auth Usage Tracking ──

export async function incrementCheckCount(userId: number) {
  const sql = getDb();
  await sql`
    UPDATE auth_users
    SET checks_used_this_month = checks_used_this_month + 1,
        updated_at = NOW()
    WHERE id = ${userId}
  `;
}

export async function getCheckCount(userId: number) {
  const sql = getDb();
  const rows = await sql`
    SELECT checks_used_this_month, subscription_tier, checks_reset_at
    FROM auth_users WHERE id = ${userId}
  `;
  return rows[0] || null;
}

export async function resetMonthlyChecks(userId: number) {
  const sql = getDb();
  await sql`
    UPDATE auth_users
    SET checks_used_this_month = 0,
        checks_reset_at = NOW(),
        updated_at = NOW()
    WHERE id = ${userId}
  `;
}

export async function getAuthUser(userId: number) {
  const sql = getDb();
  const rows = await sql`
    SELECT id, email, name, student_number, university, country,
           subscription_tier, checks_used_this_month, checks_reset_at
    FROM auth_users WHERE id = ${userId}
  `;
  return rows[0] || null;
}
