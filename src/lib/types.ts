export interface Entities {
  keywords?: string[]
  technologies?: string[]
  people?: string[]
  places?: string[]
  topics?: string[]
}

export interface Clip {
  id: string
  url: string
  title: string | null
  domain: string | null
  favicon_url: string | null
  summary: string | null
  entities: Entities
  embedding: number[] | string | null
  created_at: string
}
