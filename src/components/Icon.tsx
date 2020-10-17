import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

interface Props {
  icon: keyof typeof svg
  onClick?(e: React.MouseEvent<SVGSVGElement, MouseEvent>): void
  linkTo?: string
  clickStyle?: boolean
}

export default function Icon({
  icon = 'info',
  onClick,
  clickStyle = typeof onClick === 'function',
  linkTo,
}: Props) {
  const Wrap = linkTo ? Link : React.Fragment

  const mods = [
    ...(onClick && clickStyle ? ['clickable'] : []),
    ...('color' in svg[icon] ? ['color'] : []),
  ]

  const sel: SvgIcon = svg[icon]
  return (
    // @ts-ignore
    <Wrap
      {...(linkTo && {
        to: linkTo,
        ...(/^https?:\/\//.test(linkTo) && {
          target: '_blank',
          rel: 'noopener noreferrer',
          'data-type': 'social',
        }),
      })}
    >
      <S.Icon
        data-mode={mods.join(' ')}
        xmlns="http://www.w3.org/2000/svg"
        width={sel.size ?? '24'}
        height={sel.size || '24'}
        viewBox={`0 0 ${sel.size || '24'} ${sel.size || '24'}`}
        onClick={onClick}
        data-icon={icon}
      >
        {'path' in sel && <path d={sel.path} {...sel.props} fill={sel.color} />}
        {'markup' in sel && sel.markup}
      </S.Icon>
    </Wrap>
  )
}

const S = {
  Icon: styled.svg`
    * {
      pointer-events: none;
    }

    &[data-mode~='color'] > path {
      fill: var(--cl-text-strong);
    }

    &[data-mode~='clickable'] {
      cursor: pointer;
      transition: background-color 0.2s ease, transform 0.2s ease;
      border-radius: 50%;

      &:hover {
        path {
          fill: var(--cl-accent);
        }

        background-color: #feeef2;
      }
    }
  `,
}

type SvgIcon = {
  path?: string
  markup?: JSX.Element
  size?: number
  props?: { [k: string]: string }
  color?: string
}

