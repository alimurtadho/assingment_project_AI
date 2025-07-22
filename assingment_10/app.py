"""
Main application entry point for AI Document Assistant
"""
import os
import sys

# Add src directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from src.ui.streamlit_app import main

if __name__ == "__main__":
    main()
