/**
 * Shared styles used across all screens and components.
 */

import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  // ─── Layout ─────────────────────────────────────────────
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

  // ─── Photo Buttons ──────────────────────────────────────
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

  // ─── Photo Preview ──────────────────────────────────────
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

  // ─── Labels ─────────────────────────────────────────────
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },

  // ─── Text Input ─────────────────────────────────────────
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

  // ─── Action Buttons ─────────────────────────────────────
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

  // ─── Back Button ────────────────────────────────────────
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },

  // ─── Stats Cards ────────────────────────────────────────
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

  // ─── Annotated Essay ────────────────────────────────────
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

  // ─── Tooltip ────────────────────────────────────────────
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

  // ─── No Issues Box ──────────────────────────────────────
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

  // ─── Issue Cards ────────────────────────────────────────
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
