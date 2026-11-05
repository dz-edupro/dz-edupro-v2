const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SolveRequest {
  input: string;
  subject?: string;
  imageData?: string; // base64 data URL
}

interface AIStep {
  title: string;
  text?: string;
  bullets?: string[];
  math?: string;
}

interface AIResponse {
  subjectAr: string;
  topic: string;
  summary: string;
  steps: AIStep[];
}

type AIErrorCode = "INVALID_API_KEY" | "API_KEY_MISSING" | "AI_UNAVAILABLE";

const AI_ERROR_MESSAGES: Record<AIErrorCode, string> = {
  INVALID_API_KEY:
    "مفتاح الذكاء الاصطناعي غير صالح أو منتهي الصلاحية. يرجى التحقق من المفتاح المحفوظ في قسم Secrets ثم إعادة المحاولة.",
  API_KEY_MISSING:
    "لم يتم إعداد مفتاح الذكاء الاصطناعي بعد. يرجى إضافته في قسم Secrets.",
  AI_UNAVAILABLE: "خدمة الذكاء الاصطناعي غير متاحة حالياً. حاول مرة أخرى بعد قليل.",
};

class AIProviderError extends Error {
  code: AIErrorCode;
  constructor(code: AIErrorCode) {
    super(code);
    this.code = code;
  }
}

class ProviderAuthError extends Error {}

function providerError(name: string, status: number, body: string): Error {
  const message = `${name} API error ${status}: ${body.slice(0, 500)}`;
  return status === 401 || status === 403 ? new ProviderAuthError(message) : new Error(message);
}

const SYSTEM_PROMPT = `أنت معلم خبير في النظام التعليمي الجزائري. مهمتك الوحيدة: حل التمرين المرفوع حلّاً علمياً نهائياً ومباشراً.

قاعدة مطلقة — ممنوع منعاً باتاً:
- لا تكتب أبداً نصوصاً توضيحية لكيفية الحل أو قواعد المنهجية.
- لا تكتب "نقرأ الوثيقة" أو "نحدد المعطيات" أو "نستدعي القوانين" أو أي جملة تصف الخطوة بدلاً من تنفيذها.
- لا تكتب "نحلل..." أو "نستخرج..." أو "نصيغ..." — بدلاً من ذلك نفّذ التحليل والاستخراج والصياغة فعلياً.
- ممنوع كتابة إرشادات عامة مثل "حدد المطلوب" أو "ربط المعطيات بالنظرية" — استبدلها بالحل الفعلي.
- استخدم عناوين المنهجية الجزائرية كعناوين فقط، لكن تحتها اكتب الحل الحقيقي المطبّق على معطيات هذا التمرين بالذات.

لكل مادة، هذا ما يجب كتابته تحت كل عنوان — حلاً تطبيقياً فعلياً وليس شرحاً للمنهجية:

علوم الطبيعة والحياة (SVT):
- أ) استغلال الوثيقة: اكتب تحليل معطيات الوثيقة المرفوعة فعلياً — اذكر الأرقام والقيم والملاحظات الموجودة في الوثيقة بالذات وادلل عليها.
- ب) الاستنتاج العلمي: اكتب الاستنتاج العلمي المباشر المأخوذ من معطيات هذه الوثيقة تحديداً.
- ج) تمحيص الفرضيات (إن وجدت): اكتب الفرضية المحددة لهذا التمرين واختبرها بمعطيات الوثيقة.
- د) التركيب والربط النهائي: اكتب الإجابة النهائية المباشرة على سؤال التمرين.

رياضيات / تقني رياضي:
- الخطوة 1: المعطيات: اكتب المعطيات الفعلية للتمرين (الدالة، الأعداد، الشروط...) والمطلوب بالضبط.
- الخطوة 2: القوانين: اكتب القوانين المستخدمة في حل هذا التمرين بالذات مع الصيغ الرياضية.
- الخطوة 3: البرهان والحسابات: اكتب الحسابات والاستدلالات الفعلية خطوة بخطوة بأرقام ومعطيات هذا التمرين.
- الخطوة 4: النتيجة النهائية: اكتب النتيجة النهائية العددية أو الرياضية للتمرين.

بقية المواد: استخدم عناوين منهجية مناسبة واكتب تحتها الإجابة الفعلية المطبّقة على معطيات التمرين.

أرجع النتيجة بصيغة JSON فقط، بدون أي نص قبل أو بعد:
{
  "subjectAr": "اسم المادة بالعربية",
  "topic": "عنوان مختصر للموضوع",
  "summary": "ملخص الحل في جملة أو جملتين",
  "steps": [
    {
      "title": "عنوان الخطوة",
      "text": "الحل الفعلي المطبّق على معطيات هذا التمرين تحديداً",
      "bullets": ["نقطة حل فعلية 1", "نقطة حل فعلية 2"],
      "math": "صيغة رياضية بصيغة LaTeX إن وجدت"
    }
  ]
}`;

