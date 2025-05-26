import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY


if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


export type UserRole = 'jovem' | 'rh'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  full_name?: string
  institution?: string
  company?: string
  created_at: string
}


export interface CadastroJovem {
  nome: string
  email: string
  login: string  
  senha: string  
  cpf?: string
}

export interface CadastroEmpresa {
  nome: string
  email: string
  cnpj?: string
}


export function validateInstitutionalEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }

  const educationalDomains = [
    'edu.br',
    'ufba.br',
    'usp.br',
    'unicamp.br',
    'ufrj.br',
    'ufmg.br',
    'ufsc.br',
    'ufpe.br',
    'ufrgs.br',
    'ufpr.br',
    'student.',
    'aluno.',
    'academico.',
  ]
  
  const personalDomains = [
    'gmail.com',
    'hotmail.com',
    'yahoo.com',
    'outlook.com',
    'live.com',
    'terra.com.br',
    'uol.com.br'
  ]
  
  const emailLower = email.toLowerCase().trim()
  
 
  if (personalDomains.some(domain => emailLower.endsWith(domain))) {
    return false
  }
  

  if (educationalDomains.some(domain => emailLower.includes(domain))) {
    return true
  }
  

  return !personalDomains.some(domain => emailLower.endsWith(domain))
}


export function determineUserRole(email: string): UserRole {
  if (!email || typeof email !== 'string') {
    throw new Error('Email inválido')
  }

  const educationalDomains = [
    'edu.br',
    'ufba.br',
    'usp.br',
    'unicamp.br',
    'ufrj.br',
    'ufmg.br',
    'ufsc.br',
    'ufpe.br',
    'ufrgs.br',
    'ufpr.br',
    'student.',
    'aluno.',
    'academico.',
  ]
  
  const emailLower = email.toLowerCase().trim()
  

  const isEducational = educationalDomains.some(domain => 
    emailLower.includes(domain)
  )
  
  return isEducational ? 'jovem' : 'rh'
}


