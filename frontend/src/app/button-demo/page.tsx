'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import ParticleButton from '@/components/ui/particle-button'
import { Heart, Star, Zap, Sparkles, Download, Upload, Play, Pause, Settings, User, Mail, Phone, Home, Search, ShoppingCart, Heart as HeartIcon } from 'lucide-react'

export default function ButtonDemo() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [clickedButtons, setClickedButtons] = useState<Record<string, number>>({})

  const handleLoadingClick = (buttonId: string) => {
    setLoadingStates(prev => ({ ...prev, [buttonId]: true }))
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [buttonId]: false }))
    }, 2000)
  }

  const handleClick = (buttonId: string) => {
    setClickedButtons(prev => ({ ...prev, [buttonId]: (prev[buttonId] || 0) + 1 }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Комплексная система стилей кнопок
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Современные, адаптивные и доступные кнопки с различными вариантами стилей, анимациями и эффектами
          </p>
        </div>

        {/* Base Button Variants */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Базовые варианты кнопок</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {[
              { variant: 'default', label: 'Default', icon: <HeartIcon size={16} /> },
              { variant: 'destructive', label: 'Destructive', icon: <Zap size={16} /> },
              { variant: 'outline', label: 'Outline', icon: <Settings size={16} /> },
              { variant: 'secondary', label: 'Secondary', icon: <User size={16} /> },
              { variant: 'ghost', label: 'Ghost', icon: <Mail size={16} /> },
              { variant: 'link', label: 'Link', icon: <Phone size={16} /> },
              { variant: 'gradient', label: 'Gradient', icon: <Star size={16} /> },
              { variant: 'neon', label: 'Neon', icon: <Sparkles size={16} /> },
              { variant: 'glass', label: 'Glass', icon: <Home size={16} /> }
            ].map(({ variant, label, icon }) => (
              <div key={variant} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <Button 
                  variant={variant as any} 
                  className="w-full mb-4"
                  onClick={() => handleClick(`base-${variant}`)}
                >
                  {icon}
                  {label}
                </Button>
                <p className="text-sm text-gray-300">Кликов: {clickedButtons[`base-${variant}`] || 0}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Neon preset: size=default, shape=smooth */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Неон — размер Default, форма Smooth</h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
            <Button
              variant="neon"
              size="default"
              shape="smooth"
              onClick={() => handleClick('neon-default-smooth')}
            >
              <Sparkles size={16} />
              Neon Default Smooth
            </Button>
            <p className="mt-4 text-sm text-gray-300">Кликов: {clickedButtons['neon-default-smooth'] || 0}</p>
          </div>
        </section>

        {/* Button Sizes */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Размеры кнопок</h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
            <div className="flex flex-wrap items-center justify-center gap-6">
              {[
                { size: 'sm', label: 'Small' },
                { size: 'default', label: 'Default' },
                { size: 'lg', label: 'Large' },
                { size: 'xl', label: 'Extra Large' }
              ].map(({ size, label }) => (
                <Button key={size} size={size as any} variant="gradient">
                  {label} Button
                </Button>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <Button size="icon" variant="neon">
                <HeartIcon size={20} />
              </Button>
            </div>
          </div>
        </section>

        {/* Button Shapes */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Формы кнопок</h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
            <div className="flex flex-wrap items-center justify-center gap-6">
              {[
                { shape: 'default', label: 'Rounded' },
                { shape: 'pill', label: 'Pill' },
                { shape: 'square', label: 'Square' },
                { shape: 'smooth', label: 'Smooth' }
              ].map(({ shape, label }) => (
                <Button key={shape} shape={shape as any} variant="gradient">
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Loading States */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Состояния загрузки</h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { variant: 'default', label: 'Loading...' },
                { variant: 'gradient', label: 'Processing...' },
                { variant: 'neon', label: 'Uploading...' }
              ].map(({ variant, label }, index) => (
                <Button
                  key={variant}
                  variant={variant as any}
                  loading={loadingStates[`loading-${index}`] || false}
                  loadingText={label}
                  onClick={() => handleLoadingClick(`loading-${index}`)}
                  className="w-full"
                >
                  <Upload size={16} />
                  Начать загрузку
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Particle Buttons */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Кнопки с частицами</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { type: 'sparkle', label: 'Sparkle Magic', variant: 'primary' as const },
              { type: 'heart', label: 'Heart Burst', variant: 'accent' as const },
              { type: 'star', label: 'Star Shower', variant: 'secondary' as const },
              { type: 'burst', label: 'Energy Burst', variant: 'danger' as const },
              { type: 'mixed', label: 'Mixed Magic', variant: 'success' as const }
            ].map(({ type, label, variant }) => (
              <div key={type} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <ParticleButton
                  particleType={type as any}
                  variant={variant}
                  size="lg"
                  className="w-full mb-4"
                  onClick={() => handleClick(`particle-${type}`)}
                >
                  {label}
                </ParticleButton>
                <p className="text-sm text-gray-300">Кликов: {clickedButtons[`particle-${type}`] || 0}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Advanced Particle Variations */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Расширенные варианты</h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-4">Glass Effect</h3>
                <ParticleButton
                  particleType="sparkle"
                  variant="primary"
                  className="w-full"
                  glowEffect={true}
                  gradient={true}
                  particleColor="#ffffff"
                  particleCount={20}
                >
                  <Sparkles size={20} />
                  Glass Particle Button
                </ParticleButton>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-4">Gradient Burst</h3>
                <ParticleButton
                  particleType="burst"
                  variant="accent"
                  className="w-full"
                  gradient={true}
                  glowEffect={true}
                  particleCount={15}
                >
                  <Zap size={20} />
                  Gradient Burst Button
                </ParticleButton>
              </div>
            </div>
          </div>
        </section>

        {/* Button Groups */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Группы кнопок</h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
            <div className="space-y-8">
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="default">
                  <Play size={16} />
                  Play
                </Button>
                <Button variant="secondary">
                  <Pause size={16} />
                  Pause
                </Button>
                <Button variant="outline">
                  <Settings size={16} />
                  Settings
                </Button>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <ParticleButton particleType="heart" variant="accent" size="sm">
                  <Heart size={16} />
                  Like
                </ParticleButton>
                <ParticleButton particleType="star" variant="secondary" size="sm">
                  <Star size={16} />
                  Favorite
                </ParticleButton>
                <ParticleButton particleType="sparkle" variant="primary" size="sm">
                  <Sparkles size={16} />
                  Magic
                </ParticleButton>
              </div>
            </div>
          </div>
        </section>

        {/* Accessibility Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Доступность и взаимодействие</h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Button
                variant="default"
                disabled
                className="w-full"
              >
                Disabled Button
              </Button>
              <Button
                variant="gradient"
                className="w-full"
                onClick={() => handleClick('focus-test')}
              >
                Focus Test
              </Button>
              <Button
                variant="neon"
                size="lg"
                className="w-full"
                onClick={() => handleClick('large-click')}
              >
                Large Click Area
              </Button>
              <Button
                variant="glass"
                className="w-full"
                aria-label="Glass button with accessibility"
              >
                ARIA Label
              </Button>
            </div>
          </div>
        </section>

        {/* Summary */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">Характеристики системы</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">🎨 Визуальное оформление</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• 9 вариантов стилей</li>
                  <li>• Градиентные эффекты</li>
                  <li>• Тени и подсветки</li>
                  <li>• Скругления и формы</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">📏 Адаптивность</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• 4 размера кнопок</li>
                  <li>• 4 формы кнопок</li>
                  <li>• Адаптивные отступы</li>
                  <li>• Масштабирование текста</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-pink-400 mb-2">✨ Анимации</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Эффекты частиц</li>
                  <li>• Риппл-анимации</li>
                  <li>• Hover-эффекты</li>
                  <li>• Плавные переходы</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-400 mb-2">♿ Доступность</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Контрастность WCAG</li>
                  <li>• Фокус-состояния</li>
                  <li>• ARIA-метки</li>
                  <li>• Клавиатурная навигация</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}