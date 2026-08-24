import type { HabitTemplate } from '@/lib/types/v2'

export const STARTER_TEMPLATES: HabitTemplate[] = [
  {
    id: 'morning-reset',
    name: 'Morning Reset',
    description: 'Build a focused, energized start to every day.',
    category: 'Mindfulness',
    icon: '🌅',
    habits: [
      { name: 'Hydrate (500ml water)', icon: '💧', accentColor: '#3b82f6', frequencyType: 'daily', preferredTime: 'morning' },
      { name: '10m Mindfulness Meditation', icon: '🧘', accentColor: '#8b5cf6', frequencyType: 'daily', preferredTime: 'morning' },
      { name: 'Sunlight Exposure & Walk', icon: '☀️', accentColor: '#f59e0b', frequencyType: 'daily', preferredTime: 'morning' },
    ],
  },
  {
    id: 'deep-work-focus',
    name: 'Deep Work & Focus',
    description: 'Eliminate distractions and achieve deep flow state.',
    category: 'Productivity',
    icon: '🧠',
    habits: [
      { name: 'Block Distracting Apps', icon: '🎯', accentColor: '#6366f1', frequencyType: 'weekdays', preferredTime: 'morning' },
      { name: '90-minute Deep Focus Session', icon: '📝', accentColor: '#3b82f6', frequencyType: 'weekdays', preferredTime: 'morning' },
      { name: 'Daily Evening Review', icon: '✍️', accentColor: '#8b5cf6', frequencyType: 'weekdays', preferredTime: 'evening' },
    ],
  },
  {
    id: 'fitness-foundation',
    name: 'Fitness Foundation',
    description: 'Essential physical wellness baseline for strength & stamina.',
    category: 'Fitness',
    icon: '🏋️',
    habits: [
      { name: '8,000 Daily Steps', icon: '🏃', accentColor: '#22c55e', frequencyType: 'daily', preferredTime: 'anytime' },
      { name: 'Workout Session (Strength / Cardio)', icon: '💪', accentColor: '#f59e0b', frequencyType: 'weekdays', preferredTime: 'afternoon' },
      { name: 'Sleep Before 11 PM', icon: '😴', accentColor: '#8b5cf6', frequencyType: 'daily', preferredTime: 'evening' },
    ],
  },
  {
    id: 'continuous-learner',
    name: 'Continuous Learner',
    description: 'Consistently expand your skills and knowledge base.',
    category: 'Learning',
    icon: '📚',
    habits: [
      { name: 'Read 20 Pages of a Book', icon: '📚', accentColor: '#6366f1', frequencyType: 'daily', preferredTime: 'evening' },
      { name: 'Practice Coding / Skill Building', icon: '🧠', accentColor: '#3b82f6', frequencyType: 'weekdays', preferredTime: 'afternoon' },
      { name: 'Learn 5 New Vocabulary Words', icon: '📝', accentColor: '#ec4899', frequencyType: 'daily', preferredTime: 'morning' },
    ],
  },
  {
    id: 'digital-detox',
    name: 'Digital Detox',
    description: 'Reclaim your attention and improve sleep quality.',
    category: 'Health',
    icon: '🌿',
    habits: [
      { name: 'No Screen 1 hour Before Bed', icon: '🌙', accentColor: '#8b5cf6', frequencyType: 'daily', preferredTime: 'evening' },
      { name: 'Starlight / Evening Walk', icon: '🌿', accentColor: '#22c55e', frequencyType: 'daily', preferredTime: 'evening' },
    ],
  },
  {
    id: 'financial-discipline',
    name: 'Financial Discipline',
    description: 'Build intentional spending habits and long-term security.',
    category: 'Productivity',
    icon: '💳',
    habits: [
      { name: 'Log Daily Expenses', icon: '📝', accentColor: '#22c55e', frequencyType: 'daily', preferredTime: 'evening' },
      { name: 'No Impulse Purchases Today', icon: '🎯', accentColor: '#f59e0b', frequencyType: 'daily', preferredTime: 'anytime' },
    ],
  },
]
