import { useState } from 'react'
import { Settings, Moon, Sun, Bell, Shield, Info, ExternalLink, Github, Palette } from 'lucide-react'
import { usePreferences } from '@/store/preferences'
import { motion } from 'framer-motion'

function SettingSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-omni-text/60 uppercase tracking-wider">{title}</h3>
      <div className="bg-omni-bg/50 border border-omni-text/10 rounded-xl divide-y divide-omni-text/5">
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
      <div className="flex items-center gap-3">
        <div className="p-2 bg-omni-text/5 rounded-lg">
          <Icon className="w-5 h-5 text-omni-text/60" />
        </div>
        <div>
          <p className="font-medium text-omni-text">{title}</p>
          {description && <p className="text-sm text-omni-text/50">{description}</p>}
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
  const { theme, toggleTheme, favorites } = usePreferences()
  const [notifications, setNotifications] = useState(true)

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-omni-text font-['Space_Mono'] flex items-center gap-3">
          <Settings className="w-8 h-8" />
          Settings
        </h1>
        <p className="text-omni-text/60">Customize your OmniToys experience</p>
      </div>

      <SettingSection title="Appearance">
        <SettingRow 
          icon={Palette} 
          title="Lab Presets" 
          description="Switch between specialized laboratory themes"
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 bg-omni-primary/10 text-omni-primary rounded-full font-black uppercase tracking-widest">SOON</span>
            <div className="w-12 h-6 rounded-full bg-omni-text/10 cursor-not-allowed opacity-50 relative">
               <div className="absolute top-1 left-1 w-4 h-4 bg-white/20 rounded-full" />
            </div>
          </div>
        </SettingRow>
      </SettingSection>

      <SettingSection title="Notifications">
        <SettingRow 
          icon={Bell} 
          title="Update Notifications" 
          description="Get notified when new versions are available"
        >
          <Toggle checked={notifications} onChange={setNotifications} />
        </SettingRow>
      </SettingSection>

      <SettingSection title="Privacy">
        <SettingRow 
          icon={Shield} 
          title="Local-Only Processing" 
          description="All data stays on your device"
        >
          <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">Always On</span>
        </SettingRow>
      </SettingSection>

      <SettingSection title="About">
        <SettingRow 
          icon={Info} 
          title="Version" 
          description="Current app version"
        >
          <span className="text-sm text-omni-text/60 font-mono">v0.2.5</span>
        </SettingRow>
        <SettingRow 
          icon={Github} 
          title="Source Code" 
          description="View on GitHub"
        >
          <a 
            href="https://github.com/Manak-hash/OmniToys" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-omni-primary hover:underline text-sm"
          >
            Open <ExternalLink className="w-3 h-3" />
          </a>
        </SettingRow>
      </SettingSection>

      {favorites.length > 0 && (
        <SettingSection title="Your Favorites">
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {favorites.map(fav => (
                <span key={fav} className="px-3 py-1 bg-omni-primary/10 text-omni-primary text-sm rounded-full">
                  {fav}
                </span>
              ))}
            </div>
          </div>
        </SettingSection>
      )}
    </div>
  )
}
