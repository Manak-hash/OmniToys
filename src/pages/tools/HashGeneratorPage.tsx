import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { Hash as HashIcon, Copy, Download } from 'lucide-react'
import { toast } from 'sonner'

type HashType = 'md5' | 'sha-1' | 'sha-256' | 'sha-512' | 'sha-384' | 'sha-224'
type InputType = 'text' | 'file'

export default function HashGeneratorPage() {
  const [input, setInput] = useState('')
  const [inputType, setInputType] = useState<InputType>('text')
  const [hashType, setHashType] = useState<HashType>('sha-256')
  const [outputs, setOutputs] = useState<Record<HashType, string>>({} as Record<HashType, string>)
  const [fileName, setFileName] = useState('')

  // MD5 implementation (simple, not Web Crypto)
  const md5 = useCallback(async (string: string): Promise<string> => {
    function md5cycle(x: number[], k: number[]) {
      let a = x[0], b = x[1], c = x[2], d = x[3]

      a = ff(a, b, c, d, k[0], 7, -680876936)
      d = ff(d, a, b, c, k[1], 12, -389564586)
      c = ff(c, d, a, b, k[2], 17, 606105819)
      b = ff(b, c, d, a, k[3], 22, -1044525330)
      a = ff(a, b, c, d, k[4], 7, -176418897)
      d = ff(d, a, b, c, k[5], 12, 1200080426)
      c = ff(c, d, a, b, k[6], 17, -1473231341)
      b = ff(b, c, d, a, k[7], 22, -45705983)
      a = ff(a, b, c, d, k[8], 7, 1770035416)
      d = ff(d, a, b, c, k[9], 12, -1958414417)
      c = ff(c, d, a, b, k[10], 17, -42063)
      b = ff(b, c, d, a, k[11], 22, -1990404162)
      a = ff(a, b, c, d, k[12], 7, 1804603682)
      d = ff(d, a, b, c, k[13], 12, -40341101)
      c = ff(c, d, a, b, k[14], 17, -1502002290)
      b = ff(b, c, d, a, k[15], 22, 1236535329)

      a = gg(a, b, c, d, k[1], 5, -165796510)
      d = gg(d, a, b, c, k[6], 9, -1069501632)
      c = gg(c, d, a, b, k[11], 14, 643717713)
      b = gg(b, c, d, a, k[0], 20, -373897302)
      a = gg(a, b, c, d, k[5], 5, -701558691)
      d = gg(d, a, b, c, k[10], 9, 38016083)
      c = gg(c, d, a, b, k[15], 14, -660478335)
      b = gg(b, c, d, a, k[4], 20, -405537848)
      a = gg(a, b, c, d, k[9], 5, 568446438)
      d = gg(d, a, b, c, k[14], 9, -1019803690)
      c = gg(c, d, a, b, k[3], 14, -187363961)
      b = gg(b, c, d, a, k[8], 20, 1163531501)
      a = gg(a, b, c, d, k[13], 5, -1444681467)
      d = gg(d, a, b, c, k[2], 9, -51403784)
      c = gg(c, d, a, b, k[7], 14, 1735328473)
      b = gg(b, c, d, a, k[12], 20, -1926607734)

      a = hh(a, b, c, d, k[5], 4, -378558)
      d = hh(d, a, b, c, k[8], 11, -2022574463)
      c = hh(c, d, a, b, k[11], 16, 1839030562)
      b = hh(b, c, d, a, k[14], 23, -35309556)
      a = hh(a, b, c, d, k[1], 4, -1530992060)
      d = hh(d, a, b, c, k[4], 11, 1272893353)
      c = hh(c, d, a, b, k[7], 16, -155497632)
      b = hh(b, c, d, a, k[10], 23, -1094730640)
      a = hh(a, b, c, d, k[13], 4, 681279174)
      d = hh(d, a, b, c, k[0], 11, -358537222)
      c = hh(c, d, a, b, k[3], 16, -722521979)
      b = hh(b, c, d, a, k[6], 23, 76029189)
      a = hh(a, b, c, d, k[9], 4, -640364487)
      d = hh(d, a, b, c, k[12], 11, -421815835)
      c = hh(c, d, a, b, k[15], 16, 530742520)
      b = hh(b, c, d, a, k[2], 23, -995338651)

      a = ii(a, b, c, d, k[0], 6, -198630844)
      d = ii(d, a, b, c, k[7], 10, 1126891415)
      c = ii(c, d, a, b, k[14], 15, -1416354905)
      b = ii(b, c, d, a, k[5], 21, -57434055)
      a = ii(a, b, c, d, k[12], 6, 1700485571)
      d = ii(d, a, b, c, k[3], 10, -1894986606)
      c = ii(c, d, a, b, k[10], 15, -1051523)
      b = ii(b, c, d, a, k[1], 21, -2054922799)
      a = ii(a, b, c, d, k[8], 6, 1873313359)
      d = ii(d, a, b, c, k[15], 10, -30611744)
      c = ii(c, d, a, b, k[6], 15, -1560198380)
      b = ii(b, c, d, a, k[13], 21, 1309151649)
      a = ii(a, b, c, d, k[4], 6, -145523070)
      d = ii(d, a, b, c, k[11], 10, -1120210379)
      c = ii(c, d, a, b, k[2], 15, 718787259)
      b = ii(b, c, d, a, k[9], 21, -343485551)

      x[0] = add32(a, x[0])
      x[1] = add32(b, x[1])
      x[2] = add32(c, x[2])
      x[3] = add32(d, x[3])
    }

    function cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
      a = add32(add32(a, q), add32(x, t))
      return add32((a << s) | (a >>> (32 - s)), b)
    }

    function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
      return cmn((b & c) | ((~b) & d), a, b, x, s, t)
    }

    function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
      return cmn((b & d) | (c & (~d)), a, b, x, s, t)
    }

    function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
      return cmn(b ^ c ^ d, a, b, x, s, t)
    }

    function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
      return cmn(c ^ (b | (~d)), a, b, x, s, t)
    }

    function md51(s: string): number[] {
      const n = s.length
      const state = [1732584193, -271733879, -1732584194, 271733878]
      let i
      for (i = 64; i <= s.length; i += 64) {
        md5cycle(state, md5blk(s.substring(i - 64, i)))
      }
      s = s.substring(i - 64)
      const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      for (i = 0; i < s.length; i++)
        tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3)
      tail[i >> 2] |= 0x80 << ((i % 4) << 3)
      if (i > 55) {
        md5cycle(state, tail)
        for (i = 0; i < 16; i++) tail[i] = 0
      }
      tail[14] = n * 8
      md5cycle(state, tail)
      return state
    }

    function md5blk(s: string): number[] {
      const md5blks = []
      for (let i = 0; i < 64; i += 4) {
        md5blks[i >> 2] = s.charCodeAt(i)
          + (s.charCodeAt(i + 1) << 8)
          + (s.charCodeAt(i + 2) << 16)
          + (s.charCodeAt(i + 3) << 24)
      }
      return md5blks
    }

    const hex_chr = '0123456789abcdef'.split('')

    function rhex(n: number): string {
      let s = ''
      for (let j = 0; j < 4; j++)
        s += hex_chr[(n >> (j * 8 + 4)) & 0x0F]
          + hex_chr[(n >> (j * 8)) & 0x0F]
      return s
    }

    function hex(x: number[]): string {
      return x.map(n => rhex(n)).join('')
    }

    return hex(md51(string))
  }, [])

  const generateHashes = useCallback(async (data: string | ArrayBuffer) => {
    const results: Record<HashType, string> = {} as Record<HashType, string>
    const encoder = new TextEncoder()

    // MD5 (custom implementation)
    try {
      const textData = typeof data === 'string' ? data : new TextDecoder().decode(data)
      results['md5'] = await md5(textData)
    } catch (e) {
      results['md5'] = 'Error generating MD5'
    }

    // SHA hashes using Web Crypto API
    const hashTypes: HashType[] = ['sha-1', 'sha-256', 'sha-384', 'sha-512', 'sha-224']
    for (const type of hashTypes) {
      try {
        const buffer = typeof data === 'string' ? encoder.encode(data) : data
        const hashBuffer = await crypto.subtle.digest(type.replace('-', '').toUpperCase(), buffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        results[type] = hashHex
      } catch (e) {
        results[type] = 'Error'
      }
    }

    setOutputs(results)
    toast.success('Generated all hashes!')
  }, [md5])

  const handleGenerate = useCallback(() => {
    if (!input) {
      toast.error('Please enter text or select a file')
      return
    }

    if (inputType === 'text') {
      generateHashes(input)
    }
  }, [input, inputType, generateHashes])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setInputType('file')

    const reader = new FileReader()
    reader.onload = async (event) => {
      const buffer = event.target?.result as ArrayBuffer
      if (buffer) {
        await generateHashes(buffer)
      }
    }
    reader.readAsArrayBuffer(file)
    toast.success(`Loaded file: ${file.name}`)
  }, [generateHashes])

  const handleCopy = useCallback((hash: string) => {
    navigator.clipboard.writeText(hash)
    toast.success('Hash copied to clipboard!')
  }, [])

  const handleDownload = useCallback(() => {
    const hashText = Object.entries(outputs)
      .map(([type, hash]) => `${type.toUpperCase()}: ${hash}`)
      .join('\n')

    const blob = new Blob([hashText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hashes-${fileName || 'text'}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }, [outputs, fileName])

  const handleReset = useCallback(() => {
    setInput('')
    setOutputs({} as Record<HashType, string>)
    setFileName('')
  }, [])

  const hashLabels: Record<HashType, { label: string; bits: number; description: string }> = {
    'md5': { label: 'MD5', bits: 128, description: 'Message Digest Algorithm (deprecated, use for checksums only)' },
    'sha-1': { label: 'SHA-1', bits: 160, description: 'Secure Hash Algorithm 1 (deprecated)' },
    'sha-224': { label: 'SHA-224', bits: 224, description: 'Secure Hash Algorithm 224-bit' },
    'sha-256': { label: 'SHA-256', bits: 256, description: 'Secure Hash Algorithm 256-bit (recommended)' },
    'sha-384': { label: 'SHA-384', bits: 384, description: 'Secure Hash Algorithm 384-bit' },
    'sha-512': { label: 'SHA-512', bits: 512, description: 'Secure Hash Algorithm 512-bit' },
  }

  return (
    <ToolLayout
      title="Hash Generator"
      description="Generate MD5, SHA-1, SHA-256, SHA-512 hashes"
      icon={<HashIcon className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="flex flex-col h-full gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <button
              onClick={() => setInputType('text')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                inputType === 'text'
                  ? 'bg-omni-primary text-white'
                  : 'bg-omni-text/5 hover:bg-omni-text/10 text-omni-text'
              }`}
            >
              Text Input
            </button>
            <label className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
              inputType === 'file'
                ? 'bg-omni-primary text-white'
                : 'bg-omni-text/5 hover:bg-omni-text/10 text-omni-text'
            }`}>
              {fileName || 'Select File'}
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {inputType === 'text' && (
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to hash..."
              className="w-full h-32 bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text p-4 focus:outline-none focus:border-omni-primary/30 resize-none font-mono"
            />
          )}

          {inputType === 'text' && (
            <button
              onClick={handleGenerate}
              disabled={!input}
              className="w-full py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HashIcon className="w-4 h-4" /> Generate Hashes
            </button>
          )}
        </div>

        {/* Hash Outputs */}
        <div className="flex-1 overflow-auto space-y-3">
          {(Object.keys(hashLabels) as HashType[]).map((type) => {
            const info = hashLabels[type]
            const hash = outputs[type]
            return (
              <div key={type} className="bg-omni-bg/30 rounded-xl overflow-hidden border border-omni-text/10">
                <div className="px-4 py-3 bg-omni-text/5 border-b border-omni-text/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">{info.label}</span>
                    <span className="text-xs text-omni-text/40 ml-2">({info.bits}-bit)</span>
                  </div>
                  {hash && (
                    <button
                      onClick={() => handleCopy(hash)}
                      className="text-xs text-omni-text/40 hover:text-omni-text flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  )}
                </div>
                <div className="p-4">
                  <input
                    readOnly
                    value={hash || ''}
                    className={`w-full bg-transparent border-none text-sm font-mono focus:outline-none ${hash ? 'text-omni-text/70' : 'text-omni-text/30'}`}
                    placeholder={`${info.label} hash will appear here...`}
                  />
                  <p className="text-xs text-omni-text/40 mt-2">{info.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Download All */}
        {Object.keys(outputs).length > 0 && (
          <button
            onClick={handleDownload}
            className="w-full py-3 bg-omni-text/5 hover:bg-omni-text/10 text-omni-text rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download All Hashes
          </button>
        )}
      </div>
    </ToolLayout>
  )

  // Helper functions for MD5 (inline to avoid issues)
  function add32(a: number, b: number): number {
    return (a + b) & 0xFFFFFFFF
  }
}
