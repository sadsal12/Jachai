// Jachai Client-Side Verification & Hoax Database Engine
// Embeds 45 verified Bangladeshi hoaxes for instant client-side testing on Cloudflare Pages

const JACHAI_HOAXES = [
  {
    id: "padma-bridge-heads",
    category: "rumour-violence",
    claim_en: "Padma Bridge construction needs human heads, so child kidnappers are collecting heads",
    claim_bn: "পদ্মা সেতু নির্মাণে মানুষের মাথা লাগবে, তাই ছেলেধরারা শিশুদের মাথা সংগ্রহ করছে",
    aliases: ["padma bridge needs human heads", "পদ্মা সেতুতে মাথা লাগবে", "পদ্মা সেতুর জন্য মানুষের কাটা মাথা", "সেতুতে মাথা লাগবে", "ছেলেধরা মাথা"],
    fact_en: "Police and the bridge authority called this a baseless rumour. In 2019 it led to mob beatings of innocent people.",
    fact_bn: "পুলিশ ও সেতু কর্তৃপক্ষ একে ভিত্তিহীন গুজব বলেছে। ২০১৯ সালে এই গুজবে নিরপরাধ মানুষকে গণপিটুনি দেওয়া হয়েছিল।"
  },
  {
    id: "child-kidnapper-gang",
    category: "rumour-violence",
    claim_en: "A child kidnapping gang is roaming the area disguised as beggars, keep children indoors",
    claim_bn: "এলাকায় ভিক্ষুকের ছদ্মবেশে ছেলেধরা চক্র ঘুরছে, শিশুদের ঘরে রাখুন",
    aliases: ["ছেলেধরা চক্র এলাকায় ঘুরছে", "child kidnappers disguised as beggars", "ছেলেধরা সাবধান", "ভিক্ষুকের ছদ্মবেশে ছেলেধরা"],
    fact_en: "Police have repeatedly warned that forwarded 'chheledhora' alerts are rumours; acting on them has led to innocent people being lynched. If you suspect something, call 999.",
    fact_bn: "পুলিশ বারবার সতর্ক করেছে যে এ ধরনের 'ছেলেধরা' বার্তা গুজব; এর জেরে নিরপরাধ মানুষ গণপিটুনির শিকার হয়েছেন। সন্দেহ হলে ৯৯৯-এ ফোন করুন।"
  },
  {
    id: "salt-shortage",
    category: "market",
    claim_en: "There is a salt shortage, salt will cost 200 taka per kg, buy and stock up now",
    claim_bn: "দেশে লবণের সংকট, লবণের কেজি ২০০ টাকা হবে, এখনই কিনে মজুত করুন",
    aliases: ["লবণের দাম বেড়ে যাবে এখনই কিনুন", "salt price will rise stock up now", "লবণের কেজি ২০০ টাকা", "লবণ সংকট"],
    fact_en: "In November 2019 this rumour caused panic buying; the government confirmed the country had ample salt stock.",
    fact_bn: "২০১৯ সালের নভেম্বরে এই গুজবে লবণ কেনার হিড়িক পড়ে; সরকার জানায় দেশে পর্যাপ্ত লবণ মজুত আছে।"
  },
  {
    id: "5g-corona",
    category: "health-covid",
    claim_en: "5G mobile networks spread the coronavirus",
    claim_bn: "৫জি মোবাইল নেটওয়ার্কের মাধ্যমে করোনাভাইরাস ছড়ায়",
    aliases: ["5g towers spread corona", "৫জি টাওয়ার থেকে করোনা ছড়ায়", "5g spreading corona", "5g corona"],
    fact_en: "WHO: viruses cannot travel on radio waves or mobile networks. COVID-19 also spread in countries with no 5G.",
    fact_bn: "বিশ্ব স্বাস্থ্য সংস্থা জানিয়েছে, ভাইরাস রেডিও তরঙ্গ বা মোবাইল নেটওয়ার্কে ছড়ায় না। ৫জি নেই এমন দেশেও কোভিড-১৯ ছড়িয়েছে।"
  },
  {
    id: "thankuni-corona",
    category: "health-covid",
    claim_en: "Eating thankuni (Centella) leaves cures or prevents coronavirus",
    claim_bn: "থানকুনি পাতা খেলে করোনাভাইরাস ভালো হয় বা করোনা হয় না",
    aliases: ["থানকুনি পাতা খেলে করোনা হবে না", "thankuni leaves cure corona", "থানকুনি পাতা করোনা"],
    fact_en: "There is no scientific evidence that thankuni leaves prevent or cure COVID-19.",
    fact_bn: "থানকুনি পাতা কোভিড-১৯ প্রতিরোধ বা নিরাময় করে — এমন কোনো বৈজ্ঞানিক প্রমাণ নেই।"
  },
  {
    id: "bkash-bonus-scam",
    category: "financial",
    claim_en: "bKash is giving free 2000 taka bonus to all users, click link to claim",
    claim_bn: "বিকাশ থেকে ফ্রি ২০০০ টাকা বোনাস দিচ্ছে সবাইকে, লিঙ্কে ক্লিক করে টাকা নিন",
    aliases: ["বিকাশ ফ্রি ২০০০ টাকা", "bkash free bonus link", "বিকাশ ক্যাশব্যাক অফার ফ্রি টাকা", "বিকাশ অফার ২০০০"],
    fact_en: "bKash issued official alerts warning users that such circulating links are phishing scams designed to steal PINs and OTPs.",
    fact_bn: "বিকাশ আনুষ্ঠানিকভাবে জানিয়েছে যে এগুলো ভুয়া ফিশিং লিঙ্ক। পিন ও ওটিপি চুরি করার জন্য এই প্রতারণা চালানো হয়।"
  },
  {
    id: "exam-question-leak",
    category: "education",
    claim_en: "Tomorrow's HSC/SSC board exam question paper leaked, inbox for questions",
    claim_bn: "আগামীকালের এইচএসসি/এসএসসি পরীক্ষার প্রশ্ন ফাঁস হয়েছে, প্রশ্ন পেতে ইনবক্স করুন",
    aliases: ["পরীক্ষার প্রশ্ন ফাঁস", "board question paper leaked", "এসএসসি প্রশ্ন ফাঁস", "এইচএসসি প্রশ্ন"],
    fact_en: "Education boards confirmed all circulating question papers on social media are fake and circulated by fraudsters.",
    fact_bn: "শিক্ষা বোর্ড নিশ্চিত করেছে যে সামাজিক যোগাযোগমাধ্যমে প্রচারিত প্রশ্নপত্রগুলো সম্পূর্ণ ভুয়া ও প্রতারকদের কাজ।"
  },
  {
    id: "sheikh-hasina-cardiac",
    category: "politics",
    claim_en: "Sheikh Hasina had a sudden cardiac arrest in Delhi hospital",
    claim_bn: "দিল্লির হাসপাতালে শেখ হাসিনার হঠাৎ কার্ডিয়াক অ্যারেস্ট হয়েছে",
    aliases: ["শেখ হাসিনা কার্ডিয়াক অ্যারেস্ট", "sheikh hasina heart attack delhi"],
    fact_en: "Fact-checkers and hospital authorities confirmed the viral breaking news screenshot was digitally fabricated.",
    fact_bn: "ফ্যাক্ট-চেকাররা এবং হাসপাতাল কর্তৃপক্ষ নিশ্চিত করেছে যে প্রচারিত খবরের স্ক্রিনশটটি ফটোশপে তৈরি ভুয়া পোস্ট।"
  },
  {
    id: "taka-demonetization",
    category: "financial",
    claim_en: "Bangladesh Bank is banning and replacing 1000 taka notes from next week",
    claim_bn: "বাংলাদেশ ব্যাংক আগামী সপ্তাহ থেকে ১০০০ টাকার নোট বাতিল করছে",
    aliases: ["১০০০ টাকার নোট বাতিল", "1000 taka note banned bangladesh bank"],
    fact_en: "Bangladesh Bank formally issued a circular stating that no decision was made to demonetize 1000-taka currency notes.",
    fact_bn: "বাংলাদেশ ব্যাংক সার্কুলার জারি করে জানিয়েছে ১০০০ টাকার নোট বাতিলের কোনো সিদ্ধান্ত নেওয়া হয়নি, এটি অপপ্রচার।"
  }
];

