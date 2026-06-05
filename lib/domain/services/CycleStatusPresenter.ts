import { CycleStatus, CYCLE_STATUS_DISPLAY } from '@/lib/domain/enums/CycleStatus'
import type { InterpretedRecord } from '@/lib/domain/entities/DailyRecord'
import type { DailyRecord } from '@/lib/domain/entities/DailyRecord'
import { interpretCycle } from '@/lib/domain/services/BillingsRulesEngine'

export interface CurrentStatusSummary {
  status: CycleStatus | null
  latestRecord: InterpretedRecord | null
  title: string
  message: string
  recommendation: string
  cycleDay: number | null
}

const STATUS_MESSAGES: Record<CycleStatus, { title: string; message: string; recommendation: string }> = {
  menstruacao: {
    title: 'Menstruação',
    message: 'Você está no período menstrual.',
    recommendation:
      'Regra 1: Evite relações sexuais durante o sangramento intenso. Continue registrando suas observações diariamente.',
  },
  mancha: {
    title: 'Mancha / Spotting',
    message: 'Há um sangramento leve hoje.',
    recommendation:
      'Regra 3: Trate como dia potencialmente fértil. Aguarde 3 dias secos consecutivos (PBI) antes de retomar a Regra 2.',
  },
  pbi_seco: {
    title: 'Infértil — PBI Seco',
    message: 'Você está no Padrão Básico de Infertilidade: vulva seca, nada se vê.',
    recommendation:
      'Regra 2: Noites alternadas estão disponíveis para relações sexuais enquanto esse padrão seco se mantiver.',
  },
  pbi_muco: {
    title: 'Infértil — PBI Muco',
    message: 'Você está no Padrão Básico de Infertilidade: muco opaco sem mudança.',
    recommendation:
      'O padrão não mudou. Noites alternadas disponíveis enquanto o muco permanecer igual dia após dia.',
  },
  mudanca: {
    title: 'Atenção — Mudança de Padrão',
    message: 'Foi detectada uma mudança no padrão habitual.',
    recommendation:
      'Há uma possível mudança de padrão. Trate este dia como potencialmente fértil e registre cuidadosamente a sensação e aparência.',
  },
  fertil: {
    title: 'Período Fértil',
    message: 'Você está no período fértil. O muco ou a sensação indicam fertilidade.',
    recommendation:
      'O muco fértil permite a sobrevivência dos espermatozoides por até 5 dias. Registre o dia mais fértil observado.',
  },
  apice: {
    title: '⭐ Ápice — Pico de Fertilidade',
    message: 'Este foi o dia do Ápice: último dia com sensação escorregadia.',
    recommendation:
      'O Ápice é o dia de maior fertilidade. Contagem retroativa: os 3 dias seguintes ainda são possivelmente férteis.',
  },
  pos_apice_1: {
    title: '1° Dia Pós-Ápice',
    message: 'Primeiro dia após o Ápice — ainda possivelmente fértil.',
    recommendation:
      'A ovulação ocorreu ou está iminente. Continue evitando relações sexuais. Faltam 2 dias para a fase infértil.',
  },
  pos_apice_2: {
    title: '2° Dia Pós-Ápice',
    message: 'Segundo dia após o Ápice — ainda possivelmente fértil.',
    recommendation:
      'A cérvix está se fechando gradualmente. Falta 1 dia para a fase infértil da fase lútea.',
  },
  pos_apice_3: {
    title: '3° Dia Pós-Ápice',
    message: 'Terceiro dia após o Ápice — último dia possivelmente fértil.',
    recommendation:
      'A partir de amanhã (4° dia pós-Ápice) você entrará na fase lútea infértil — relações disponíveis a qualquer hora!',
  },
  infertil_pos_apice: {
    title: 'Fase Lútea — Infértil',
    message: 'Você está na fase lútea pós-ovulatória. Esta fase é infértil.',
    recommendation:
      'Regra do Ápice: A partir do 4° dia após o Ápice até a próxima menstruação, relações sexuais estão disponíveis a qualquer hora e dia.',
  },
}

export function buildCurrentStatusSummary(records: DailyRecord[]): CurrentStatusSummary {
  if (records.length === 0) {
    return {
      status: null,
      latestRecord: null,
      title: 'Sem registros',
      message: 'Você ainda não tem observações registradas.',
      recommendation:
        'Comece registrando suas observações diárias para receber interpretações do Método Billings.',
      cycleDay: null,
    }
  }

  const interpreted = interpretCycle(records)
  const latest = interpreted[interpreted.length - 1]
  const messages = STATUS_MESSAGES[latest.cycleStatus]

  return {
    status: latest.cycleStatus,
    latestRecord: latest,
    title: messages.title,
    message: messages.message,
    recommendation: messages.recommendation,
    cycleDay: latest.cycleDay,
  }
}

export function getStatusDisplayInfo(status: CycleStatus) {
  return CYCLE_STATUS_DISPLAY[status]
}
