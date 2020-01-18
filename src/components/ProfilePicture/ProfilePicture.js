import React from 'react'
import './ProfilePicture.css'

export default function ProfilePictures({
  name,
  imgs,
  className,
  size = '13rem',
  onClick,
}) {
  function getOptimal(pxSize) {
    let available = Object.keys(imgs)
      .map(n => parseInt(n, 10))
      .map(v => v || Infinity)
    let size = Math.min(...available.filter(n => n >= pxSize))
    if (size === Infinity) size = Math.max(...available.filter(n => n < pxSize))
    if (size < pxSize && available.includes(Infinity)) size = Infinity
    const selected = imgs[size !== Infinity ? size : 'max']
    return [selected.webp, selected.jpeg]
  }
  let pics = []
  if (typeof imgs === 'object' && Object.entries(imgs).length) {
    const sizes = typeof size === 'string' ? [{ size }] : size
    pics = sizes.flatMap(({ size, min, max }) => {
      const media = [
        ...(min ? [['min', parseCSSSize(min)]] : []),
        ...(max ? [['max', parseCSSSize(max)]] : []),
      ]
        .map(([t, s]) => `(${t}-width: ${s}px)`)
        .join(' and ')

      return getOptimal(parseCSSSize(size)).map((url, i) => ({
        url,
        media,
        type: i === 0 ? 'webp' : 'jpeg',
      }))
    })
  } else pics.push({ url: imgs })

  return (
    <picture onClick={onClick}>
      {pics.map(({ url, type, media }) => (
        <source
          srcSet={url}
          type={`image/${type}`}
          media={media}
          key={url + media}
        />
      ))}
      <img
        src={pics.find(({ type }) => type !== 'webp').url}
        alt={name}
        className={className || 'mentor-profilepic'}
      />
    </picture>
  )
}

function parseCSSSize(size) {
  const value = parseInt(size)
  const unit = size.replace(/[0-9.]/g, '')
  switch (unit) {
    case 'px':
      return value
    case 'rem':
      return (
        parseFloat(getComputedStyle(document.documentElement).fontSize) * value
      )
    default:
      throw Error(`unknown unit ${unit}`)
  }
}
