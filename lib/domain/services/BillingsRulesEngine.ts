import { differenceInDays, parseISO } from 'date-fns'
import { Sensation } from '@/lib/domain/enums/Sensation'
import { BleedingIntensity } from '@/lib/domain/enums/BleedingIntensity'
import { MucusAppearance } from '@/lib/domain/enums/MucusAppearance'
import { MucusQuantity } from '@/lib/domain/enums/MucusQuantity'
import { CycleStatus } from '@/lib/domain/enums/CycleStatus'
import type { DailyRecord, InterpretedRecord } from '@/lib/domain/entities/DailyRecord'

/**
 * Billings Ovulation Method — deterministic rules engine.
 *
 * Source: Dr. E.L. Billings — "Ensinando o Método de Ovulação Billings"
 *
 * Core concepts:
 *   BIP (Padrão Básico de Infertilidade):
 *     - Type 1 (Dry): seca + no mucus, cervix blocked, ovaries at rest
 *     - Type 2 (Mucus): same opaque mucus pattern unchanged day-after-day
 *   Peak (Ápice): last day of slippery sensation — identified retrospectively
 *   Post-peak infertile phase: from day 4 after Peak until next menstruation
 *
 * Rules of the First Days:
 *   Rule 1 — Avoid during heavy menstrual bleeding
 *   Rule 2 — Alternate nights available during confirmed dry BIP
 *   Rule 3 — Avoid any bleeding that interrupts BIP; need 3 BIP days to restart
 *
 * Peak Rule:
 *   From day 4 after Peak → infertile until next menstruation (any time, any day)
 */

function isMenstruation(record: DailyRecord): boolean {
  return (
    record.sensation === Sensation.MENSTRUATION ||
    record.bleedingIntensity === BleedingIntensity.HEAVY ||
    record.bleedingIntensity === BleedingIntensity.MODERATE
  )
}

function isSpotting(record: DailyRecord): boolean {
  return record.sensation === Sensation.SPOTTING || record.bleedingIntensity === BleedingIntensity.LIGHT
}

function isSlippery(record: DailyRecord): boolean {
  return record.sensation === Sensation.SLIPPERY
}

function isDryBIP(record: DailyRecord): boolean {
  return (
    record.sensation === Sensation.DRY &&
    record.mucusAppearance === MucusAppearance.NONE &&
    record.mucusQuantity === MucusQuantity.NONE
  )
}

function getMucusSignature(record: DailyRecord): string {
  return `${record.sensation}|${record.mucusAppearance}|${record.mucusQuantity}`
}

function isFertileTypeObservation(record: DailyRecord): boolean {
  const fertileAppearances: MucusAppearance[] = [
    MucusAppearance.CLEAR,
    MucusAppearance.ELASTIC,
    MucusAppearance.STRINGY,
  ]
  return (
    record.sensation === Sensation.SLIPPERY ||
    record.sensation === Sensation.WET ||
    record.sensation === Sensation.HUMID ||
    fertileAppearances.includes(record.mucusAppearance)
  )
}

/**
 * Identifies confirmed Peak dates from the full sorted record list.
 * A Peak is confirmed only when the next non-menstruation record is NOT slippery.
 * This models the retrospective nature of the Billings method.
 */
function identifyPeakDates(sorted: DailyRecord[]): Set<string> {
  const peaks = new Set<string>()

  for (let i = 0; i < sorted.length; i++) {
    if (!isSlippery(sorted[i])) continue

    let nextNonMenstruation: DailyRecord | null = null
    for (let j = i + 1; j < sorted.length; j++) {
      if (!isMenstruation(sorted[j])) {
        nextNonMenstruation = sorted[j]
        break
      }
    }

    const isConfirmedPeak = nextNonMenstruation !== null && !isSlippery(nextNonMenstruation)
    if (isConfirmedPeak) {
      peaks.add(sorted[i].date)
    }
  }

  return peaks
}

/**
 * Returns the most recent confirmed Peak date before `targetDate`
 * with no menstruation records between the peak and the target.
 */
function findActivePeakBefore(
  targetDate: string,
  peaks: Set<string>,
  allRecords: DailyRecord[],
): string | null {
  const candidates = [...peaks].filter((p) => p < targetDate).sort().reverse()

  for (const peakDate of candidates) {
    const hasMenstruationBetween = allRecords.some(
      (r) => r.date > peakDate && r.date < targetDate && isMenstruation(r),
    )
    if (!hasMenstruationBetween) return peakDate
  }

  return null
}

/**
 * Returns records since the last menstruation day (exclusive),
 * up to but not including `beforeDate`.
 */
function getRecordsSinceLastMenstruation(
  beforeDate: string,
  allRecords: DailyRecord[],
): DailyRecord[] {
  const prior = allRecords.filter((r) => r.date < beforeDate)
  let lastMenstruationIndex = -1

  for (let i = prior.length - 1; i >= 0; i--) {
    if (isMenstruation(prior[i])) {
      lastMenstruationIndex = i
      break
    }
  }

  return prior.slice(lastMenstruationIndex + 1)
}

