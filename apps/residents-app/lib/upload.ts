import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';
import 'react-native-url-polyfill/auto';

export async function uploadImageToSupabase(uri: string, label: string) {
  const filename = `${label}_${Date.now()}.jpg`;
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const file = Buffer.from(base64, 'base64');

  const { error } = await supabase.storage
    .from('responders-uploads')
    .upload(`${label}/${filename}`, file, {
      contentType: 'image/jpeg',
    });

  if (error) throw error;

  const { data } = supabase.storage.from('responders-uploads').getPublicUrl(`${label}/${filename}`);
  return data.publicUrl;
}
