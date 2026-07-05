import sys
import os
import tensorflow as tf
import numpy as np
from PIL import Image

# Import class names list
from cnn.classes import CLASS_NAMES

def load_and_predict(image_path, model_path="models/plantvillage_cnn.h5"):
    if not os.path.exists(image_path):
        print(f"Error: Target image file not found at: {image_path}")
        return None

    if not os.path.exists(model_path):
        print(f"Error: Model file not found at: {model_path}. Please train your model using cnn/train.py first.")
        return None

    try:
        print("Loading TensorFlow Keras Model...")
        model = tf.keras.models.load_model(model_path)
        
        print("Preprocessing target leaf image...")
        img = Image.open(image_path).resize((224, 224))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        print("Executing model classification...")
        predictions = model.predict(img_array)
        class_idx = np.argmax(predictions[0])
        confidence = float(np.max(predictions[0]) * 100)
        predicted_disease = CLASS_NAMES[class_idx]

        print("-" * 40)
        print(f"Predicted Class: {predicted_disease}")
        print(f"Confidence score: {confidence:.2f}%")
        print("-" * 40)
        return predicted_disease, confidence
    except Exception as e:
        print(f"Inference execution failed: {e}")
        return None

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python predict.py <path_to_leaf_image>")
    else:
        load_and_predict(sys.argv[1])
