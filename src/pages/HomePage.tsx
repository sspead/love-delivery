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
function saveCart(c: CartItem[]) { localStorage.setItem(CART_KEY, JSON.stringify(c)) }
function loadOrders(): DemoOrder[] { try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]') } catch { return [] } }
function saveOrders(o: DemoOrder[]) { localStorage.setItem(ORDERS_KEY, JSON.stringify(o)) }
function genId(): string { return `#LOVE${String(Math.floor(Math.random()*999)+1).padStart(3,'0')}` }

export default function HomePage() {
  const { profile, partner } = useCoupleStore()
  const { addToast } = useUIStore()
  const uid = profile?.id || 'demo-user-1'
  const uname = profile?.display_name || '我'
  const pid = partner?.id || 'demo-user-2'
  const pname = partner?.display_name || 'TA'

  const [activeCat, setActiveCat] = useState('intimacy')
  const [cart, setCart] = useState<CartItem[]>(loadCart)
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => { saveCart(cart) }, [cart])

  const category = getCategoryById(activeCat)
  const items = getItemsByCategory(activeCat)
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0)

  const addToCart = useCallback((item: MenuItem) => {
    setCart(p => { const x = p.find(c => c.item.id === item.id); if (x) return p.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c); return [...p, { item, quantity: 1 }] })
    addToast(`${item.emoji} 加入购物车`, 'love')
  }, [addToast])

  const removeFromCart = useCallback((id: string) => {
    setCart(p => { const x = p.find(c => c.item.id === id); if (x && x.quantity > 1) return p.map(c => c.item.id === id ? { ...c, quantity: c.quantity - 1 } : c); return p.filter(c => c.item.id !== id) })
  }, [])

  const submitOrder = useCallback(() => {
    if (!cart.length) return
    const orders = loadOrders()
    const now = new Date().toISOString()
    saveOrders([...cart.map(ci => ({ id: genId(), itemId: ci.item.id, itemName: ci.item.name, itemEmoji: ci.item.emoji, price: ci.item.price, quantity: ci.quantity, status: 'pending' as const, from: uid, fromName: uname, to: pid, toName: pname, createdAt: now })), ...orders])
    setCart([]); setCartOpen(false)
    addToast('已下单！等待TA接单~ 💝', 'love')
  }, [cart, uid, uname, pid, pname, addToast])

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: 'linear-gradient(180deg, #FFF0F4 0%, #FFF5F8 100%)' }}>
      {/* Top Banner — 水滴玻璃风格 */}
      <div className="flex-shrink-0 relative px-4 pt-3 pb-4 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,184,205,0.5) 0%, rgba(255,214,224,0.3) 50%, rgba(255,240,244,0) 100%)' }} />
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #FF7B9C, transparent 70%)' }} />
        <div className="absolute top-6 right-16 w-20 h-20 rounded-full opacity-8" style={{ background: 'radial-gradient(circle, #FFA940, transparent 60%)' }} />
        <div className="relative z-10">
          <h1 className="crystal-text text-[26px] leading-tight" style={{ color: 'var(--color-primary-dark)' }}>恋爱外卖</h1>
          <p className="text-xs text-[var(--color-text-soft)] flex items-center gap-1 mt-0.5">
            <Sparkles size={11} style={{ color: '#FFA940' }} /> 甜蜜下单 · 专属送达
          </p>
        </div>
      </div>

      {/* Main: Sidebar + Panel */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* LEFT: Category Sidebar — 水滴玻璃 */}
        <div className="flex-shrink-0 w-[80px] overflow-y-auto relative" style={{
          background: 'rgba(255,255,255,0.35)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.5)',
          scrollbarWidth: 'none',
        }}>
          {MENU_CATEGORIES.map(cat => {
            const isActive = activeCat === cat.id
            return (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => setActiveCat(cat.id)}
                className="flex flex-col items-center justify-center gap-1 py-3 px-1 w-full cursor-pointer relative"
                style={{
                  background: isActive
                    ? 'linear-gradient(180deg, rgba(255,123,156,0.2) 0%, rgba(255,150,180,0.08) 100%)'
                    : 'transparent',
                  minHeight: 64,
                }}
              >
                {isActive && (
                  <motion.div layoutId="activeCatBar" className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
                    style={{ background: 'linear-gradient(180deg, #FF7B9C, #E8668A)', boxShadow: '0 0 8px rgba(255,123,156,0.4)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                )}
                <span className="text-xl leading-none drop-shadow-sm">{cat.emoji}</span>
                <span className="text-[11px] leading-tight font-medium text-center break-word"
                  style={{ color: isActive ? 'var(--color-primary-dark)' : 'var(--color-text-soft)', fontWeight: isActive ? 600 : 500, maxWidth: 72 }}>
                  {cat.name}
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* RIGHT: Items */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Category header — 水滴玻璃 */}
          {category && (
            <div className="flex-shrink-0 px-4 py-3 flex items-center gap-2.5" style={{
              background: 'rgba(255,255,255,0.4)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderBottom: '1px solid rgba(255,255,255,0.5)',
            }}>
              <span className="text-xl drop-shadow-sm">{category.emoji}</span>
              <span className="crystal-text-sm text-base" style={{ color: 'var(--color-text)' }}>{category.name}</span>
              <span className="text-xs text-[var(--color-text-muted)] ml-auto">{items.length}项</span>
            </div>
          )}

          {/* Item list — 水滴玻璃卡片 */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 pb-16"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,123,156,0.15) transparent', WebkitOverflowScrolling: 'touch' }}>
            {items.map(item => (
              <div key={item.id} className="food-card p-3">
                <div className="flex items-center gap-3 relative z-[2]">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,240,244,0.6))', boxShadow: '0 2px 8px rgba(255,150,180,0.1)' }}>
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm text-[var(--color-text)] line-clamp-1 break-word">{item.name}</span>
                      {item.tag && (
                        <span className="flex-shrink-0 px-1.5 py-[1px] rounded-full text-[10px] font-semibold"
                          style={{ background: 'rgba(255,123,156,0.12)', color: 'var(--color-primary)' }}>{item.tag}</span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-2 break-word leading-snug">{item.desc}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>{item.price} 爱点</span>
                      <motion.button whileTap={{ scale: 0.85 }}
                        onClick={() => addToCart(item)}
                        className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #FF7B9C, #E8668A)', boxShadow: '0 2px 10px rgba(255,123,156,0.35)' }}>
                        <Plus size={14} style={{ color: '#fff' }} strokeWidth={3} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-4xl mb-3 opacity-50">📭</span>
                <p className="text-sm text-[var(--color-text-soft)]">该分类暂无商品</p>
              </div>
            )}
          </div>
        </div>

        {/* Cart FAB — 水滴玻璃 */}
        {cartCount > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCartOpen(true)}
            className="absolute bottom-4 right-4 z-20 w-14 h-14 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.5)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.6)',
              boxShadow: '0 4px 20px rgba(255,123,156,0.2), inset 0 1px 0 rgba(255,255,255,0.5)',
            }}
          >
            <div className="absolute inset-0 rounded-2xl opacity-30"
              style={{ background: 'linear-gradient(135deg, rgba(255,123,156,0.6), rgba(255,184,205,0.2))' }} />
            <ShoppingBag size={22} style={{ color: 'var(--color-primary)', position: 'relative', zIndex: 1 }} />
            <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] rounded-full flex items-center justify-center text-white text-[11px] font-bold z-10"
              style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF4470)', boxShadow: '0 2px 8px rgba(255,68,112,0.4)', padding: '0 4px' }}>
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          </motion.button>
        )}
      </div>

      {/* Cart Bottom Sheet — 水滴玻璃 */}
      <AnimatePresence>
        {cartOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)} className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative z-10 w-full rounded-t-[28px] flex flex-col overflow-hidden safe-bottom"
              style={{
                background: 'rgba(255,255,255,0.75)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                maxHeight: '80dvh',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.1), 0 -1px 0 rgba(255,255,255,0.6)',
                border: '1px solid rgba(255,255,255,0.5)',
              }}>
              {/* Handle */}
              <div className="flex-shrink-0 flex justify-center pt-3 pb-1">
                <div className="w-10 h-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.08)' }} />
              </div>
              {/* Header */}
              <div className="flex-shrink-0 px-5 pt-2 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={20} style={{ color: 'var(--color-primary)' }} />
                  <h3 className="crystal-text-sm text-lg" style={{ color: 'var(--color-text)' }}>购物车</h3>
                  <span className="text-sm text-[var(--color-text-muted)]">({cartCount}件)</span>
                </div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCartOpen(false)}
                  className="p-2 rounded-full cursor-pointer" style={{ background: 'rgba(0,0,0,0.04)' }}>
                  <X size={18} style={{ color: 'var(--color-text-muted)' }} />
                </motion.button>
              </div>

              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-center px-5">
                  <span className="text-5xl mb-4 opacity-60">🛒</span>
                  <p className="text-sm text-[var(--color-text-soft)] mb-1">购物车是空的</p>
                  <p className="text-xs text-[var(--color-text-muted)]">快去选一些甜蜜商品吧~</p>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setCartOpen(false)}
                    className="mt-5 px-6 py-2.5 rounded-full text-sm font-semibold cursor-pointer text-white"
                    style={{ background: 'linear-gradient(135deg, #FF7B9C, #E8668A)', boxShadow: '0 4px 16px rgba(255,123,156,0.35)' }}>去逛逛</motion.button>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto px-5 space-y-2.5" style={{ minHeight: 0 }}>
                    {cart.map(ci => (
                      <div key={ci.item.id} className="food-card p-3 !rounded-2xl">
                        <div className="flex items-center gap-3 relative z-[2]">
                          <span className="text-2xl flex-shrink-0 drop-shadow-sm">{ci.item.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[var(--color-text)] line-clamp-1 break-word">{ci.item.name}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--color-primary)' }}>{ci.item.price} 爱点 × {ci.quantity}</p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <motion.button whileTap={{ scale: 0.85 }} onClick={() => removeFromCart(ci.item.id)}
                              className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
                              style={{ background: 'rgba(255,123,156,0.1)' }}>
                              <Minus size={12} style={{ color: 'var(--color-primary)' }} strokeWidth={3} />
                            </motion.button>
                            <span className="text-sm font-semibold text-[var(--color-text)] w-5 text-center">{ci.quantity}</span>
                            <motion.button whileTap={{ scale: 0.85 }} onClick={() => addToCart(ci.item)}
                              className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
                              style={{ background: 'linear-gradient(135deg, #FF7B9C, #E8668A)' }}>
                              <Plus size={12} style={{ color: '#fff' }} strokeWidth={3} />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex-shrink-0 px-5 pt-3 pb-4 space-y-3" style={{ borderTop: '1px solid rgba(255,123,156,0.08)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--color-text-soft)]">共 {cartCount} 件商品</span>
                      <motion.button whileTap={{ scale: 0.93 }}
                        onClick={() => { setCart([]); addToast('购物车已清空', 'info') }}
                        className="text-xs text-[var(--color-text-muted)] cursor-pointer px-2 py-1">清空</motion.button>
                    </div>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={submitOrder}
                      className="w-full py-3.5 rounded-2xl text-white font-semibold text-base cursor-pointer flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #FF7B9C, #E8668A)', boxShadow: '0 4px 20px rgba(255,123,156,0.35)' }}>
                      <span>提交订单</span><span>💝</span>
                    </motion.button>
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
