import { useState, useRef } from 'react'
import { FileCode, Upload, Copy, Check, Download, Code2 } from 'lucide-react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { CodeEditor } from '@/components/ui/CodeEditor'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { toast } from 'sonner'

// Convert hyphenated attributes to camelCase for JSX
function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

// Check if attribute needs to be converted
const JSX_ATTR_MAP: Record<string, string> = {
  'class': 'className',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'stroke-miterlimit': 'strokeMiterlimit',
  'fill-opacity': 'fillOpacity',
  'stroke-opacity': 'strokeOpacity',
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'font-weight': 'fontWeight',
  'letter-spacing': 'letterSpacing',
  'word-spacing': 'wordSpacing',
  'text-anchor': 'textAnchor',
  'text-decoration': 'textDecoration',
  'xml:space': 'xmlSpace',
  'crossorigin': 'crossOrigin',
  'accent-height': 'accentHeight',
  'alignment-baseline': 'alignmentBaseline',
  'arabic-form': 'arabicForm',
  'attributeName': 'attributeName',
  'attributeType': 'attributeType',
  'baseFrequency': 'baseFrequency',
  'baseline-shift': 'baselineShift',
  'calcMode': 'calcMode',
  'cap-height': 'capHeight',
  'clip-path': 'clipPath',
  'clipPathUnits': 'clipPathUnits',
  'color-interpolation': 'colorInterpolation',
  'color-rendering': 'colorRendering',
  'contentScriptType': 'contentScriptType',
  'contentStyleType': 'contentStyleType',
  'diffuseConstant': 'diffuseConstant',
  'dominant-baseline': 'dominantBaseline',
  'edge-mode': 'edgeMode',
  'enable-background': 'enableBackground',
  'fill': 'fill',
  'filter': 'filter',
  'flood-color': 'floodColor',
  'flood-opacity': 'floodOpacity',
  'font-stretch': 'fontStretch',
  'font-style': 'fontStyle',
  'font-variant': 'fontVariant',
  'glyph-name': 'glyphName',
  'glyph-orientation-horizontal': 'glyphOrientationHorizontal',
  'glyph-orientation-vertical': 'glyphOrientationVertical',
  'glyphRef': 'glyphRef',
  'gradientTransform': 'gradientTransform',
  'gradientUnits': 'gradientUnits',
  'horiz-adv-x': 'horizAdvX',
  'horiz-origin-x': 'horizOriginX',
  'image-rendering': 'imageRendering',
  'kernelMatrix': 'kernelMatrix',
  'kernelUnitLength': 'kernelUnitLength',
  'keyPoints': 'keyPoints',
  'keySplines': 'keySplines',
  'keyTimes': 'keyTimes',
  'lengthAdjust': 'lengthAdjust',
  'maskContentUnits': 'maskContentUnits',
  'maskUnits': 'maskUnits',
  'numOctaves': 'numOctaves',
  'overline-position': 'overlinePosition',
  'overline-thickness': 'overlineThickness',
  'paint-order': 'paintOrder',
  'pathLength': 'pathLength',
  'patternContentUnits': 'patternContentUnits',
  'patternTransform': 'patternTransform',
  'patternUnits': 'patternUnits',
  'pointer-events': 'pointerEvents',
  'pointsAtX': 'pointsAtX',
  'pointsAtY': 'pointsAtY',
  'pointsAtZ': 'pointsAtZ',
  'preserveAlpha': 'preserveAlpha',
  'preserveAspectRatio': 'preserveAspectRatio',
  'primitiveUnits': 'primitiveUnits',
  'refX': 'refX',
  'refY': 'refY',
  'rendering-intent': 'renderingIntent',
  'repeatCount': 'repeatCount',
  'repeatDur': 'repeatDur',
  'requiredExtensions': 'requiredExtensions',
  'requiredFeatures': 'requiredFeatures',
  'specularConstant': 'specularConstant',
  'specularExponent': 'specularExponent',
  'spreadMethod': 'spreadMethod',
  'startOffset': 'startOffset',
  'stdDeviation': 'stdDeviation',
  'stitchTiles': 'stitchTiles',
  'surfaceScale': 'surfaceScale',
  'systemLanguage': 'systemLanguage',
  'tableValues': 'tableValues',
  'targetX': 'targetX',
  'targetY': 'targetY',
  'textLength': 'textLength',
  'underline-position': 'underlinePosition',
  'underline-thickness': 'underlineThickness',
  'unicode-bidi': 'unicodeBidi',
  'unicode-range': 'unicodeRange',
  'units-per-em': 'unitsPerEm',
  'v-alphabetic': 'vAlphabetic',
  'v-hanging': 'vHanging',
  'v-ideographic': 'vIdeographic',
  'v-mathematical': 'vMathematical',
  'vector-effect': 'vectorEffect',
  'vert-adv-y': 'vertAdvY',
  'vert-origin-x': 'vertOriginX',
  'vert-origin-y': 'vertOriginY',
  'writing-mode': 'writingMode',
  'x-height': 'xHeight',
  'x1': 'x1',
  'x2': 'x2',
  'x-channel-selector': 'xChannelSelector',
  'xlink:actuate': 'xlinkActuate',
  'xlink:arcrole': 'xlinkArcrole',
  'xlink:href': 'xlinkHref',
  'xlink:role': 'xlinkRole',
  'xlink:show': 'xlinkShow',
  'xlink:title': 'xlinkTitle',
  'xlink:type': 'xlinkType',
  'xml:base': 'xmlBase',
}

