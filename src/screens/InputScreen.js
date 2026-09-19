/**
 * InputScreen — capture or pick a photo, transcribe handwriting, edit text.
 */

import { useState } from 'react';
import {
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { transcribeImage } from '../services/gemini';
import styles from '../styles';

export default function InputScreen({
  photoUri,
  setPhotoUri,
  transcription,
  setTranscription,
  transcribed,
  setTranscribed,
  onAnalyze,
  analyzeLoading,
}) {
  const [transcribeLoading, setTranscribeLoading] = useState(false);

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

  // ── Transcribe ──

  const handleTranscribe = async () => {
    if (!photoUri) return;
    setTranscribeLoading(true);

    try {
      const text = await transcribeImage(photoUri);
      setTranscription(text);
      setTranscribed(true);
    } catch (err) {
      console.error('Transcription error:', err);
      Alert.alert('Error', err.message || 'Something went wrong. Please try again.');
    } finally {
      setTranscribeLoading(false);
    }
  };

  // ── Render ──

  return (
    <>
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
          onPress={onAnalyze}
          disabled={analyzeLoading}
        >
          {analyzeLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.actionButtonText}>✅ Analyze Essay</Text>
          )}
        </TouchableOpacity>
      )}
    </>
  );
}
