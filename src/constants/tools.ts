import type { ReactNode } from 'react'
import {
  FileJson, Hash, Palette, FileImage, Shield, FileText, Code2, Layers, QrCode, Calculator, Type,
  Sparkles, PenTool, Smartphone, Globe, Clock, Terminal, FileCode, Binary, Lock, Timer, Eye, Database,
  Scissors, Eraser, Ratio, Cpu, BookOpen, Radio, FileAudio, Diff, FileSearch, Monitor, Braces, Minimize2
} from 'lucide-react'
import React from 'react'

export interface Tool {
  id: string
  to: string
  title: string
  description: string
  icon: ReactNode
  category: string
  isNew?: boolean
  isWasm?: boolean
  isComingSoon?: boolean
  isFavorite?: boolean
}

// Helper to ensure icons are stable React elements
const createIcon = (Icon: React.ComponentType<{ className?: string }>) => React.createElement(Icon, { className: "w-5 h-5" })

export const ALL_TOOLS: Tool[] = [
  // Web Design & UI
  { id: 'palette', to: '/tools/palette', title: 'Color Palette Extractor', description: 'Generate HEX/RGB/HSL from images', icon: createIcon(Palette), category: 'Design', isNew: true },
  { id: 'glassmorphism', to: '/tools/glassmorphism', title: 'Glassmorphism Editor', description: 'Create frosted-glass CSS effects', icon: createIcon(Sparkles), category: 'Design', isNew: true },
  { id: 'svg-optimizer', to: '/tools/svg-optimizer', title: 'SVG Path Optimizer', description: 'Minify SVG and visualize paths', icon: createIcon(PenTool), category: 'Design', isNew: true },
  { id: 'shadow-builder', to: '/tools/shadow-builder', title: 'Shadow & Neumorphism', description: 'Visual sliders for complex shadows', icon: createIcon(Layers), category: 'Design', isNew: true },
  { id: 'font-pairer', to: '/tools/font-pairer', title: 'Web Font Pairer', description: 'Test Google Font combinations', icon: createIcon(Type), category: 'Design', isComingSoon: false },
  { id: 'lottie', to: '/tools/lottie', title: 'Lottie Previewer', description: 'Drag-and-drop animation testing', icon: createIcon(Radio), category: 'Design', isComingSoon: true },
  { id: 'tailwind-palette', to: '/tools/tailwind-palette', title: 'Tailwind Palette Master', description: 'Generate 50-950 color scales', icon: createIcon(Palette), category: 'Design', isComingSoon: true },
  { id: 'golden-ratio', to: '/tools/golden-ratio', title: 'Golden Ratio Calculator', description: 'Math-based layout sizing', icon: createIcon(Ratio), category: 'Design', isNew: true },
  { id: 'color-picker', to: '/tools/color-picker', title: 'Color Picker & Contrast', icon: createIcon(Eye), description: 'Accessibility checker', category: 'Design', isComingSoon: true },

  // Web Development & Coding
  { id: 'json-to-ts', to: '/tools/json-to-ts', title: 'JSON to TypeScript', description: 'Convert JSON to TS interfaces', icon: createIcon(FileJson), category: 'Dev', isNew: true },
  { id: 'regex-tester', to: '/tools/regex-tester', title: 'RegEx Tester', description: 'Visual regex debugger', icon: createIcon(Hash), category: 'Dev', isNew: true },
  { id: 'json-yaml-converter', to: '/tools/json-yaml-converter', title: 'JSON/YAML Converter', description: 'Bidirectional converter', icon: createIcon(Braces), category: 'Dev', isNew: true },
  { id: 'sql-beautifier', to: '/tools/sql-beautifier', title: 'SQL Beautifier', description: 'Format SQL queries', icon: createIcon(Code2), category: 'Dev', isNew: true },
  { id: 'code-minifier', to: '/tools/code-minifier', title: 'Code Minifier', description: 'Minify JS/CSS/HTML', icon: createIcon(Minimize2), category: 'Dev', isNew: true },
  { id: 'crontab', to: '/tools/crontab', title: 'Crontab UI', description: 'Visual cron schedule builder', icon: createIcon(Clock), category: 'Dev', isNew: true },
  { id: 'uuid-generator', to: '/tools/uuid-generator', title: 'UUID Generator', description: 'Generate UUIDs v1/v4/v7', icon: createIcon(Hash), category: 'Dev', isNew: true },
  { id: 'api-payload', to: '/tools/api-payload', title: 'API Payload Generator', description: 'Create dummy JSON data', icon: createIcon(Database), category: 'Dev', isNew: true },
  { id: 'z-index', to: '/tools/z-index', title: 'Z-Index 3D Visualizer', description: 'Debug layering in 3D view', icon: createIcon(Layers), category: 'Dev', isComingSoon: true },
  { id: 'json-formatter', to: '/tools/json-formatter', title: 'JSON/XML/YAML Formatter', description: 'Pretty-printer and validator', icon: createIcon(Braces), category: 'Dev', isComingSoon: true },
  { id: 'meta-tags', to: '/tools/meta-tags', title: 'Meta Tag Pro', description: 'SEO previewer for social', icon: createIcon(Globe), category: 'Dev', isComingSoon: true },
  { id: 'markdown-editor', to: '/tools/markdown-editor', title: 'Markdown Live Editor', description: 'Full-featured MD editor with shortcuts', icon: createIcon(BookOpen), category: 'Dev', isComingSoon: true },
  { id: 'css-to-tailwind', to: '/tools/css-to-tailwind', title: 'CSS to Tailwind', description: 'Convert raw CSS to Tailwind', icon: createIcon(Code2), category: 'Dev', isComingSoon: true },
  { id: 'svg-to-jsx', to: '/tools/svg-to-jsx', title: 'SVG to JSX/React', description: 'Transform SVG to React components', icon: createIcon(FileCode), category: 'Dev', isNew: true },
  { id: 'bundle-size', to: '/tools/bundle-size', title: 'Bundle Size Mock-up', description: 'Estimate library weight impact', icon: createIcon(FileSearch), category: 'Dev', isComingSoon: true },
  { id: 'curl-to-fetch', to: '/tools/curl-to-fetch', title: 'Curl to Fetch/Axios', description: 'Convert curl to TypeScript', icon: createIcon(Terminal), category: 'Dev', isNew: true },

  // File & Text Processing
  { id: 'compressor', to: '/tools/compressor', title: 'Ultra Compressor', description: 'Brotli/Gzip file optimization', icon: createIcon(FileText), category: 'File', isNew: true },
  { id: 'online-compiler', to: '/tools/online-compiler', title: 'Online Compiler', description: 'C/C++ execution in browser', icon: createIcon(Cpu), category: 'File', isWasm: true, isComingSoon: false },
  { id: 'ocr', to: '/tools/ocr', title: 'OCR (Doc to Text)', description: 'Extract text from images/PDFs', icon: createIcon(FileSearch), category: 'File', isWasm: true },
  { id: 'converter', to: '/tools/converter', title: 'Image Converter', description: 'WEBP/PNG/JPG/AVIF conversion', icon: createIcon(FileImage), category: 'File', isNew: true },
  { id: 'bg-remover', to: '/tools/bg-remover', title: 'Background Remover', description: 'AI-powered image editing', icon: createIcon(Eraser), category: 'File', isWasm: true, isComingSoon: true },
  { id: 'md-to-pdf', to: '/tools/md-to-pdf', title: 'Markdown to PDF/HTML', description: 'Professional export tool', icon: createIcon(FileText), category: 'File', isComingSoon: true },
  { id: 'waveform', to: '/tools/waveform', title: 'Audio Waveform Generator', description: 'SVG waveforms from audio', icon: createIcon(FileAudio), category: 'File', isComingSoon: true },
  { id: 'diff-checker', to: '/tools/diff-checker', title: 'Diff Checker', description: 'Side-by-side comparison', icon: createIcon(Diff), category: 'File', isWasm: true },
  { id: 'text-analysis', to: '/tools/text-analysis', title: 'Text Analysis Pro', description: 'Word counts, reading difficulty', icon: createIcon(Type), category: 'File', isNew: true },

  // Advanced Logic & Math
  { id: 'equation-solver', to: '/tools/equation-solver', title: 'Equation Solver', description: 'Algebraic/scientific calculations', icon: createIcon(Calculator), category: 'Math', isWasm: true },
  { id: 'unit-converter', to: '/tools/unit-converter', title: 'Unit & Currency Converter', description: 'Data, weight, live currency', icon: createIcon(Calculator), category: 'Math', isNew: true },
  { id: 'algorithm-viz', to: '/tools/algorithm-viz', title: 'Algorithm Visualizer', description: 'Sorting/pathfinding animations', icon: createIcon(Binary), category: 'Math', isComingSoon: true },
  { id: 'unix-timestamp', to: '/tools/unix-timestamp', title: 'Unix Timestamp Master', description: 'Epoch to human-readable', icon: createIcon(Clock), category: 'Math', isNew: true },

  // Security & Productivity
  { id: 'base64', to: '/tools/base64', title: 'Base64 Encoder/Decoder', description: 'Strings and images', icon: createIcon(Shield), category: 'Security', isNew: true },
  { id: 'jwt-inspector', to: '/tools/jwt-inspector', title: 'JWT Inspector', description: 'Decode tokens locally', icon: createIcon(Lock), category: 'Security', isNew: true },
  { id: 'password-gen', to: '/tools/password-gen', title: 'Password Shield', description: 'Cryptographic password generator', icon: createIcon(Lock), category: 'Security', isNew: true },
  { id: 'qr-generator', to: '/tools/qr-generator', title: 'QR Code Generator', description: 'URLs, Wi-Fi, V-Cards', icon: createIcon(QrCode), category: 'Security', isNew: true },
  { id: 'pomodoro', to: '/tools/pomodoro', title: 'Pomodoro Timer', description: 'Productivity workflow tool', icon: createIcon(Timer), category: 'Security', isNew: true },
  { id: 'pii-scrubber', to: '/tools/pii-scrubber', title: 'PII Scrubber (Anonymizer)', description: 'Mask emails, names, phones', icon: createIcon(Scissors), category: 'Security', isComingSoon: true },
  { id: 'sql-visualizer', to: '/tools/sql-visualizer', title: 'SQL Schema Visualizer', description: 'CREATE TABLE to ERD diagram', icon: createIcon(Database), category: 'Security', isComingSoon: true },
  { id: 'metadata-stripper', to: '/tools/metadata-stripper', title: 'Metadata Stripper', description: 'Remove EXIF from photos', icon: createIcon(Eraser), category: 'Security', isComingSoon: true },

  // Mobile Dev Tools
  { id: 'app-icon-gen', to: '/tools/app-icon-gen', title: 'App Icon & Splash Generator', description: 'All icon sizes for iOS/Android', icon: createIcon(Smartphone), category: 'Mobile', isComingSoon: false },
  { id: 'manifest-builder', to: '/tools/manifest-builder', title: 'Permissions Manifest Builder', description: 'AndroidManifest/Info.plist generator', icon: createIcon(FileCode), category: 'Mobile', isComingSoon: true },
  { id: 'device-mockup', to: '/tools/device-mockup', title: 'Device Mockup Generator', description: 'Screenshots in phone frames', icon: createIcon(Monitor), category: 'Mobile', isComingSoon: true },
]
