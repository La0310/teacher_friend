/**
 * ResultsScreen — shows essay stats, annotated text, and grammar issue cards.
 */

import { Text, View, TouchableOpacity } from 'react-native';
import AnnotatedEssay from '../components/AnnotatedEssay';
import GrammarIssueCard from '../components/GrammarIssueCard';
import styles from '../styles';

export default function ResultsScreen({ stats, annotations, transcription, onBack }) {
  return (
    <>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
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
            <Text
              style={[
                styles.statNumber,
                stats.grammarIssueCount > 0 && styles.statWarning,
              ]}
            >
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
    </>
  );
}
