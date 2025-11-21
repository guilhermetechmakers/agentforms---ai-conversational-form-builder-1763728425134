import { useQuery } from '@tanstack/react-query'
import { plansApi } from '@/api/plans'
import type { Plan } from '@/types/database/plans'

export const usePlans = () => {
  return useQuery<Plan[]>({
    queryKey: ['plans'],
    queryFn: () => plansApi.getAll(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export const usePlan = (id: string | null) => {
  return useQuery<Plan | null>({
    queryKey: ['plans', id],
    queryFn: () => (id ? plansApi.getById(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export const usePlanBySlug = (slug: string | null) => {
  return useQuery<Plan | null>({
    queryKey: ['plans', 'slug', slug],
    queryFn: () => (slug ? plansApi.getBySlug(slug) : Promise.resolve(null)),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}
