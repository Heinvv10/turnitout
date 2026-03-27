// WORKING: Pure pattern-matching Afrikaans academic writing error detection

export type AfrikaansCategory =
  | "Dubbele Ontkenning"
  | "Woordorde"
  | "Spelling"
  | "Anglisismes"
  | "Register"
  | "Tyd"
  | "Passief";

export interface AfrikaansPattern {
  name: string;
  category: AfrikaansCategory;
  regex: RegExp;
  explanation: string;
  fix: string;
}

export interface AfrikaasFinding {
  pattern: AfrikaansPattern;
  matchedText: string;
  index: number;
}

export interface AfrikaansAnalysisResult {
  findings: AfrikaasFinding[];
  categoryCounts: Record<AfrikaansCategory, number>;
  totalCount: number;
  categoryCount: number;
  isAfrikaans: boolean;
  confidence: number;
}

/** Common Afrikaans words used for language detection */
const AFRIKAANS_MARKERS = [
  "die", "en", "van", "het", "nie", "wat", "dat", "vir",
  "kan", "sal", "met", "ook", "maar", "ons", "hulle",
  "sy", "hy", "hierdie", "daardie", "volgens", "omdat",
  "wanneer", "indien", "egter", "reeds", "asook", "dus",
];

/**
 * Detect whether text is likely Afrikaans.
 * Returns a confidence score between 0 and 1.
 */
export function detectAfrikaans(text: string): number {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length < 5) return 0;
  const markerSet = new Set(AFRIKAANS_MARKERS);
  let hits = 0;
  for (const w of words) {
    if (markerSet.has(w)) hits++;
  }
  return Math.min(hits / words.length * 5, 1);
}

