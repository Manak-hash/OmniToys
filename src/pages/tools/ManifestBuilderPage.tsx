import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { InputPane } from '@/components/tools/InputPane'
import { OutputPane } from '@/components/tools/OutputPane'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { FileCode, Copy, Download, Smartphone, Apple } from 'lucide-react'
import { toast } from 'sonner'

interface AndroidConfig {
  packageName: string
  appName: string
  versionCode: string
  versionName: string
  minSdk: string
  targetSdk: string
  permissions: string[]
}

interface IosConfig {
  bundleIdentifier: string
  appName: string
  version: string
  build: string
  permissions: string[]
}

const ANDROID_PERMISSIONS = [
  'INTERNET',
  'ACCESS_NETWORK_STATE',
  'ACCESS_WIFI_STATE',
  'CAMERA',
  'READ_EXTERNAL_STORAGE',
  'WRITE_EXTERNAL_STORAGE',
  'RECORD_AUDIO',
  'ACCESS_FINE_LOCATION',
  'ACCESS_COARSE_LOCATION',
  'VIBRATE',
  'READ_CONTACTS',
  'WRITE_CONTACTS',
  'READ_PHONE_STATE',
  'CALL_PHONE',
  'SEND_SMS',
  'RECEIVE_SMS',
  'READ_SMS',
  'BLUETOOTH',
  'BLUETOOTH_ADMIN',
  'NFC',
  'FLASHLIGHT',
]

const IOS_PERMISSIONS = [
  'NSCameraUsageDescription',
  'NSPhotoLibraryUsageDescription',
  'NSMicrophoneUsageDescription',
  'NSLocationWhenInUseUsageDescription',
  'NSLocationAlwaysUsageDescription',
  'NSContactsUsageDescription',
  'NSCalendarsUsageDescription',
  'NSRemindersUsageDescription',
  'NSFaceIDUsageDescription',
  'NSSpeechRecognitionUsageDescription',
]

