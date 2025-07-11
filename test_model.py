"""
Simple test script to verify the improved model works
"""
import os
import sys

def test_model():
    try:
        import torch
        print("✅ PyTorch imported successfully")
        
        from transformers import AutoTokenizer, AutoModelForSequenceClassification
        print("✅ Transformers imported successfully")
        
        # Test loading the model
        model_dir = "./tokenizador"
        print(f"📂 Loading model from: {model_dir}")
        
        tokenizer = AutoTokenizer.from_pretrained(model_dir, local_files_only=True)
        model = AutoModelForSequenceClassification.from_pretrained(model_dir, local_files_only=True)
        
        print("✅ Model loaded successfully!")
        print(f"📊 Model config: {model.config}")
        print(f"🏷️ Labels: {model.config.id2label}")
        
        # Test prediction
        test_texts = ["This is a test message", "fuck you"]
        inputs = tokenizer(test_texts, padding=True, truncation=True, return_tensors="pt")
        
        with torch.no_grad():
            outputs = model(**inputs)
            probs = torch.nn.functional.softmax(outputs.logits, dim=1)
            preds = torch.argmax(probs, dim=1)
        
        print("✅ Prediction test successful!")
        for i, text in enumerate(test_texts):
            pred_label = model.config.id2label[preds[i].item()]
            confidence = probs[i].max().item()
            print(f"   Text: '{text}' -> {pred_label} (confidence: {confidence:.3f})")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🧪 Testing improved model...")
    success = test_model()
    if success:
        print("\n🎉 Model test completed successfully!")
    else:
        print("\n💥 Model test failed!")
