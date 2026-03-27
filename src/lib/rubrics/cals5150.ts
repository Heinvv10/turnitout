import type { ModuleRubric } from "../module-rubrics";

export const CALS5150_RUBRIC: ModuleRubric = {
  moduleCode: "CALS5150",
  moduleName: "Counselling and Life Skills",
  lecturer: "Michaela Moodley",
  turnitinThreshold: 25,
  learningOutcomes: [
    "Define and differentiate listening skills and psycho-education/life skills",
    "Begin to develop an identity as a helping professional",
    "Develop a basic understanding of Counselling and life-skill interventions and demonstrate ability to evaluate interventions",
    "Demonstrate ability to implement, evaluate and adapt skills learned, in controlled contexts",
  ],
  topics: [
    "PERMA Model (Seligman)",
    "Flourishing in Community",
    "The Counsellor: Person & Professional",
    "Being a Skilled Helper",
    "Basic Counselling Skills",
    "Life Skills",
    "Egan's Helping Model",
    "Facilitation & Life Skills Education",
    "Ethics and Good Practice",
    "Diversity in Counselling and Life Skills",
    "Reflective Practitioners and Supervision",
  ],
  assessments: [
    {
      name: "Reflective Essay",
      type: "Formative",
      weighting: 30,
      wordCount: "1000-1200",
      dueWeek: 6,
      question:
        "Critically explore how the PERMA framework helps explain your current experience of wellbeing. Integrate research on flourishing in communities to consider how social and environmental contexts shape these experiences. Reflect on how developing Skilled Helper competencies may enhance your capacity to promote flourishing in your personal relationships and future helping roles.",
      structure: [
        "Cover page",
        "Introduction (introduce the topic and your approach to it in a short paragraph)",
        "Body (divided into paragraphs using research and personal experience)",
        "Conclusion (summarise the essence of your reflection in 1-2 paragraphs)",
        "Bibliography",
      ],
      resources: [
        "Seligman, M. 2010. Flourish: Positive Psychology and Positive Intervention.",
        "Nelson-Jones, R. 2016. Basic Counselling Skills.",
        "At least five academic journal articles published in 2015 or later",
      ],
      aiPolicy:
        "Students may NOT use AI tools to generate interview content, reflective material, summaries, diagnostic impressions, or written analysis. AI may only be used for grammar checking, and must be disclosed in an AI Disclosure Statement. Undisclosed or inappropriate AI use constitutes academic dishonesty.",
      referencing: "Harvard",
    },
    {
      name: "Presentation",
      type: "Formative",
      weighting: 30,
      wordCount: "1000-1500 words + 8-10 slides",
      dueWeek: 9,
      question:
        "Written Report (~1500 words) with subsections: 1. Community & Needs, 2. Theory Link, 3. Facilitation Skills, 4. Reflection. Plus PowerPoint Presentation (8-10 slides) with Workshop Plan.",
      structure: [
        "Community & Needs - Describe chosen community, identify life skills gaps",
        "Theory Link - Explain how life skills education can support this community with at least two class reading references",
        "Facilitation Skills - Describe key skills a good facilitator needs, reflect on which you have/need to develop",
        "Reflection - Why you think your workshop would be effective",
      ],
      resources: [
        "Rooth. 1995, p9-32",
        "Rooth 2004, 75-103",
        "Four relevant academic journal articles published in 2015 or later",
      ],
      aiPolicy:
        "Same as Assessment 1 - AI only for grammar checking, must be disclosed.",
      referencing: "Harvard",
    },
    {
      name: "Class Test",
      type: "Summative",
      weighting: 40,
      wordCount: "2 hours",
      dueWeek: 13,
      question: "MCQ, Short Question, Essay Question covering all module content (Weeks 1-12)",
      structure: [],
      resources: ["Slides Week 1-12"],
      aiPolicy:
        "AI use is STRICTLY PROHIBITED during this assessment. Use of AI tools (including chatbots, translators, summarizers, or any generative tool) constitutes cheating.",
      referencing: "Not required",
    },
  ],
  rubrics: {
    "Reflective Essay": [
      {
        name: "Reflection & Insight",
        description:
          "Depth of reflection and integration of personal experience with theory (PERMA, flourishing, optimism/helplessness)",
        maxMark: 40,
        levels: {
          excellent: "30-40: Deep, critical reflection; demonstrates strong integration of personal experience with theory; nuanced insights",
          good: "28-29: Clear reflection with good integration of theory and experience; shows thoughtful engagement, though less depth or nuance",
          satisfactory: "24-27: Adequate reflection; some links between experience and theory, but often surface-level or inconsistent",
          basic: "20-23: Limited reflection; mainly descriptive with weak or vague theoretical connections",
          fail: "0-19: Little to no reflection; lacks integration of theory and personal experience",
        },
      },
      {
        name: "Use of Evidence",
        description: "Supports reflection with theory, course content, and/or scholarly sources",
        maxMark: 25,
        levels: {
          excellent: "19-25: Consistently applies relevant theory and literature to support reflection; strong and accurate use of sources",
          good: "18: Generally good use of theory with minor gaps or limited depth",
          satisfactory: "15-17: Some evidence used, though uneven, superficial, or occasionally inaccurate",
          basic: "13-14: Minimal use of theory; weak engagement with course content",
          fail: "0-12: No meaningful use of evidence; arguments unsupported",
        },
      },
      {
        name: "Personal Application",
        description: "Demonstrates self-awareness and growth; identifies strengths and growth areas with honesty and depth",
        maxMark: 15,
        levels: {
          excellent: "12-15: Strong self-awareness; clearly identifies strengths and growth areas with honesty and depth",
          good: "11: Good self-awareness; strengths and growth areas identified with some depth",
          satisfactory: "9-10: Adequate self-awareness; some areas noted, but limited reflection on growth",
          basic: "8: Minimal self-awareness; vague or generic comments about strengths and growth",
          fail: "0-7: No evidence of self-awareness or growth",
        },
      },
      {
        name: "Communication",
        description: "Clarity, structure, style, grammar",
        maxMark: 10,
        levels: {
          excellent: "8-10: Exceptionally clear, well-structured, coherent, and engaging; error-free",
          good: "7: Clear and well-structured with only minor language issues",
          satisfactory: "6: Adequately structured; some clarity or grammar issues",
          basic: "5: Weak structure; frequent errors that affect readability",
          fail: "0-4: Poorly written, disorganised, and unclear; numerous language errors",
        },
      },
      {
        name: "Referencing",
        description: "Correct and consistent use of Harvard referencing style",
        maxMark: 10,
        levels: {
          excellent: "8-10: Accurate and consistent referencing throughout; correct style applied",
          good: "7: Minor referencing errors; mostly consistent",
          satisfactory: "6: Some referencing attempted but with noticeable errors",
          basic: "5: Minimal or inconsistent use of referencing",
          fail: "0-4: No evidence of correct referencing style",
        },
      },
    ],
    Presentation: [
      {
        name: "Insight & Reflection",
        description: "Demonstrates deep insight into the chosen community, life skills needs, facilitation, and self-reflection",
        maxMark: 30,
        levels: {
          excellent: "26-30: Demonstrates deep insight into the chosen community, life skills needs, facilitation, and self-reflection.",
          good: "24-25: Good insight with some depth of reflection. Minor gaps in critical engagement.",
          satisfactory: "21-23: Adequate insight; reflection tends to be more descriptive than critical.",
          basic: "18-20: Limited insight; reflection is brief or superficial.",
          fail: "0-17: Very little or no reflection; lacks understanding of community or life skills.",
        },
      },
      {
        name: "Theory & Evidence",
        description: "Integrates theory from class readings clearly and effectively; strong connection between theory and community needs",
        maxMark: 25,
        levels: {
          excellent: "23-25: Integrates theory from at least 2 class readings clearly and effectively.",
          good: "21-22: Good use of theory with clear relevance; some minor gaps in application.",
          satisfactory: "18-20: Uses theory but mostly descriptive; connections to community needs not always clear.",
          basic: "15-17: Minimal use of theory; weak or vague link to community.",
          fail: "0-14: No evidence of theory or references.",
        },
      },
      {
        name: "Workshop Plan (PowerPoint)",
        description: "Clear, practical, and creative plan with title, aim, objectives, activities, and materials",
        maxMark: 25,
        levels: {
          excellent: "23-25: Clear, practical, and creative plan. Activities well-suited to community needs.",
          good: "21-22: Good plan with most required elements; activities mostly relevant.",
          satisfactory: "18-20: Adequate plan; some elements missing or unclear; activities somewhat relevant.",
          basic: "15-17: Basic plan with significant gaps; little detail in activities or materials.",
          fail: "0-14: No clear workshop plan; activities missing or irrelevant.",
        },
      },
      {
        name: "Communication",
        description: "Report and slides are well-structured, clear, and polished",
        maxMark: 10,
        levels: {
          excellent: "9-10: Report and slides are well-structured, clear, and polished throughout.",
          good: "8: Mostly well-written with minor errors. Clear structure.",
          satisfactory: "7: Adequately written with some errors or inconsistencies in clarity/structure.",
          basic: "6: Weak structure; frequent errors make reading difficult.",
          fail: "0-5: Very poor writing or presentation; unclear, disorganized.",
        },
      },
      {
        name: "Referencing",
        description: "Consistent and correct use of APA 7th edition referencing throughout",
        maxMark: 10,
        levels: {
          excellent: "9-10: Consistent and correct use of APA 7th edition referencing throughout.",
          good: "8: Minor errors in APA referencing.",
          satisfactory: "7: Some errors or inconsistencies in APA referencing.",
          basic: "6: Minimal attempt at referencing; many errors.",
          fail: "0-5: No referencing or completely incorrect style.",
        },
      },
    ],
  },
};