const svg = {
  info: {
    path:
      'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
  },
  arrow_back: {
    path: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
  },
  arrow_down: {
    path: 'M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z',
  },
  arrow_up: {
    path: 'M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z',
  },
  close: {
    path:
      'M22.6464 10.7636C22.8417 10.5683 22.8417 10.2517 22.6464 10.0564L21.9436 9.35355C21.7483 9.15829 21.4317 9.15829 21.2364 9.35355L16.3536 14.2364C16.1583 14.4317 15.8417 14.4317 15.6464 14.2364L10.7636 9.35355C10.5683 9.15829 10.2517 9.15829 10.0564 9.35355L9.35355 10.0564C9.15829 10.2517 9.15829 10.5683 9.35355 10.7636L14.2364 15.6464C14.4317 15.8417 14.4317 16.1583 14.2364 16.3536L9.35355 21.2364C9.15829 21.4317 9.15829 21.7483 9.35355 21.9436L10.0564 22.6464C10.2517 22.8417 10.5683 22.8417 10.7636 22.6464L15.6464 17.7636C15.8417 17.5683 16.1583 17.5683 16.3536 17.7636L21.2364 22.6464C21.4317 22.8417 21.7483 22.8417 21.9436 22.6464L22.6464 21.9436C22.8417 21.7483 22.8417 21.4317 22.6464 21.2364L17.7636 16.3536C17.5683 16.1583 17.5683 15.8417 17.7636 15.6464L22.6464 10.7636Z',
    size: 32,
  },
  add: {
    markup: (
      <g>
        <path d="M15.3636 21.6938C14.6606 21.6938 14.0908 21.124 14.0908 20.4211V10.2727C14.0908 9.56982 14.6606 9 15.3636 9V9C16.0665 9 16.6363 9.56982 16.6363 10.2727V20.4211C16.6363 21.124 16.0665 21.6938 15.3636 21.6938V21.6938Z" />
        <path d="M21.7273 15.3468C21.7273 16.0479 21.159 16.6162 20.4579 16.6162L10.2694 16.6162C9.56832 16.6162 9 16.0479 9 15.3468V15.3468C9 14.6458 9.56832 14.0774 10.2694 14.0774L20.4579 14.0774C21.159 14.0774 21.7273 14.6458 21.7273 15.3468V15.3468Z" />
      </g>
    ),
    size: 30,
  },
  location: {
    path:
      'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
  },
  search: {
    path:
      'M25.6939 13.7046C25.7939 15.1041 25.5939 16.8035 24.5939 18.2029C23.4939 19.9023 23.7939 21.2018 25.2939 22.5013C27.1939 24.2006 28.8939 26.0999 30.6939 27.8992C31.6939 28.8988 32.7939 29.9984 31.1939 31.3978C29.7939 32.5974 28.6939 31.7977 27.6939 30.7981C26.1939 29.2986 24.4939 27.8992 23.1939 26.1998C21.5939 24.3006 19.9939 23.9007 17.5939 24.9003C10.4939 27.7992 2.89386 24.1006 0.593856 16.9034C-1.60614 9.70619 2.49386 2.30904 9.79386 0.409774C18.0939 -1.68942 25.6939 4.50819 25.6939 13.7046ZM12.7939 22.1014C18.1939 22.1014 22.0939 18.3029 22.0939 13.0049C22.0939 7.70696 18.0939 3.7085 12.8939 3.7085C7.69386 3.7085 3.49386 7.80692 3.59386 12.905C3.59386 18.2029 7.39386 22.1014 12.7939 22.1014Z',
    size: 33,
  },
  google: {
    markup: (
      <g>
        <path
          d="M17.64,9.20454545 C17.64,8.56636364 17.5827273,7.95272727 17.4763636,7.36363636 L9,7.36363636 L9,10.845 L13.8436364,10.845 C13.635,11.97 13.0009091,12.9231818 12.0477273,13.5613636 L12.0477273,15.8195455 L14.9563636,15.8195455 C16.6581818,14.2527273 17.64,11.9454545 17.64,9.20454545 L17.64,9.20454545 Z"
          fill="#4285F4"
        />
        <path
          d="M9,18 C11.43,18 13.4672727,17.1940909 14.9563636,15.8195455 L12.0477273,13.5613636 C11.2418182,14.1013636 10.2109091,14.4204545 9,14.4204545 C6.65590909,14.4204545 4.67181818,12.8372727 3.96409091,10.71 L0.957272727,10.71 L0.957272727,13.0418182 C2.43818182,15.9831818 5.48181818,18 9,18 L9,18 Z"
          fill="#34A853"
        />
        <path
          d="M3.96409091,10.71 C3.78409091,10.17 3.68181818,9.59318182 3.68181818,9 C3.68181818,8.40681818 3.78409091,7.83 3.96409091,7.29 L3.96409091,4.95818182 L0.957272727,4.95818182 C0.347727273,6.17318182 0,7.54772727 0,9 C0,10.4522727 0.347727273,11.8268182 0.957272727,13.0418182 L3.96409091,10.71 L3.96409091,10.71 Z"
          fill="#FBBC05"
        />
        <path
          d="M9,3.57954545 C10.3213636,3.57954545 11.5077273,4.03363636 12.4404545,4.92545455 L15.0218182,2.34409091 C13.4631818,0.891818182 11.4259091,0 9,0 C5.48181818,0 2.43818182,2.01681818 0.957272727,4.95818182 L3.96409091,7.29 C4.67181818,5.16272727 6.65590909,3.57954545 9,3.57954545 L9,3.57954545 Z"
          fill="#EA4335"
        />
      </g>
    ),
    size: 20,
  },
  twitter: {
    path:
      'M153.62,301.59c94.34,0,145.94-78.16,145.94-145.94,0-2.22,0-4.43-.15-6.63A104.36,104.36,0,0,0,325,122.47a102.38,102.38,0,0,1-29.46,8.07,51.47,51.47,0,0,0,22.55-28.37,102.79,102.79,0,0,1-32.57,12.45,51.34,51.34,0,0,0-87.41,46.78A145.62,145.62,0,0,1,92.4,107.81a51.33,51.33,0,0,0,15.88,68.47A50.91,50.91,0,0,1,85,169.86c0,.21,0,.43,0,.65a51.31,51.31,0,0,0,41.15,50.28,51.21,51.21,0,0,1-23.16.88,51.35,51.35,0,0,0,47.92,35.62,102.92,102.92,0,0,1-63.7,22A104.41,104.41,0,0,1,75,278.55a145.21,145.21,0,0,0,78.62,23',
    size: 400,
    color: '#1da1f2',
  },
  more: {
    path:
      'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
  },
  send: {
    path:
      'M0.842663 17.25L20.0835 9L0.842663 0.75L0.833496 7.16667L14.5835 9L0.833496 10.8333L0.842663 17.25Z',
    size: 21,
  },
  home: {
    path:
      'M29.3256 12.1974C29.1257 10.7977 28.6261 9.89789 27.627 8.99808C24.1299 6.29866 20.7327 3.59923 17.2356 0.799829C16.4363 0.299936 15.7369 0 15.0375 0C14.3381 0 13.5387 0.299936 12.8393 0.899808C9.34221 3.69921 5.84513 6.39863 2.44796 9.09806C1.44879 9.89789 0.949209 10.8977 0.749376 12.2974C-0.249792 18.0961 -0.249792 22.7951 0.749376 29.0938C1.04913 31.0934 1.74854 32.0932 3.74688 31.9932C5.6453 31.9932 10.3414 31.8932 15.0375 31.8932C19.7336 31.8932 24.4296 31.8932 26.3281 31.9932C28.3264 31.9932 29.0258 31.0934 29.3256 29.0938C30.2248 22.7951 30.2248 18.0961 29.3256 12.1974ZM15.0375 26.4943C11.3405 26.3944 8.44296 23.495 8.44296 19.8958C8.44296 16.3965 11.5404 13.2972 15.0375 13.1972C18.5346 13.1972 21.632 16.2965 21.632 19.8958C21.632 23.495 18.7344 26.3944 15.0375 26.4943Z',
    size: 32,
  },
  message: {
    path:
      'M31.3985 0.61269C30.4963 -0.286315 29.4939 0.0133534 28.4914 0.213132C18.868 2.91015 11.2495 5.70705 1.72626 10.9013C-0.278627 12.0001 -0.479117 13.0989 0.824057 14.797C2.32772 16.6949 3.33016 17.6938 4.83382 18.8925C6.63822 20.3908 7.54042 20.4907 9.34481 19.1921C12.2519 16.9946 15.159 14.9968 18.0661 12.8991C18.6675 12.4995 19.4695 11.8003 19.9707 12.1C20.3717 12.4995 19.5697 13.3985 19.1687 13.9979C17.0636 16.8947 15.0587 19.8914 12.8534 22.6883C11.5502 24.4863 11.5502 25.3853 13.1541 27.1833C14.357 28.6816 15.3595 29.6805 17.2641 31.1789C18.7678 32.4774 19.9707 32.2776 21.1736 30.2799C26.3863 20.5906 29.0929 13.0989 31.6993 3.50948C32 2.51059 32.3007 1.5117 31.3985 0.61269Z',
    size: 32,
  },
  person: {
    markup: (
      <g>
        <path d="M14.0265 0C10.0239 0 6.92188 2.89598 6.92188 6.89043C6.92188 10.785 10.124 14.0804 13.9265 14.0804H14.0265H14.1266C17.9291 14.0804 21.1312 10.785 21.1312 6.89043C21.1312 2.89598 18.0292 0 14.0265 0Z" />
        <path d="M27.7353 27.4619C26.0342 21.9695 20.7307 17.7753 15.027 17.6755C14.7268 17.6755 14.3265 17.6755 14.0263 17.6755C13.7261 17.6755 13.4259 17.6755 13.0257 17.6755C7.32193 17.8752 1.91839 21.9695 0.317336 27.4619C-0.583254 30.3579 0.417403 31.8558 3.51944 31.9556C6.92167 32.0555 10.424 31.9556 13.8262 31.9556C13.9263 31.9556 13.9263 31.9556 14.0263 31.9556C14.1264 31.9556 14.1264 31.9556 14.2265 31.9556C17.6287 31.9556 21.131 32.0555 24.5332 31.9556C27.5352 31.8558 28.5358 30.3579 27.7353 27.4619Z" />
      </g>
    ),
    size: 32,
  },
  refresh: {
    path:
      'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z',
  },
  gear: {
    path:
      'M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z',
  },
  maximize: {
    path:
      'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z',
  },
  minimize: {
    path:
      'M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z',
  },
  adjust: {
    path:
      'M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z',
  },
  check: {
    path: 'M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z',
  },
  edit: {
    path:
      'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
  },
  add_photo: {
    path:
      'M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z',
  },
}
