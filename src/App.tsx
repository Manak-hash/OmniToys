import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Suspense, lazy, useEffect, useState } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import HomePage from './pages/HomePage'
import ToolsCatalog from './pages/ToolsCatalog'
import ComingSoonPage from './pages/ComingSoonPage'
import SettingsPage from './pages/SettingsPage'
import { trackWebVitals } from './utils/performance'
import { PWAProvider } from './contexts/PWAContext'
import { TransitionProvider } from './contexts/TransitionContext'
import { usePreferences } from './store/preferences'
import { getThemeById, applyTheme } from './utils/themes'
import { Transition } from './components/transitions'
import { TransitionErrorBoundary } from './components/transitions/TransitionErrorBoundary'

// Lazy load tool pages
const JsonToTsPage = lazy(() => import('./pages/tools/JsonToTsPage'))
const RegexTesterPage = lazy(() => import('./pages/tools/RegexTesterPage'))
const PaletteExtractorPage = lazy(() => import('./pages/tools/PaletteExtractorPage'))
const CompressorPage = lazy(() => import('./pages/tools/CompressorPage'))
const Base64Page = lazy(() => import('./pages/tools/Base64Page'))
const QrGeneratorPage = lazy(() => import('./pages/tools/QrGeneratorPage'))
const UnixTimestampPage = lazy(() => import('./pages/tools/UnixTimestampPage'))
const PasswordGenPage = lazy(() => import('./pages/tools/PasswordGenPage'))
const GlassmorphismPage = lazy(() => import('./pages/tools/GlassmorphismPage'))
const SvgOptimizerPage = lazy(() => import('./pages/tools/SvgOptimizerPage'))
const ShadowBuilderPage = lazy(() => import('./pages/tools/ShadowBuilderPage'))
const OcrPage = lazy(() => import('./pages/tools/OcrPage'))
const EquationSolverPage = lazy(() => import('./pages/tools/EquationSolverPage'))
const DiffCheckerPage = lazy(() => import('./pages/tools/DiffCheckerPage'))
const OnlineCompilerPage = lazy(() => import('./pages/tools/OnlineCompilerPage'))
const WebFontPairerPage = lazy(() => import('./pages/tools/WebFontPairerPage'))
const AppIconGeneratorPage = lazy(() => import('./pages/tools/mobile/AppIconGeneratorPage'))

// New tool pages from library integration
const JsonYamlConverterPage = lazy(() => import('./pages/tools/JsonYamlConverterPage'))
const SqlBeautifierPage = lazy(() => import('./pages/tools/SqlBeautifierPage'))
const CodeMinifierPage = lazy(() => import('./pages/tools/CodeMinifierPage'))
const CrontabPage = lazy(() => import('./pages/tools/CrontabPage'))
const UuidGeneratorPage = lazy(() => import('./pages/tools/UuidGeneratorPage'))
const ApiPayloadPage = lazy(() => import('./pages/tools/ApiPayloadPage'))
const ImageConverterPage = lazy(() => import('./pages/tools/ImageConverterPage'))
const JwtInspectorPage = lazy(() => import('./pages/tools/JwtInspectorPage'))
const PomodoroPage = lazy(() => import('./pages/tools/PomodoroPage'))
const GoldenRatioPage = lazy(() => import('./pages/tools/GoldenRatioPage'))
const SvgToJsxPage = lazy(() => import('./pages/tools/SvgToJsxPage'))
const TextAnalysisPage = lazy(() => import('./pages/tools/TextAnalysisPage'))
const CurlToFetchPage = lazy(() => import('./pages/tools/CurlToFetchPage'))
const UnitConverterPage = lazy(() => import('./pages/tools/UnitConverterPage'))

// New Phase 1 tools
const AlgorithmVizPage = lazy(() => import('./pages/tools/AlgorithmVizPage'))
const SqlVisualizerPage = lazy(() => import('./pages/tools/SqlVisualizerPage'))
const MarkdownEditorPage = lazy(() => import('./pages/tools/MarkdownEditorPage'))
const AudioWaveformPage = lazy(() => import('./pages/tools/AudioWaveformPage'))
const ColorPickerPage = lazy(() => import('./pages/tools/ColorPickerPage'))
const MetaTagPage = lazy(() => import('./pages/tools/MetaTagPage'))
const ZIndexPage = lazy(() => import('./pages/tools/ZIndexPage'))
const BundleSizePage = lazy(() => import('./pages/tools/BundleSizePage'))
const TailwindPalettePage = lazy(() => import('./pages/tools/TailwindPalettePage'))

