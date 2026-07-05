import os
import random
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, BatchNormalization
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from PIL import Image, ImageDraw

# Configuration
BATCH_SIZE = 16
IMAGE_SIZE = (224, 224)
EPOCHS = 10
DATASET_DIR = "dataset/plantvillage"  # Directory where dataset is structured
MODEL_SAVE_DIR = "models"
os.makedirs(MODEL_SAVE_DIR, exist_ok=True)

print("TensorFlow Version:", tf.__version__)

def generate_synthetic_dataset():
    """
    Generates a synthetic plant leaf disease dataset for training if empty.
    Creates healthy and diseased crop leaves with simulated pathology patterns.
    """
    print("\n--- Generating Synthetic Crop Leaf Dataset to Train More Data ---")
    categories = [
        "Tomato Late Blight", "Tomato Early Blight", "Tomato Healthy",
        "Potato Early Blight", "Potato Late Blight", "Potato Healthy",
        "Corn Common Rust", "Corn Healthy", "Pepper Bell Bacterial Spot", "Pepper Bell Healthy"
    ]
    
    samples_per_category = 30 # Generate 30 distinct samples per class
    
    for category in categories:
        category_dir = os.path.join(DATASET_DIR, category)
        os.makedirs(category_dir, exist_ok=True)
        
        # Check if directory already has images
        existing_files = [f for f in os.listdir(category_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        if len(existing_files) >= samples_per_category:
            print(f" -> Class '{category}' already populated with {len(existing_files)} files. Skipping synthesis.")
            continue
            
        print(f" -> Creating {samples_per_category} synthetic samples for '{category}'...")
        for i in range(samples_per_category):
            # Create base image (dark agricultural background soil)
            img = Image.new("RGB", IMAGE_SIZE, color=(35, 27, 18))
            draw = ImageDraw.Draw(img)
            
            # Draw leaf base (green ellipse)
            leaf_color = (46, 125, 50) # Standard green
            if "Healthy" in category:
                leaf_color = (27, 94, 32) # Rich deep healthy green
            elif "Blight" in category:
                leaf_color = (139, 195, 74) # Slightly pale green
                
            # Draw primary leaf shape
            draw.ellipse([40, 30, 184, 194], fill=leaf_color, outline=(15, 60, 20))
            
            # Draw leaf stem
            draw.line([112, 190, 112, 220], fill=(20, 50, 15), width=4)
            
            # Draw spots based on specific diseases
            if "Late Blight" in category:
                # Big dark brown necrotic spots
                for _ in range(5):
                    x = random.randint(60, 160)
                    y = random.randint(50, 170)
                    r = random.randint(10, 25)
                    draw.ellipse([x-r, y-r, x+r, y+r], fill=(62, 39, 35)) # Necrotic brown
            elif "Early Blight" in category:
                # Concentric yellow/brown spots
                for _ in range(8):
                    x = random.randint(60, 160)
                    y = random.randint(50, 170)
                    r = random.randint(6, 12)
                    draw.ellipse([x-r-2, y-r-2, x+r+2, y+r+2], fill=(244, 208, 63)) # Yellow halo
                    draw.ellipse([x-r, y-r, x+r, y+r], fill=(93, 64, 55)) # Brown center
            elif "Common Rust" in category:
                # Small raised reddish-orange pustules
                for _ in range(15):
                    x = random.randint(60, 160)
                    y = random.randint(50, 170)
                    r = random.randint(3, 7)
                    draw.ellipse([x-r, y-r, x+r, y+r], fill=(230, 81, 0)) # Rust orange
            elif "Bacterial Spot" in category:
                # Tiny black angular spots
                for _ in range(20):
                    x = random.randint(60, 160)
                    y = random.randint(50, 170)
                    r = random.randint(2, 5)
                    draw.ellipse([x-r, y-r, x+r, y+r], fill=(33, 33, 33)) # Near-black spot
            
            # Save the simulated image
            img.save(os.path.join(category_dir, f"sim_{i+1}.jpg"), "JPEG")
    
    print("--- Synthetic Data Synthesis Complete! ---\n")

def build_cnn_model(num_classes):
    """
    Builds an optimized deep Convolutional Neural Network (CNN) for leaf disease classification.
    """
    model = Sequential([
        # Block 1
        Conv2D(32, (3, 3), activation='relu', padding='same', input_shape=(224, 224, 3)),
        BatchNormalization(),
        Conv2D(32, (3, 3), activation='relu'),
        MaxPooling2D(pool_size=(2, 2)),
        Dropout(0.25),

        # Block 2
        Conv2D(64, (3, 3), activation='relu', padding='same'),
        BatchNormalization(),
        Conv2D(64, (3, 3), activation='relu'),
        MaxPooling2D(pool_size=(2, 2)),
        Dropout(0.25),

        # Block 3
        Conv2D(128, (3, 3), activation='relu', padding='same'),
        BatchNormalization(),
        Conv2D(128, (3, 3), activation='relu'),
        MaxPooling2D(pool_size=(2, 2)),
        Dropout(0.4),

        # Dense classification head
        Flatten(),
        Dense(512, activation='relu'),
        BatchNormalization(),
        Dropout(0.5),
        Dense(num_classes, activation='softmax')
    ])
    
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    return model

def main():
    # Make sure dataset structure exists or create it
    os.makedirs(DATASET_DIR, exist_ok=True)
    
    # Generate synthetic images if dataset is empty/partially populated
    generate_synthetic_dataset()

    # Advanced Data Augmentation to "train more data" variations
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=40,          # Increased from 25
        width_shift_range=0.25,     # Increased from 0.2
        height_shift_range=0.25,    # Increased from 0.2
        shear_range=0.25,           # Increased from 0.2
        zoom_range=0.25,            # Increased from 0.2
        brightness_range=[0.7, 1.3], # Added brightness augmentation!
        horizontal_flip=True,
        vertical_flip=True,         # Added vertical flip!
        fill_mode='nearest',
        validation_split=0.2        # 80-20 Train-Val Split
    )

    print("Loading augmented training samples...")
    train_generator = train_datagen.flow_from_directory(
        DATASET_DIR,
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training'
    )

    print("Loading augmented validation samples...")
    validation_generator = train_datagen.flow_from_directory(
        DATASET_DIR,
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation'
    )

    num_classes = train_generator.num_classes
    print(f"Detected {num_classes} categories of crop diseases.")

    # Instantiate Model
    model = build_cnn_model(num_classes)
    model.summary()

    # Callbacks
    early_stopping = EarlyStopping(
        monitor='val_loss',
        patience=4,
        restore_best_weights=True,
        verbose=1
    )

    model_checkpoint = ModelCheckpoint(
        filepath=os.path.join(MODEL_SAVE_DIR, 'plantvillage_cnn.h5'),
        monitor='val_accuracy',
        save_best_only=True,
        mode='max',
        verbose=1
    )

    print("Starting Model Training on Augmented Data...")
    history = model.fit(
        train_generator,
        steps_per_epoch=max(1, train_generator.samples // BATCH_SIZE),
        epochs=EPOCHS,
        validation_data=validation_generator,
        validation_steps=max(1, validation_generator.samples // BATCH_SIZE),
        callbacks=[early_stopping, model_checkpoint]
    )

    print("\nTraining completed successfully! CNN model saved as 'models/plantvillage_cnn.h5'")

if __name__ == '__main__':
    main()

