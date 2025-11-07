import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Sparkles, Zap, Heart, Star } from 'lucide-react'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  velocity: { x: number; y: number }
  life: number
  maxLife: number
  icon?: 'sparkle' | 'zap' | 'heart' | 'star'
}

interface ParticleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  particleType?: 'sparkle' | 'burst' | 'heart' | 'star' | 'mixed'
  particleColor?: string
  particleCount?: number
  duration?: number
  className?: string
  glowEffect?: boolean
  rippleEffect?: boolean
  gradient?: boolean
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const ParticleButton: React.FC<ParticleButtonProps> = ({
  children,
  particleType = 'sparkle',
  particleColor = '#ffffff',
  particleCount = 12,
  duration = 800,
  className,
  glowEffect = true,
  rippleEffect = true,
  gradient = false,
  variant = 'primary',
  size = 'md',
  onClick,
  ...props
}) => {
  const [particles, setParticles] = useState<Particle[]>([])
  const [isPressed, setIsPressed] = useState(false)
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const buttonRef = useRef<HTMLButtonElement>(null)
  const particleIdRef = useRef(0)

  const getParticleColors = (type: string) => {
    switch (type) {
      case 'sparkle':
        return ['#ffffff', '#fbbf24', '#f59e0b', '#d97706']
      case 'heart':
        return ['#ef4444', '#dc2626', '#b91c1c', '#991b1b']
      case 'star':
        return ['#fbbf24', '#f59e0b', '#d97706', '#b45309']
      case 'burst':
        return ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af']
      case 'mixed':
        return ['#ffffff', '#fbbf24', '#ef4444', '#3b82f6', '#8b5cf6']
      default:
        return [particleColor]
    }
  }

  const getParticleIcons = (type: string) => {
    switch (type) {
      case 'heart':
        return ['heart']
      case 'star':
        return ['star']
      case 'mixed':
        return ['sparkle', 'star', 'heart']
      default:
        return ['sparkle']
    }
  }

  const createParticles = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const colors = getParticleColors(particleType)
    const icons = getParticleIcons(particleType)

    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => {
      const angle = (i / particleCount) * Math.PI * 2
      const velocity = 2 + Math.random() * 3
      const size = 4 + Math.random() * 8
      const color = colors[Math.floor(Math.random() * colors.length)]
      const icon = icons[Math.floor(Math.random() * icons.length)] as Particle['icon']

      return {
        id: particleIdRef.current++,
        x: centerX,
        y: centerY,
        size,
        color,
        velocity: {
          x: Math.cos(angle) * velocity,
          y: Math.sin(angle) * velocity
        },
        life: duration,
        maxLife: duration,
        icon
      }
    })

    setParticles(prev => [...prev, ...newParticles])
  }

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!rippleEffect) return
    
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    const newRipple = { id: Date.now(), x, y }
    setRipples(prev => [...prev, newRipple])
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
    }, 600)
  }

  useEffect(() => {
    if (particles.length === 0) return

    const interval = setInterval(() => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.velocity.x,
          y: particle.y + particle.velocity.y,
          life: particle.life - 16,
          velocity: {
            x: particle.velocity.x * 0.98,
            y: particle.velocity.y * 0.98 + 0.1
          }
        })).filter(particle => particle.life > 0)
      )
    }, 16)

    return () => clearInterval(interval)
  }, [particles.length])

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    createParticles(event)
    createRipple(event)
    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 150)
    onClick?.(event)
  }

  const getVariantStyles = () => {
    const baseStyles = "relative overflow-hidden font-semibold transition-all duration-300 transform"
    
    const variants = {
      primary: gradient 
        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/25"
        : "bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl",
      secondary: gradient
        ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg hover:shadow-xl"
        : "bg-gray-600 text-white shadow-lg hover:bg-gray-700 hover:shadow-xl",
      accent: gradient
        ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg hover:shadow-xl hover:shadow-pink-500/25"
        : "bg-pink-500 text-white shadow-lg hover:bg-pink-600 hover:shadow-xl",
      danger: gradient
        ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl"
        : "bg-red-500 text-white shadow-lg hover:bg-red-600 hover:shadow-xl",
      success: gradient
        ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl"
        : "bg-green-500 text-white shadow-lg hover:bg-green-600 hover:shadow-xl"
    }

    const sizes = {
      sm: "px-4 py-2 text-sm h-10",
      md: "px-6 py-3 text-base h-12",
      lg: "px-8 py-4 text-lg h-14",
      xl: "px-10 py-5 text-xl h-16"
    }

    return `${baseStyles} ${variants[variant]} ${sizes[size]}`
  }

  const renderParticleIcon = (icon: Particle['icon']) => {
    const size = 16
    const color = 'currentColor'
    
    switch (icon) {
      case 'heart':
        return <Heart size={size} color={color} fill={color} />
      case 'star':
        return <Star size={size} color={color} fill={color} />
      case 'zap':
        return <Zap size={size} color={color} />
      default:
        return <Sparkles size={size} color={color} />
    }
  }

  return (
    <motion.button
      ref={buttonRef}
      className={cn(
        getVariantStyles(),
        glowEffect && "hover:brightness-110 focus:brightness-110",
        isPressed && "scale-95",
        className
      )}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {/* Ripple Effects */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 0,
              height: 0,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <AnimatePresence>
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              className="absolute pointer-events-none"
              style={{
                left: particle.x - particle.size / 2,
                top: particle.y - particle.size / 2,
                width: particle.size,
                height: particle.size,
                color: particle.color,
                opacity: particle.life / particle.maxLife,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: particle.life / particle.maxLife }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              {renderParticleIcon(particle.icon)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Button Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  )
}

export default ParticleButton