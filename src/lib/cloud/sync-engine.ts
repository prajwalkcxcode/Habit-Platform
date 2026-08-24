import { supabase, isCloudEnabled } from './supabase'
import { db } from '@/lib/db'
import { useSyncStore } from '@/lib/store/sync'

export async function syncLocalToCloud() {
  if (!isCloudEnabled() || !supabase) return

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    useSyncStore.getState().setStatus('disabled')
    return
  }

  const userId = session.user.id
  useSyncStore.getState().setStatus('syncing')

  try {
    // 1. Sync Habits
    const localHabits = await db.habits.toArray()
    for (const habit of localHabits) {
      await supabase.from('habits').upsert({
        id: habit.id,
        user_id: userId,
        name: habit.name,
        description: habit.description,
        icon: habit.icon,
        accent_color: habit.accentColor,
        frequency: habit.frequency,
        preferred_time: habit.preferredTime,
        status: habit.status,
        priority: habit.priority || 'medium',
        difficulty: habit.difficulty || 'medium',
        category_id: habit.categoryId,
        created_at: habit.createdAt,
        updated_at: habit.updatedAt,
      })
    }

    // Pull Habits from Cloud
    const { data: cloudHabits } = await supabase.from('habits').select('*')
    if (cloudHabits) {
      for (const ch of cloudHabits) {
        await db.habits.put({
          id: ch.id,
          name: ch.name,
          description: ch.description,
          icon: ch.icon,
          accentColor: ch.accent_color,
          frequency: ch.frequency,
          preferredTime: ch.preferred_time,
          status: ch.status,
          priority: ch.priority,
          difficulty: ch.difficulty,
          categoryId: ch.category_id,
          createdAt: ch.created_at,
          updatedAt: ch.updated_at,
        })
      }
    }

    // 2. Sync Completions
    const localCompletions = await db.completions.toArray()
    for (const c of localCompletions) {
      await supabase.from('completions').upsert({
        id: c.id,
        habit_id: c.habitId,
        user_id: userId,
        date: c.date,
        completed_at: c.completedAt,
        note: c.note,
      })
    }

    // Pull Completions
    const { data: cloudCompletions } = await supabase.from('completions').select('*')
    if (cloudCompletions) {
      for (const cc of cloudCompletions) {
        await db.completions.put({
          id: cc.id,
          habitId: cc.habit_id,
          date: cc.date,
          completedAt: cc.completed_at,
          note: cc.note,
        })
      }
    }

    // 3. Sync Routines
    const localRoutines = await db.routines.toArray()
    for (const r of localRoutines) {
      await supabase.from('routines').upsert({
        id: r.id,
        user_id: userId,
        name: r.name,
        description: r.description,
        icon: r.icon,
        accent_color: r.accentColor,
        items: r.items,
        created_at: r.createdAt,
        updated_at: r.updatedAt,
      })
    }

    // Pull Routines
    const { data: cloudRoutines } = await supabase.from('routines').select('*')
    if (cloudRoutines) {
      for (const cr of cloudRoutines) {
        await db.routines.put({
          id: cr.id,
          name: cr.name,
          description: cr.description,
          icon: cr.icon,
          accentColor: cr.accent_color,
          items: cr.items,
          createdAt: cr.created_at,
          updatedAt: cr.updated_at,
        })
      }
    }

    // 4. Sync Goals
    const localGoals = await db.goals.toArray()
    for (const g of localGoals) {
      await supabase.from('goals').upsert({
        id: g.id,
        user_id: userId,
        title: g.title,
        description: g.description,
        target_type: g.targetType,
        target_value: g.targetValue,
        current_value: g.currentValue,
        unit: g.unit,
        deadline: g.deadline,
        sub_goals: g.subGoals,
        linked_habit_ids: g.linkedHabitIds,
        status: g.status,
        created_at: g.createdAt,
        updated_at: g.updatedAt,
      })
    }

    // Pull Goals
    const { data: cloudGoals } = await supabase.from('goals').select('*')
    if (cloudGoals) {
      for (const cg of cloudGoals) {
        await db.goals.put({
          id: cg.id,
          title: cg.title,
          description: cg.description,
          targetType: cg.target_type,
          targetValue: cg.target_value,
          currentValue: cg.current_value,
          unit: cg.unit,
          deadline: cg.deadline,
          subGoals: cg.sub_goals,
          linkedHabitIds: cg.linked_habit_ids,
          status: cg.status,
          createdAt: cg.created_at,
          updatedAt: cg.updated_at,
        })
      }
    }

    // 5. Sync Reflections
    const localReflections = await db.reflections.toArray()
    for (const r of localReflections) {
      await supabase.from('reflections').upsert({
        id: r.id,
        user_id: userId,
        date: r.date,
        mood: r.mood,
        energy: r.energy,
        note: r.journalText,
        updated_at: r.updatedAt,
      })
    }

    // Pull Reflections
    const { data: cloudReflections } = await supabase.from('reflections').select('*')
    if (cloudReflections) {
      for (const cr of cloudReflections) {
        await db.reflections.put({
          id: cr.id,
          date: cr.date,
          mood: cr.mood,
          energy: cr.energy,
          journalText: cr.note,
          updatedAt: cr.updated_at,
        })
      }
    }

    useSyncStore.getState().markSynced()
  } catch (error) {
    console.error('Sync failed:', error)
    useSyncStore.getState().setStatus('error')
  }
}
