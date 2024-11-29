# WardrobeWizard: AI-Enhanced Outfit Recommendation and Smart Buy Suggestion System

WardrobeWizard is an innovative AI-powered application designed to provide personalized outfit recommendations, smart buying suggestions, and wardrobe-based outfit generation. It combines advanced machine learning models with a full-stack implementation to deliver a seamless user experience.

---

## Features

1. **Outfit Compatibility**: Get recommendations for compatible clothing based on user preferences and wardrobe.
2. **Wardrobe-Based Recommendations**: Suggest outfits from the user's wardrobe.
3. **Smart Buy Options**: Identify clothing items to complete or enhance the wardrobe.

---

## Folder Structure

```plaintext
WardrobeWizard
├── Outfit_app                 # Frontend and backend for the web interface
│   ├── public                 # Static assets like CSS, JavaScript, and images
│   ├── views                  # EJS templates for rendering frontend pages
│   ├── app.js                 # Main entry point for the Express server
│   ├── middlewares.js         # Custom middleware functions
│   ├── config                 # Configuration files
├── recommendation_api         # Backend server for AI processing
│   ├── app.py                 # Flask server to handle AI requests

```
---
## Setup Instructions

Prerequisites
Node.js (v16+)
Python (v3.9+)
Flask
MongoDB 
Dependencies listed in requirements.txt and package.json
---
# pre-trained models and training code: 
1. yolo v5 trained for outfit segmentation
2. Resnet -18 finetuned for clothing feature extrarction.
3. Compatiblity Scoring mlp.
   
Send a mail request to Vishwajeetrajpatil2002@gmail.com or JagdishMalagond@gmail.com

---
## Installation
Clone the repository:

bash
Copy code
git clone https://github.com/vishwapatill/WARDROBE-WIZARD
cd WardrobeWizard
Set up the Outfit_app (Express Server):

Navigate to the Outfit_app directory:
bash
Copy code
cd Outfit_app
Install dependencies:
bash
Copy code
npm install
Start the Express server:
bash
Copy code
node app.js
Set up the recommendation_api (Flask Server):

Navigate to the recommendation_api directory:
bash
Copy code
cd ../recommendation_api
Create a virtual environment:
bash
Copy code
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
Install dependencies:
bash
Copy code
pip install -r requirements.txt
Start the Flask server:
bash
Copy code
python app.py
Open the Application:

### Access the app at http://localhost:3000 (default for Express server).
### The AI recommendation API runs at http://localhost:5000.
How It Works
Frontend: The Outfit_app handles user interactions and provides a seamless UI using EJS templates and public assets.

Backend:

Express: Manages API routes, user sessions, and frontend logic.
Flask: Hosts the AI models and handles requests for compatibility scores, predictions, and outfit generation.
AI Models: Advanced machine learning models calculate compatibility scores and recommend outfits or smart buy suggestions.

## Contributing
Contributions are welcome! Please follow the steps below to contribute:

## Fork the repository.
Create a feature branch: git checkout -b feature-name.
Commit changes: git commit -m 'Add feature name'.
Push to the branch: git push origin feature-name.
Open a pull request.
---


