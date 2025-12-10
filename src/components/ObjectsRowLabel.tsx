'use client'

import { useRowLabel } from '@payloadcms/ui'

export const ObjectsRowLabel = () => {
  const { data, rowNumber } = useRowLabel<{ name?: string }>()

  const label = data?.name || `Document ${(rowNumber ?? 0) + 1}`

  return <div>{label}</div>
}
