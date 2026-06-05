import type { Sensation } from '@/lib/domain/enums/Sensation'
import type { MucusAppearance } from '@/lib/domain/enums/MucusAppearance'
import type { MucusQuantity } from '@/lib/domain/enums/MucusQuantity'
import type { BleedingIntensity } from '@/lib/domain/enums/BleedingIntensity'
import type { CycleStatus } from '@/lib/domain/enums/CycleStatus'

export interface DailyRecord {
  readonly id: string
  readonly userId: string
  readonly date: string            // YYYY-MM-DD
  readonly sensation: Sensation
  readonly mucusAppearance: MucusAppearance
  readonly mucusQuantity: MucusQuantity
  readonly bleedingIntensity: BleedingIntensity
  readonly notes: string
  readonly createdAt: string
  readonly updatedAt: string
}

export interface InterpretedRecord extends DailyRecord {
  readonly cycleStatus: CycleStatus
  readonly cycleDay: number
  readonly ruleApplied: string
}

export interface CreateDailyRecordInput {
  userId: string
  date: string
  sensation: Sensation
  mucusAppearance: MucusAppearance
  mucusQuantity: MucusQuantity
  bleedingIntensity: BleedingIntensity
  notes: string
}
