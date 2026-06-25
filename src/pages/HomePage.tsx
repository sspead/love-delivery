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

const CART_KEY = 'demo_cart'; const ORDERS_KEY = 'demo_orders'
function loadCart(): CartItem[] { try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]') } catch { return [] } }
function saveCart(c: CartItem[]) { localStorage.setItem(CART_KEY, JSON.stringify(c)) }
function loadOrders(): DemoOrder[] { try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]') } catch { return [] } }
function saveOrders(o: DemoOrder[]) { localStorage.setItem(ORDERS_KEY, JSON.stringify(o)) }
function genId(): string { return '#L'+String(Math.floor(Math.random()*999)+1).padStart(3,'0') }

export default function HomePage() {
  const { profile, partner } = useCoupleStore()
  const { addToast } = useUIStore()
  const uid = profile?.id || 'demo-user-1'; const uname = profile?.display_name || '我'
  const pid = partner?.id || 'demo-user-2'; const pname = partner?.display_name || 'TA'

  const [activeCat, setActiveCat] = useState('intimacy')
  const [cart, setCart] = useState<CartItem[]>(loadCart)
  const [cartOpen, setCartOpen] = useState(false)
  useEffect(() => { saveCart(cart) }, [cart])

  const category = getCategoryById(activeCat); const items = getItemsByCategory(activeCat)
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
    const orders = loadOrders(); const now = new Date().toISOString()
    saveOrders([...cart.map(ci => ({ id: genId(), itemId: ci.item.id, itemName: ci.item.name, itemEmoji: ci.item.emoji, price: ci.item.price, quantity: ci.quantity, status: 'pending' as const, from: uid, fromName: uname, to: pid, toName: pname, createdAt: now })), ...orders])
    setCart([]); setCartOpen(false); addToast('已下单，等待TA接单 💝', 'love')
  }, [cart, uid, uname, pid, pname, addToast])

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: 'linear-gradient(180deg, #FFFAFB 0%, #FBF0F2 40%, #F8ECEF 100%)' }}>
      {/* Banner · 玫瑰金渐变 */}
      <div className="flex-shrink-0 relative px-5 pt-4 pb-5 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(245,197,206,0.35) 0%, rgba(251,240,242,0.2) 50%, transparent 100%)' }} />
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full opacity-6" style={{ background: 'radial-gradient(circle, #E8919E, transparent 70%)' }} />
        <div className="absolute top-8 right-12 w-12 h-12 rounded-full opacity-4" style={{ background: 'radial-gradient(circle, #D4A853, transparent 60%)' }} />
        <div className="relative z-10 flex items-end justify-between">
          <div>
            <h1 className="crystal-text text-[28px] leading-none" style={{ color: 'var(--rose-deep)' }}>恋爱外卖</h1>
            <p className="text-[13px] text-[var(--ink-soft)] flex items-center gap-1.5 mt-1.5 tracking-wide">
              <Sparkles size={12} style={{ color: 'var(--gold)' }} /> 甜蜜下单 · 专属送达
            </p>
          </div>
        </div>
      </div>

      {/* Main · 左侧栏 + 右侧列表 */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* LEFT · 分类侧栏 */}
        <div className="flex-shrink-0 w-[80px] overflow-y-auto panel-glass" style={{ scrollbarWidth: 'none' }}>
          {MENU_CATEGORIES.map(cat => {
            const isActive = activeCat === cat.id
            return (
              <motion.button
                key={cat.id} whileTap={{ scale: 0.94 }} onClick={() => setActiveCat(cat.id)}
                className="flex flex-col items-center justify-center gap-1.5 py-3.5 px-1 w-full cursor-pointer relative"
                style={{ background: isActive ? 'linear-gradient(180deg, rgba(232,145,158,0.1) 0%, rgba(245,197,206,0.05) 100%)' : 'transparent', minHeight: 68 }}
              >
                {isActive && (
                  <motion.div layoutId="activeBar" className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
                    style={{ background: 'linear-gradient(180deg, #E8919E, #D47888)', boxShadow: '0 0 6px rgba(232,145,158,0.3)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }} />
                )}
                <span className="text-xl leading-none" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.06))' }}>{cat.emoji}</span>
                <span className="text-[11px] leading-tight font-medium text-center break-word"
                  style={{ color: isActive ? 'var(--rose-deep)' : 'var(--ink-soft)', fontWeight: isActive ? 600 : 500, maxWidth: 72 }}>
                  {cat.name}
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* RIGHT · 商品列表 */}
        <div className="flex-1 min-w-0 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(232,145,158,0.12) transparent', WebkitOverflowScrolling: 'touch' }}>
          {category && (
            <div className="sticky top-0 z-10 px-5 py-3.5 flex items-center gap-3 panel-glass" style={{ borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}>
              <span className="text-xl">{category.emoji}</span>
              <span className="crystal-text-sm text-[17px]" style={{ color: 'var(--ink)' }}>{category.name}</span>
              <span className="text-[13px] text-[var(--ink-muted)] ml-auto font-medium">{items.length} 项</span>
            </div>
          )}
          <div className="px-4 py-4 space-y-3" style={{ paddingBottom: '130px' }}>
            {items.map(item => (
              <div key={item.id} className="food-card p-4">
                <div className="flex items-center gap-4 relative z-[2]">
                  {/* Emoji icon */}
                  <div className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(251,240,242,0.7))',
                      boxShadow: '0 2px 10px rgba(200,150,160,0.1), inset 0 1px 0 rgba(255,255,255,0.6)',
                    }}>
                    {item.emoji}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-[16px] text-[var(--ink)] line-clamp-1 break-word tracking-tight">{item.name}</span>
                      {item.tag && (
                        <span className="flex-shrink-0 px-2 py-[3px] rounded-full text-[10px] font-bold tracking-wide"
                          style={{ background: 'linear-gradient(135deg, rgba(232,145,158,0.12), rgba(245,197,206,0.08))', color: 'var(--rose)' }}>
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-[var(--ink-soft)] line-clamp-2 break-word leading-relaxed mb-2.5">{item.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-extrabold tracking-tight" style={{ color: 'var(--rose)' }}>
                        {item.price} <span className="text-[11px] font-semibold text-[var(--ink-muted)]">爱点</span>
                      </span>
                      <motion.button whileTap={{ scale: 0.88 }}
                        onClick={() => addToCart(item)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #E8919E, #D47888)', boxShadow: '0 3px 14px rgba(232,145,158,0.35)' }}>
                        <Plus size={18} style={{ color: '#fff' }} strokeWidth={2.5} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <span className="text-5xl mb-5 opacity-25">📭</span>
                <p className="text-[15px] text-[var(--ink-soft)] font-medium">该分类暂无商品</p>
              </div>
            )}
          </div>
        </div>

        {/* Cart FAB */}
        {cartCount > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 0.9 }} onClick={() => setCartOpen(true)}
            className="absolute bottom-5 right-5 z-20 w-[56px] h-[56px] rounded-[18px] flex items-center justify-center cursor-pointer overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
              border: '0.5px solid rgba(255,255,255,0.7)',
              boxShadow: '0 4px 24px rgba(200,150,160,0.18), inset 0 1px 0 rgba(255,255,255,0.5)',
            }}>
            <div className="absolute inset-0 opacity-20" style={{ background: 'linear-gradient(135deg, #E8919E, #F5C5CE)' }} />
            <ShoppingBag size={24} style={{ color: 'var(--rose)', position: 'relative', zIndex: 1 }} strokeWidth={1.5} />
            <span className="absolute -top-1 -right-1 min-w-[24px] h-[24px] rounded-full flex items-center justify-center text-white text-[11px] font-bold z-10"
              style={{ background: 'linear-gradient(135deg, #E8919E, #D47888)', boxShadow: '0 2px 8px rgba(212,120,136,0.4)', padding: '0 5px' }}>
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          </motion.button>
        )}
      </div>

      {/* Cart Sheet */}
      <AnimatePresence>
        {cartOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)} className="absolute inset-0 bg-black/25 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative z-10 w-full rounded-t-[28px] flex flex-col overflow-hidden safe-bottom"
              style={{
                background: 'rgba(255,250,251,0.8)',
                backdropFilter: 'blur(44px) saturate(200%)', WebkitBackdropFilter: 'blur(44px) saturate(200%)',
                maxHeight: '78dvh',
                boxShadow: '0 -8px 48px rgba(0,0,0,0.08), 0 -1px 0 rgba(255,255,255,0.6)',
              }}>
              <div className="flex-shrink-0 flex justify-center pt-3 pb-1">
                <div className="w-10 h-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.06)' }} />
              </div>
              <div className="flex-shrink-0 px-5 pt-2 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag size={20} style={{ color: 'var(--rose)' }} strokeWidth={1.5} />
                  <h3 className="crystal-text-sm text-lg" style={{ color: 'var(--ink)' }}>购物车</h3>
                  <span className="text-sm text-[var(--ink-muted)] font-medium">{cartCount} 件</span>
                </div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCartOpen(false)}
                  className="p-2 rounded-full cursor-pointer" style={{ background: 'rgba(0,0,0,0.03)' }}>
                  <X size={18} style={{ color: 'var(--ink-muted)' }} />
                </motion.button>
              </div>

              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-center px-5">
                  <span className="text-5xl mb-4 opacity-30">🛒</span>
                  <p className="text-[15px] text-[var(--ink-soft)] mb-1">购物车是空的</p>
                  <p className="text-[13px] text-[var(--ink-muted)]">快去逛逛吧~</p>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setCartOpen(false)}
                    className="mt-6 px-6 py-3 rounded-2xl text-white text-[15px] font-semibold cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #E8919E, #D47888)', boxShadow: '0 4px 20px rgba(232,145,158,0.3)' }}>去逛逛</motion.button>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto px-5 space-y-2.5" style={{ minHeight: 0 }}>
                    {cart.map(ci => (
                      <div key={ci.item.id} className="flex items-center gap-3 p-3.5 rounded-2xl relative z-[2]"
                        style={{ background: 'rgba(251,240,242,0.5)', border: '0.5px solid rgba(232,145,158,0.1)' }}>
                        <span className="text-2xl flex-shrink-0">{ci.item.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-semibold text-[var(--ink)] line-clamp-1 break-word">{ci.item.name}</p>
                          <p className="text-[13px] mt-0.5" style={{ color: 'var(--rose)' }}>{ci.item.price} 爱点 × {ci.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <motion.button whileTap={{ scale: 0.85 }} onClick={() => removeFromCart(ci.item.id)}
                            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                            style={{ background: 'rgba(232,145,158,0.08)' }}>
                            <Minus size={14} style={{ color: 'var(--rose)' }} strokeWidth={2.5} />
                          </motion.button>
                          <span className="text-[15px] font-semibold text-[var(--ink)] w-5 text-center">{ci.quantity}</span>
                          <motion.button whileTap={{ scale: 0.85 }} onClick={() => addToCart(ci.item)}
                            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                            style={{ background: 'linear-gradient(135deg, #E8919E, #D47888)' }}>
                            <Plus size={14} style={{ color: '#fff' }} strokeWidth={2.5} />
                          </motion.button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex-shrink-0 px-5 pt-3 pb-4 space-y-3" style={{ borderTop: '0.5px solid rgba(0,0,0,0.04)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] text-[var(--ink-soft)] font-medium">共 {cartCount} 件商品</span>
                      <button onClick={() => { setCart([]); addToast('已清空', 'info') }}
                        className="text-[13px] text-[var(--ink-muted)] cursor-pointer px-2 py-1">清空</button>
                    </div>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={submitOrder}
                      className="w-full py-3.5 rounded-2xl text-white text-[16px] font-semibold cursor-pointer flex items-center justify-center gap-2 tracking-wide"
                      style={{ background: 'linear-gradient(135deg, #E8919E, #D47888)', boxShadow: '0 4px 24px rgba(232,145,158,0.35)' }}>
                      提交订单 <span>💝</span>
                    </motion.button>
                    <p className="text-center text-[12px] text-[var(--ink-muted)]">爱点是心意，不是钱哦</p>
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
