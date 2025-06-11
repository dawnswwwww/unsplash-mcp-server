import type { FormattedPhoto, UnsplashPhoto } from '../tools/types'

/**
 * 将 Unsplash 照片数据格式化为更简洁、AI 友好的格式
 */
export function formatPhoto(photo: UnsplashPhoto): FormattedPhoto {
  return {
    id: photo.id,
    title: photo.description || photo.alt_description || '无标题',
    description: photo.description || photo.alt_description || '无描述',
    photographer: {
      name: photo.user.name,
      username: photo.user.username,
      profile_url: photo.user.links.html,
    },
    urls: {
      full: photo.urls.full,
      regular: photo.urls.regular,
      small: photo.urls.small,
      thumb: photo.urls.thumb,
    },
    download_url: photo.links.download_location,
    stats: {
      likes: photo.likes,
      views: photo.views,
      downloads: photo.downloads,
    },
    dimensions: {
      width: photo.width,
      height: photo.height,
    },
    created_at: photo.created_at,
    color: photo.color,
    tags: photo.tags?.map((tag) => tag.title).filter(Boolean),
    exif: photo.exif ? formatExif(photo.exif) : undefined,
    location: photo.location ? formatLocation(photo.location) : undefined,
  }
}

/**
 * 格式化 EXIF 数据
 */
function formatExif(exif: UnsplashPhoto['exif']): FormattedPhoto['exif'] {
  if (!exif) return undefined

  const camera = [exif.make, exif.model].filter(Boolean).join(' ')
  const settings = [
    exif.aperture && `f/${exif.aperture}`,
    exif.exposure_time && `${exif.exposure_time}s`,
    exif.focal_length && `${exif.focal_length}mm`,
    exif.iso && `ISO ${exif.iso}`,
  ]
    .filter(Boolean)
    .join(', ')

  return {
    camera: camera || undefined,
    lens: exif.name || undefined,
    settings: settings || undefined,
  }
}

/**
 * 格式化位置数据
 */
function formatLocation(
  location: UnsplashPhoto['location'],
): FormattedPhoto['location'] {
  if (!location) return undefined

  const coordinates =
    location.position.latitude && location.position.longitude
      ? {
          latitude: location.position.latitude,
          longitude: location.position.longitude,
        }
      : undefined

  return {
    name: location.name || undefined,
    city: location.city || undefined,
    country: location.country || undefined,
    coordinates,
  }
}

/**
 * 创建下载提示信息
 */
export function createDownloadInstructions(photos: FormattedPhoto[]): string {
  if (photos.length === 0) {
    return '未找到符合条件的照片。'
  }

  const instructions = [
    `找到 ${photos.length} 张图片：\n`,
    ...photos.map((photo, index) => {
      const photographer = `作者：${photo.photographer.name} (@${photo.photographer.username})`
      const dimensions = `尺寸：${photo.dimensions.width}×${photo.dimensions.height}`
      const downloadUrl = `下载地址：${photo.urls.regular}`

      return [
        `${index + 1}. **${photo.title}**`,
        `   ${photographer}`,
        `   ${dimensions}`,
        `   ${downloadUrl}`,
        photo.description !== photo.title
          ? `   描述：${photo.description}`
          : '',
        photo.tags?.length
          ? `   标签：${photo.tags.slice(0, 5).join(', ')}`
          : '',
        photo.location?.name ? `   位置：${photo.location.name}` : '',
        '',
      ]
        .filter(Boolean)
        .join('\n')
    }),
    '💡 提示：',
    '• 这些图片来自 Unsplash，您可以免费使用',
    '• 建议在使用时注明摄影师姓名',
    '• 如需其他尺寸，可访问 Unsplash 官网获取',
  ].join('\n')

  return instructions
}

/**
 * 创建单个照片的详细信息
 */
export function createPhotoDetails(photo: FormattedPhoto): string {
  const sections = [
    `# ${photo.title}`,
    '',
    `**作者**: ${photo.photographer.name} (@${photo.photographer.username})`,
    `**个人主页**: ${photo.photographer.profile_url}`,
    '',
    `**描述**: ${photo.description}`,
    `**尺寸**: ${photo.dimensions.width} × ${photo.dimensions.height}`,
    `**主色调**: ${photo.color}`,
    `**创建时间**: ${formatDate(photo.created_at)}`,
    '',
    `**下载链接**:`,
    `• 完整尺寸: ${photo.urls.full}`,
    `• 常规尺寸: ${photo.urls.regular}`,
    `• 小图: ${photo.urls.small}`,
    `• 缩略图: ${photo.urls.thumb}`,
    '',
    `**统计信息**:`,
    `• 点赞数: ${photo.stats.likes}`,
    photo.stats.views ? `• 浏览量: ${photo.stats.views}` : '',
    photo.stats.downloads ? `• 下载量: ${photo.stats.downloads}` : '',
  ].filter(Boolean)

  // 添加标签信息
  if (photo.tags?.length) {
    sections.push('', `**标签**: ${photo.tags.join(', ')}`)
  }

  // 添加拍摄信息
  if (photo.exif) {
    sections.push('', '**拍摄信息**:')
    if (photo.exif.camera) sections.push(`• 相机: ${photo.exif.camera}`)
    if (photo.exif.lens) sections.push(`• 镜头: ${photo.exif.lens}`)
    if (photo.exif.settings) sections.push(`• 参数: ${photo.exif.settings}`)
  }

  // 添加位置信息
  if (photo.location) {
    sections.push('', '**拍摄地点**:')
    if (photo.location.name) sections.push(`• 地点: ${photo.location.name}`)
    if (photo.location.city) sections.push(`• 城市: ${photo.location.city}`)
    if (photo.location.country)
      sections.push(`• 国家: ${photo.location.country}`)
    if (photo.location.coordinates) {
      sections.push(
        `• 坐标: ${photo.location.coordinates.latitude}, ${photo.location.coordinates.longitude}`,
      )
    }
  }

  return sections.join('\n')
}

/**
 * 格式化日期
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

/**
 * 创建随机照片的展示文本
 */
export function createRandomPhotoText(photos: UnsplashPhoto[]): string {
  const formattedPhotos = photos.map(formatPhoto)

  if (formattedPhotos.length === 1) {
    return `🎲 **随机推荐**\n\n${createPhotoDetails(formattedPhotos[0])}`
  }

  return `🎲 **随机推荐 ${formattedPhotos.length} 张照片**\n\n${createDownloadInstructions(formattedPhotos)}`
}

/**
 * 生成搜索结果摘要
 */
export function createSearchSummary(
  query: string,
  totalResults: number,
  currentPage: number,
  perPage: number,
  totalPages: number,
): string {
  const startIndex = (currentPage - 1) * perPage + 1
  const endIndex = Math.min(currentPage * perPage, totalResults)

  return [
    `🔍 **搜索结果**: "${query}"`,
    `📊 显示第 ${startIndex}-${endIndex} 张，共 ${totalResults} 张照片`,
    `📄 第 ${currentPage} 页，共 ${totalPages} 页`,
  ].join('\n')
}
