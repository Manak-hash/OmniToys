import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import HomePage from './pages/HomePage'
import ToolsCatalog from './pages/ToolsCatalog'
import ComingSoonPage from './pages/ComingSoonPage'
import SettingsPage from './pages/SettingsPage'

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
  return <RouterProvider router={router} />
}

export default App
