"""
Improved sentiment analysis model using transformers
"""
import os
import logging

logger = logging.getLogger(__name__)

class ImprovedSentimentModel:
    def __init__(self, model_dir="tokenizador"):
        self.model_dir = os.path.join(os.path.dirname(__file__), '..', model_dir)
        self.tokenizer = None
        self.model = None
        self.id2label = None
        self.torch = None
        self.load_model()
    
    def load_model(self):
        """Load the improved transformers model"""
        try:
            # Import torch and transformers
            import torch
            from transformers import AutoTokenizer, AutoModelForSequenceClassification
            self.torch = torch
            
            logger.info(f"Loading improved model from: {self.model_dir}")
            
            # Load model and tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_dir, 
                local_files_only=True
            )
            self.model = AutoModelForSequenceClassification.from_pretrained(
                self.model_dir, 
                local_files_only=True
            )
            
            self.id2label = self.model.config.id2label
            logger.info(f"Improved model loaded successfully! Labels: {self.id2label}")
            
        except ImportError as e:
            logger.error(f"Missing dependencies for improved model: {e}")
            raise e
        except Exception as e:
            logger.error(f"Error loading improved model: {e}")
            raise e
    
    def predict(self, texts):
        """Predict sentiment for a list of texts"""
        if isinstance(texts, str):
            texts = [texts]
        
        try:
            # Tokenize input
            inputs = self.tokenizer(
                texts, 
                padding=True, 
                truncation=True, 
                return_tensors="pt",
                max_length=512
            )
            
            # Get predictions
            with self.torch.no_grad():
                outputs = self.model(**inputs)
                probs = self.torch.nn.functional.softmax(outputs.logits, dim=1)
                preds = self.torch.argmax(probs, dim=1)
            
            # Convert star ratings to toxic/not toxic
            predictions = []
            for pred in preds.tolist():
                # Get the star rating label
                star_label = self.id2label.get(pred, "1 star")
                
                # Extract star number
                if isinstance(star_label, str) and star_label.split()[0].isdigit():
                    star_number = int(star_label.split()[0])
                else:
                    # Fallback: assume first character is the star number
                    star_number = int(str(star_label)[0]) if str(star_label)[0].isdigit() else 1
                
                # 1-3 stars = toxic (1), 4-5 stars = not toxic (0)
                predictions.append(1 if star_number <= 3 else 0)
            
            return predictions
            
        except Exception as e:
            logger.error(f"Error during prediction: {e}")
            return [0] * len(texts)  # Default to not toxic
    
    def predict_proba(self, texts):
        """Predict sentiment probabilities for a list of texts"""
        if isinstance(texts, str):
            texts = [texts]
        
        try:
            inputs = self.tokenizer(
                texts, 
                padding=True, 
                truncation=True, 
                return_tensors="pt",
                max_length=512
            )
            
            with self.torch.no_grad():
                outputs = self.model(**inputs)
                probs = self.torch.nn.functional.softmax(outputs.logits, dim=1)
                preds = self.torch.argmax(probs, dim=1)
            
            # Convert to binary probabilities
            binary_probs = []
            for i, pred in enumerate(preds.tolist()):
                confidence = probs[i].max().item()
                
                # Get star rating
                star_label = self.id2label.get(pred, "1 star")
                
                if isinstance(star_label, str) and star_label.split()[0].isdigit():
                    star_number = int(star_label.split()[0])
                else:
                    star_number = int(str(star_label)[0]) if str(star_label)[0].isdigit() else 1
                
                if star_number <= 3:  # Toxic
                    binary_probs.append([1 - confidence, confidence])
                else:  # Not toxic
                    binary_probs.append([confidence, 1 - confidence])
            
            return binary_probs
            
        except Exception as e:
            logger.error(f"Error during probability prediction: {e}")
            return [[1.0, 0.0]] * len(texts)  # Default to not toxic with high confidence

# Initialize the improved model
improved_model = None

def get_improved_model():
    """Get or initialize the improved model"""
    global improved_model
    if improved_model is None:
        try:
            improved_model = ImprovedSentimentModel()
        except Exception as e:
            logger.error(f"Failed to load improved model: {e}")
            improved_model = None
    return improved_model
