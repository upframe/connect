import React from 'react'
import { Card, ProfilePicture, Title, Chip } from '../../components'
import styles from './mentorcard.module.scss'

export default function MentorCard({ mentor }) {
  const imgSize = window.innerWidth > 720 ? '13rem' : '18rem'
  let tags = (mentor.tags || []).slice(0, 2)
  if (tags.length) tags.push('+')

  return (
    <Card
      className={styles.mentorCard}
      linkTo={mentor.keycode}
      hoverEffect={true}
      article
    >
      <ProfilePicture imgs={mentor.profilePictures} size={imgSize} />
      <div className={styles.info}>
        <Title s3>{mentor.name}</Title>{' '}
        <p className={styles.role}>
          {mentor.title}
          {mentor.company ? ` at ${mentor.company}` : ''}
        </p>
        <p className={styles.biography}>{mentor.biography}</p>
        <div className={styles.skills}>
          {tags.map(v => (
            <Chip key={v} removable={false}>
              {v}
            </Chip>
          ))}
        </div>
      </div>
    </Card>
  )
}
