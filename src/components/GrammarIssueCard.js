/**
 * GrammarIssueCard — a single card showing one grammar issue
 * with its category, original text, explanation, and suggestions.
 */

import { Text, View } from 'react-native';
import styles from '../styles';

export default function GrammarIssueCard({ issue, index }) {
  return (
    <View style={styles.issueCard}>
      <View style={styles.issueHeader}>
        <Text style={styles.issueNumber}>#{index + 1}</Text>
        <Text style={styles.issueCategory}>{issue.category}</Text>
      </View>
      <Text style={styles.issueOriginal}>"{issue.original}"</Text>
      <Text style={styles.issueMessage}>{issue.message}</Text>
      {issue.replacements.length > 0 && (
        <Text style={styles.issueSuggestion}>
          💡 {issue.replacements.join(', ')}
        </Text>
      )}
    </View>
  );
}