/**
 * Evaluates whether a non-slippery, non-bleeding day fits a BIP pattern.
 * Checks dry BIP first, then mucus BIP (same pattern for 2+ prior days).
 */
function assessBipStatus(record: DailyRecord, history: DailyRecord[]): CycleStatus {
  if (isDryBIP(record)) return CycleStatus.DRY_BIP

  const priorNonMens = history.filter((r) => !isMenstruation(r))
  if (priorNonMens.length >= 2) {
    const currentSignature = getMucusSignature(record)
    const lastTwo = priorNonMens.slice(-2)
    const isUnchangedPattern = lastTwo.every((r) => getMucusSignature(r) === currentSignature)
    if (isUnchangedPattern) return CycleStatus.MUCUS_BIP
  }

  return CycleStatus.PATTERN_CHANGE
}

function classifyDay(
  record: DailyRecord,
  history: DailyRecord[],
  peakDates: Set<string>,
  allRecords: DailyRecord[],
): { status: CycleStatus; ruleApplied: string } {
  if (isMenstruation(record)) {
    return { status: CycleStatus.MENSTRUATION, ruleApplied: 'Regra 1: menstruação' }
  }

  if (isSpotting(record)) {
    return { status: CycleStatus.SPOTTING, ruleApplied: 'Regra 3: sangramento interrompe PBI' }
  }

  if (peakDates.has(record.date)) {
    return { status: CycleStatus.PEAK, ruleApplied: 'Ápice: último dia escorregadio (identificado retroativamente)' }
  }

  const activePeak = findActivePeakBefore(record.date, peakDates, allRecords)
  if (activePeak) {
    const daysDiff = differenceInDays(parseISO(record.date), parseISO(activePeak))
    if (daysDiff === 1) return { status: CycleStatus.POST_PEAK_1, ruleApplied: 'Regra do Ápice: 1° dia pós-ápice' }
    if (daysDiff === 2) return { status: CycleStatus.POST_PEAK_2, ruleApplied: 'Regra do Ápice: 2° dia pós-ápice' }
    if (daysDiff === 3) return { status: CycleStatus.POST_PEAK_3, ruleApplied: 'Regra do Ápice: 3° dia pós-ápice' }
    return { status: CycleStatus.INFERTILE_POST_PEAK, ruleApplied: 'Regra do Ápice: 4°+ dia pós-ápice — infértil' }
  }

  if (isSlippery(record)) {
    return { status: CycleStatus.FERTILE, ruleApplied: 'Período fértil: sensação escorregadia (ápice ainda não confirmado)' }
  }

  const sinceLastMenstruation = getRecordsSinceLastMenstruation(record.date, allRecords)
  const hasPriorFertileObservation = sinceLastMenstruation.some(
    (r) => r.date < record.date && isFertileTypeObservation(r),
  )

  if (hasPriorFertileObservation && !isDryBIP(record)) {
    return { status: CycleStatus.FERTILE, ruleApplied: 'Período fértil: após mudança de padrão' }
  }

  const bipStatus = assessBipStatus(record, sinceLastMenstruation)
  const ruleMap: Record<CycleStatus, string> = {
    [CycleStatus.DRY_BIP]: 'Regra 2: PBI seco — infértil (noites alternadas disponíveis)',
    [CycleStatus.MUCUS_BIP]: 'PBI muco: padrão sem mudança por 2+ dias — infértil',
    [CycleStatus.PATTERN_CHANGE]: 'Ponto de mudança: padrão alterado — possivelmente fértil',
    [CycleStatus.MENSTRUATION]: '',
    [CycleStatus.SPOTTING]: '',
    [CycleStatus.FERTILE]: '',
    [CycleStatus.PEAK]: '',
    [CycleStatus.POST_PEAK_1]: '',
    [CycleStatus.POST_PEAK_2]: '',
    [CycleStatus.POST_PEAK_3]: '',
    [CycleStatus.INFERTILE_POST_PEAK]: '',
  }

  return { status: bipStatus, ruleApplied: ruleMap[bipStatus] }
}

/**
 * Main entry point — processes all records and returns them annotated
 * with their interpreted CycleStatus and cycle day number.
 */
export function interpretCycle(records: DailyRecord[]): InterpretedRecord[] {
  if (records.length === 0) return []

  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date))
  const peakDates = identifyPeakDates(sorted)

  let cycleDay = 0
  let lastMenstruationDate: string | null = null

  return sorted.map((record, index) => {
    const history = sorted.slice(0, index)
    const { status, ruleApplied } = classifyDay(record, history, peakDates, sorted)

    if (isMenstruation(record)) {
      const isNewCycle = !lastMenstruationDate || history.some((r) => !isMenstruation(r) && r.date > lastMenstruationDate!)
      if (isNewCycle || cycleDay === 0) {
        cycleDay = 1
        lastMenstruationDate = record.date
      } else {
        cycleDay++
      }
    } else {
      cycleDay++
    }

    return { ...record, cycleStatus: status, cycleDay, ruleApplied }
  })
}