const PATTERNS: AfrikaansPattern[] = [
  // --- Dubbele Ontkenning (Double Negation) ---
  {
    name: "Ontbrekende sluit-'nie'",
    category: "Dubbele Ontkenning",
    regex: /\b(kan|sal|wil|moet|mag|het|is|was)\s+nie\s+\w+(?:\s+\w+){0,5}[.!?](?!\s*nie)/gi,
    explanation:
      "In Afrikaans vereis die dubbele ontkenning 'n sluit-'nie' aan die einde van die sin. Sonder die tweede 'nie' is die sin grammatikaal onvolledig.",
    fix: "Voeg 'nie' by aan die einde: 'Ek kan nie gaan nie.'",
  },
  {
    name: "Driedubbele ontkenning",
    category: "Dubbele Ontkenning",
    regex: /\bnie\s+\w+\s+nie\s+\w+\s+nie\b/gi,
    explanation:
      "Drie 'nie'-woorde in een sinsdeel is gewoonlik 'n fout. Afrikaans gebruik slegs twee: een by die werkwoord en een aan die einde.",
    fix: "Hersien die sin sodat daar slegs twee 'nie'-woorde is.",
  },

  // --- Woordorde (Word Order) ---
  {
    name: "Werkwoord nie finaal in bysin",
    category: "Woordorde",
    regex: /\b(omdat|wanneer|indien|terwyl|sodat|alhoewel|voordat|nadat|totdat)\s+\w+\s+(het|is|was|sal|kan|wil|moet|mag)\s+\w+/gi,
    explanation:
      "In Afrikaanse bysonne (na voegwoorde soos 'omdat', 'wanneer') moet die werkwoord na die einde van die bysin skuif.",
    fix: "Skuif die werkwoord na die einde: 'omdat hy die boek gelees het' (nie 'omdat hy het die boek gelees').",
  },
  {
    name: "Inversie ontbreek na vooropstelling",
    category: "Woordorde",
    regex: /\b(Gister|Vandag|Môre|Daarom|Dus|Gevolglik|Verder|Eerstens|Tweedens|Laastens)\s+(ek|hy|sy|ons|hulle|dit)\s+/gi,
    explanation:
      "Wanneer 'n bywoord of bywoordelike bepaling voorop in die sin staan, moet die onderwerp en werkwoord omruil (inversie).",
    fix: "Pas inversie toe: 'Gister het ek...' (nie 'Gister ek het...').",
  },

  // --- Spelling ---
  {
    name: "'baje' in plaas van 'baie'",
    category: "Spelling",
    regex: /\bbaje\b/gi,
    explanation: "'Baje' is 'n algemene spelfout. Die korrekte spelling is 'baie'.",
    fix: "Verander na 'baie'.",
  },
  {
    name: "'hul' vs 'hulle' verwarring",
    category: "Spelling",
    regex: /\bhul\s+(is|het|kan|sal|wil|moet|mag|was)\b/gi,
    explanation:
      "'Hul' is die besitlike vorm (hul boeke). As onderwerp gebruik jy 'hulle': 'hulle is', 'hulle het'.",
    fix: "Gebruik 'hulle' as onderwerp: 'Hulle het gegaan.'",
  },
  {
    name: "'n Hoofletter na 'n",
    category: "Spelling",
    regex: /\b'n\s+[A-Z][a-z]/g,
    explanation:
      "Na die lidwoord ''n' begin die volgende woord met 'n kleinletter, behalwe by eiename.",
    fix: "Gebruik 'n kleinletter: ''n boek', ''n studie'.",
  },
  {
    name: "'Ongelukkig' as 'unfortunately'",
    category: "Spelling",
    regex: /\bongelukkig\b/gi,
    explanation:
      "'Ongelukkig' beteken 'unhappy', nie 'unfortunately' nie. Die korrekte Afrikaanse woord vir 'unfortunately' is 'ongelukkig genoeg' of 'helaas'.",
    fix: "Gebruik 'ongelukkig' slegs vir 'unhappy'. Vir 'unfortunately', gebruik 'helaas' of 'ongelukkig genoeg'.",
  },

  // --- Anglisismes (Anglicisms) ---
  {
    name: "'ge-enjoy' (Engelse werkwoord met Afrikaanse voorvoegsel)",
    category: "Anglisismes",
    regex: /\bge-?(enjoy|manage|handle|ignore|cancel|email|google|check|like|post)\w*\b/gi,
    explanation:
      "Dit is 'n Engelse werkwoord met 'n Afrikaanse verlede-tyd-voorvoegsel. In akademiese Afrikaans moet jy die korrekte Afrikaanse werkwoord gebruik.",
    fix: "Gebruik die Afrikaanse ekwivalent: ge-enjoy → geniet, ge-manage → bestuur, ge-handle → hanteer, ge-ignore → ignoreer, ge-cancel → kanselleer.",
  },
  {
    name: "'applikasie' (Anglisisme)",
    category: "Anglisismes",
    regex: /\bapplikasie\b/gi,
    explanation:
      "'Applikasie' is 'n Anglisisme. Die korrekte Afrikaanse woord is 'aansoek' (vir 'n pos) of 'toepassing' (sagteware).",
    fix: "Gebruik 'aansoek' (job application) of 'toepassing' (software application).",
  },
  {
    name: "'adresseer' (Anglisisme vir 'aanspreek')",
    category: "Anglisismes",
    regex: /\badresseer\b/gi,
    explanation:
      "In die sin van 'address an issue' is 'adresseer' 'n Anglisisme. Die korrekte Afrikaans is 'aanspreek' of 'aanpak'.",
    fix: "Gebruik 'aanspreek' of 'aanpak': 'die probleem aanspreek'.",
  },
  {
    name: "'attendance' → 'bywoning'",
    category: "Anglisismes",
    regex: /\battendance\b/gi,
    explanation:
      "Die Engelse woord 'attendance' word soms direk in Afrikaans gebruik. Die korrekte Afrikaans is 'bywoning' of 'teenwoordigheid'.",
    fix: "Gebruik 'bywoning' of 'teenwoordigheid'.",
  },

  // --- Register (Formal vs Informal) ---
  {
    name: "'ek's' (informeel)",
    category: "Register",
    regex: /\bek'?s\b/gi,
    explanation:
      "'Ek's' is 'n informele sametrekking van 'ek is'. In akademiese skryfwerk moet die volle vorm gebruik word.",
    fix: "Skryf voluit: 'ek is'.",
  },
  {
    name: "'dis' (informeel)",
    category: "Register",
    regex: /\bdis\b/gi,
    explanation:
      "'Dis' is 'n informele sametrekking van 'dit is'. In akademiese skryfwerk moet die volle vorm gebruik word.",
    fix: "Skryf voluit: 'dit is'.",
  },
  {
    name: "'okay/ok' (informeel)",
    category: "Register",
    regex: /\b(okay|ok)\b/gi,
    explanation:
      "'Okay' en 'ok' is informeel. In akademiese Afrikaans, gebruik 'aanvaarbaar', 'geskik', of 'toereikend'.",
    fix: "Gebruik 'aanvaarbaar', 'geskik', of 'toereikend' in akademiese konteks.",
  },

  // --- Tyd (Tense) ---
  {
    name: "Verkeerde gebruik van 'is' vir verlede tyd",
    category: "Tyd",
    regex: /\b(ek|hy|sy|ons|hulle|dit)\s+is\s+\w*(gegaan|geloop|gekom|gedoen|gemaak|geskryf|gelees)\b/gi,
    explanation:
      "Sommige werkwoorde gebruik 'het' (nie 'is') vir die verlede tyd in Afrikaans: 'Ek het gegaan' (nie 'Ek is gegaan').",
    fix: "Gebruik 'het' vir die verlede tyd: 'Ek het gegaan.'",
  },
  {
    name: "'het' met teenwoordige tyd werkwoord",
    category: "Tyd",
    regex: /\b(ek|hy|sy|ons|hulle)\s+het\s+(gaan|kom|doen|maak|skryf|lees|sien|loop)\b/gi,
    explanation:
      "Na 'het' moet die werkwoord in die verlede deelwoord wees (met ge-): 'het gegaan', nie 'het gaan'.",
    fix: "Gebruik die verlede deelwoord: 'het gegaan', 'het gekom', 'het gedoen'.",
  },

  // --- Passief (Passive Voice) ---
  {
    name: "'is' in plaas van 'word' vir passief teenwoordig",
    category: "Passief",
    regex: /\b(dit|die\s+\w+)\s+is\s+\w*(bespreek|beslis|oorweeg|ondersoek|ontleed|gebruik)\b/gi,
    explanation:
      "In Afrikaans gebruik ons 'word' vir die teenwoordige passief en 'is' vir die verlede passief. 'Dit word bespreek' (nou) vs 'Dit is bespreek' (klaar).",
    fix: "Vir teenwoordige passief gebruik 'word': 'Dit word bespreek.'",
  },
];

