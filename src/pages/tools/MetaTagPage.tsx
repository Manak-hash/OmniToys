import { useState, useCallback, useEffect } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { InputPane } from '@/components/tools/InputPane'
import { OutputPane } from '@/components/tools/OutputPane'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { Globe, Copy, Image as ImageIcon, Link2, FileText, Video, ShoppingBag, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface MetaData {
  title: string
  description: string
  image: string
  url: string
  siteName: string
  type: string
  author: string
  keywords: string
  twitterCard: 'summary' | 'summary_large_image' | 'app' | 'player'
  locale: string
  articleType?: string
  articlePublishedTime?: string
  articleModifiedTime?: string
  articleAuthor?: string
  articleSection?: string
  articleTag?: string[]
}

type ContentType = 'website' | 'article' | 'product' | 'video'

const DEFAULT_META: MetaData = {
  title: 'OmniToys - 50+ Developer Tools in One PWA',
  description: 'Privacy-focused, offline-capable Progressive Web App with 50+ developer tools. All tools execute locally in your browser.',
  image: 'https://github.com/Manak-hash/OmniToys/blob/main/src/assets/icons/OmniToys(Banner).png?raw=true',
  url: 'https://omnitoys.vercel.app',
  siteName: 'OmniToys',
  type: 'website',
  author: 'OmniToys',
  keywords: 'developer tools, PWA, offline, privacy, web tools',
  twitterCard: 'summary_large_image',
  locale: 'en_US',
}

const CONTENT_PRESETS: Record<ContentType, Partial<MetaData>> = {
  website: {
    type: 'website',
    twitterCard: 'summary_large_image',
  },
  article: {
    type: 'article',
    twitterCard: 'summary_large_image',
    articleType: 'article',
  },
  product: {
    type: 'website',
    twitterCard: 'summary_large_image',
  },
  video: {
    type: 'video.other',
    twitterCard: 'player',
  },
}

export default function MetaTagPage() {
  const [meta, setMeta] = useState<MetaData>(DEFAULT_META)
  const [activeTab, setActiveTab] = useState<'html' | 'twitter' | 'facebook' | 'linkedin' | 'json-ld'>('html')
  const [contentType, setContentType] = useState<ContentType>('website')
  const [score, setScore] = useState({ title: 0, description: 0, overall: 0 })

  // Calculate SEO score
  useEffect(() => {
    const titleScore = Math.min(100, Math.max(0,
      (meta.title.length >= 50 ? 30 : 0) +
      (meta.title.length <= 60 ? 30 : 0) +
      (meta.title.length > 0 ? 40 : 0)
    ))

    const descScore = Math.min(100, Math.max(0,
      (meta.description.length >= 150 ? 30 : 0) +
      (meta.description.length <= 160 ? 30 : 0) +
      (meta.description.length > 0 ? 40 : 0)
    ))

    setScore({
      title: titleScore,
      description: descScore,
      overall: Math.round((titleScore + descScore) / 2),
    })
  }, [meta.title, meta.description])

  const generateMetaTags = useCallback(() => {
    let tags = `<!-- Primary Meta Tags -->\n<title>${meta.title}</title>\n<meta name="title" content="${meta.title}" />\n<meta name="description" content="${meta.description}" />\n<meta name="keywords" content="${meta.keywords}" />\n<meta name="author" content="${meta.author}" />\n`

    if (meta.locale) {
      tags += `<meta name="locale" content="${meta.locale}" />\n`
    }

    tags += `\n<!-- Open Graph / Facebook -->\n<meta property="og:type" content="${meta.type}" />\n<meta property="og:url" content="${meta.url}" />\n<meta property="og:title" content="${meta.title}" />\n<meta property="og:description" content="${meta.description}" />\n<meta property="og:image" content="${meta.image}" />\n<meta property="og:site_name" content="${meta.siteName}" />\n`

    if (meta.locale) {
      tags += `<meta property="og:locale" content="${meta.locale}" />\n`
    }

    // Article specific tags
    if (meta.type === 'article') {
      if (meta.articlePublishedTime) {
        tags += `<meta property="article:published_time" content="${meta.articlePublishedTime}" />\n`
      }
      if (meta.articleModifiedTime) {
        tags += `<meta property="article:modified_time" content="${meta.articleModifiedTime}" />\n`
      }
      if (meta.articleAuthor) {
        tags += `<meta property="article:author" content="${meta.articleAuthor}" />\n`
      }
      if (meta.articleSection) {
        tags += `<meta property="article:section" content="${meta.articleSection}" />\n`
      }
      if (meta.articleTag && meta.articleTag.length > 0) {
        meta.articleTag.forEach(tag => {
          tags += `<meta property="article:tag" content="${tag}" />\n`
        })
      }
    }

    tags += `\n<!-- Twitter -->\n<meta property="twitter:card" content="${meta.twitterCard}" />\n<meta property="twitter:url" content="${meta.url}" />\n<meta property="twitter:title" content="${meta.title}" />\n<meta property="twitter:description" content="${meta.description}" />\n<meta property="twitter:image" content="${meta.image}" />\n`

    if (meta.siteName) {
      tags += `<meta property="twitter:site" content="@${meta.siteName.replace(/[^a-zA-Z0-9]/g, '')}" />\n`
    }

    tags += `\n<!-- Additional -->\n<link rel="canonical" href="${meta.url}" />\n`

    // Favicon
    tags += `<link rel="icon" type="image/x-icon" href="/favicon.ico" />`

    return tags
  }, [meta])

  // Generate JSON-LD Schema
  const generateJsonLd = useCallback(() => {
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': meta.type === 'article' ? 'Article' : 'WebSite',
      'name': meta.title,
      'description': meta.description,
      'url': meta.url,
    }

    if (meta.image) {
      schema.image = meta.image
    }

    if (meta.type === 'article') {
      schema.headline = meta.title
      schema.author = {
        '@type': 'Person',
        'name': meta.articleAuthor || meta.author,
      }
      if (meta.articlePublishedTime) {
        schema.datePublished = meta.articlePublishedTime
      }
      if (meta.articleModifiedTime) {
        schema.dateModified = meta.articleModifiedTime
      }
      if (meta.articleSection) {
        schema.articleSection = meta.articleSection
      }
      schema.publisher = {
        '@type': 'Organization',
        'name': meta.siteName,
        'logo': {
          '@type': 'ImageObject',
          'url': meta.image,
        },
      }
    }

    return JSON.stringify(schema, null, 2)
  }, [meta])

  const copyMetaTags = useCallback(() => {
    const tags = activeTab === 'json-ld' ? generateJsonLd() : generateMetaTags()
    navigator.clipboard.writeText(tags)
    toast.success('Meta tags copied to clipboard!')
  }, [generateMetaTags, generateJsonLd, activeTab])

  const updateMeta = useCallback((field: keyof MetaData, value: string) => {
    setMeta(prev => ({ ...prev, [field]: value }))
  }, [])

  const applyContentType = useCallback((type: ContentType) => {
    setContentType(type)
    setMeta(prev => ({ ...prev, ...CONTENT_PRESETS[type], type: CONTENT_PRESETS[type].type || 'website' }))
    toast.success(`Applied ${type} content type`)
  }, [])

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-400'
    if (s >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreIcon = (s: number) => {
    if (s >= 80) return <CheckCircle className={`w-4 h-4 ${getScoreColor(s)}`} />
    return <AlertCircle className={`w-4 h-4 ${getScoreColor(s)}`} />
  }

  return (
    <ToolLayout
      title="Meta Tag Pro"
      description="Generate SEO meta tags with live preview cards"
      icon={<Globe className="w-8 h-8" />}
      actions={<ActionToolbar onReset={() => setMeta(DEFAULT_META)} />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[500px]">
        {/* Input Panel */}
        <InputPane title="Meta Data">
          <div className="flex flex-col h-full p-6 gap-5 overflow-auto">
            {/* Content Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Content Type</label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => applyContentType('website')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all flex flex-col items-center gap-1 ${
                    contentType === 'website'
                      ? 'bg-omni-primary text-white'
                      : 'bg-omni-text/5 hover:bg-omni-text/10 text-omni-text/70'
                  }`}
                >
                  <Globe className="w-4 h-4" /> Website
                </button>
                <button
                  onClick={() => applyContentType('article')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all flex flex-col items-center gap-1 ${
                    contentType === 'article'
                      ? 'bg-omni-primary text-white'
                      : 'bg-omni-text/5 hover:bg-omni-text/10 text-omni-text/70'
                  }`}
                >
                  <FileText className="w-4 h-4" /> Article
                </button>
                <button
                  onClick={() => applyContentType('product')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all flex flex-col items-center gap-1 ${
                    contentType === 'product'
                      ? 'bg-omni-primary text-white'
                      : 'bg-omni-text/5 hover:bg-omni-text/10 text-omni-text/70'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" /> Product
                </button>
                <button
                  onClick={() => applyContentType('video')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all flex flex-col items-center gap-1 ${
                    contentType === 'video'
                      ? 'bg-omni-primary text-white'
                      : 'bg-omni-text/5 hover:bg-omni-text/10 text-omni-text/70'
                  }`}
                >
                  <Video className="w-4 h-4" /> Video
                </button>
              </div>
            </div>

            {/* SEO Score */}
            <div className="p-4 bg-omni-text/5 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">SEO Score</span>
                <div className="flex items-center gap-2">
                  {getScoreIcon(score.overall)}
                  <span className={`text-lg font-black ${getScoreColor(score.overall)}`}>{score.overall}%</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-omni-text/50">Title</span>
                  <div className="flex items-center gap-1">
                    {getScoreIcon(score.title)}
                    <span className={getScoreColor(score.title)}>{score.title}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-omni-text/50">Description</span>
                  <div className="flex items-center gap-1">
                    {getScoreIcon(score.description)}
                    <span className={getScoreColor(score.description)}>{score.description}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Title</label>
              <input
                type="text"
                value={meta.title}
                onChange={(e) => updateMeta('title', e.target.value)}
                placeholder="Page title"
                maxLength={60}
                className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text focus:outline-none focus:border-omni-primary/30 transition-colors"
              />
              <div className="flex justify-between text-xs text-omni-text/30">
                <span>Recommended: 50-60 characters</span>
                <span className={meta.title.length >= 50 && meta.title.length <= 60 ? 'text-green-400' : 'text-yellow-400'}>
                  {meta.title.length}/60
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Description</label>
              <textarea
                value={meta.description}
                onChange={(e) => updateMeta('description', e.target.value)}
                placeholder="Page description"
                rows={3}
                maxLength={160}
                className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text focus:outline-none focus:border-omni-primary/30 transition-colors resize-none"
              />
              <div className="flex justify-between text-xs text-omni-text/30">
                <span>Recommended: 150-160 characters</span>
                <span className={meta.description.length >= 150 && meta.description.length <= 160 ? 'text-green-400' : 'text-yellow-400'}>
                  {meta.description.length}/160
                </span>
              </div>
            </div>

            {/* URL */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">URL</label>
              <div className="relative">
                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-omni-text/30" />
                <input
                  type="url"
                  value={meta.url}
                  onChange={(e) => updateMeta('url', e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-10 pr-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text focus:outline-none focus:border-omni-primary/30 transition-colors"
                />
              </div>
            </div>

            {/* Image */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Image URL</label>
              <div className="relative">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-omni-text/30" />
                <input
                  type="url"
                  value={meta.image}
                  onChange={(e) => updateMeta('image', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full pl-10 pr-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text focus:outline-none focus:border-omni-primary/30 transition-colors"
                />
              </div>
              <div className="text-xs text-omni-text/30">Recommended: 1200x630px (1.91:1 ratio)</div>
            </div>

            {/* Site Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Site Name</label>
              <input
                type="text"
                value={meta.siteName}
                onChange={(e) => updateMeta('siteName', e.target.value)}
                placeholder="Your site name"
                className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text focus:outline-none focus:border-omni-primary/30 transition-colors"
              />
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Keywords</label>
              <input
                type="text"
                value={meta.keywords}
                onChange={(e) => updateMeta('keywords', e.target.value)}
                placeholder="keyword1, keyword2, keyword3"
                className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text focus:outline-none focus:border-omni-primary/30 transition-colors"
              />
            </div>

            {/* Twitter Card Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Twitter Card</label>
              <select
                value={meta.twitterCard}
                onChange={(e) => updateMeta('twitterCard', e.target.value as any)}
                className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text focus:outline-none focus:border-omni-primary/30 transition-colors"
              >
                <option value="summary">Summary Card</option>
                <option value="summary_large_image">Summary Card with Large Image</option>
                <option value="app">App Card</option>
                <option value="player">Player Card</option>
              </select>
            </div>

            {/* Locale */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Locale</label>
              <select
                value={meta.locale}
                onChange={(e) => updateMeta('locale', e.target.value)}
                className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text focus:outline-none focus:border-omni-primary/30 transition-colors"
              >
                <option value="en_US">English (US)</option>
                <option value="en_GB">English (UK)</option>
                <option value="fr_FR">French (France)</option>
                <option value="de_DE">German (Germany)</option>
                <option value="es_ES">Spanish (Spain)</option>
                <option value="it_IT">Italian (Italy)</option>
                <option value="pt_BR">Portuguese (Brazil)</option>
                <option value="ja_JP">Japanese (Japan)</option>
                <option value="ko_KR">Korean (Korea)</option>
                <option value="zh_CN">Chinese (China)</option>
              </select>
            </div>

            {/* Article-specific fields */}
            {meta.type === 'article' && (
              <>
                <div className="col-span-2 pt-4 border-t border-omni-text/10">
                  <div className="text-xs font-bold text-omni-text/50 uppercase tracking-wider mb-3">Article Metadata</div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Article Author</label>
                  <input
                    type="text"
                    value={meta.articleAuthor || ''}
                    onChange={(e) => updateMeta('articleAuthor', e.target.value)}
                    placeholder="Author name"
                    className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text focus:outline-none focus:border-omni-primary/30 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Section</label>
                  <input
                    type="text"
                    value={meta.articleSection || ''}
                    onChange={(e) => updateMeta('articleSection', e.target.value)}
                    placeholder="e.g., Technology"
                    className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text focus:outline-none focus:border-omni-primary/30 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Published Date</label>
                  <input
                    type="datetime-local"
                    value={meta.articlePublishedTime || ''}
                    onChange={(e) => updateMeta('articlePublishedTime', e.target.value)}
                    className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text focus:outline-none focus:border-omni-primary/30 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Modified Date</label>
                  <input
                    type="datetime-local"
                    value={meta.articleModifiedTime || ''}
                    onChange={(e) => updateMeta('articleModifiedTime', e.target.value)}
                    className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text focus:outline-none focus:border-omni-primary/30 transition-colors"
                  />
                </div>
              </>
            )}
          </div>
        </InputPane>

        {/* Output Panel */}
        <OutputPane title="Preview">
          <div className="flex flex-col h-full">
            {/* Tabs */}
            <div className="flex gap-2 p-4 border-b border-omni-text/5 bg-omni-bg/40 flex-wrap">
              <button
                onClick={() => setActiveTab('html')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                  activeTab === 'html'
                    ? 'bg-omni-primary text-white'
                    : 'bg-omni-text/5 text-omni-text/50 hover:bg-omni-text/10'
                }`}
              >
                HTML Code
              </button>
              <button
                onClick={() => setActiveTab('json-ld')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                  activeTab === 'json-ld'
                    ? 'bg-omni-primary text-white'
                    : 'bg-omni-text/5 text-omni-text/50 hover:bg-omni-text/10'
                }`}
              >
                JSON-LD Schema
              </button>
              <button
                onClick={() => setActiveTab('twitter')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                  activeTab === 'twitter'
                    ? 'bg-omni-primary text-white'
                    : 'bg-omni-text/5 text-omni-text/50 hover:bg-omni-text/10'
                }`}
              >
                Twitter
              </button>
              <button
                onClick={() => setActiveTab('facebook')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                  activeTab === 'facebook'
                    ? 'bg-omni-primary text-white'
                    : 'bg-omni-text/5 text-omni-text/50 hover:bg-omni-text/10'
                }`}
              >
                Facebook
              </button>
              <button
                onClick={() => setActiveTab('linkedin')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                  activeTab === 'linkedin'
                    ? 'bg-omni-primary text-white'
                    : 'bg-omni-text/5 text-omni-text/50 hover:bg-omni-text/10'
                }`}
              >
                LinkedIn
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
              {activeTab === 'html' || activeTab === 'json-ld' ? (
                <div className="p-6">
                  <pre className="text-xs font-mono text-omni-text/70 whitespace-pre-wrap">
                    {activeTab === 'html' ? generateMetaTags() : generateJsonLd()}
                  </pre>
                  <button
                    onClick={copyMetaTags}
                    className="w-full mt-6 py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy {activeTab === 'html' ? 'HTML' : 'JSON-LD'}
                  </button>
                </div>
              ) : (
                <div className="p-6 flex items-center justify-center bg-white">
                  {activeTab === 'twitter' && (
                    <TwitterPreview meta={meta} cardType={meta.twitterCard} />
                  )}
                  {activeTab === 'facebook' && (
                    <FacebookPreview meta={meta} />
                  )}
                  {activeTab === 'linkedin' && (
                    <LinkedInPreview meta={meta} />
                  )}
                </div>
              )}
            </div>
          </div>
        </OutputPane>
      </div>
    </ToolLayout>
  )
}

// Twitter Preview Component
function TwitterPreview({ meta, cardType }: { meta: MetaData; cardType: string }) {
  return (
    <div className="w-full max-w-lg border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="p-3 border-b border-gray-100 flex items-center gap-2">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div>
          <div className="font-bold text-sm text-gray-900">{meta.siteName}</div>
          <div className="text-xs text-gray-500">{meta.url}</div>
        </div>
      </div>
      {cardType === 'summary_large_image' && meta.image && (
        <div className="aspect-[1.91/1] bg-gray-100">
          <img src={meta.image} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect fill="%23ddd" width="400" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E' }} />
        </div>
      )}
      <div className="p-3">
        <div className="text-xs text-gray-500 mb-1">{meta.url}</div>
        <div className="font-bold text-gray-900 mb-1">{meta.title}</div>
        <div className="text-sm text-gray-700 line-clamp-2">{meta.description}</div>
        {cardType === 'summary' && meta.image && (
          <div className="mt-2 rounded-lg overflow-hidden">
            <img src={meta.image} alt="" className="w-full h-32 object-cover" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect fill="%23ddd" width="400" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E' }} />
          </div>
        )}
      </div>
    </div>
  )
}

// Facebook Preview Component
function FacebookPreview({ meta }: { meta: MetaData }) {
  return (
    <div className="w-full max-w-lg border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="p-2.5 border-b border-gray-200 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        <div className="font-semibold text-gray-700">Facebook</div>
      </div>
      <div className="p-2">
        <div className="text-xs text-gray-600 mb-1 uppercase">{meta.url}</div>
        <div className="font-bold text-gray-900 mb-1">{meta.title}</div>
        <div className="text-sm text-gray-700 mb-2 line-clamp-2">{meta.description}</div>
        {meta.image && (
          <div className="rounded overflow-hidden bg-gray-100">
            <img src={meta.image} alt="" className="w-full h-48 object-cover" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect fill="%23ddd" width="400" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E' }} />
          </div>
        )}
      </div>
    </div>
  )
}

// LinkedIn Preview Component
function LinkedInPreview({ meta }: { meta: MetaData }) {
  return (
    <div className="w-full max-w-lg border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-700" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        <div className="font-semibold text-gray-700">LinkedIn</div>
      </div>
      <div className="p-3">
        <div className="font-bold text-gray-900 mb-1">{meta.title}</div>
        <div className="text-sm text-gray-600 mb-2">{meta.siteName}</div>
        {meta.image && (
          <div className="rounded overflow-hidden bg-gray-100 mb-2">
            <img src={meta.image} alt="" className="w-full h-40 object-cover" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect fill="%23ddd" width="400" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E' }} />
          </div>
        )}
        <div className="text-sm text-gray-700 line-clamp-3">{meta.description}</div>
      </div>
    </div>
  )
}
