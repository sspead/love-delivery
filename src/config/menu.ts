// ============================================================
// 恋爱外卖 — 完整菜单数据
// 8大分类 · 80+商品 · 情侣全场景覆盖
// ============================================================

export interface MenuCategory {
  id: string; name: string; emoji: string; color: string
}

export interface MenuItem {
  id: string; category: string; name: string; emoji: string
  desc: string; price: number; tag: string
}

export type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'done'

export interface Order {
  id: string; itemId: string; itemName: string; itemEmoji: string
  price: number; quantity: number; status: OrderStatus
  from: string; fromName: string; to: string; toName: string; createdAt: string
}

export const MENU_CATEGORIES: MenuCategory[] = [
  { id: 'intimacy', name: '亲密互动', emoji: '💋', color: '#FF7B9C' },
  { id: 'dining', name: '美食约会', emoji: '🍽️', color: '#FFA940' },
  { id: 'travel', name: '旅行出游', emoji: '✈️', color: '#5B8FF9' },
  { id: 'gifts', name: '鲜花礼物', emoji: '💐', color: '#C084FC' },
  { id: 'entertainment', name: '休闲娱乐', emoji: '🎬', color: '#4ADE80' },
  { id: 'service', name: '专属服务', emoji: '🛎️', color: '#60A5FA' },
  { id: 'words', name: '甜蜜话语', emoji: '💌', color: '#F759AB' },
  { id: 'special', name: '特殊时刻', emoji: '🎯', color: '#FF6B6B' },
]

