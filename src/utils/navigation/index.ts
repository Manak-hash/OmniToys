/**
 * Unified Navigation System for OmniToys ↔ OmniFlow
 *
 * Cross-app navigation with:
 * - Logo-based mode switching (OmniToys ↔ OmniFlow)
 * - Theme synchronization across both apps
 * - Shared state via BroadcastChannel
 * - Tools dropdown when in OmniFlow mode
 */

export { OmniSwitcher } from '@/components/navigation/OmniSwitcher'
export { OmniToolsDropdown } from '@/components/navigation/OmniToolsDropdown'
export { getNavigationManager, switchToOmniFlow, switchToOmniToys } from '@/utils/navigation/OmniNavigation'
export { getCurrentTheme, setTheme } from '@/utils/navigation/ThemeSync'
