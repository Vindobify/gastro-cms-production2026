'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface MaintenanceData {
  maintenanceMode: boolean
  maintenanceTitle: string
  maintenanceMessage: string
}

export default function MaintenanceCheck() {
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkMaintenanceMode()
  }, [])

  const checkMaintenanceMode = async () => {
    try {
      const response = await fetch('/api/maintenance/check')
      const data = await response.json()
      setMaintenanceData(data)
      
      // Wenn Maintenance-Modus aktiv ist und wir nicht auf der Maintenance-Seite sind
      if (data.maintenanceMode && !window.location.pathname.startsWith('/maintenance') && !window.location.pathname.startsWith('/dashboard')) {
        router.push('/maintenance')
      }
    } catch (error) {
      console.error('Error checking maintenance mode:', error)
    } finally {
      setLoading(false)
    }
  }

  // Zeige nichts während des Ladens
  if (loading) {
    return null
  }

  return null
}
