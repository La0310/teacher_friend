import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

// ─── Helpers ──────────────────────────────────────────────

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countParagraphs(text) {
  return text.trim().split(/\n\s*\n/).filter(Boolean).length || 1;
}

async function analyzeWithGemini(text) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
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
      }
    );

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

// ─── Main App ─────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState('input'); // 'input' or 'results'

  // Input screen state
  const [photoUri, setPhotoUri] = useState(null);
  const [transcription, setTranscription] = useState(
    '[transcription will appear here once connected]'
  );
  const [transcribeLoading, setTranscribeLoading] = useState(false);
  const [transcribed, setTranscribed] = useState(false);

  // Results state
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [annotations, setAnnotations] = useState([]);

  // ── Photo picking ──

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      setTranscribed(false);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Camera access is required to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      setTranscribed(false);
    }
  };

  // ── Transcribe (Gemini) ──

  const handleTranscribe = async () => {
    if (!photoUri) return;
    setTranscribeLoading(true);

    try {
      const base64 = await FileSystem.readAsStringAsync(photoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
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
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', response.status, errorText);
        Alert.alert('Error', 'Failed to transcribe. Check your API key and try again.');
        return;
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      setTranscription(text);
      setTranscribed(true);
    } catch (err) {
      console.error('Transcription error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setTranscribeLoading(false);
    }
  };

  // ── Analyze (LanguageTool + counts) ──

  const handleAnalyze = async () => {
    const text = transcription.trim();
    if (!text) {
      Alert.alert('No text', 'Please transcribe or type some text first.');
      return;
    }

    setAnalyzeLoading(true);

    try {
      const grammarIssues = await analyzeWithGemini(text);

      setStats({
        wordCount: countWords(text),
        paragraphCount: countParagraphs(text),
        grammarIssueCount: grammarIssues.length,
      });
      setAnnotations(grammarIssues);
      setScreen('results');
    } catch (err) {
      console.error('Analysis error:', err);
      Alert.alert('Error', 'Analysis failed. Please try again.');
    } finally {
      setAnalyzeLoading(false);
    }
  };

  // ── Back to input ──

  const handleBack = () => {
    setScreen('input');
  };

  // ─── Input Screen ──────────────────────────────────────

  if (screen === 'input') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <StatusBar style="dark" />
        <Text style={styles.title}>Essay Input</Text>

        {/* Photo capture buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Text style={styles.buttonText}>📷 Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>🖼️ Choose Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Photo preview */}
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="contain" />
        ) : (
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>No photo selected</Text>
          </View>
        )}

        {/* Transcribe button */}
        <TouchableOpacity
          style={[styles.transcribeButton, (!photoUri || transcribeLoading) && styles.buttonDisabled]}
          onPress={handleTranscribe}
          disabled={!photoUri || transcribeLoading}
        >
          {transcribeLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.actionButtonText}>Transcribe</Text>
          )}
        </TouchableOpacity>

        {/* Editable transcription */}
        <Text style={styles.label}>Transcription (edit if needed)</Text>
        <TextInput
          style={styles.textInput}
          multiline
          value={transcription}
          onChangeText={(text) => {
            setTranscription(text);
            setTranscribed(true);
          }}
          placeholder="Transcription text..."
        />

        {/* Analyze button — only shows after transcription */}
        {transcribed && (
          <TouchableOpacity
            style={[styles.analyzeButton, analyzeLoading && styles.buttonDisabled]}
            onPress={handleAnalyze}
            disabled={analyzeLoading}
          >
            {analyzeLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>✅ Analyze Essay</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  }

  // ─── Results Screen ────────────────────────────────────

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />

      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>← Back to Essay</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Results</Text>

      {/* Stats cards */}
      {stats && (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.wordCount}</Text>
            <Text style={styles.statLabel}>Words</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.paragraphCount}</Text>
            <Text style={styles.statLabel}>Paragraphs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, stats.grammarIssueCount > 0 && styles.statWarning]}>
              {stats.grammarIssueCount}
            </Text>
            <Text style={styles.statLabel}>Grammar Issues</Text>
          </View>
        </View>
      )}

      {/* Annotated essay */}
      <Text style={styles.label}>Essay with Annotations</Text>
      <AnnotatedEssay text={transcription} annotations={annotations} />

      {/* Grammar issues list */}
      {annotations.length > 0 && (
        <>
          <Text style={[styles.label, { marginTop: 20 }]}>Grammar Issues</Text>
          {annotations.map((a, i) => (
            <GrammarIssueCard key={i} issue={a} index={i} />
          ))}
        </>
      )}

      {annotations.length === 0 && (
        <View style={styles.noIssuesBox}>
          <Text style={styles.noIssuesText}>🎉 No grammar issues found!</Text>
        </View>
      )}
    </ScrollView>
  );
}