export const MENU_ITEMS: MenuItem[] = [
  // 💋 亲密互动
  { id: 'hug', category: 'intimacy', name: '大大拥抱', emoji: '🤗', desc: '一个温暖的大大拥抱，抱满一分钟不许松手', price: 1, tag: '热销' },
  { id: 'kiss', category: 'intimacy', name: '甜蜜亲亲', emoji: '😘', desc: '一个甜甜的亲亲，想亲哪里亲哪里', price: 1, tag: '' },
  { id: 'handwalk', category: 'intimacy', name: '牵手散步', emoji: '🤝', desc: '十指相扣慢慢散步30分钟', price: 2, tag: '推荐' },
  { id: 'cuddle', category: 'intimacy', name: '依偎看电影', emoji: '🍿', desc: '依偎在沙发上盖一条毯子看完整部电影', price: 3, tag: '' },
  { id: 'massage', category: 'intimacy', name: '肩颈按摩', emoji: '💆', desc: '15分钟专业级肩颈放松按摩', price: 3, tag: '热门' },
  { id: 'piggyback', category: 'intimacy', name: '背背TA', emoji: '🎒', desc: '背TA走一小段路，感受彼此的温度', price: 1, tag: '' },
  { id: 'forehead', category: 'intimacy', name: '额头亲吻', emoji: '😚', desc: '轻轻在额头上印下一个温柔的吻', price: 1, tag: '甜蜜' },
  { id: 'sleep', category: 'intimacy', name: '抱着入睡', emoji: '😴', desc: '紧紧抱着TA直到TA安心睡着', price: 5, tag: '精选' },
  { id: 'dance', category: 'intimacy', name: '客厅慢舞', emoji: '💃', desc: '放一首慢歌，在客厅抱着慢慢跳舞', price: 2, tag: '浪漫' },
  { id: 'hair', category: 'intimacy', name: '帮TA吹头发', emoji: '💨', desc: '温柔地帮TA把头发吹干梳顺', price: 2, tag: '' },
  { id: 'scratch', category: 'intimacy', name: '挠背服务', emoji: '✋', desc: '轻轻给TA挠背5分钟', price: 1, tag: '' },
  { id: 'footmassage', category: 'intimacy', name: '脚底按摩', emoji: '🦶', desc: '一次舒服解乏的脚底按摩', price: 2, tag: '' },

  // 🍽️ 美食约会
  { id: 'candle', category: 'dining', name: '烛光晚餐', emoji: '🕯️', desc: '一起准备并享受一顿浪漫烛光晚餐', price: 5, tag: '精选' },
  { id: 'hotpot', category: 'dining', name: '火锅约起', emoji: '🫕', desc: '一起去吃一顿热气腾腾的火锅', price: 4, tag: '热销' },
  { id: 'sushi', category: 'dining', name: '日料大餐', emoji: '🍣', desc: '去吃一顿精致的日料', price: 5, tag: '' },
  { id: 'cooking', category: 'dining', name: '一起做饭', emoji: '👨‍🍳', desc: '逛菜市场、一起下厨、一起享用', price: 4, tag: '推荐' },
  { id: 'dessert', category: 'dining', name: '甜品探店', emoji: '🍰', desc: '找一家网红甜品店共享一份甜蜜', price: 2, tag: '' },
  { id: 'bbq', category: 'dining', name: '户外烧烤', emoji: '🍖', desc: '找个好地方一起烧烤，边烤边聊', price: 4, tag: '' },
  { id: 'breakfast_bed', category: 'dining', name: '床上早餐', emoji: '🥐', desc: '把早餐端到床上让TA醒来就能吃', price: 3, tag: '暖心' },
  { id: 'wine', category: 'dining', name: '红酒之夜', emoji: '🍷', desc: '开一瓶红酒配奶酪，聊到深夜', price: 4, tag: '浪漫' },
  { id: 'streetfood', category: 'dining', name: '逛夜市吃小吃', emoji: '🌃', desc: '一起去夜市从街头吃到街尾', price: 2, tag: '' },
  { id: 'picnic', category: 'dining', name: '公园野餐', emoji: '🧺', desc: '精心准备食物去公园草地上野餐', price: 3, tag: '推荐' },
  { id: 'icecream', category: 'dining', name: '冰淇淋约会', emoji: '🍦', desc: '你一口我一口吃同一个冰淇淋', price: 1, tag: '' },
  { id: 'tea', category: 'dining', name: '下午茶时光', emoji: '🫖', desc: '精致下午茶，三层点心配红茶', price: 3, tag: '' },

  // ✈️ 旅行出游
  { id: 'weekend', category: 'travel', name: '周末短途游', emoji: '🚗', desc: '周末自驾去周边城市玩两天一夜', price: 10, tag: '精选' },
  { id: 'beach', category: 'travel', name: '一起看海', emoji: '🌊', desc: '去海边踏浪看日出捡贝壳', price: 8, tag: '热门' },
  { id: 'mountain', category: 'travel', name: '爬山看日出', emoji: '⛰️', desc: '凌晨出发一起爬到山顶看日出', price: 6, tag: '' },
  { id: 'amusement', category: 'travel', name: '游乐园狂欢', emoji: '🎢', desc: '坐过山车、拍大头贴、吃棉花糖', price: 5, tag: '推荐' },
  { id: 'camping', category: 'travel', name: '星空露营', emoji: '🏕️', desc: '搭帐篷生篝火躺着看星星', price: 8, tag: '浪漫' },
  { id: 'bike', category: 'travel', name: '骑行约会', emoji: '🚲', desc: '租两辆自行车沿河边或海边骑行', price: 3, tag: '' },
  { id: 'zoo', category: 'travel', name: '逛动物园', emoji: '🐼', desc: '一起去看大熊猫喂长颈鹿', price: 3, tag: '' },
  { id: 'museum', category: 'travel', name: '逛博物馆', emoji: '🏛️', desc: '一起去博物馆或美术馆熏陶艺术', price: 2, tag: '' },
  { id: 'hotspring', category: 'travel', name: '泡温泉', emoji: '♨️', desc: '找个温泉度假村好好放松一天', price: 7, tag: '享受' },
  { id: 'roadtrip', category: 'travel', name: '公路旅行', emoji: '🛣️', desc: '没有目的地，开着车一路走走停停', price: 10, tag: '自由' },
  { id: 'cruise', category: 'travel', name: '坐游轮', emoji: '🚢', desc: '一起坐一次游轮看海上日落', price: 9, tag: '' },

  // 💐 鲜花礼物
  { id: 'roses', category: 'gifts', name: '玫瑰花束', emoji: '🌹', desc: '精心挑选的一束红玫瑰', price: 4, tag: '经典' },
  { id: 'chocolate', category: 'gifts', name: '巧克力礼盒', emoji: '🍫', desc: '一盒精致的进口巧克力', price: 2, tag: '' },
  { id: 'handletter', category: 'gifts', name: '手写情书', emoji: '✉️', desc: '一封情真意切的手写情书', price: 3, tag: '用心' },
  { id: 'playlist', category: 'gifts', name: '专属歌单', emoji: '🎵', desc: '为你精心挑选的专属歌单', price: 1, tag: '' },
  { id: 'perfume', category: 'gifts', name: '香水', emoji: '🔮', desc: '精心挑选一款TA喜欢的香水', price: 5, tag: '' },
  { id: 'jewelry', category: 'gifts', name: '小首饰', emoji: '💍', desc: '一条精致的项链或手链', price: 5, tag: '惊喜' },
  { id: 'photo_album', category: 'gifts', name: '手工相册', emoji: '📸', desc: '把两人的照片做成一本手工相册', price: 4, tag: '用心' },
  { id: 'surprise_box', category: 'gifts', name: '惊喜盲盒', emoji: '🎁', desc: '准备一个装满小礼物的惊喜盒子', price: 3, tag: '有趣' },
  { id: 'plush', category: 'gifts', name: '毛绒公仔', emoji: '🧸', desc: '一只软软的毛绒公仔可以抱着睡觉', price: 2, tag: '' },
  { id: 'small_flowers', category: 'gifts', name: '随机小花束', emoji: '💐', desc: '下班路上顺手带一束小花回家', price: 1, tag: '日常' },
  { id: 'custom_gift', category: 'gifts', name: '定制礼物', emoji: '🎨', desc: '定制一个独一无二的专属礼物', price: 6, tag: '独一无二' },

  // 🎬 休闲娱乐
  { id: 'cinema', category: 'entertainment', name: '电影院约会', emoji: '🎬', desc: '一起去看一场期待已久的电影', price: 3, tag: '经典' },
  { id: 'ktv', category: 'entertainment', name: 'KTV唱歌', emoji: '🎤', desc: '两个人包小包间唱到尽兴', price: 3, tag: '' },
  { id: 'boardgame', category: 'entertainment', name: '玩桌游', emoji: '🎲', desc: '找一款好玩的两人桌游对战一下午', price: 2, tag: '' },
  { id: 'gaming', category: 'entertainment', name: '游戏之夜', emoji: '🎮', desc: '一起打游戏，输了的人洗碗', price: 2, tag: '' },
  { id: 'puzzle', category: 'entertainment', name: '拼拼图', emoji: '🧩', desc: '买一幅1000片拼图两个人一起拼', price: 3, tag: '合作' },
  { id: 'painting', category: 'entertainment', name: '一起画画', emoji: '🎨', desc: '各画一幅对方的肖像', price: 3, tag: '有趣' },
  { id: 'concert', category: 'entertainment', name: '看演唱会', emoji: '🎵', desc: '一起去看喜欢的歌手演唱会', price: 8, tag: '精选' },
  { id: 'sports', category: 'entertainment', name: '一起运动', emoji: '🏸', desc: '打羽毛球、乒乓球或一起去游泳', price: 2, tag: '健康' },
  { id: 'escape', category: 'entertainment', name: '密室逃脱', emoji: '🔐', desc: '两个人一起解密逃脱', price: 4, tag: '刺激' },
  { id: 'stargazing', category: 'entertainment', name: '天台看星星', emoji: '🌟', desc: '找个天台铺毯子躺着看星星聊天', price: 1, tag: '浪漫' },
  { id: 'reading', category: 'entertainment', name: '一起看书', emoji: '📚', desc: '各选一本书安静在咖啡馆看一下午', price: 2, tag: '' },

  // 🛎️ 专属服务
  { id: 'wakeup_svc', category: 'service', name: '温柔叫醒', emoji: '⏰', desc: '用最温柔的方式叫醒TA附赠早安吻', price: 1, tag: '甜蜜' },
  { id: 'driver_svc', category: 'service', name: '专属司机', emoji: '🚗', desc: '接送TA去任何地方不用TA操心', price: 3, tag: '' },
  { id: 'clean_svc', category: 'service', name: '打扫房间', emoji: '🧹', desc: '帮TA彻底打扫一次房间', price: 4, tag: '实用' },
  { id: 'laundry', category: 'service', name: '帮TA洗衣服', emoji: '👕', desc: '洗衣晾衣叠衣一条龙服务', price: 3, tag: '' },
  { id: 'dish_svc', category: 'service', name: '今天洗碗', emoji: '🍽️', desc: '今天所有碗我来洗你休息', price: 1, tag: '' },
  { id: 'run_errand', category: 'service', name: '跑腿代办', emoji: '🏃', desc: '帮TA跑腿办事拿快递买东西都行', price: 1, tag: '' },
  { id: 'tech_support', category: 'service', name: 'IT技术支持', emoji: '💻', desc: '帮TA修电脑装软件清理手机', price: 2, tag: '' },
  { id: 'cook_meal', category: 'service', name: '做一顿饭', emoji: '👩‍🍳', desc: '从买菜到上桌全程包办一顿饭', price: 4, tag: '暖心' },
  { id: 'shopping', category: 'service', name: '陪逛街', emoji: '🛍️', desc: '陪TA逛街耐心当衣架和摄影师', price: 3, tag: '' },
  { id: 'listen', category: 'service', name: '认真倾听', emoji: '👂', desc: '放下手机认真听TA说30分钟话', price: 2, tag: '走心' },
  { id: 'plan_date', category: 'service', name: '策划约会', emoji: '📋', desc: '全权策划一次完整的约会TA只管享受', price: 5, tag: '全能' },

  // 💌 甜蜜话语
  { id: 'compliment', category: 'words', name: '真心赞美', emoji: '🥰', desc: '真诚具体说出TA的三个优点', price: 1, tag: '' },
  { id: 'sorry_words', category: 'words', name: '认真道歉', emoji: '🙇', desc: '看着TA的眼睛认真说对不起', price: 2, tag: '' },
  { id: 'iloveyou', category: 'words', name: '大声说爱你', emoji: '📢', desc: '在人多的地方大声喊"我爱你"', price: 3, tag: '刺激' },
  { id: 'bedtime', category: 'words', name: '睡前故事', emoji: '📖', desc: '为TA讲一个温暖的睡前故事', price: 2, tag: '温馨' },
  { id: 'goodmorning', category: 'words', name: '早安语音', emoji: '🌅', desc: '每天一条甜甜的早安语音', price: 2, tag: '日常' },
  { id: 'poem', category: 'words', name: '写一首小诗', emoji: '✍️', desc: '为TA写一首原创的小诗', price: 3, tag: '文艺' },
  { id: 'grateful', category: 'words', name: '说感谢的话', emoji: '🙏', desc: '认真说出三件感谢TA的事', price: 1, tag: '' },
  { id: 'future', category: 'words', name: '聊聊未来', emoji: '🔮', desc: '认真聊聊你们未来的计划和梦想', price: 2, tag: '走心' },
  { id: 'memory', category: 'words', name: '回忆美好', emoji: '💭', desc: '一起回忆第一次见面第一次约会', price: 1, tag: '甜蜜' },
  { id: 'nickname', category: 'words', name: '起专属昵称', emoji: '🏷️', desc: '给对方起一个独一无二的专属昵称', price: 1, tag: '有趣' },

  // 🎯 特殊时刻
  { id: 'anniversary_plan', category: 'special', name: '纪念日策划', emoji: '🎂', desc: '精心策划一整天的纪念日活动', price: 10, tag: '重磅' },
  { id: 'birthday_surprise', category: 'special', name: '生日惊喜', emoji: '🎉', desc: '给TA准备一个难忘的生日惊喜', price: 8, tag: '精选' },
  { id: 'valentine', category: 'special', name: '情人节计划', emoji: '💝', desc: '策划一个完美的情人节', price: 8, tag: '' },
  { id: 'propose', category: 'special', name: '求婚演练', emoji: '💍', desc: '认真排练一次求婚（虽然不是真的但很甜）', price: 5, tag: '紧张' },
  { id: 'rainyday', category: 'special', name: '雨天计划', emoji: '🌧️', desc: '下雨天不出门在家安排一整天的活动', price: 3, tag: '温馨' },
  { id: 'photoshoot', category: 'special', name: '情侣写真', emoji: '📷', desc: '找摄影师拍一组情侣写真留念', price: 6, tag: '纪念' },
  { id: 'bucketlist', category: 'special', name: '写愿望清单', emoji: '📝', desc: '一起写下两个人的100个愿望', price: 2, tag: '' },
  { id: 'timeline_make', category: 'special', name: '制作时间轴', emoji: '📊', desc: '把从相识到现在的点点滴滴整理出来', price: 3, tag: '用心' },
  { id: 'recreate', category: 'special', name: '重演第一次', emoji: '🔄', desc: '回到第一次约会的地方重现那天', price: 5, tag: '浪漫' },
  { id: 'letter_future', category: 'special', name: '给未来的信', emoji: '💌', desc: '各自写一封信给一年后的对方', price: 2, tag: '走心' },
]

export function getItemsByCategory(catId: string): MenuItem[] {
  return MENU_ITEMS.filter((item) => item.category === catId)
}

export function getItemById(id: string): MenuItem | undefined {
  return MENU_ITEMS.find((item) => item.id === id)
}

export function getCategoryById(id: string): MenuCategory | undefined {
  return MENU_CATEGORIES.find((cat) => cat.id === id)
}
