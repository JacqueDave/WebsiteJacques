#!/bin/bash

# 1. Generate runtime config from .env
echo "Generating config.js from .env..."
node build-config.js

# 2. Start local server
echo "Starting local server at http://localhost:8000"
echo "Pages available:"
echo " - Landing:  http://localhost:8000/index.html"
echo " - Checkout: http://localhost:8000/checkout.html"
echo " - Success:  http://localhost:8000/thank-you.html"
echo ""
echo "Press Ctrl+C to stop the server."

python3 -m http.server 8000