function convertSvgToJsx(svgCode: string, componentName: string): string {
  let code = svgCode.trim()

  // Remove XML declaration and DOCTYPE
  code = code.replace(/<\?xml[^>]*\?>/g, '')
  code = code.replace(/<!DOCTYPE[^>]*>/g, '')

  // Remove xmlns attributes (React doesn't need them)
  code = code.replace(/\s+xmlns[^=]*="[^"]*"/g, '')
  code = code.replace(/\s+xmlns:[^=]*="[^"]*"/g, '')

  // Convert self-closing tags: <tag /> -> <tag />
  code = code.replace(/<([a-zA-Z0-9:-]+)([^>]*)>/g, (match, tag, attrs) => {
    // If it's a self-closing tag without the slash
    if (!match.endsWith('/>') && !attrs.includes('</')) {
      // Check if it's actually a self-closing tag (no closing tag exists)
      const voidTags = ['path', 'circle', 'rect', 'ellipse', 'line', 'polygon', 'polyline', 'use', 'image']
      const tagName = tag.toLowerCase()
      if (voidTags.some(voidTag => tagName.includes(voidTag)) && !attrs.includes('/>')) {
        return `<${tag}${attrs} />`
      }
    }
    return match
  })

  // Convert attributes to JSX format
  const processAttrs = (attrStr: string): string => {
    if (!attrStr) return ''

    return attrStr.replace(/([a-zA-Z0-9:-]+)=(".*?"|'.*?')/g, (match, attrName, value) => {
      // Check if we have a mapping for this attribute
      const jsxAttr = JSX_ATTR_MAP[attrName] || toCamelCase(attrName)

      // Special handling for style attribute (string to object)
      if (attrName === 'style') {
        return `style={${styleStringToObject(value)}}`
      }

      // Convert to JSX prop format
      return `${jsxAttr}={${value}}`
    })
  }

  // Convert style string to object
  const styleStringToObject = (styleStr: string): string => {
    const styles = styleStr
      .slice(1, -1)
      .split(';')
      .filter(s => s.trim())
      .map(s => {
        const [prop, val] = s.split(':').map(x => x.trim())
        return `${toCamelCase(prop)}: '${val}'`
      })

    return styles.length > 0 ? `{ ${styles.join(', ')} }` : '{}'
  }

  // Process all tags and their attributes
  code = code.replace(/<([a-zA-Z0-9:-]+)(\s+[^>]*)?(\s*\/)?>/g, (match, tag, attrs, selfClose) => {
    const processedAttrs = attrs ? ' ' + processAttrs(attrs) : ''
    return `<${tag}${processedAttrs}${selfClose || ''}>`
  })

  // Generate component code
  return `import React from 'react'

export const ${componentName}: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    ${code}
  )
}
`
}

