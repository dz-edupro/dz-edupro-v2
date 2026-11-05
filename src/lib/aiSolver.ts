import type { SolverSolution, SolverStep } from '@/lib/solver';
import type { SubjectKey } from '@/lib/constants';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

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

const GENERIC_ERROR = 'خدمة الذكاء الاصطناعي غير متاحة حالياً. حاول مرة أخرى بعد قليل.';

function buildUserPrompt(input: string, subjectAr: string | undefined): string {
  const subjectLine = subjectAr
    ? `المادة: ${subjectAr}`
    : 'المادة: يرجى كشف المادة من محتوى التمرين';

  return `${subjectLine}\n\nنص التمرين:\n${input}\n\nحل هذا التمرين تحديداً حلّاً علمياً نهائياً ومباشراً. طبّق خطوات المنهجية على معطيات هذا التمرين بالذات — اكتب الأرقام والقيم والاستنتاجات الفعلية، وليس شرحاً عاماً لما يجب فعله. ممنوع كتابة نصوص توضيحية للمنهجية. أرجع JSON فقط.`;
}

function isStep(value: unknown): value is SolverStep {
  return typeof value === 'object' && value !== null && typeof (value as SolverStep).title === 'string';
}

export async function solveWithGroq(
  input: string,
  subjectKey: SubjectKey,
  subjectAr: string | undefined
): Promise<SolverSolution> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    console.error('VITE_GROQ_API_KEY is not set');
    throw new Error('مفتاح الذكاء الاصطناعي غير مُعدّ في التطبيق بعد.');
  }

  let resp: Response;
  try {
    resp = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.3,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(input, subjectAr) },
        ],
      }),
    });
  } catch (err) {
    console.error('Groq network request failed:', err);
    throw new Error(GENERIC_ERROR);
  }

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    console.error(`Groq API error ${resp.status}:`, errText);
    throw new Error(
      resp.status === 401 || resp.status === 403
        ? 'مفتاح الذكاء الاصطناعي غير صالح أو منتهي الصلاحية.'
        : GENERIC_ERROR
    );
  }

  const data = await resp.json().catch((err) => {
    console.error('Groq returned non-JSON body:', err);
    return null;
  });
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content) {
    console.error('Groq returned an empty response:', data);
    throw new Error(GENERIC_ERROR);
  }

  let parsed: Partial<SolverSolution>;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    console.error('Groq response was not valid JSON:', err, content);
    throw new Error(GENERIC_ERROR);
  }

  if (!Array.isArray(parsed.steps) || !parsed.steps.every(isStep)) {
    console.error('Groq response has an unexpected shape:', parsed);
    throw new Error(GENERIC_ERROR);
  }

  return {
    subjectKey,
    subjectAr: parsed.subjectAr || subjectAr || 'مادة عامة',
    topic: parsed.topic || 'حل التمرين',
    summary: parsed.summary || '',
    steps: parsed.steps,
  };
}
