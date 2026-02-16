export type Tag = {
  id: number
  name: string
}

export type Work = {
  id: number
  title: string
  year: string
  imageUrl: string
  tags?: number[]
}

export type WorkDetail = {
  id: number
  title: string
  description: string | null
  year: string
  imageUrl: string
  tags: Tag[]
}

export type ProcessImage = {
  id: number
  imageUrl: string
  caption: string | null
  sortOrder: number
}

export type RelatedWork = {
  id: number
  title: string
  imageUrl: string
}
