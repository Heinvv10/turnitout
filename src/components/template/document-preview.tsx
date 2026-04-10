"use client";

import { useEffect, useState } from "react";
import { usePaperStore } from "@/store/paper-store";
import { useSettingsStore } from "@/store/settings-store";
import { MODULES } from "@/lib/constants";

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

export function DocumentPreview() {
  const { currentPaper, sections } = usePaperStore();
  const { studentName, studentNumber, selectedModule } = useSettingsStore();
  const module = MODULES.find((m) => m.code === selectedModule);
  const [date, setDate] = useState("");

  useEffect(() => {
    setDate(new Date().toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }));
  }, []);

  const intro = sections?.introduction || "";
  const body = sections?.body || "";
  const conclusion = sections?.conclusion || "";
  const refs = sections?.references || currentPaper?.references || "";

  return (
    <div className="mx-auto max-w-[600px] bg-white text-black shadow-lg">
      {/* Cover Page */}
      <div className="flex flex-col items-center justify-center px-12 py-16 text-center min-h-[300px]">
        <p className="mb-8 text-sm font-bold uppercase tracking-widest">
          {currentPaper?.title || "ASSIGNMENT TITLE"}
        </p>
        <div className="mb-6 h-px w-3/4 bg-gray-300" />
        <p className="text-xs text-gray-600">Academic Essay</p>
        <div className="my-4 h-px w-3/4 bg-gray-300" />
        <p className="text-[11px] text-gray-500">In partial fulfilment</p>
        <p className="text-[11px] text-gray-500">
          of the requirement in {module?.name || "Module Name"}
        </p>
        <p className="text-[11px] text-gray-500">at</p>
        <p className="text-[11px] font-semibold text-gray-700">
          Cornerstone Institute
        </p>
        <div className="my-4 h-px w-3/4 bg-gray-300" />
        <p className="text-[11px] text-gray-500">by</p>
        <p className="text-xs font-semibold">
          {studentName || "Student Name"} ({studentNumber || "Number"})
        </p>
        <p className="mt-3 text-[11px] text-gray-500">Date: {date}</p>
      </div>

      {/* Table of Contents */}
      <div className="border-t px-12 py-6">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider">
          Table of Contents
        </p>
        <div className="space-y-1.5 text-[11px]">
          {[
            { label: "1. Introduction", page: "1" },
            { label: "2. Body", page: "1" },
            { label: "3. Conclusion", page: "" },
            { label: "Reference List", page: "" },
          ].map(({ label, page }) => (
            <div
              key={label}
              className="flex items-end gap-1"
            >
              <span>{label}</span>
              <span className="flex-1 border-b border-dotted border-gray-300" />
              <span className="text-gray-400">{page}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Introduction */}
      <div className="border-t px-12 py-6">
        <p className="mb-2 text-xs font-bold">1. Introduction</p>
        {intro ? (
          <p className="text-[11px] leading-[1.8] text-gray-800 whitespace-pre-line">
            {intro.length > 500 ? intro.slice(0, 500) + "..." : intro}
          </p>
        ) : (
          <p className="text-[11px] italic text-gray-300">
            Introduction will appear here...
          </p>
        )}
      </div>

      {/* Body */}
      <div className="border-t px-12 py-6">
        <p className="mb-2 text-xs font-bold">2. Body</p>
        {body ? (
          <p className="text-[11px] leading-[1.8] text-gray-800 whitespace-pre-line">
            {body.length > 800 ? body.slice(0, 800) + "..." : body}
          </p>
        ) : (
          <p className="text-[11px] italic text-gray-300">
            Body will appear here...
          </p>
        )}
      </div>

      {/* Conclusion */}
      <div className="border-t px-12 py-6">
        <p className="mb-2 text-xs font-bold">3. Conclusion</p>
        {conclusion ? (
          <p className="text-[11px] leading-[1.8] text-gray-800 whitespace-pre-line">
            {conclusion.length > 500
              ? conclusion.slice(0, 500) + "..."
              : conclusion}
          </p>
        ) : (
          <p className="text-[11px] italic text-gray-300">
            Conclusion will appear here...
          </p>
        )}
      </div>

      {/* References */}
      <div className="border-t px-12 py-6">
        <p className="mb-2 text-xs font-bold">Reference List</p>
        {refs ? (
          <div className="text-[10px] leading-[1.8] text-gray-800">
            {refs
              .split("\n")
              .filter((l) => l.trim())
              .slice(0, 10)
              .map((ref, i) => (
                <p key={i} className="mb-1 pl-6 -indent-6">
                  {ref}
                </p>
              ))}
          </div>
        ) : (
          <p className="text-[11px] italic text-gray-300">
            References will appear here...
          </p>
        )}
      </div>

      {/* Declaration */}
      <div className="border-t px-12 py-6">
        <p className="mb-2 text-[10px] font-bold text-gray-600">
          Plagiarism & AI Declaration / Honour Pledge
        </p>
        <p className="text-[9px] leading-relaxed text-gray-400">
          I understand that plagiarism is to use another&apos;s work and represent
          it as one&apos;s own, and I know that plagiarism is wrong. I have used
          the Cornerstone Harvard Referencing convention for citation and
          referencing...
        </p>
        <div className="mt-3 space-y-1 text-[10px] text-gray-600">
          <p>
            Signature: <span className="underline">{studentName || "_______________"}</span>
          </p>
          <p>
            Date: <span className="underline">{date}</span>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t px-12 py-3 text-center">
        <p className="text-[9px] text-gray-400">
          {module?.code} — {module?.name} | {countWords(intro) + countWords(body) + countWords(conclusion)} words
        </p>
      </div>
    </div>
  );
}
