/**
 * AnnotatedEssay — displays the essay text with highlighted grammar issues.
 * Tap a highlighted word to expand its tooltip with explanation + suggestions.
 */

import { useState } from 'react';
import { Text, View } from 'react-native';
import styles from '../styles';

export default function AnnotatedEssay({ text, annotations }) {
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

    segments.push({
      type: 'issue',
      text: text.substring(a.offset, a.offset + a.length),
      index: i,
      annotation: a,
    });
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
              onPress={() =>
                setExpandedIndex(expandedIndex === seg.index ? null : seg.index)
              }
            >
              {seg.text}
            </Text>
          );
        })}
      </Text>

      {expandedIndex !== null && sorted[expandedIndex] && (
        <View style={styles.tooltipBox}>
          <Text style={styles.tooltipCategory}>
            {sorted[expandedIndex].category}
          </Text>
          <Text style={styles.tooltipMessage}>
            {sorted[expandedIndex].message}
          </Text>
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
