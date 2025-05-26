"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  userProfile: any | null  
  userType: string | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (
    email: string,
    password: string,
    fullName: string,
    userType: 'jovem' | 'empresa' | 'tutor'
  ) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  hasRole: (role: 'jovem' | 'empresa' | 'tutor') => boolean
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [userType, setUserType] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      if (session?.user) {
        const storedType = localStorage.getItem('userType')
        if (storedType) {
          setUserType(storedType)
          await fetchUserProfile(session.user.id, storedType)
        }
      }

      setLoading(false)
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          const storedType = localStorage.getItem('userType')
          if (storedType) {
            setUserType(storedType)
            await fetchUserProfile(session.user.id, storedType)
          }
        } else {
          setUserProfile(null)
          setUserType(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string, userType: string) => {
    try {
      const { data, error } = await supabase
        .from(userType)
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setUserProfile(data)
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

  
      const userId = data.session?.user.id
      if (!userId) return {}

      let { data: jovemData } = await supabase
        .from('jovem')
        .select('id')
        .eq('id', userId)
        .single()

      if (jovemData) {
        setUserType('jovem')
        localStorage.setItem('userType', 'jovem')
        await fetchUserProfile(userId, 'jovem')
        return {}
      }


      let { data: empresaData } = await supabase
        .from('empresa')
        .select('id')
        .eq('id', userId)
        .single()

      if (empresaData) {
        setUserType('empresa')
        localStorage.setItem('userType', 'empresa')
        await fetchUserProfile(userId, 'empresa')
        return {}
      }

      setUserType(null)
      localStorage.removeItem('userType')

      return {}
    } catch (error) {
      return { error: 'Erro interno do servidor' }
    }
  }

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    userType: 'jovem' | 'empresa' | 'tutor'
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      if (data.user) {
   
        const tableData: any = {
          id: data.user.id,
          email,
          full_name: fullName,
        }

        const { error: profileError } = await supabase
          .from(userType)
          .insert([tableData])

        if (profileError) {
          return { error: `Erro ao criar perfil do tipo ${userType}` }
        }

        setUserType(userType)
        localStorage.setItem('userType', userType)
        setUserProfile(tableData)
      }

      return {}
    } catch (error) {
      return { error: 'Erro interno do servidor' }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUserType(null)
    setUserProfile(null)
    localStorage.removeItem('userType')
  }

  const hasRole = (role: 'jovem' | 'empresa' | 'tutor'): boolean => {
    return userType === role
  }

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      userType,
      loading,
      signIn,
      signUp,
      signOut,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
