import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import type { CameraCapturedPicture, Camera as CameraType } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as tf from '@tensorflow/tfjs';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import { classifyImage, loadModel } from '../lib/tfModel';
import { getCurrentLocation } from '../lib/location';
import { uploadImageToSupabase } from '../lib/upload';
import { submitIncident } from '../lib/firestore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const cameraRef = useRef<CameraType | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    (async () => {
      await tf.ready();
      await loadModel();
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;

    setLoading(true);
    try {
      const photo: CameraCapturedPicture = await cameraRef.current.takePictureAsync({ skipProcessing: true });
      const location = await getCurrentLocation();

      const resized = await ImageManipulator.manipulateAsync(photo.uri, [
        { resize: { width: 224, height: 224 } }
      ], { format: ImageManipulator.SaveFormat.JPEG });

      const base64 = await FileSystem.readAsStringAsync(resized.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const raw = tf.util.encodeString(base64, 'base64').buffer;
      const uint8 = new Uint8Array(raw);
      const imageTensor = decodeJpeg(uint8) as tf.Tensor3D;

      const label = await classifyImage(imageTensor.toFloat().div(255));
      setPrediction(label);

      const photoUrl = await uploadImageToSupabase(resized.uri, label);

      await submitIncident({
        type: label as 'fire' | 'road',
        photoUrl,
        location,
      });

      Alert.alert('✅ Incident Submitted', `Classified as: ${label}`);
      navigation.navigate('Success');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }

    setLoading(false);
    setPrediction(null);
  };

  if (hasPermission === null) return <ActivityIndicator />;
  if (hasPermission === false) return <Text>No camera access</Text>;

  return (
    <View style={styles.container}>
      <Camera ref={cameraRef} style={styles.camera} />
      <Button title="Capture & Classify" onPress={handleTakePhoto} disabled={loading} />
      {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
      {prediction && (
        <Text style={styles.result}>🧠 Predicted: {prediction.toUpperCase()}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1, marginBottom: 10 },
  result: { fontSize: 18, textAlign: 'center', marginTop: 20 },
});