export async function cadastrarJovem(dados: CadastroJovem) {
  try {
    console.log('🔍 Iniciando cadastro de jovem:', dados)

    if (!dados.nome || dados.nome.trim().length < 2) {
      throw new Error('Nome deve ter pelo menos 2 caracteres')
    }

    if (!dados.email || !dados.email.includes('@')) {
      throw new Error('Email é obrigatório e deve ser válido')
    }

    if (!dados.login || dados.login.trim().length < 3) {
      throw new Error('Login deve ter pelo menos 3 caracteres')
    }

    if (!dados.senha || dados.senha.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres')
    }

    if (!validateInstitutionalEmail(dados.email)) {
      throw new Error('Email deve ser institucional ou educacional')
    }


    console.log('🔍 Verificando se email/login já existem...')
    const { data: emailCheck, error: emailError } = await supabase
      .from('jovem')
      .select('id, email, login')
      .or(`email.eq.${dados.email.toLowerCase().trim()},login.eq.${dados.login.toLowerCase().trim()}`)

    if (emailError && emailError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar email/login:', emailError)
      throw new Error(`Erro ao verificar dados: ${emailError.message}`)
    }

    if (emailCheck && emailCheck.length > 0) {
      const existing = emailCheck[0]
      if (existing.email === dados.email.toLowerCase().trim()) {
        throw new Error('Email já cadastrado no sistema')
      }
      if (existing.login === dados.login.toLowerCase().trim()) {
        throw new Error('Login já cadastrado no sistema')
      }
    }


    const dadosLimpos = {
      nome: dados.nome.trim(),          
      email: dados.email.toLowerCase().trim(), 
      login: dados.login.toLowerCase().trim(),  
      senha: dados.senha.trim(),       
      ...(dados.cpf && dados.cpf.trim() && { cpf: dados.cpf.replace(/\D/g, '') }) 
    }

    console.log('📤 Dados preparados para inserção:', {
      ...dadosLimpos,
      senha: '[OCULTA]'
    })

    const { data, error } = await supabase
      .from('jovem')
      .insert(dadosLimpos)
      .select()

    if (error) {
      console.error('❌ Erro detalhado na inserção:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })

      if (error.code === '23505') {
        throw new Error('Email, login ou CPF já cadastrado')
      } else if (error.code === '23502') {
        throw new Error('Campo obrigatório não preenchido')
      } else if (error.code === '23514') {
        throw new Error('Dados não atendem às regras de validação')
      } else {
        throw new Error(`Erro no cadastro: ${error.message}`)
      }
    }

    console.log('✅ Jovem cadastrado com sucesso:', data)
    return {
      success: true,
      data: data?.[0] || data,
      message: 'Jovem cadastrado com sucesso!'
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('❌ Erro final no cadastro:', errorMessage)
    
    return {
      success: false,
      error: errorMessage,
      data: null
    }
  }
}


export async function cadastrarEmpresa(dados: CadastroEmpresa) {
  try {
    console.log('🔍 Iniciando cadastro de empresa:', dados)

    if (!dados.nome || dados.nome.trim().length < 2) {
      throw new Error('Nome da empresa deve ter pelo menos 2 caracteres')
    }

    if (!dados.email || !dados.email.includes('@')) {
      throw new Error('Email é obrigatório e deve ser válido')
    }

   
    const { data: emailCheck, error: emailError } = await supabase
      .from('empresas')
      .select('id, email')
      .eq('email', dados.email.toLowerCase().trim())

    if (emailError && emailError.code !== 'PGRST116') {
      throw new Error(`Erro ao verificar email: ${emailError.message}`)
    }

    if (emailCheck && emailCheck.length > 0) {
      throw new Error('Email da empresa já cadastrado')
    }

    
    const dadosLimpos = {
      nome: dados.nome.trim(),
      email: dados.email.toLowerCase().trim(),
      ...(dados.cnpj && dados.cnpj.trim() && { cnpj: dados.cnpj.trim() })
    }
    const { data, error } = await supabase
      .from('empresas')
      .insert(dadosLimpos)
      .select()

    if (error) {
      console.error('❌ Erro na inserção da empresa:', error)
      
      if (error.code === '23505') {
        throw new Error('Email ou CNPJ já cadastrado')
      } else if (error.code === '23502') {
        throw new Error('Campo obrigatório não preenchido')
      } else {
        throw new Error(`Erro no cadastro: ${error.message}`)
      }
    }

    return {
      success: true,
      data: data?.[0] || data,
      message: 'Empresa cadastrada com sucesso!'
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('❌ Erro no cadastro de empresa:', errorMessage)
    
    return {
      success: false,
      error: errorMessage,
      data: null
    }
  }
}

export async function testarConexao() {
  try {
    const { data, error } = await supabase
      .from('jovem')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Erro na conexão:', error)
      return { success: false, error: error.message }
    }
    
    console.log('Conexão OK')
    return { success: true }
  } catch (error) {
    console.error('Erro ao testar conexão:', error)
    return { success: false, error: 'Erro de conexão' }
  }
}

export async function listarTabelas() {
  try {
    const tabelas = ['jovem', 'empresas', 'tutor', 'projeto', 'avaliacao']
    const resultados: Record<string, string> = {}
    
    for (const tabela of tabelas) {
      try {
        const { data, error } = await supabase
          .from(tabela)
          .select('*')
          .limit(1)
        
        resultados[tabela] = error ? `Erro: ${error.message}` : 'OK'
      } catch (err) {
        resultados[tabela] = `Erro: ${err instanceof Error ? err.message : 'Erro desconhecido'}`
      }
    }
    
    console.log('Status das tabelas:', resultados)
    return resultados
  } catch (error) {
    console.error('Erro ao listar tabelas:', error)
    return { error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}


export async function verificarEstruturaJovem() {
  try {
    const { data, error } = await supabase
      .from('jovem')
      .select('*')
      .limit(0)

    if (error) {
      return {
        success: false,
        error: error.message,
        campos: []
      }
    }

    return {
      success: true,
      message: 'Tabela jovem acessível',
      campos: ['id_jovem', 'login', 'senha', 'cpf', 'nome', 'email']
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      campos: []
    }
  }
}


export async function testeInsercaoManual() {
  const dadosTeste = {
    nome: 'Teste Manual',
    email: `teste${Date.now()}@estudante.edu.br`,
    login: `teste${Date.now()}`,
    senha: 'teste123'
  }

  try {
    console.log('🧪 Teste de inserção manual:', {
      ...dadosTeste,
      senha: '[OCULTA]'
    })

    const { data, error } = await supabase
      .from('jovem')
      .insert(dadosTeste)
      .select()

    if (error) {
      throw new Error(`Inserção manual falhou: ${error.message}`)
    }

    if (data && data[0]) {
      await supabase
        .from('jovem')
        .delete()
        .eq('id_jovem', data[0].id_jovem)
    }

    return {
      success: true,
      message: 'Inserção manual funcionou corretamente',
      data
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}


export async function listarJovens() {
  try {
    const { data, error } = await supabase
      .from('jovem')
      .select('id_jovem, nome, email, login, cpf')
      .order('id_jovem', { ascending: false })

    if (error) {
      throw new Error(`Erro ao listar jovens: ${error.message}`)
    }

    return {
      success: true,
      data: data || [],
      message: `${data?.length || 0} jovens encontrados`
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      data: []
    }
  }
}