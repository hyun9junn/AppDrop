'use client'
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'appdrop_device_id'

function getOrCreateDeviceId(): string {
  const existing = localStorage.getItem(STORAGE_KEY)
  if (existing) return existing
  const id = crypto.randomUUID()
  localStorage.setItem(STORAGE_KEY, id)
  return id
}

export function useDeviceId(): string {
  const [deviceId, setDeviceId] = useState('')
  useEffect(() => {
    setDeviceId(getOrCreateDeviceId())
  }, [])
  return deviceId
}
