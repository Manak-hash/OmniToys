import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import HomePage from './pages/HomePage'
import JsonToTsPage from './pages/tools/JsonToTsPage'
import RegexTesterPage from './pages/tools/RegexTesterPage'
import PaletteExtractorPage from './pages/tools/PaletteExtractorPage'
import CompressorPage from './pages/tools/CompressorPage'
import Base64Page from './pages/tools/Base64Page'
import QrGeneratorPage from './pages/tools/QrGeneratorPage'
import UnixTimestampPage from './pages/tools/UnixTimestampPage'
import PasswordGenPage from './pages/tools/PasswordGenPage'
import GlassmorphismPage from './pages/tools/GlassmorphismPage'
import SvgOptimizerPage from './pages/tools/SvgOptimizerPage'
import ShadowBuilderPage from './pages/tools/ShadowBuilderPage'
import OcrPage from './pages/tools/OcrPage'
import ToolsCatalog from './pages/ToolsCatalog'
import ComingSoonPage from './pages/ComingSoonPage'
import SettingsPage from './pages/SettingsPage'

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
      {
        path: 'tools/json-to-ts',
        element: <JsonToTsPage />,
      },
      {
        path: 'tools/regex-tester',
        element: <RegexTesterPage />,
      },
      {
        path: 'tools/palette',
        element: <PaletteExtractorPage />,
      },
      {
        path: 'tools/compressor',
        element: <CompressorPage />,
      },
      {
        path: 'tools/base64',
        element: <Base64Page />,
      },
      {
        path: 'tools/qr-generator',
        element: <QrGeneratorPage />,
      },
      {
        path: 'tools/unix-timestamp',
        element: <UnixTimestampPage />,
      },
      {
        path: 'tools/password-gen',
        element: <PasswordGenPage />,
      },
      {
        path: 'tools/glassmorphism',
        element: <GlassmorphismPage />,
      },
      {
        path: 'tools/svg-optimizer',
        element: <SvgOptimizerPage />,
      },
      {
        path: 'tools/shadow-builder',
        element: <ShadowBuilderPage />,
      },
      {
        path: 'tools/ocr',
        element: <OcrPage />,
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
