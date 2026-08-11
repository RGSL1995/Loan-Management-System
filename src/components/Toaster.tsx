"use client"

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'

export function Toaster() {
  const toasts = useAppStore((state) => state.toasts)
  const removeToast = useAppStore((state) => state.removeToast)
  const addToast = useAppStore((state) => state.addToast)

  useEffect(() => {
    let channel: any

    const initSubscription = async () => {
      try {
        const supabase = await createClient()

        // Subscribe to ops_cases table changes
        channel = supabase
          .channel('schema-db-changes')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'ops_cases' },
            (payload: any) => {
              const newCase = payload.new as any
              addToast({
                title: 'New Operations Case',
                description: `Case ${newCase.case_number} created for ${newCase.client_id}`,
                type: 'info'
              })
            }
          )
          .subscribe()
      } catch (err) {
        console.error('Failed to initialize Supabase subscription:', err)
      }
    }

    initSubscription()

    return () => {
      if (channel) {
        channel.unsubscribe?.()
      }
    }
  }, [addToast])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = 
          toast.type === 'success' ? CheckCircle :
          toast.type === 'error' ? XCircle :
          toast.type === 'warning' ? AlertCircle : Info

        const bgColor = 
          toast.type === 'success' ? 'bg-green-50 border-green-200' :
          toast.type === 'error' ? 'bg-red-50 border-red-200' :
          toast.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'
        
        const textColor = 
          toast.type === 'success' ? 'text-green-800' :
          toast.type === 'error' ? 'text-red-800' :
          toast.type === 'warning' ? 'text-yellow-800' : 'text-blue-800'

        return (
          <div 
            key={toast.id}
            className={`flex items-start gap-3 p-4 border rounded-lg shadow-lg w-80 transition-all ${bgColor}`}
            onClick={() => removeToast(toast.id)}
          >
            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${textColor}`} />
            <div className="flex flex-col gap-1">
              <h4 className={`text-sm font-semibold ${textColor}`}>{toast.title}</h4>
              {toast.description && (
                <p className={`text-xs ${textColor} opacity-90`}>{toast.description}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
