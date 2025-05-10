import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import os
import subprocess
import shutil
import json

# Config
DATASET_DIR = "dataset"
MODEL_DIR = "models"
TFJS_DIR = "tfjs_model"
TARGET_MODEL_PATH = "../apps/residents-app/assets/model"
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 10

# Prepare datasets
train_ds = ImageDataGenerator(rescale=1. / 255, validation_split=0.2)

train_generator = train_ds.flow_from_directory(
    DATASET_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    subset='training',
    class_mode='categorical'
)

val_generator = train_ds.flow_from_directory(
    DATASET_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    subset='validation',
    class_mode='categorical'
)

# Build model
base_model = tf.keras.applications.MobileNetV2(
    input_shape=IMG_SIZE + (3,),
    include_top=False,
    weights='imagenet',
    pooling='avg'
)

x = tf.keras.layers.Dense(128, activation='relu')(base_model.output)
output = tf.keras.layers.Dense(2, activation='softmax')(x)
model = tf.keras.Model(inputs=base_model.input, outputs=output)

model.compile(optimizer='adam',
              loss='categorical_crossentropy',
              metrics=['accuracy'])

model.fit(train_generator, validation_data=val_generator, epochs=EPOCHS)

# Save .h5 model
os.makedirs(MODEL_DIR, exist_ok=True)
h5_path = os.path.join(MODEL_DIR, "incident_classifier.h5")
model.save(h5_path)

# Convert to .tflite
tflite_model = tf.lite.TFLiteConverter.from_keras_model(model).convert()
with open(os.path.join(MODEL_DIR, "incident_classifier_model.tflite"), "wb") as f:
    f.write(tflite_model)

# Convert to TFJS format
if os.path.exists(TFJS_DIR):
    shutil.rmtree(TFJS_DIR)

subprocess.run([
    "tensorflowjs_converter",
    "--input_format=keras",
    h5_path,
    TFJS_DIR
], check=True)

# Copy to residents-app
os.makedirs(TARGET_MODEL_PATH, exist_ok=True)
for file in os.listdir(TFJS_DIR):
    src = os.path.join(TFJS_DIR, file)
    dst = os.path.join(TARGET_MODEL_PATH, file)
    shutil.copyfile(src, dst)

print("✅ Model trained, converted, and copied to residents-app.")

# Auto-bump version in app.json
app_json_path = os.path.join(TARGET_MODEL_PATH, "../../app.json")
try:
    with open(app_json_path, "r+") as f:
        data = json.load(f)
        version = data["expo"].get("version", "1.0.0")
        major, minor, patch = map(int, version.split("."))
        patch += 1
        new_version = f"{major}.{minor}.{patch}"
        data["expo"]["version"] = new_version
        f.seek(0)
        json.dump(data, f, indent=2)
        f.truncate()
        print(f"🔁 Bumped version to {new_version} in app.json")
except Exception as e:
    print(f"⚠️ Failed to bump version: {e}")

print("📦 Model is now live at: apps/residents-app/assets/model/")
print("🚀 To reload the Expo app: pnpm --filter residents-app start")