// Security & Mobile tools
const PiiScrubberPage = lazy(() => import('./pages/tools/PiiScrubberPage'))
const MetadataStripperPage = lazy(() => import('./pages/tools/MetadataStripperPage'))
const DeviceMockupPage = lazy(() => import('./pages/tools/DeviceMockupPage'))

// Additional new tools
const LottiePreviewerPage = lazy(() => import('./pages/tools/LottiePreviewerPage'))
const CssToTailwindPage = lazy(() => import('./pages/tools/CssToTailwindPage'))
const MdToPdfPage = lazy(() => import('./pages/tools/MdToPdfPage'))
const ManifestBuilderPage = lazy(() => import('./pages/tools/ManifestBuilderPage'))

// Additional encoder/decoder tools
const HtmlEntityPage = lazy(() => import('./pages/tools/HtmlEntityPage'))
const UrlEncoderPage = lazy(() => import('./pages/tools/UrlEncoderPage'))
const LoremPage = lazy(() => import('./pages/tools/LoremPage'))

// Additional utility tools
const UnicodePage = lazy(() => import('./pages/tools/UnicodePage'))
const CaseConverterPage = lazy(() => import('./pages/tools/CaseConverterPage'))

// Additional utility tools
const ReverseTextPage = lazy(() => import('./pages/tools/ReverseTextPage'))
const CountStatsPage = lazy(() => import('./pages/tools/CountStatsPage'))
const SortLinesPage = lazy(() => import('./pages/tools/SortLinesPage'))
const RemoveDuplicatesPage = lazy(() => import('./pages/tools/RemoveDuplicatesPage'))
const FindReplacePage = lazy(() => import('./pages/tools/FindReplacePage'))
const JsonFormatterPage = lazy(() => import('./pages/tools/JsonFormatterPage'))
const HashGeneratorPage = lazy(() => import('./pages/tools/HashGeneratorPage'))
const JsonCsvPage = lazy(() => import('./pages/tools/JsonCsvPage'))
const NumberBasePage = lazy(() => import('./pages/tools/NumberBasePage'))
const SvgPatternPage = lazy(() => import('./pages/tools/SvgPatternPage'))
const PasswordLeakPage = lazy(() => import('./pages/tools/PasswordLeakPage'))
const HeaderOraclePage = lazy(() => import('./pages/tools/HeaderOraclePage'))
const PortOraclePage = lazy(() => import('./pages/tools/PortOraclePage'))
const SSLSentinelPage = lazy(() => import('./pages/tools/SSLSentinelPage'))
const NeuralPromptPage = lazy(() => import('./pages/tools/NeuralPromptPage'))
const ApiMockPage = lazy(() => import('./pages/tools/ApiMockPage'))
const GitCheatPage = lazy(() => import('./pages/tools/GitCheatPage'))
const BackgroundRemoverPage = lazy(() => import('./pages/tools/BackgroundRemoverPage'))