// ─── Annotated Essay Component ────────────────────────────

function AnnotatedEssay({ text, annotations }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (annotations.length === 0) {
    return <Text style={styles.essayText}>{text}</Text>;
  }

  // Build segments: plain text + highlighted issues
  const segments = [];
  let lastEnd = 0;

  // Sort annotations by offset
  const sorted = [...annotations].sort((a, b) => a.offset - b.offset);

  sorted.forEach((a, i) => {
    // Plain text before this issue
    if (a.offset > lastEnd) {
      segments.push({ type: 'plain', text: text.substring(lastEnd, a.offset) });
    }

    segments.push({ type: 'issue', text: text.substring(a.offset, a.offset + a.length), index: i, annotation: a });
    lastEnd = a.offset + a.length;
  });

  // Remaining text
  if (lastEnd < text.length) {
    segments.push({ type: 'plain', text: text.substring(lastEnd) });
  }

  return (
    <View style={styles.essayBox}>
      <Text style={styles.essayText}>
        {segments.map((seg, i) => {
          if (seg.type === 'plain') {
            return <Text key={i}>{seg.text}</Text>;
          }
          return (
            <Text
              key={i}
              style={styles.highlightedText}
              onPress={() => setExpandedIndex(expandedIndex === seg.index ? null : seg.index)}
            >
              {seg.text}
            </Text>
          );
        })}
      </Text>

      {expandedIndex !== null && sorted[expandedIndex] && (
        <View style={styles.tooltipBox}>
          <Text style={styles.tooltipCategory}>{sorted[expandedIndex].category}</Text>
          <Text style={styles.tooltipMessage}>{sorted[expandedIndex].message}</Text>
          {sorted[expandedIndex].replacements.length > 0 && (
            <Text style={styles.tooltipSuggestion}>
              💡 Suggestion: {sorted[expandedIndex].replacements.join(', ')}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Grammar Issue Card ──────────────────────────────────

function GrammarIssueCard({ issue, index }) {
  return (
    <View style={styles.issueCard}>
      <View style={styles.issueHeader}>
        <Text style={styles.issueNumber}>#{index + 1}</Text>
        <Text style={styles.issueCategory}>{issue.category}</Text>
      </View>
      <Text style={styles.issueOriginal}>"{issue.original}"</Text>
      <Text style={styles.issueMessage}>{issue.message}</Text>
      {issue.replacements.length > 0 && (
        <Text style={styles.issueSuggestion}>💡 {issue.replacements.join(', ')}</Text>
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FAFAFA',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: -0.5,
  },

  // Photo buttons
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  buttonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },

  // Photo preview
  preview: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    marginBottom: 24,
    backgroundColor: '#F3F4F6',
  },
  placeholderBox: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#F3F4F6',
  },
  placeholderText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },

  // Labels
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },

  // Text input
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    minHeight: 140,
    textAlignVertical: 'top',
    marginBottom: 24,
  },

  // Action buttons
  transcribeButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  analyzeButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Back button
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -1,
  },
  statWarning: {
    color: '#000000',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Annotated essay
  essayBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  essayText: {
    fontSize: 16,
    lineHeight: 28,
    color: '#111827',
  },
  highlightedText: {
    backgroundColor: '#FEF08A',
    color: '#111827',
    fontWeight: '600',
  },

  // Tooltip
  tooltipBox: {
    marginTop: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tooltipCategory: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tooltipMessage: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 8,
  },
  tooltipSuggestion: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },

  // No issues
  noIssuesBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  noIssuesText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '700',
  },

  // Issue cards
  issueCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  issueNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  issueCategory: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  issueOriginal: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '700',
    marginBottom: 8,
  },
  issueMessage: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 8,
  },
  issueSuggestion: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },
});
