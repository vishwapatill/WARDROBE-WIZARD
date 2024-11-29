from flask import Flask, request, jsonify
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import requests
from io import BytesIO

class CompatibilityModel(nn.Module):
    def __init__(self, embedding_dim=512):
        super(CompatibilityModel, self).__init__()
        self.fc1 = nn.Linear(embedding_dim * 3, 256)
        self.fc2 = nn.Linear(256, 64)
        self.fc3 = nn.Linear(64, 1)
        self.sigmoid = nn.Sigmoid()

    def forward(self, top_emb, bottom_emb, shoes_emb):
        combined = torch.cat([top_emb, bottom_emb, shoes_emb], dim=1)
        x = torch.relu(self.fc1(combined))
        x = torch.relu(self.fc2(x))
        x = self.sigmoid(self.fc3(x))
        return x

num_classes = 12  
resnet_model = models.resnet18(pretrained=False)
resnet_model.fc = nn.Linear(resnet_model.fc.in_features, num_classes)

checkpoint_path1 = "fashion_model_resnet18.pth"
state_dict = torch.load(checkpoint_path1, map_location=torch.device('cpu'))
resnet_model.load_state_dict(state_dict)

resnet_model.fc = nn.Identity()
resnet_model.eval()


embedding_dim = 512
compatibility_model = CompatibilityModel(embedding_dim)
checkpoint = torch.load("my_model.pth", map_location=torch.device('cpu'))
compatibility_model.load_state_dict(checkpoint["model_state_dict"])
compatibility_model.eval()

# Initialize Flask app
app = Flask(__name__)

# Define image preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

def preprocess_image(image_url):
    try:
        # Fetch the image from the provided URL
        response = requests.get(image_url)
        response.raise_for_status()  # Check if the request was successful
        image = Image.open(BytesIO(response.content)).convert("RGB")  # Open and convert to RGB
        return transform(image).unsqueeze(0)  # Add batch dimension
    except requests.exceptions.RequestException as e:
        raise Exception(f"Error fetching image from URL: {e}")


@app.route('/get_embedding_local',methods=['POST'])
def get_embedding_local():
    if 'image_url' not in request.json:
        print("Please provide an image URL")
        return jsonify({"error": "Please provide an image URL"}), 400
    image_url = request.json['image_url']
    print(image_url)
    try:
        image=Image.open(image_url)
        image_tensor =transform(image).unsqueeze(0)
        with torch.no_grad():
            embedding = resnet_model(image_tensor).squeeze().tolist()
        return jsonify({"embedding": embedding})
    except Exception as e:
        print("error occured")
        return jsonify({"error": str(e)}), 500

@app.route('/get_embedding', methods=['POST'])
def get_embedding():
    if 'image_url' not in request.json:
        print("Please provide an image URL")
        return jsonify({"error": "Please provide an image URL"}), 400

    image_url = request.json['image_url']
    try:
        image_tensor = preprocess_image(image_url)
        with torch.no_grad():
            embedding = resnet_model(image_tensor).squeeze().tolist()
        return jsonify({"embedding": embedding})
    except Exception as e:
        print("error occured")
        return jsonify({"error": str(e)}), 500


@app.route('/calculate_score',methods=['POST'])
def get_compatibility():
    # Check if the embeddings are provided in the JSON request
    if 'top_emb' not in request.json or 'bottom_emb' not in request.json or 'shoes_emb' not in request.json:
        return jsonify({"error": "Please provide all three embeddings: top_emb, bottom_emb, shoes_emb"}), 400

    # Get embeddings from the request
    try:
        top_emb = torch.tensor(request.json['top_emb']).float().unsqueeze(0)  # Add batch dimension
        bottom_emb = torch.tensor(request.json['bottom_emb']).float().unsqueeze(0)
        shoes_emb = torch.tensor(request.json['shoes_emb']).float().unsqueeze(0)
    except Exception as e:
        return jsonify({"error": f"Invalid embedding format: {e}"}), 400

    with torch.no_grad():
        # Calculate compatibility score
        score = compatibility_model(top_emb, bottom_emb, shoes_emb).item()

    return jsonify({"compatibility_score": score})



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
