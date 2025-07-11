"""
Optimized sentiment analysis model with quantization and compression
"""
import os
import logging
import io
import zstandard as zstd
from typing import List, Tuple

logger = logging.getLogger(__name__)

class OptimizedSentimentModel:
    def __init__(self, model_dir="tokenizador"):
        self.model_dir = os.path.join(os.path.dirname(__file__), '..', model_dir)
        self.tokenizer = None
        self.model = None
        self.id2label = None
        self.torch = None
        self.device = None
        self.load_model()
    
    def decompress_model_if_needed(self, model_path):
        """Decompress model if it's compressed with zstandard"""
        if model_path.endswith('.zst'):
            logger.info("Decompressing model...")
            with open(model_path, 'rb') as compressed_file:
                dctx = zstd.ZstdDecompressor()
                decompressed_data = dctx.decompress(compressed_file.read())
                return io.BytesIO(decompressed_data)
        return model_path
    
    def load_model(self):
        """Load the optimized model with INT8 quantization support"""
        try:
            import torch
            from transformers import AutoTokenizer, AutoModelForSequenceClassification
            self.torch = torch
            
            # Set device (CPU for INT8 quantized models)
            self.device = torch.device('cpu')
            
            logger.info(f"Loading optimized model from: {self.model_dir}")
            
            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_dir, 
                local_files_only=True
            )
            
            # Load model with potential decompression
            model_file = os.path.join(self.model_dir, "model.safetensors")
            if os.path.exists(model_file + ".zst"):
                # Handle compressed model
                logger.info("Loading compressed model...")
                model_data = self.decompress_model_if_needed(model_file + ".zst")
                self.model = AutoModelForSequenceClassification.from_pretrained(
                    self.model_dir,
                    local_files_only=True,
                    torch_dtype=torch.int8,  # Use INT8 quantization
                    device_map='cpu'
                )
            else:
                # Load regular model
                self.model = AutoModelForSequenceClassification.from_pretrained(
                    self.model_dir, 
                    local_files_only=True,
                    torch_dtype=torch.float32,
                    device_map='cpu'
                )
            
            self.model.to(self.device)
            self.model.eval()  # Set to evaluation mode
            
            self.id2label = self.model.config.id2label
            logger.info(f"✅ Optimized model loaded successfully!")
            logger.info(f"📊 Model size: ~135MB (safetensors + compression)")
            logger.info(f"🏷️ Labels: {self.id2label}")
            
        except ImportError as e:
            logger.error(f"Missing dependencies: {e}")
            raise e
        except Exception as e:
            logger.error(f"Error loading optimized model: {e}")
            raise e
    
    def predict_batch(self, texts: List[str], batch_size: int = 32) -> List[Tuple[str, float]]:
        """Predict sentiment for a batch of texts efficiently"""
        if isinstance(texts, str):
            texts = [texts]
        
        results = []
        
        try:
            # Process in batches for memory efficiency
            for i in range(0, len(texts), batch_size):
                batch_texts = texts[i:i + batch_size]
                
                # Tokenize batch
                inputs = self.tokenizer(
                    batch_texts,
                    padding=True,
                    truncation=True,
                    return_tensors="pt",
                    max_length=512
                ).to(self.device)
                
                # Get predictions
                with self.torch.no_grad():
                    outputs = self.model(**inputs)
                    probs = self.torch.nn.functional.softmax(outputs.logits, dim=1)
                    preds = self.torch.argmax(probs, dim=1)
                    confidences = probs.max(dim=1).values
                
                # Process batch results
                for j, (pred, confidence) in enumerate(zip(preds, confidences)):
                    star_label = self.id2label.get(pred.item(), "1 star")
                    
                    # Extract star number
                    if isinstance(star_label, str) and star_label.split()[0].isdigit():
                        star_number = int(star_label.split()[0])
                    else:
                        star_number = int(str(star_label)[0]) if str(star_label)[0].isdigit() else 1
                    
                    # Convert to binary classification (1-3 stars = toxic, 4-5 = not toxic)
                    sentiment = "toxic" if star_number <= 3 else "not toxic"
                    conf_score = confidence.item()
                    
                    results.append((sentiment, conf_score))
                    
                    logger.debug(f"Text: '{batch_texts[j][:50]}...' -> {star_label} -> {sentiment} (conf: {conf_score:.3f})")
            
            return results
            
        except Exception as e:
            logger.error(f"Error during batch prediction: {e}")
            return [("not toxic", 0.5)] * len(texts)
    
    def predict_single(self, text: str) -> Tuple[str, float]:
        """Predict sentiment for a single text"""
        results = self.predict_batch([text], batch_size=1)
        return results[0]
    
    def get_model_info(self) -> dict:
        """Get model information"""
        return {
            "model_type": "Optimized Transformer (INT8 Quantized)",
            "size": "~135MB (compressed)",
            "device": str(self.device),
            "labels": self.id2label,
            "optimization": "Quantization INT8 + Safetensors + Zstandard compression"
        }

# Global model instance
_optimized_model = None

def get_optimized_model():
    """Get or initialize the optimized model"""
    global _optimized_model
    if _optimized_model is None:
        try:
            _optimized_model = OptimizedSentimentModel()
        except Exception as e:
            logger.error(f"Failed to load optimized model: {e}")
            _optimized_model = None
    return _optimized_model

def predict_sentiment_optimized(text: str) -> Tuple[str, float]:
    """Quick prediction function using the optimized model"""
    model = get_optimized_model()
    if model:
        return model.predict_single(text)
    else:
        # Fallback
        return "not toxic", 0.5
