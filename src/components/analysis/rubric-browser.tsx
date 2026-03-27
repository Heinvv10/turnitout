"use client";

import { useState } from "react";
import { useSettingsStore } from "@/store/settings-store";
import { MODULE_RUBRICS, type RubricCriterion } from "@/lib/module-rubrics";
import { MODULES } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileSpreadsheet,
  BookOpen,
  Calendar,
  Percent,
  ChevronDown,
  AlertCircle,
  Upload,
  CheckCircle,
} from "lucide-react";

function CriterionCard({ criterion }: { criterion: RubricCriterion }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-border/50 bg-secondary/30 p-3">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{criterion.name}</span>
          <Badge variant="outline" className="text-xs">
            /{criterion.maxMark}
          </Badge>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      <p className="mt-1 text-xs text-muted-foreground">
        {criterion.description}
      </p>
      {expanded && (
        <div className="mt-3 space-y-1.5">
          {Object.entries(criterion.levels).map(([level, desc]) => (
            <div key={level} className="flex gap-2 text-xs">
              <Badge
                variant="outline"
                className={`shrink-0 w-24 justify-center text-[10px] ${getLevelColor(level)}`}
              >
                {level}
              </Badge>
              <span className="text-muted-foreground">{desc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getLevelColor(level: string): string {
  switch (level) {
    case "excellent":
      return "border-green-500/50 text-green-400";
    case "good":
      return "border-blue-500/50 text-blue-400";
    case "satisfactory":
      return "border-yellow-500/50 text-yellow-400";
    case "basic":
      return "border-orange-500/50 text-orange-400";
    case "fail":
      return "border-red-500/50 text-red-400";
    default:
      return "";
  }
}

export function RubricBrowser() {
  const { selectedModule } = useSettingsStore();
  const rubric = MODULE_RUBRICS[selectedModule];
  const moduleName =
    MODULES.find((m) => m.code === selectedModule)?.name || selectedModule;

  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(
    null,
  );

  if (!rubric) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Module Rubric</h3>
        </div>
        <Card className="border-dashed border-2 p-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium">No rubric available</p>
              <p className="text-sm text-muted-foreground mt-1">
                No pre-built rubric found for{" "}
                <span className="font-medium text-foreground">
                  {selectedModule} - {moduleName}
                </span>
                .
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Upload className="h-4 w-4" />
              <span>
                Upload a module outline in Settings to enable rubric-based
                grading.
              </span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const activeAssessmentName = selectedAssessment || rubric.assessments[0]?.name;
  const criteria = activeAssessmentName
    ? rubric.rubrics[activeAssessmentName]
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileSpreadsheet className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Module Rubric</h3>
      </div>

      <Card className="p-4 space-y-1">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm">{rubric.moduleName}</p>
          <Badge variant="outline">{rubric.moduleCode}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Lecturer: {rubric.lecturer}
        </p>
        <p className="text-xs text-muted-foreground">
          Turnitin threshold: {rubric.turnitinThreshold}%
        </p>
      </Card>

      {/* Assessment selector */}
      <div>
        <p className="text-sm font-medium mb-2">Assessments</p>
        <div className="space-y-2">
          {rubric.assessments.map((assessment) => {
            const isActive = assessment.name === activeAssessmentName;
            const hasRubric = Boolean(rubric.rubrics[assessment.name]);
            return (
              <button
                key={assessment.name}
                type="button"
                onClick={() => setSelectedAssessment(assessment.name)}
                className={`w-full text-left rounded-lg border p-3 transition-colors cursor-pointer ${
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:bg-secondary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{assessment.name}</span>
                  <div className="flex items-center gap-1.5">
                    {hasRubric && (
                      <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    )}
                    <Badge variant="secondary" className="text-[10px]">
                      {assessment.type}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Percent className="h-3 w-3" />
                    {assessment.weighting}%
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Week {assessment.dueWeek}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {assessment.wordCount}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grading criteria */}
      {criteria ? (
        <div>
          <p className="text-sm font-medium mb-2">
            Grading Criteria &mdash; {activeAssessmentName}
          </p>
          <div className="space-y-2">
            {criteria.map((c) => (
              <CriterionCard key={c.name} criterion={c} />
            ))}
          </div>
          <div className="mt-3 rounded-lg bg-secondary/50 p-3">
            <p className="text-xs text-muted-foreground text-center">
              Total marks:{" "}
              <span className="font-semibold text-foreground">
                {criteria.reduce((sum, c) => sum + c.maxMark, 0)}
              </span>
            </p>
          </div>
        </div>
      ) : (
        <Card className="border-dashed p-4">
          <p className="text-sm text-muted-foreground text-center">
            No grading criteria available for this assessment type.
          </p>
        </Card>
      )}
    </div>
  );
}
