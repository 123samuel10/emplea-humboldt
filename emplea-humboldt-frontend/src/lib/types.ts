// Tipos de dominio del frontend. Reconstruidos a partir del uso en mock-data.

export type Rol = 'estudiante' | 'empresa' | 'admin'

export type Disponibilidad = 'tiempo_completo' | 'medio_tiempo' | 'fines_de_semana'
export type EtapaCarrera = 'explorando' | 'aplicando' | 'entrevistando' | 'contratado'

export interface Estudiante {
  id: string
  nombre: string
  email: string
  rol: 'estudiante'
  universidad: string
  programa: string
  semestre: number
  habilidades: string[]
  disponibilidad: Disponibilidad
  etapaCarrera: EtapaCarrera
}

export type TamanoEmpresa = 'pequena' | 'mediana' | 'grande'

export interface Empresa {
  id: string
  nombre: string
  email: string
  rol: 'empresa'
  razonSocial: string
  sector: string
  ciudad: string
  tamaño: TamanoEmpresa
}

export interface Admin {
  id: string
  nombre: string
  email: string
  rol: 'admin'
  universidad: string
  cargo: string
}

export type Modalidad = 'remoto' | 'hibrido' | 'presencial'
export type TipoVacante = 'practica' | 'medio_tiempo' | 'tiempo_completo'

export interface Vacante {
  id: string
  titulo: string
  empresa: string
  empresaId: string
  sector: string
  ciudad: string
  modalidad: Modalidad
  tipo: TipoVacante
  salario: { min: number; max: number }
  descripcion: string
  requisitos: string[]
  habilidades: string[]
  fechaPublicacion: string
  fechaCierre: string
  postulaciones: number
  compatibilidad: number
}

export type EstadoPostulacion =
  | 'postulado'
  | 'en_revision'
  | 'entrevista'
  | 'aceptado'
  | 'rechazado'

export interface Postulacion {
  id: string
  vacanteId: string
  vacantetitulo: string
  empresa: string
  sector: string
  fechaPostulacion: string
  estado: EstadoPostulacion
  compatibilidad: number
  modalidad: Modalidad
  proximoPaso?: string
}

export type EstadoPractica = 'activa' | 'finalizada' | 'cancelada'

export interface Practica {
  id: string
  vacanteId: string
  estudianteId: string
  empresa: string
  cargo: string
  fechaInicio: string
  fechaFin: string
  estado: EstadoPractica
  calificacion?: number
  informesPendientes: number
  proximaEvaluacion: string
  avancePorcentaje: number
}

export type TipoNotificacion = 'success' | 'warning' | 'info' | 'error'

export interface NotificacionItem {
  id: string
  tipo: TipoNotificacion
  titulo: string
  descripcion: string
  tiempo: string
  leida: boolean
}
