# WardrobeWizard: AI-Enhanced Outfit Recommendation and Smart Buy Suggestion System

WardrobeWizard is an innovative AI-powered application designed to provide personalized outfit recommendations, smart buying suggestions, and wardrobe-based outfit generation. It combines advanced machine learning models with a full-stack implementation to deliver a seamless user experience.

---

## Features

1. **Outfit Compatibility**: Get recommendations for compatible clothing based on user preferences and wardrobe.
2. **Wardrobe-Based Recommendations**: Suggest outfits from the user's wardrobe.
3. **Smart Buy Options**: Identify clothing items to complete or enhance the wardrobe.
4. **Virtual Try-On**: Visualize outfits on a virtual model.

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