/** Curated academic Afrikaans phrases for student reference */
export const ACADEMIC_PHRASES = [
  { context: "Inleiding", phrase: "In hierdie opstel word ondersoek ingestel na..." },
  { context: "Inleiding", phrase: "Die doel van hierdie studie is om..." },
  { context: "Inleiding", phrase: "Hierdie werkstuk poog om aan te toon dat..." },
  { context: "Verwysing", phrase: "Volgens [Outeur] (Jaar), ..." },
  { context: "Verwysing", phrase: "[Outeur] (Jaar) voer aan dat..." },
  { context: "Verwysing", phrase: "Soos [Outeur] (Jaar) tereg opmerk, ..." },
  { context: "Argument", phrase: "Dit blyk duidelik dat..." },
  { context: "Argument", phrase: "Daar kan geargumenteer word dat..." },
  { context: "Argument", phrase: "In die lig van bogenoemde..." },
  { context: "Kontras", phrase: "Aan die ander kant..." },
  { context: "Kontras", phrase: "In teenstelling hiermee..." },
  { context: "Kontras", phrase: "Ten spyte van hierdie siening..." },
  { context: "Gevolgtrekking", phrase: "Samevattend kan gesê word dat..." },
  { context: "Gevolgtrekking", phrase: "Op grond van die voorafgaande bespreking..." },
  { context: "Gevolgtrekking", phrase: "Ten slotte blyk dit dat..." },
];

/**
 * Run all Afrikaans pattern checks against the provided text.
 * Also performs language detection.
 */
export function analyzeAfrikaansPatterns(text: string): AfrikaansAnalysisResult {
  const confidence = detectAfrikaans(text);
  const isAfrikaans = confidence >= 0.15;
  const findings: AfrikaasFinding[] = [];

  if (isAfrikaans) {
    for (const pattern of PATTERNS) {
      pattern.regex.lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = pattern.regex.exec(text)) !== null) {
        findings.push({
          pattern,
          matchedText: match[0],
          index: match.index,
        });
      }
    }
  }

  findings.sort((a, b) => a.index - b.index);

  const categoryCounts: Record<AfrikaansCategory, number> = {
    "Dubbele Ontkenning": 0,
    Woordorde: 0,
    Spelling: 0,
    Anglisismes: 0,
    Register: 0,
    Tyd: 0,
    Passief: 0,
  };

  for (const f of findings) {
    categoryCounts[f.pattern.category]++;
  }

  const categoryCount = Object.values(categoryCounts).filter((c) => c > 0).length;

  return { findings, categoryCounts, totalCount: findings.length, categoryCount, isAfrikaans, confidence };
}
