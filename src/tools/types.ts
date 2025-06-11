import { z } from 'zod'

// Unsplash API 响应类型定义
export interface UnsplashPhoto {
  id: string
  slug: string
  alternative_slugs: Record<string, string>
  created_at: string
  updated_at: string
  promoted_at: string | null
  width: number
  height: number
  color: string
  blur_hash: string
  description: string | null
  alt_description: string | null
  breadcrumbs: Array<{
    slug: string
    title: string
    index: number
    type: string
  }>
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
    small_s3: string
  }
  links: {
    self: string
    html: string
    download: string
    download_location: string
  }
  likes: number
  liked_by_user: boolean
  current_user_collections: Array<Record<string, unknown>>
  sponsorship: Record<string, unknown> | null
  topic_submissions: Record<string, unknown>
  asset_type: string
  user: UnsplashUser
  exif?: UnsplashExif
  location?: UnsplashLocation
  meta?: {
    index: boolean
  }
  tags?: Array<{
    type: string
    title: string
    source?: {
      ancestry: {
        type: { slug: string; pretty_slug: string }
        category?: { slug: string; pretty_slug: string }
        subcategory?: { slug: string; pretty_slug: string }
      }
      title: string
      subtitle: string
      description: string
      meta_title: string
      meta_description: string
      cover_photo: UnsplashPhoto
    }
  }>
  views?: number
  downloads?: number
}

export interface UnsplashUser {
  id: string
  updated_at: string
  username: string
  name: string
  first_name: string
  last_name: string | null
  twitter_username: string | null
  portfolio_url: string | null
  bio: string | null
  location: string | null
  links: {
    self: string
    html: string
    photos: string
    likes: string
    portfolio: string
    following: string
    followers: string
  }
  profile_image: {
    small: string
    medium: string
    large: string
  }
  instagram_username: string | null
  total_collections: number
  total_likes: number
  total_photos: number
  total_promoted_photos: number
  total_illustrations: number
  total_promoted_illustrations: number
  accepted_tos: boolean
  for_hire: boolean
  social: {
    instagram_username: string | null
    portfolio_url: string | null
    twitter_username: string | null
    paypal_email: string | null
  }
}

export interface UnsplashExif {
  make: string | null
  model: string | null
  name: string | null
  exposure_time: string | null
  aperture: string | null
  focal_length: string | null
  iso: number | null
}

export interface UnsplashLocation {
  name: string | null
  city: string | null
  country: string | null
  position: {
    latitude: number | null
    longitude: number | null
  }
}

export interface UnsplashSearchResponse {
  total: number
  total_pages: number
  results: UnsplashPhoto[]
}

// 工具参数验证模式
export const SearchPhotosSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  page: z.number().int().min(1).max(999).optional().default(1),
  per_page: z.number().int().min(1).max(30).optional().default(10),
  order_by: z.enum(['relevant', 'latest']).optional().default('relevant'),
  color: z
    .enum([
      'black_and_white',
      'black',
      'white',
      'yellow',
      'orange',
      'red',
      'purple',
      'magenta',
      'green',
      'teal',
      'blue',
    ])
    .optional(),
  orientation: z.enum(['landscape', 'portrait', 'squarish']).optional(),
})

export const GetPhotoSchema = z.object({
  photoId: z.string().min(1, 'Photo ID is required'),
})

export const RandomPhotoSchema = z.object({
  count: z.number().int().min(1).max(30).optional().default(1),
  collections: z.string().optional(),
  topics: z.string().optional(),
  username: z.string().optional(),
  query: z.string().optional(),
  orientation: z.enum(['landscape', 'portrait', 'squarish']).optional(),
  content_filter: z.enum(['low', 'high']).optional().default('low'),
  featured: z.boolean().optional(),
})

export type SearchPhotosParams = z.infer<typeof SearchPhotosSchema>
export type GetPhotoParams = z.infer<typeof GetPhotoSchema>
export type RandomPhotoParams = z.infer<typeof RandomPhotoSchema>

// API 错误类型
export interface UnsplashError {
  errors: string[]
}

// 工具响应格式化类型
export interface FormattedPhoto {
  id: string
  title: string
  description: string
  photographer: {
    name: string
    username: string
    profile_url: string
  }
  urls: {
    full: string
    regular: string
    small: string
    thumb: string
  }
  download_url: string
  stats: {
    likes: number
    views?: number
    downloads?: number
  }
  dimensions: {
    width: number
    height: number
  }
  created_at: string
  color: string
  tags?: string[]
  exif?: {
    camera?: string
    lens?: string
    settings?: string
  }
  location?: {
    name?: string
    city?: string
    country?: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
}
