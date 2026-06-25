import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Plus, Minus, X, Sparkles } from 'lucide-react'
import { useCoupleStore } from '../stores/coupleStore'
import { useUIStore } from '../stores/uiStore'
import { MENU_CATEGORIES, getItemsByCategory, getCategoryById } from '../config/menu'
import type { MenuItem } from '../config/menu'

interface CartItem { item: MenuItem; quantity: number }

interface DemoOrder {
  id: string; itemId: string; itemName: string; itemEmoji: string
  price: number; quantity: number; status: 'pending' | 'accepted' | 'done' | 'cancelled'
  from: string; fromName: string; to: string; toName: string; createdAt: string
}

const CART_KEY = 'demo_cart'
const ORDERS_KEY = 'demo_orders'

function loadCart(): CartItem[] { try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]') } catch { return [] } }
function saveCart(cart: CartItem[]) { localStorage.setItem(CART_KEY, JSON.stringify(cart)) }
function loadOrders(): DemoOrder[] { try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]') } catch { return [] } }
function saveOrders(orders: DemoOrder[]) { localStorage.setItem(ORDERS_KEY, JSON.stringify(orders)) }
function genOrderId(): string { return `#LOVE${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}` }

export default function HomePage() {
  const { profile, partner } = useCoupleStore()
  const { addToast } = useUIStore()

  const currentUserId = profile?.id || 'demo-user-1'
  const currentUserName = profile?.display_name || '我'
  const partnerId = partner?.id || 'demo-user-2'
  const partnerName = partner?.display_name || 'TA'

  const [activeCat, setActiveCat] = useState('intimacy')
  const [cart, setCart] = useState<CartItem[]>(loadCart)
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => { saveCart(cart) }, [cart])

  const category = getCategoryById(activeCat)
  const items = getItemsByCategory(activeCat)
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0)

  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const ex = prev.find((c) => c.item.id === item.id)
      if (ex) return prev.map((c) => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
      return [...prev, { item, quantity: 1 }]
    })
    addToast(`${item.emoji} 已加入购物车`, 'love')
  }, [addToast])

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prev) => {
      const ex = prev.find((c) => c.item.id === itemId)
      if (ex && ex.quantity > 1) return prev.map((c) => c.item.id === itemId ? { ...c, quantity: c.quantity - 1 } : c)
      return prev.filter((c) => c.item.id !== itemId)
    })
  }, [])

  const submitOrder = useCallback(() => {
    if (cart.length === 0) return
    const orders = loadOrders()
    const now = new Date().toISOString()
    const newOrders: DemoOrder[] = cart.map((ci) => ({
      id: genOrderId(), itemId: ci.item.id, itemName: ci.item.name, itemEmoji: ci.item.emoji,
      price: ci.item.price, quantity: ci.quantity, status: 'pending' as const,
      from: currentUserId, fromName: currentUserName, to: partnerId, toName: partnerName, createdAt: now,
    }))
    saveOrders([...newOrders, ...orders])
    setCart([])
    setCartOpen(false)
    addToast('已下单！等待TA接单~ 💝', 'love')
  }, [cart, currentUserId, currentUserName, partnerId, partnerName, addToast])

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Top Banner */}
      <div className="flex-shrink-0 px-4 pt-3 pb-3" style={{ background: 'linear-gradient(180deg, #FFB8CD 0%, #FFD6E0 50%, #FFF0F4 100%)' }}>
        <h1 className="crystal-text text-2xl leading-tight" style={{ color: 'var(--color-primary-dark)' }}>恋爱外卖</h1>
        <p className="text-xs text-[var(--color-text-soft)] flex items-center gap-1 mt-0.5">
          <Sparkles size={11} style={{ color: '#FFA940' }} /> 甜蜜下单 · 专属送达
        </p>
      </div>

      {/* Left Sidebar + Right Panel */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* LEFT: Categories */}
        <div className="flex-shrink-0 w-[80px] overflow-y-auto" style={{ background: '#FFFFFF', borderRight: '1px solid rgba(255,123,156,0.08)', scrollbarWidth: 'none' }}>
          {MENU_CATEGORIES.map((cat) => {
            const isActive = activeCat === cat.id
            return (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => setActiveCat(cat.id)}
                className="flex flex-col items-center justify-center gap-1 py-3 px-1 w-full cursor-pointer relative"
                style={{ background: isActive ? 'linear-gradient(180deg, rgba(255,123,156,0.12) 0%, rgba(255,123,156,0.04) 100%)' : 'transparent', minHeight: 64 }}
              >
                {isActive && (
                  <motion.div layoutId="activeCatBar" className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full" style={{ background: 'var(--color-primary)' }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                )}
                <span className="text-xl leading-none">{cat.emoji}</span>
                <span className="text-[11px] leading-tight font-medium text-center break-word" style={{ color: isActive ? 'var(--color-primary-dark)' : 'var(--color-text-soft)', fontWeight: isActive ? 600 : 500, maxWidth: 72 }}>{cat.name}</span>
              </motion.button>
            )
          })}
        </div>

        {/* RIGHT: Items */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0" style={{ background: 'var(--color-bg)' }}>
          {category && (
            <div className="flex-shrink-0 px-4 py-3 flex items-center gap-2.5" style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(255,123,156,0.06)' }}>
              <span className="text-xl">{category.emoji}</span>
              <span className="crystal-text-sm text-base" style={{ color: 'var(--color-text)' }}>{category.name}</span>
              <span className="text-xs text-[var(--color-text-muted)] ml-auto">{items.length}项</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 pb-16" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,123,156,0.2) transparent', WebkitOverflowScrolling: 'touch' }}>
            {items.map((item) => (
              <div key={item.id} className="food-card p-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(255,123,156,0.08), rgba(255,184,205,0.04))' }}>{item.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm text-[var(--color-text)] line-clamp-1 break-word">{item.name}</span>
                      {item.tag && <span className="flex-shrink-0 inline-block px-1.5 py-[1px] rounded-full text-[10px] font-semibold" style={{ background: 'rgba(255,123,156,0.1)', color: 'var(--color-primary)' }}>{item.tag}</span>}
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-2 break-word leading-snug">{item.desc}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>{item.price} 爱点</span>
                      <motion.button whileTap={{ scale: 0.85 }} onClick={() => addToCart(item)} className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0" style={{ background: 'linear-gradient(135deg, #FF7B9C, #E8668A)', boxShadow: '0 2px 8px rgba(255,123,156,0.3)' }}>
                        <Plus size={14} style={{ color: '#fff' }} strokeWidth={3} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-4xl mb-3">📭</span>
                <p className="text-sm text-[var(--color-text-soft)]">该分类暂无商品</p>
              </div>
            )}
          </div>
        </div>

        {/* Floating Cart Button — always visible */}
        {cartCount > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCartOpen(true)}
            className="absolute bottom-4 right-4 z-20 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer shadow-lg"
            style={{ background: 'linear-gradient(135deg, #FF7B9C, #E8668A)', boxShadow: '0 4px 20px rgba(255,123,156,0.4)' }}
          >
            <ShoppingBag size={24} style={{ color: '#fff' }} />
            <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ background: '#FF6B6B', boxShadow: '0 2px 6px rgba(255,107,107,0.4)', padding: '0 4px' }}>
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          </motion.button>
        )}
      </div>

      {/* Cart Bottom Sheet */}
      <AnimatePresence>
        {cartOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative z-10 w-full rounded-t-3xl flex flex-col overflow-hidden safe-bottom"
              style={{ background: '#FFFFFF', maxHeight: '80dvh', boxShadow: '0 -8px 40px rgba(0,0,0,0.12)' }}
            >
              {/* Handle + Header */}
              <div className="flex-shrink-0">
                <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full" style={{ background: '#E8E0E5' }} /></div>
                <div className="px-5 pt-2 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={20} style={{ color: 'var(--color-primary)' }} />
                    <h3 className="crystal-text-sm text-lg" style={{ color: 'var(--color-text)' }}>购物车</h3>
                    <span className="text-sm text-[var(--color-text-muted)]">({cartCount}件)</span>
                  </div>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCartOpen(false)} className="p-2 rounded-full cursor-pointer" style={{ background: 'rgba(0,0,0,0.04)' }}><X size={18} style={{ color: 'var(--color-text-muted)' }} /></motion.button>
                </div>
              </div>

              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-center px-5">
                  <span className="text-5xl mb-4">🛒</span>
                  <p className="text-sm text-[var(--color-text-soft)] mb-1">购物车是空的</p>
                  <p className="text-xs text-[var(--color-text-muted)]">快去选一些甜蜜商品吧~</p>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setCartOpen(false)} className="mt-5 px-6 py-2.5 rounded-full text-sm font-semibold cursor-pointer text-white" style={{ background: 'linear-gradient(135deg, #FF7B9C, #E8668A)', boxShadow: '0 2px 10px rgba(255,123,156,0.3)' }}>去逛逛</motion.button>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto px-5 space-y-2.5" style={{ minHeight: 0 }}>
                    {cart.map((ci) => (
                      <div key={ci.item.id} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: '#FFF5F8', border: '1px solid rgba(255,123,156,0.06)' }}>
                        <span className="text-2xl flex-shrink-0">{ci.item.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[var(--color-text)] line-clamp-1 break-word">{ci.item.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--color-primary)' }}>{ci.item.price} 爱点 × {ci.quantity}</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <motion.button whileTap={{ scale: 0.85 }} onClick={() => removeFromCart(ci.item.id)} className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer" style={{ background: 'rgba(255,123,156,0.1)' }}><Minus size={12} style={{ color: 'var(--color-primary)' }} strokeWidth={3} /></motion.button>
                          <span className="text-sm font-semibold text-[var(--color-text)] w-5 text-center">{ci.quantity}</span>
                          <motion.button whileTap={{ scale: 0.85 }} onClick={() => addToCart(ci.item)} className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer" style={{ background: 'linear-gradient(135deg, #FF7B9C, #E8668A)' }}><Plus size={12} style={{ color: '#fff' }} strokeWidth={3} /></motion.button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex-shrink-0 px-5 pt-3 pb-4 border-t border-[rgba(255,123,156,0.08)] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--color-text-soft)]">共 {cartCount} 件商品</span>
                      <motion.button whileTap={{ scale: 0.93 }} onClick={() => { setCart([]); addToast('购物车已清空', 'info') }} className="text-xs text-[var(--color-text-muted)] cursor-pointer px-2 py-1">清空</motion.button>
                    </div>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={submitOrder} className="w-full py-3.5 rounded-2xl text-white font-semibold text-base cursor-pointer flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #FF7B9C, #E8668A)', boxShadow: '0 4px 16px rgba(255,123,156,0.35)' }}><span>提交订单</span><span>💝</span></motion.button>
                    <p className="text-center text-[11px] text-[var(--color-text-muted)]">爱点是心意，不是钱哦 💕</p>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
