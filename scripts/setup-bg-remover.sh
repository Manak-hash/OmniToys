#!/bin/bash
# Setup script for Background Remover - downloads model and WASM files

set -e

echo "📦 Setting up Background Remover..."

# Create directories
mkdir -p public/models
mkdir -p public/wasm

# Download RMBG-1.4 model from HuggingFace (quantized version for better performance)
echo "📥 Downloading RMBG-1.4 quantized model (43MB)..."
if [ ! -f "public/models/rmbg-1.4.onnx" ]; then
  curl -L -o public/models/rmbg-1.4.onnx \
    "https://huggingface.co/briaai/RMBG-1.4/resolve/main/onnx/model_quantized.onnx"
  echo "✅ Model downloaded"
else
  echo "✅ Model already exists"
fi

# Download ONNX Runtime Web WASM files
echo "📥 Downloading ONNX Runtime WASM files..."

BASE_URL="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.0/dist"

WASM_FILES=(
  "ort-wasm.wasm"
  "ort-wasm-simd.wasm"
  "ort-wasm-threaded.wasm"
  "ort-wasm-simd-threaded.wasm"
)

for file in "${WASM_FILES[@]}"; do
  if [ ! -f "public/wasm/$file" ]; then
    echo "  Downloading $file..."
    curl -L -o "public/wasm/$file" "$BASE_URL/$file"
  else
    echo "  ✅ $file already exists"
  fi
done

# Also download the JS glue files (they might be needed)
JS_FILES=(
  "ort-wasm.min.js"
  "ort-wasm-simd.min.js"
  "ort-wasm-threaded.min.js"
  "ort-wasm-simd-threaded.min.js"
)

for file in "${JS_FILES[@]}"; do
  if [ ! -f "public/wasm/$file" ]; then
    echo "  Downloading $file..."
    curl -L -o "public/wasm/$file" "$BASE_URL/$file"
  else
    echo "  ✅ $file already exists"
  fi
done

echo ""
echo "✅ Background Remover setup complete!"
echo "📁 Files:"
echo "   - public/models/rmbg-1.4.onnx (43MB - quantized)"
echo "   - public/wasm/ort-*.wasm"
echo "   - public/wasm/ort-*.js"
