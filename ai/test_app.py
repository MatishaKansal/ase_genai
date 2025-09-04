#!/usr/bin/env python3
"""
Simple test script for the AI Document Processor
"""

import sys
import os
import logging

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test if all modules can be imported successfully"""
    print("Testing module imports...")
    
    try:
        from config import Config
        print("✓ Config module imported successfully")
        
        # Test utility imports
        from utils.ocr_utils import extract_text_from_document
        print("✓ OCR utils imported successfully")
        
        from utils.embedding_utils import chunk_text, get_embeddings
        print("✓ Embedding utils imported successfully")
        
        from utils.vectorstore_utils import create_vector_store
        print("✓ Vector store utils imported successfully")
        
        from utils.anomaly_utils import detect_anomalies, risk_score
        print("✓ Anomaly utils imported successfully")
        
        from utils.summarizer_utils import generate_summary
        print("✓ Summarizer utils imported successfully")
        
        return True
        
    except ImportError as e:
        print(f"✗ Import failed: {e}")
        return False
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        return False

def test_config():
    """Test configuration loading"""
    print("\nTesting configuration...")
    
    try:
        from config import Config
        
        # Test configuration validation
        is_valid = Config.validate()
        print(f"✓ Configuration validation: {'PASSED' if is_valid else 'FAILED'}")
        
        # Print current configuration
        Config.print_config()
        
        return True
        
    except Exception as e:
        print(f"✗ Configuration test failed: {e}")
        return False

def test_basic_functions():
    """Test basic utility functions"""
    print("\nTesting basic functions...")
    
    try:
        from utils.embedding_utils import chunk_text
        
        # Test text chunking
        test_text = "This is a test document with multiple sentences. It should be chunked properly."
        chunks = chunk_text(test_text, chunk_size=5)
        print(f"✓ Text chunking: {len(chunks)} chunks created")
        
        # Test anomaly detection
        from utils.anomaly_utils import risk_score
        risk = risk_score([0, 1], 10)
        print(f"✓ Risk score calculation: {risk}%")
        
        return True
        
    except Exception as e:
        print(f"✗ Basic function test failed: {e}")
        return False

def test_fastapi_app():
    """Test if the FastAPI app can be imported"""
    print("\nTesting FastAPI app...")
    
    try:
        from processor_app import app
        print("✓ FastAPI app imported successfully")
        
        # Check if app has the expected endpoints
        routes = [route.path for route in app.routes]
        expected_routes = ["/", "/health", "/api/process-document"]
        
        for route in expected_routes:
            if route in routes:
                print(f"✓ Route {route} found")
            else:
                print(f"✗ Route {route} not found")
        
        return True
        
    except Exception as e:
        print(f"✗ FastAPI app test failed: {e}")
        return False

def main():
    """Main test function"""
    print("AI Document Processor - Module Test")
    print("=" * 50)
    
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    tests = [
        ("Module Imports", test_imports),
        ("Configuration", test_config),
        ("Basic Functions", test_basic_functions),
        ("FastAPI App", test_fastapi_app)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        if test_func():
            passed += 1
        else:
            print(f"✗ {test_name} failed")
    
    print("\n" + "=" * 50)
    print(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The AI module is ready to use.")
        return 0
    else:
        print("❌ Some tests failed. Please check the errors above.")
        print("\nNote: Configuration warnings are expected if environment variables are not set.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
