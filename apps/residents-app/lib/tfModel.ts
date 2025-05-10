import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

let model: tf.GraphModel | null = null;

export async function loadModel() {
  await tf.ready();

  const modelJson = require('../assets/model/model.json');
  const modelWeights = [
    require('../assets/model/group1-shard1of3.bin'),
    require('../assets/model/group1-shard2of3.bin'),
    require('../assets/model/group1-shard3of3.bin'),
  ];

  model = await tf.loadGraphModel(bundleResourceIO(modelJson, modelWeights));
}

export async function classifyImage(tensor: tf.Tensor3D): Promise<'fire' | 'road'> {
  if (!model) throw new Error('Model not loaded');

  const prediction = model.predict(tensor.expandDims(0)) as tf.Tensor;
  const values = await prediction.data();

  const predictedIndex = values[0] > values[1] ? 0 : 1;
  return predictedIndex === 0 ? 'fire' : 'road';
}
