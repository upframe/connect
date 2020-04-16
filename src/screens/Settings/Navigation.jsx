import React from 'react'
import { Link } from 'react-router-dom'
import styles from './navigation.module.scss'
import { useMe } from '../../utils/hooks'

export default function Navigation() {
  const current = window.location.href.split('/').pop()
  const { me } = useMe()

  const tabs = [
    { title: 'Public Profile', url: 'public' },
    { title: 'Account Settings', url: 'account' },
    { title: 'Notifications', url: 'notifications' },
    ...(me && me.role !== 'USER'
      ? [{ title: 'My Calendar', url: 'mycalendar' }]
      : []),
    { title: 'Invite', url: 'invite' },
  ]

  return (
    <nav className={styles.navigation}>
      {tabs.map(({ title, url }) => (
        <Link
          className={[
            styles.item,
            ...(current === url ? [styles.active] : []),
          ].join(' ')}
          to={`/settings/${url}`}
          key={url}
        >
          {title}
        </Link>
      ))}
    </nav>
  )
}
