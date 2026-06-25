export const APP_NAME = '恋爱外卖'
export const APP_DESCRIPTION = '甜蜜下单 · 专属送达'

export const COUPLE_CODE_LENGTH = 6

export const MOODS = [
  { emoji: '😊', label: '开心', value: 'happy' },
  { emoji: '🥰', label: '幸福', value: 'love' },
  { emoji: '😢', label: '想你', value: 'miss' },
  { emoji: '🎉', label: '兴奋', value: 'excited' },
  { emoji: '🙏', label: '感恩', value: 'grateful' },
] as const

export const CHECKIN_MOODS = [
  { emoji: '😄', label: '超棒', value: 'great', color: '#FFD700' },
  { emoji: '😊', label: '不错', value: 'good', color: '#7BC67E' },
  { emoji: '😐', label: '一般', value: 'okay', color: '#9B7B8D' },
  { emoji: '😢', label: '不太好', value: 'bad', color: '#FFB6C1' },
  { emoji: '😤', label: '很糟糕', value: 'terrible', color: '#FF6B8A' },
] as const

export const WISH_CATEGORIES = [
  { icon: '🍽️', label: '约会', value: 'date' },
  { icon: '✈️', label: '旅行', value: 'travel' },
  { icon: '🎁', label: '礼物', value: 'gift' },
  { icon: '🎯', label: '活动', value: 'activity' },
  { icon: '💡', label: '其他', value: 'other' },
] as const

export const COUPON_SUGGESTIONS = [
  { title: '按摩券', icon: '💆', description: '享受一次15分钟的专属按摩' },
  { title: '不生气券', icon: '😤', description: '使用此券，TA必须立刻原谅你' },
  { title: '电影券', icon: '🎬', description: '一起看一部你想看的电影' },
  { title: '早餐券', icon: '🍳', description: '享受一份爱心早餐' },
  { title: '洗碗券', icon: '🍽️', description: '今天不用洗碗！' },
  { title: '约会券', icon: '💝', description: '策划一次完美约会' },
  { title: '唱歌券', icon: '🎤', description: '为对方唱一首歌' },
  { title: '抱抱券', icon: '🤗', description: '任何时候都能兑换一个拥抱' },
] as const

export const LOVE_LETTER_PROMPTS = [
  '今天最想对TA说的一句话...',
  '写下你们第一次见面的回忆...',
  'TA让你最感动的一件事...',
  '你对未来最期待的一件事...',
]
