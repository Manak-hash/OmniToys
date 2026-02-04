import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { 
  Shield, Bell, Database, 
  Monitor, Palette, Info, ExternalLink, Github, Settings 
} from 'lucide-react'
import { usePreferences } from '@/store/preferences'
import { motion } from 'framer-motion'

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black uppercase tracking-widest text-omni-text/20 ml-1">{title}</h3>
      <div className="glass-card rounded-[32px] overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function SettingRow({ icon: Icon, title, description, children }: { 
  icon: React.ElementType, 
  title: string, 
  description?: string,
  children: React.ReactNode 
}) {
  return (
    <div className="flex items-center justify-between p-4 gap-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-omni-text/5 flex items-center justify-center text-omni-text/40">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-omni-text">{title}</h4>
          {description && <p className="text-xs text-omni-text/40">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <button 
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-omni-primary' : 'bg-omni-text/20'}`}
    >
      <motion.div 
        className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow"
        animate={{ x: checked ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

export default function SettingsPage() {
  const { 
    clearFavorites, 
    lowDataMode, setLowDataMode,
    vibrationEnabled, setVibrationEnabled 
  } = usePreferences()
  const [notifications, setNotifications] = useState(true)

  return (
    <ToolLayout
      title="System Configuration"
      description="Fine-tune your lab environment and data persistence settings."
      icon={<Settings className="w-8 h-8" />}
    >
      <div className="max-w-3xl mx-auto space-y-10 pb-20">
        <Section title="Interface & Experience">
          <SettingRow 
            icon={Palette} 
            title="Appearance" 
            description="System theme is automatically synced with your OS."
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-omni-text/20 bg-omni-text/5 px-3 py-1 rounded-full">AUTO_SYNC</span>
          </SettingRow>
          
          <div className="h-px bg-omni-text/5 mx-4" />
          
          <SettingRow 
            icon={Monitor} 
            title="Low Data Mode" 
            description="Disable non-critical animations and heavy effects."
          >
            <Toggle checked={lowDataMode} onChange={setLowDataMode} />
          </SettingRow>

          <div className="h-px bg-omni-text/5 mx-4" />

          <SettingRow 
            icon={Shield} 
            title="Haptic Feedback" 
            description="Subtle vibrations for critical system interactions."
          >
            <Toggle checked={vibrationEnabled} onChange={setVibrationEnabled} />
          </SettingRow>
        </Section>

        <Section title="Laboratory Communications">
          <SettingRow 
            icon={Bell} 
            title="Process Notifications" 
            description="Get alerted when long-running Wasm tasks complete."
          >
            <Toggle checked={notifications} onChange={setNotifications} />
          </SettingRow>
        </Section>

        <Section title="Storage & Persistence">
          <SettingRow 
            icon={Database} 
            title="Local Cache" 
            description="Clear all favorites and tool history from this browser."
          >
            <button 
              onClick={clearFavorites}
              className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
            >
              Flush Data
            </button>
          </SettingRow>
        </Section>

        <Section title="Protocol Info">
          <div className="p-6 space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Info className="w-5 h-5 text-omni-text/20" />
                   <span className="text-sm font-bold text-omni-text">Project Version</span>
                </div>
                <span className="font-mono text-xs text-omni-text/40">v0.2.12 (BETA_LAB)</span>
             </div>
             <div className="h-px bg-omni-text/5" />
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Github className="w-5 h-5 text-omni-text/20" />
                   <span className="text-sm font-bold text-omni-text">Source Repository</span>
                </div>
                <a href="https://github.com/Manak-hash/OmniToys" target="_blank" rel="noreferrer" className="text-omni-primary hover:underline text-xs flex items-center gap-1 font-bold">
                   GitHub <ExternalLink className="w-3 h-3" />
                </a>
             </div>
          </div>
        </Section>

        <div className="text-center space-y-2 opacity-20">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] font-mono">OmniToys Lab Environment</p>
           <p className="text-[8px] font-medium leading-relaxed max-w-xs mx-auto">All tools run locally via WASM or client-side JS. No tracking. No telemetry. Pure efficiency.</p>
        </div>
      </div>
    </ToolLayout>
  )
}