// OmniFlow Integration
const OmniFlowPage = lazy(() => import('./pages/tools/OmniFlowPage'))

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-omni-primary"></div>
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'tools',
        element: <ToolsCatalog />,
      },
      // Existing tools
      {
        path: 'tools/json-to-ts',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <JsonToTsPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/regex-tester',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <RegexTesterPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/palette',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PaletteExtractorPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/compressor',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CompressorPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/base64',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Base64Page />
          </Suspense>
        ),
      },
      {
        path: 'tools/qr-generator',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <QrGeneratorPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/unix-timestamp',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <UnixTimestampPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/password-gen',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PasswordGenPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/glassmorphism',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <GlassmorphismPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/svg-optimizer',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SvgOptimizerPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/shadow-builder',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ShadowBuilderPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/ocr',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <OcrPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/equation-solver',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <EquationSolverPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/diff-checker',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <DiffCheckerPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/online-compiler',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <OnlineCompilerPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/font-pairer',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <WebFontPairerPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/app-icon-gen',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AppIconGeneratorPage />
          </Suspense>
        ),
      },
      // New tools from library integration
      {
        path: 'tools/json-yaml-converter',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <JsonYamlConverterPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/sql-beautifier',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SqlBeautifierPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/code-minifier',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CodeMinifierPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/crontab',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CrontabPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/uuid-generator',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <UuidGeneratorPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/api-payload',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ApiPayloadPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/converter',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ImageConverterPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/jwt-inspector',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <JwtInspectorPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/pomodoro',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PomodoroPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/golden-ratio',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <GoldenRatioPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/svg-to-jsx',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SvgToJsxPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/text-analysis',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <TextAnalysisPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/curl-to-fetch',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CurlToFetchPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/unit-converter',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <UnitConverterPage />
          </Suspense>
        ),
      },
      // New Phase 1 tools
      {
        path: 'tools/algorithm-viz',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AlgorithmVizPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/sql-visualizer',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SqlVisualizerPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/markdown-editor',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <MarkdownEditorPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/waveform',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AudioWaveformPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/color-picker',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ColorPickerPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/meta-tags',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <MetaTagPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/z-index',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ZIndexPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/bundle-size',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <BundleSizePage />
          </Suspense>
        ),
      },
      {
        path: 'tools/tailwind-palette',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <TailwindPalettePage />
          </Suspense>
        ),
      },
      // Security & Mobile tools
      {
        path: 'tools/pii-scrubber',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PiiScrubberPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/metadata-stripper',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <MetadataStripperPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/device-mockup',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <DeviceMockupPage />
          </Suspense>
        ),
      },
      // Additional new tools
      {
        path: 'tools/lottie',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <LottiePreviewerPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/css-to-tailwind',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CssToTailwindPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/md-to-pdf',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <MdToPdfPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/manifest-builder',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ManifestBuilderPage />
          </Suspense>
        ),
      },
      // Additional encoder/decoder tools
      {
        path: 'tools/html-entity',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <HtmlEntityPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/url-encoder',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <UrlEncoderPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/lorem-ipsum',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <LoremPage />
          </Suspense>
        ),
      },
      // Additional utility tools
      {
        path: 'tools/unicode',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <UnicodePage />
          </Suspense>
        ),
      },
      {
        path: 'tools/case-converter',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CaseConverterPage />
          </Suspense>
        ),
      },
      // Additional utility tools
      {
        path: 'tools/reverse-text',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ReverseTextPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/count-stats',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CountStatsPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/sort-lines',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SortLinesPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/remove-duplicates',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <RemoveDuplicatesPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/find-replace',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <FindReplacePage />
          </Suspense>
        ),
      },
      {
        path: 'tools/json-formatter',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <JsonFormatterPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/hash-generator',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <HashGeneratorPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/json-csv',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <JsonCsvPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/number-base',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <NumberBasePage />
          </Suspense>
        ),
      },
      {
        path: 'tools/svg-pattern',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SvgPatternPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/password-leak',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PasswordLeakPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/header-oracle',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <HeaderOraclePage />
          </Suspense>
        ),
      },
      {
        path: 'tools/port-oracle',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PortOraclePage />
          </Suspense>
        ),
      },
      {
        path: 'tools/ssl-sentinel',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SSLSentinelPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/neural-prompt',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <NeuralPromptPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/api-mock',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ApiMockPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/git-cheat',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <GitCheatPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/bg-remover',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <BackgroundRemoverPage />
          </Suspense>
        ),
      },
      // OmniFlow Integration - Special Tool
      {
        path: 'tools/omniflow',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <OmniFlowPage />
          </Suspense>
        ),
      },
      {
        path: 'tools/*',
        element: <ComingSoonPage />, // Catch-all for tools not implemented yet
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: <div>404 - Page Not Found</div>,
      },
    ],
  },
])

function App() {
  const { theme: themeId } = usePreferences()
  const [transitionTarget, setTransitionTarget] = useState<string | null>(null)

  // Apply theme on mount and when changed
  useEffect(() => {
    const theme = getThemeById(themeId)
    applyTheme(theme)
  }, [themeId])

  // Track Web Vitals in development mode
  useEffect(() => {
    if (import.meta.env.DEV) {
      trackWebVitals()
    }
  }, [])

  // Handle transition trigger from OmniSwitcher
  const handleTransitionTrigger = (targetUrl: string) => {
    setTransitionTarget(targetUrl)
  }

  const handleTransitionComplete = () => {
    setTransitionTarget(null)
  }

  const handleTransitionError = (error: Error) => {
    console.error('[App] Transition error:', error)
    setTransitionTarget(null)
  }

  return (
    <PWAProvider>
      <TransitionProvider onTransitionTrigger={handleTransitionTrigger}>
        <RouterProvider router={router} />

        {/* Transition overlay with error boundary */}
        {transitionTarget && (
          <TransitionErrorBoundary
            targetUrl={transitionTarget}
            onError={handleTransitionError}
          >
            <Transition
              targetUrl={transitionTarget}
              onComplete={handleTransitionComplete}
            />
          </TransitionErrorBoundary>
        )}
      </TransitionProvider>
    </PWAProvider>
  )
}

export default App
