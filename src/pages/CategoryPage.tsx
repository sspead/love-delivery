import { useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ShoppingBag, Plus } from 'lucide-react'
import { useCoupleStore } from '../stores/coupleStore'
import { useUIStore } from '../stores/uiStore'
import {
  MENU_CATEGORIES,
  getItemsByCategory,
  getCategoryById,
} from '../config/menu'
import type { MenuItem } from '../config/menu'

/* ──────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────── */

const CART_KEY = 'demo_cart'

interface CartItem {
  item: MenuItem
  quantity: number
}

function loadCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]')
  } catch {
    return []
  }
}

function saveCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
}

function getCartCount(): number {
  return loadCart().reduce((sum, c) => sum + c.quantity, 0)
}

/* ──────────────────────────────────────────────────
   CategoryPage — 分类商品列表
   ────────────────────────────────────────────────── */

export default function CategoryPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useCoupleStore()
  const { addToast } = useUIStore()

  const category = id ? getCategoryById(id) : undefined
  const items = id ? getItemsByCategory(id) : []

  /* If category not found */
  if (!category) {
    return (
      <div
        className="min-h-screen -mx-4 -my-4 flex flex-col items-center justify-center px-4"
        style={{ background: 'var(--color-bg)' }}
      >
        <span className="text-6xl mb-4">🔍</span>
        <p className="text-lg font-semibold text-[var(--color-text)] mb-2">
          分类不存在
        </p>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          这个分类可能已被移除
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-full text-white text-sm font-semibold cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #FF7B9C, #E8668A)',
            boxShadow: '0 2px 12px rgba(255,123,156,0.3)',
          }}
        >
          返回首页
        </motion.button>
      </div>
    )
  }

  /* ── Add single item to cart ── */

  const addSingleToCart = useCallback(
    (item: MenuItem) => {
      const cart = loadCart()
      const existing = cart.find((c) => c.item.id === item.id)
      if (existing) {
        existing.quantity += 1
      } else {
        cart.push({ item, quantity: 1 })
      }
      saveCart(cart)
      addToast(`${item.emoji} 已加入购物车，去下单吧~`, 'love')
    },
    [addToast],
  )

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */

  const cartCount = getCartCount()

  return (
    <div className="absolute inset-0 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-4 py-4 pb-24">
        {/* ═══ Header ═══ */}
        <div
          className="sticky top-0 z-20 px-4 py-3 flex items-center gap-3"
          style={{
            background: 'rgba(255,240,244,0.9)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255,123,156,0.08)',
          }}
        >
          {/* Back button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <ArrowLeft size={18} style={{ color: 'var(--color-text)' }} />
          </motion.button>

          {/* Category info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">{category.emoji}</span>
              <h1
                className="crystal-text-sm text-lg break-word line-clamp-1"
                style={{ color: 'var(--color-text)' }}
              >
                {category.name}
              </h1>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              共 {items.length} 件商品
            </p>
          </div>

          {/* Cart shortcut */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0 relative"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <ShoppingBag size={16} style={{ color: 'var(--color-primary)' }} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-1"
                style={{
                  background: 'var(--color-heart)',
                  boxShadow: '0 0 6px rgba(255,68,112,0.4)',
                }}
              >
                <span className="text-[9px] font-bold text-white leading-none">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              </span>
            )}
          </motion.button>
        </div>

        {/* ═══ Item List ═══ */}
        <div className="px-4 mt-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <span className="text-5xl mb-4">📭</span>
              <p className="text-sm text-[var(--color-text-muted)]">
                这个分类还没有商品
              </p>
            </div>
          ) : (
            items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.04, duration: 0.35 }}
                className="food-card p-4 overflow-hidden"
              >
                <div className="flex items-center gap-4">
                  {/* Large emoji left */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(255,123,156,0.08), rgba(255,184,205,0.06))',
                    }}
                  >
                    {item.emoji}
                  </div>

                  {/* Name + desc + tag */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm text-[var(--color-text)] line-clamp-1 break-word">
                        {item.name}
                      </h3>
                      {item.tag && (
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0"
                          style={{
                            background: 'var(--color-tag)',
                            color: 'var(--color-primary)',
                          }}
                        >
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-text-soft)] mt-1 line-clamp-2 break-word leading-relaxed">
                      {item.desc}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className="text-sm font-bold"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        {item.price} 爱点
                      </span>
                    </div>
                  </div>

                  {/* Add to cart button */}
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => addSingleToCart(item)}
                    className="px-4 py-2 rounded-full text-white text-sm font-semibold cursor-pointer flex-shrink-0 flex items-center gap-1.5"
                    style={{
                      background:
                        'linear-gradient(135deg, #FF7B9C, #FFB8CD)',
                      boxShadow: '0 2px 10px rgba(255,123,156,0.25)',
                    }}
                  >
                    <Plus size={14} strokeWidth={3} />
                    下单
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Cart FAB — bottom right */}
        {cartCount > 0 && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')}
            className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #FF7B9C, #E8668A)',
              boxShadow: '0 4px 20px rgba(255,123,156,0.4)',
            }}
          >
            <ShoppingBag size={22} style={{ color: '#fff' }} />
            <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] rounded-full flex items-center justify-center px-1"
              style={{
                background: '#FFA940',
                boxShadow: '0 0 8px rgba(255,169,64,0.5)',
              }}
            >
              <span className="text-[11px] font-bold text-white leading-none">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            </span>
          </motion.button>
        )}

        {/* Empty bottom space */}
        <div className="h-8" />
      </div>
    </div>
  )
}
