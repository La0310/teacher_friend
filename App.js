/**
 * App.js — main entry point.
 * Manages shared state and switches between Input and Results screens.
 */

import { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import InputScreen from './src/screens/InputScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import { analyzeWithGemini } from './src/services/gemini';
import { countWords, countParagraphs } from './src/utils/textStats';
import styles from './src/styles';

export default function App() {
  const [screen, setScreen] = useState('input'); // 'input' or 'results'

  // Input state
  const [photoUri, setPhotoUri] = useState(null);
  const [transcription, setTranscription] = useState(
    '[transcription will appear here once connected]'
  );
  const [transcribed, setTranscribed] = useState(false);

  // Results state
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [annotations, setAnnotations] = useState([]);

  // ── Analyze handler ──

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

  // ── Render ──

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />

      {screen === 'input' ? (
        <InputScreen
          photoUri={photoUri}
          setPhotoUri={setPhotoUri}
          transcription={transcription}
          setTranscription={setTranscription}
          transcribed={transcribed}
          setTranscribed={setTranscribed}
          onAnalyze={handleAnalyze}
          analyzeLoading={analyzeLoading}
        />
      ) : (
        <ResultsScreen
          stats={stats}
          annotations={annotations}
          transcription={transcription}
          onBack={() => setScreen('input')}
        />
      )}
    </ScrollView>
  );
}
