/**
 * Gemini AI service — handles transcription and grammar analysis.
 */

import * as FileSystem from 'expo-file-system/legacy';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`;

// ─── Transcribe a photo of handwriting ────────────────────

export async function transcribeImage(photoUri) {
  const base64 = await FileSystem.readAsStringAsync(photoUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: 'Transcribe this handwritten text exactly as written, including any spelling and grammar errors. Do not correct anything. Return only the transcribed text, nothing else.',
            },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', response.status, errorText);
    throw new Error('Failed to transcribe. Check your API key and try again.');
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

// ─── Analyze text for grammar issues ──────────────────────

export async function analyzeWithGemini(text) {
  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an expert English teacher grading a student's essay. Analyze the following text for grammar, punctuation, spelling, style, and structural issues.
Look for deep issues like subject-verb agreement, comma splices, awkward phrasing, and run-on sentences.
Return your analysis as a JSON array of objects. Each object must have:
- "original": The exact, verbatim substring from the text that contains the error. Make it long enough to be unique.
- "message": A clear explanation of the issue.
- "replacements": An array of 1-3 string suggestions to fix it.
- "category": A short uppercase category like "GRAMMAR", "PUNCTUATION", "STYLE", "TYPO".
If there are no issues, return an empty array [].
Do NOT wrap the JSON in markdown blocks. Return raw JSON only.

TEXT TO ANALYZE:
${text}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status);
      return [];
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';
    const issues = JSON.parse(resultText);

    return issues
      .map((issue) => {
        const offset = text.indexOf(issue.original);
        return {
          offset,
          length: issue.original.length,
          message: issue.message,
          replacements: issue.replacements || [],
          category: issue.category,
          original: issue.original,
        };
      })
      .filter((issue) => issue.offset !== -1);
  } catch (err) {
    console.error('Gemini Analysis error:', err);
    return [];
  }
}
