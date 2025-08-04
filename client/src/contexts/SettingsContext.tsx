import React, { createContext, useContext, useState, useEffect } from 'react'
import { getPublicSettings } from '@/api/settings'

interface SettingsContextType {
  logo: string
  siteName: string
  siteDescription: string
  updateLogo: (logo: string) => void
  updateSiteName: (siteName: string) => void
  updateSiteDescription: (siteDescription: string) => void
  refreshSettings: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [logo, setLogo] = useState<string>('')
  const [siteName, setSiteName] = useState<string>('WebCore Enterprise')
  const [siteDescription, setSiteDescription] = useState<string>('Advanced Content Management System')

  const refreshSettings = async () => {
    try {
      const data = await getPublicSettings()
      console.log('SettingsContext: Received settings data:', data)
      console.log('SettingsContext: Data structure check:', {
        hasGeneral: !!data?.general,
        hasBranding: !!data?.branding,
        generalLogo: data?.general?.logo ? 'SET' : 'EMPTY',
        primaryLogo: data?.branding?.primaryLogo ? 'SET' : 'EMPTY',
        siteName: data?.general?.siteName
      })

      // Try general.logo first, then fallback to branding.primaryLogo
      let logoUrl = data.general?.logo || data.branding?.primaryLogo || ''

      // Only set logo if it's a valid data URL, don't try to load external URLs that might fail
      if (logoUrl && logoUrl.startsWith('data:')) {
        console.log('SettingsContext: Setting logo from', data.general?.logo ? 'general.logo' : 'branding.primaryLogo')
        setLogo(logoUrl)
      } else {
        console.log('SettingsContext: No valid logo found, using fallback')
        setLogo('')
      }

      setSiteName(data.general?.siteName || 'WebCore Enterprise')
      setSiteDescription(data.general?.siteDescription || 'Advanced Content Management System')
    } catch (error) {
      console.error('Error fetching public settings:', error)
      // Set default values on error
      setLogo('')
      setSiteName('WebCore Enterprise')
      setSiteDescription('Advanced Content Management System')
    }
  }

  useEffect(() => {
    refreshSettings()
  }, [])

  const updateLogo = (newLogo: string) => {
    setLogo(newLogo)
  }

  const updateSiteName = (newSiteName: string) => {
    setSiteName(newSiteName)
  }

  const updateSiteDescription = (newSiteDescription: string) => {
    setSiteDescription(newSiteDescription)
  }

  return (
    <SettingsContext.Provider value={{
      logo,
      siteName,
      siteDescription,
      updateLogo,
      updateSiteName,
      updateSiteDescription,
      refreshSettings
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}