function buildUserPrompt(input: string, subject: string | undefined, hasImage: boolean): string {
  const subjectLine = subject
    ? `المادة: ${subject}`
    : "المادة: يرجى كشف المادة من محتوى التمرين";

  const contentLine = hasImage
    ? "تم إرفاق صورة للتمرين. اقرأ التمرين من الصورة وحله فعلياً."
    : `نص التمرين:\n${input}`;

  return `${subjectLine}\n\n${contentLine}\n\nحل هذا التمرين تحديداً حلّاً علمياً نهائياً ومباشراً. طبّق خطوات المنهجية على معطيات هذا التمرين بالذات — اكتب الأرقام والقيم والاستنتاجات الفعلية، وليس شرحاً عاماً لما يجب فعله. ممنوع كتابة نصوص توضيحية للمنهجية. أرجع JSON فقط.`;
}

const REQUEST_TIMEOUT_MS = 60_000;
const MAX_ATTEMPTS = 3;

async function fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
  for (let attempt = 1; ; attempt++) {
    try {
      const resp = await fetch(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
      const retryable = resp.status === 429 || resp.status >= 500;
      if (!retryable || attempt >= MAX_ATTEMPTS) return resp;
      await resp.body?.cancel();
    } catch (err) {
      if (attempt >= MAX_ATTEMPTS) throw err;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
  }
}

/**
 * Call Groq (OpenAI-compatible endpoint) with a text-only model.
 */
async function callGroq(prompt: string): Promise<string> {
  const apiKey = Deno.env.get("GROQ_API_KEY");
  if (!apiKey) {
    throw new Error("GROQ_API_KEY secret not configured");
  }

  const url = "https://api.groq.com/openai/v1/chat/completions";

  const model = "llama-3.3-70b-versatile";

  const body = {
    model,
    max_tokens: 4096,
    temperature: 0.3,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
  };

  const resp = await fetchWithRetry(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    throw providerError("Groq", resp.status, errText);
  }

  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("Groq returned empty response");
  }
  return text;
}

async function callClaude(prompt: string, imageBase64: string | null): Promise<string> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY secret not configured");
  }

  const url = "https://api.anthropic.com/v1/messages";

  const content: Array<Record<string, unknown>> = [];

  if (imageBase64) {
    const [mimeType, data] = imageBase64.includes(",")
      ? [imageBase64.split(",")[0].match(/data:(.*?);/)?.[1] ?? "image/jpeg", imageBase64.split(",")[1]]
      : ["image/jpeg", imageBase64];

    content.push({
      type: "image",
      source: { type: "base64", media_type: mimeType, data },
    });
  }

  content.push({ type: "text", text: prompt });

  const body = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content }],
  };

  const resp = await fetchWithRetry(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    throw providerError("Claude", resp.status, errText);
  }

  const data = await resp.json();
  const text = data?.content?.[0]?.text;
  if (!text) {
    throw new Error("Claude returned empty response");
  }
  return text;
}

/**
 * Try Groq first; if it fails, fall back to Claude. Collect detailed error
 * messages from both so the user can see exactly why a provider failed.
 */
async function callAI(prompt: string, imageBase64: string | null): Promise<string> {
  // Groq's model is text-only, so photo requests skip it.
  const providers = [
    { keyName: "GROQ_API_KEY", call: callGroq, textOnly: true },
    { keyName: "ANTHROPIC_API_KEY", call: callClaude, textOnly: false },
  ].filter((p) => !(imageBase64 && p.textOnly));
  let configured = 0;
  let authFailures = 0;

  for (const { keyName, call } of providers) {
    if (!Deno.env.get(keyName)) continue;
    configured++;
    try {
      return await call(prompt, imageBase64);
    } catch (err) {
      console.error(`${keyName} request failed:`, err);
      if (err instanceof ProviderAuthError) authFailures++;
    }
  }

  if (configured === 0) throw new AIProviderError("API_KEY_MISSING");
  if (authFailures > 0) throw new AIProviderError("INVALID_API_KEY");
  throw new AIProviderError("AI_UNAVAILABLE");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body: SolveRequest = await req.json();
    const { input, subject, imageData } = body;

    if (!input?.trim() && !imageData) {
      return new Response(JSON.stringify({ error: "الرجاء إدخال نص التمرين أو رفع صورة" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = buildUserPrompt(input || "", subject, !!imageData);
    const rawResult = await callAI(userPrompt, imageData ?? null);

    let parsed: AIResponse;
    try {
      const cleaned = rawResult.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        subjectAr: subject ?? "مادة عامة",
        topic: "حل التمرين",
        summary: rawResult.slice(0, 200),
        steps: [{ title: "الحل", text: rawResult }],
      };
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    if (err instanceof AIProviderError) {
      return new Response(JSON.stringify({ error: AI_ERROR_MESSAGES[err.code], code: err.code }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("solve-homework failed:", err);
    const message = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