export default function SvgToJsxPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [componentName, setComponentName] = useState('SvgIcon')
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleConvert = () => {
    if (!input.trim()) {
      setOutput('')
      return
    }

    try {
      const jsx = convertSvgToJsx(input, componentName)
      setOutput(jsx)
    } catch (error) {
      toast.error('Failed to convert SVG: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.svg')) {
      toast.error('Please upload an SVG file')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setInput(content)

      // Auto-generate component name from filename
      const name = file.name.replace('.svg', '').replace(/[^a-zA-Z0-9]/g, '')
      if (name) {
        const PascalCase = name.charAt(0).toUpperCase() + name.slice(1)
        setComponentName(PascalCase)
      }
    }
    reader.readAsText(file)
  }

  const handleCopy = () => {
    if (!output) return
    navigator.clipboard.writeText(output)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!output) return
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${componentName}.tsx`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded component')
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInput(text)
      toast.success('Pasted from clipboard')
    } catch {
      toast.error('Failed to read clipboard')
    }
  }

  return (
    <ToolLayout
      title="SVG to JSX Converter"
      description="Convert SVG files to React components"
      icon={<FileCode className="w-5 h-5" />}
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 p-4 bg-omni-text/5 rounded-lg">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-omni-text/80 mb-2">
              Component Name
            </label>
            <input
              type="text"
              value={componentName}
              onChange={(e) => setComponentName(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
              placeholder="SvgIcon"
              className="w-full px-4 py-2 rounded-lg bg-omni-bg border border-omni-text/20 text-omni-text focus:outline-none focus:ring-2 focus:ring-omni-primary/50"
            />
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-omni-text/10 text-omni-text hover:bg-omni-text/20 transition-colors self-end"
          >
            <Upload className="w-4 h-4" />
            Upload SVG
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".svg"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={handlePaste}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-omni-text/10 text-omni-text hover:bg-omni-text/20 transition-colors self-end"
          >
            <Copy className="w-4 h-4" />
            Paste SVG
          </button>

          <button
            onClick={handleConvert}
            disabled={!input.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-omni-primary text-white hover:bg-omni-primary/90 transition-colors self-end disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Code2 className="w-4 h-4" />
            Convert
          </button>
        </div>

        {/* Input/Output */}
        <div className="grid lg:grid-cols-2 gap-6 min-h-[500px]">
          {/* Input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-omni-text/80">
              SVG Code
            </label>
            <CodeEditor
              value={input}
              onChange={setInput}
              language="xml"
              placeholder="Paste your SVG code here..."
              className="flex-1"
            />
          </div>

          {/* Output */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-omni-text/80">
              JSX Component
            </label>
            <CodeEditor
              value={output}
              language="typescript"
              readOnly
              placeholder="Converted JSX component will appear here..."
              className="flex-1 bg-omni-bg/80"
            />
          </div>
        </div>

        {/* Actions */}
        {output && (
          <ActionToolbar>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-omni-primary text-white hover:bg-omni-primary/90 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-omni-text/10 text-omni-text hover:bg-omni-text/20 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </ActionToolbar>
        )}

        {/* Info */}
        <div className="p-4 bg-omni-text/5 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">Conversion Features</h3>
          <ul className="grid md:grid-cols-2 gap-2 text-xs text-omni-text/70">
            <li>✓ Converts SVG attributes to JSX (className, strokeWidth, etc.)</li>
            <li>✓ Removes unnecessary xmlns declarations</li>
            <li>✓ Proper self-closing tag syntax</li>
            <li>✓ TypeScript with proper props typing</li>
            <li>✓ CamelCase conversion for all attributes</li>
            <li>✓ Supports file upload or paste</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