export default function ManifestBuilderPage() {
  const [platform, setPlatform] = useState<'android' | 'ios'>('android')
  const [androidConfig, setAndroidConfig] = useState<AndroidConfig>({
    packageName: 'com.example.app',
    appName: 'My App',
    versionCode: '1',
    versionName: '1.0.0',
    minSdk: '21',
    targetSdk: '34',
    permissions: ['INTERNET'],
  })
  const [iosConfig, setIosConfig] = useState<IosConfig>({
    bundleIdentifier: 'com.example.app',
    appName: 'My App',
    version: '1.0.0',
    build: '1',
    permissions: [],
  })

  const [output, setOutput] = useState('')
  const [fileName, setFileName] = useState('')

  const generateAndroidManifest = useCallback(() => {
    const permissionsXml = androidConfig.permissions
      .map(perm => `    <uses-permission android:name="android.permission.${perm}" />`)
      .join('\n')

    return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${androidConfig.packageName}">

${permissionsXml ? permissionsXml + '\n' : ''}    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${androidConfig.appName}"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>`
  }, [androidConfig])

  const generateInfoPlist = useCallback(() => {
    const permissionsDict = iosConfig.permissions
      .filter(p => p.startsWith('NS'))
      .map(perm => {
        const key = perm
        const description = iosConfig[key as keyof IosConfig] as string || 'This app requires access to use this feature.'
        return `    <key>${key}</key>
    <string>${description}</string>`
      })
      .join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>$(DEVELOPMENT_LANGUAGE)</string>
    <key>CFBundleDisplayName</key>
    <string>${iosConfig.appName}</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>${iosConfig.bundleIdentifier}</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>$(PRODUCT_NAME)</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>${iosConfig.version}</string>
    <key>CFBundleVersion</key>
    <string>${iosConfig.build}</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
${permissionsDict ? permissionsDict + '\n' : ''}    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>armv7</string>
    </array>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UISupportedInterfaceOrientations~ipad</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationPortraitUpsideDown</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
</dict>
</plist>`
  }, [iosConfig])

  const handleGenerate = useCallback(() => {
    const manifest = platform === 'android' ? generateAndroidManifest() : generateInfoPlist()
    setOutput(manifest)
    setFileName(platform === 'android' ? 'AndroidManifest.xml' : 'Info.plist')
    toast.success(`${platform === 'android' ? 'Android' : 'iOS'} manifest generated!`)
  }, [platform, generateAndroidManifest, generateInfoPlist])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output)
    toast.success('Manifest copied!')
  }, [output])

  const handleDownload = useCallback(() => {
    const blob = new Blob([output], { type: 'text/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }, [output, fileName])

  const handleReset = useCallback(() => {
    setAndroidConfig({
      packageName: 'com.example.app',
      appName: 'My App',
      versionCode: '1',
      versionName: '1.0.0',
      minSdk: '21',
      targetSdk: '34',
      permissions: ['INTERNET'],
    })
    setIosConfig({
      bundleIdentifier: 'com.example.app',
      appName: 'My App',
      version: '1.0.0',
      build: '1',
      permissions: [],
    })
    setOutput('')
    setFileName('')
  }, [])

  const togglePermission = useCallback((permission: string) => {
    if (platform === 'android') {
      setAndroidConfig(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permission)
          ? prev.permissions.filter(p => p !== permission)
          : [...prev.permissions, permission],
      }))
    } else {
      setIosConfig(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permission)
          ? prev.permissions.filter(p => p !== permission)
          : [...prev.permissions, permission],
      }))
    }
  }, [platform])

  return (
    <ToolLayout
      title="Manifest Builder"
      description="Generate AndroidManifest.xml and Info.plist files"
      icon={<FileCode className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[500px]">
        {/* Input Panel */}
        <InputPane title="Configuration">
          <div className="flex flex-col h-full p-6 gap-6 overflow-auto">
            {/* Platform Toggle */}
            <div className="flex gap-2 p-1 bg-omni-text/5 rounded-lg">
              <button
                onClick={() => setPlatform('android')}
                className={`flex-1 px-3 py-2 rounded text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                  platform === 'android'
                    ? 'bg-omni-primary text-white'
                    : 'text-omni-text/50 hover:text-omni-text'
                }`}
              >
                <Smartphone className="w-4 h-4" /> Android
              </button>
              <button
                onClick={() => setPlatform('ios')}
                className={`flex-1 px-3 py-2 rounded text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                  platform === 'ios'
                    ? 'bg-omni-primary text-white'
                    : 'text-omni-text/50 hover:text-omni-text'
                }`}
              >
                <Apple className="w-4 h-4" /> iOS
              </button>
            </div>

            {platform === 'android' ? (
              <>
                {/* Android Config */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider block mb-2">Package Name</label>
                    <input
                      type="text"
                      value={androidConfig.packageName}
                      onChange={(e) => setAndroidConfig(prev => ({ ...prev, packageName: e.target.value }))}
                      className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-lg text-sm text-omni-text font-mono focus:outline-none focus:border-omni-primary/30"
                      placeholder="com.example.app"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider block mb-2">App Name</label>
                    <input
                      type="text"
                      value={androidConfig.appName}
                      onChange={(e) => setAndroidConfig(prev => ({ ...prev, appName: e.target.value }))}
                      className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-lg text-sm text-omni-text focus:outline-none focus:border-omni-primary/30"
                      placeholder="My App"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider block mb-2">Version Code</label>
                      <input
                        type="text"
                        value={androidConfig.versionCode}
                        onChange={(e) => setAndroidConfig(prev => ({ ...prev, versionCode: e.target.value }))}
                        className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-lg text-sm text-omni-text font-mono focus:outline-none focus:border-omni-primary/30"
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider block mb-2">Version Name</label>
                      <input
                        type="text"
                        value={androidConfig.versionName}
                        onChange={(e) => setAndroidConfig(prev => ({ ...prev, versionName: e.target.value }))}
                        className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-lg text-sm text-omni-text font-mono focus:outline-none focus:border-omni-primary/30"
                        placeholder="1.0.0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider block mb-2">Min SDK</label>
                      <input
                        type="text"
                        value={androidConfig.minSdk}
                        onChange={(e) => setAndroidConfig(prev => ({ ...prev, minSdk: e.target.value }))}
                        className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-lg text-sm text-omni-text font-mono focus:outline-none focus:border-omni-primary/30"
                        placeholder="21"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider block mb-2">Target SDK</label>
                      <input
                        type="text"
                        value={androidConfig.targetSdk}
                        onChange={(e) => setAndroidConfig(prev => ({ ...prev, targetSdk: e.target.value }))}
                        className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-lg text-sm text-omni-text font-mono focus:outline-none focus:border-omni-primary/30"
                        placeholder="34"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider block mb-2">Permissions</label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto p-2 bg-omni-text/5 rounded-lg">
                      {ANDROID_PERMISSIONS.map(perm => (
                        <button
                          key={perm}
                          onClick={() => togglePermission(perm)}
                          className={`px-2 py-1.5 rounded text-xs font-mono text-left transition-all ${
                            androidConfig.permissions.includes(perm)
                              ? 'bg-omni-primary text-white'
                              : 'bg-omni-bg hover:bg-omni-text/10 text-omni-text/60'
                          }`}
                        >
                          {perm}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* iOS Config */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider block mb-2">Bundle Identifier</label>
                    <input
                      type="text"
                      value={iosConfig.bundleIdentifier}
                      onChange={(e) => setIosConfig(prev => ({ ...prev, bundleIdentifier: e.target.value }))}
                      className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-lg text-sm text-omni-text font-mono focus:outline-none focus:border-omni-primary/30"
                      placeholder="com.example.app"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider block mb-2">App Name</label>
                    <input
                      type="text"
                      value={iosConfig.appName}
                      onChange={(e) => setIosConfig(prev => ({ ...prev, appName: e.target.value }))}
                      className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-lg text-sm text-omni-text focus:outline-none focus:border-omni-primary/30"
                      placeholder="My App"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider block mb-2">Version</label>
                      <input
                        type="text"
                        value={iosConfig.version}
                        onChange={(e) => setIosConfig(prev => ({ ...prev, version: e.target.value }))}
                        className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-lg text-sm text-omni-text font-mono focus:outline-none focus:border-omni-primary/30"
                        placeholder="1.0.0"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider block mb-2">Build</label>
                      <input
                        type="text"
                        value={iosConfig.build}
                        onChange={(e) => setIosConfig(prev => ({ ...prev, build: e.target.value }))}
                        className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-lg text-sm text-omni-text font-mono focus:outline-none focus:border-omni-primary/30"
                        placeholder="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider block mb-2">Permissions</label>
                    <div className="space-y-2 max-h-48 overflow-auto p-2 bg-omni-text/5 rounded-lg">
                      {IOS_PERMISSIONS.map(perm => (
                        <div key={perm} className="flex items-center gap-2">
                          <button
                            onClick={() => togglePermission(perm)}
                            className={`flex-1 px-2 py-1.5 rounded text-xs font-mono text-left transition-all ${
                              iosConfig.permissions.includes(perm)
                                ? 'bg-omni-primary text-white'
                                : 'bg-omni-bg hover:bg-omni-text/10 text-omni-text/60'
                            }`}
                          >
                            {perm}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              className="w-full py-4 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2"
            >
              <FileCode className="w-4 h-4" /> Generate Manifest
            </button>
          </div>
        </InputPane>

        {/* Output Panel */}
        <OutputPane title={`Generated ${platform === 'android' ? 'AndroidManifest.xml' : 'Info.plist'}`}>
          <div className="flex flex-col h-full">
            {/* Output */}
            <div className="flex-1 p-6 min-h-0">
              {output ? (
                <textarea
                  readOnly
                  value={output}
                  className="w-full h-full min-h-[300px] bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text/70 p-4 focus:outline-none resize-none font-mono"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-omni-text/30">
                  <div className="text-center">
                    <FileCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Configure your app and click "Generate Manifest"</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {output && (
              <div className="p-4 border-t border-omni-text/5 flex gap-3">
                <button
                  onClick={handleCopy}
                  className="flex-1 py-3 bg-omni-text/5 hover:bg-omni-text/10 text-omni-text rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" /> Copy
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Save
                </button>
              </div>
            )}
          </div>
        </OutputPane>
      </div>
    </ToolLayout>
  )
}
