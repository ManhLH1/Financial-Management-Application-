export const MUSCLE_GROUP_LABELS: Record<string, string> = {
  Chest: 'Ngực',
  Back: 'Lưng',
  Shoulders: 'Vai',
  Legs: 'Chân',
  Arms: 'Tay',
  Core: 'Core',
  'Full Body': 'Toàn thân'
}

export const EQUIPMENT_LABELS: Record<string, string> = {
  Machine: 'Máy tập',
  Dumbbell: 'Tạ đơn',
  Barbell: 'Tạ đòn',
  Cable: 'Dây cáp',
  Bodyweight: 'Trọng lượng cơ thể',
  Other: 'Khác'
}

export const LEVEL_LABELS: Record<string, string> = {
  Beginner: 'Mới bắt đầu',
  Intermediate: 'Trung cấp',
  Advanced: 'Nâng cao'
}

export function getMuscleGroupLabel(value: string) {
  return MUSCLE_GROUP_LABELS[value] || value
}

export function getEquipmentLabel(value: string) {
  return EQUIPMENT_LABELS[value] || value
}

export function getLevelLabel(value: string) {
  return LEVEL_LABELS[value] || value
}