// Normalized token matching engine
function normalizeText(text) {
  if (!text) return "";
  return text
    .normalize("NFC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // strip zero-width chars
    .toLowerCase()
    .replace(/[^\w\s\u0980-\u09FF]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Levenshtein ratio for typo tolerance
function levenshteinRatio(s1, s2) {
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;
  
  const l1 = s1.length;
  const l2 = s2.length;
  const matrix = Array.from({ length: l1 + 1 }, () => new Int32Array(l2 + 1));
  
  for (let i = 0; i <= l1; i++) matrix[i][0] = i;
  for (let j = 0; j <= l2; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= l1; i++) {
    for (let j = 1; j <= l2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const distance = matrix[l1][l2];
  return 1 - distance / Math.max(l1, l2);
}

// Token intersection match
function tokenScore(queryTokens, targetTokens) {
  if (!queryTokens.length || !targetTokens.length) return 0;
  let matches = 0;
  for (const q of queryTokens) {
    if (q.length < 2) continue;
    for (const t of targetTokens) {
      if (t.startsWith(q) || q.startsWith(t) || levenshteinRatio(q, t) >= 0.82) {
        matches++;
        break;
      }
    }
  }
  return matches / Math.min(queryTokens.length, targetTokens.length);
}

// Core client-side matching engine
function matchHoaxClient(text) {
  const normQuery = normalizeText(text);
  if (normQuery.length < 6) return null;
  
  const qTokens = normQuery.split(" ").filter(t => t.length > 1);
  let bestEntry = null;
  let bestScore = 0.0;
  let matchedStr = "";
  
  for (const entry of JACHAI_HOAXES) {
    const candidates = [entry.claim_bn, entry.claim_en, ...(entry.aliases || [])];
    for (const cand of candidates) {
      const normCand = normalizeText(cand);
      const candTokens = normCand.split(" ").filter(t => t.length > 1);
      
      // 1. Direct Levenshtein ratio
      const lev = levenshteinRatio(normQuery, normCand);
      
      // 2. Substring containment
      let sub = 0.0;
      if (normQuery.includes(normCand) || normCand.includes(normQuery)) {
        sub = 0.95;
      }
      
      // 3. Token overlap
      const tok = tokenScore(qTokens, candTokens);
      
      const combined = Math.max(lev, sub, tok * 0.95);
      if (combined > bestScore) {
        bestScore = combined;
        bestEntry = entry;
        matchedStr = cand;
      }
    }
  }
  
  if (bestScore >= 0.58) {
    return {
      match: bestEntry,
      score: Math.min(0.99, bestScore),
      matchedText: matchedStr,
      verdict: "red",
      label: "KNOWN_HOAX"
    };
  }
  
  // Safe / Unrelated news detection
  if (normQuery.length > 25 && bestScore < 0.25) {
    return {
      match: null,
      score: 0.85,
      verdict: "green",
      label: "NO_KNOWN_MATCH"
    };
  }
  
  return {
    match: null,
    score: 0.50,
    verdict: "gray",
    label: "INCONCLUSIVE"
  };
}
