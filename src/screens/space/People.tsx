import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useQuery } from 'gql'
import type { SpaceMembers, SpaceMembersVariables } from 'gql/types'
import roles, { Role } from './roles'
import Fuse from 'fuse.js'
import Context from './MemberContext'
import { MEMBER_QUERY } from './gql'
import { mobile } from 'styles/responsive'
import {
  Title,
  Text,
  Spinner,
  ProfilePicture,
  Button,
  Icon,
  SearchInput,
} from 'components'

interface Props {
  spaceId: string
  spaceName: string
  onInvite(v: Role): void
  isOwner: boolean
  onUpdate(): void
}

type User = Exclude<
  Exclude<SpaceMembers['space'], null>['members'],
  null
>[number] & { group: 'founder' | 'mentor' | 'owner' }

export default function People({
  spaceId,
  spaceName,
  onInvite,
  isOwner,
  onUpdate,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [founders, setFounders] = useState<User[]>([])
  const [mentors, setMentors] = useState<User[]>([])
  const [owners, setOwners] = useState<User[]>([])
  const [fuse, setFuse] = useState<Fuse<User, Fuse.IFuseOptions<User>>>()

  const { data } = useQuery<SpaceMembers, SpaceMembersVariables>(MEMBER_QUERY, {
    variables: { spaceId },
  })

  useEffect(() => {
    if (!data?.space) return
    setUsers([
      ...(data.space.members?.map(v => ({ ...v, group: 'founder' })) ?? []),
      ...(data.space.mentors?.map(v => ({ ...v, group: 'mentor' })) ?? []),
      ...(data.space.owners?.map(v => ({ ...v, group: 'owner' })) ?? []),
    ] as User[])
  }, [data])

  useEffect(() => {
    setFuse(
      new Fuse(users, {
        keys: [
          { name: 'name', weight: 0.9 },
          { name: 'headline', weight: 0.1 },
        ],
        threshold: 0.4,
      })
    )
  }, [users])

  useEffect(() => {
    if (!fuse) return

    const sorted = !searchQuery
      ? users
      : fuse.search(searchQuery).map(({ item }) => item)

    setFounders(sorted.filter(({ group }) => group === 'founder'))
    setMentors(sorted.filter(({ group }) => group === 'mentor'))
    setOwners(sorted.filter(({ group }) => group === 'owner'))
  }, [users, fuse, searchQuery])

  if (!data?.space) return <Spinner />
  return (
    <S.People>
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={`Seach for people within ${spaceName}`}
      />
      {owners.length > 0 && (
        <Group
          title="Owners"
          description={roles.Owners}
          users={owners}
          onInvite={() => onInvite('Owners')}
          isOwner={isOwner}
          spaceId={spaceId}
          onUpdate={onUpdate}
          invited={
            searchQuery
              ? undefined
              : data.space.invited?.filter(({ role }) => role === 'OWNER')
          }
        />
      )}
      {mentors.length > 0 && (
        <Group
          title="Mentors"
          description={roles.Mentors}
          users={mentors}
          onInvite={() => onInvite('Mentors')}
          isOwner={isOwner}
          spaceId={spaceId}
          onUpdate={onUpdate}
          invited={
            searchQuery
              ? undefined
              : data.space.invited?.filter(({ role }) => role === 'MENTOR')
          }
        />
      )}
      {founders.length > 0 && (
        <Group
          title="Founders"
          description={roles.Founders}
          users={founders}
          onInvite={() => onInvite('Founders')}
          isOwner={isOwner}
          spaceId={spaceId}
          onUpdate={onUpdate}
          invited={
            searchQuery
              ? undefined
              : data.space.invited?.filter(({ role }) => role === 'FOUNDER')
          }
        />
      )}
    </S.People>
  )
}

interface GroupProps {
  title: string
  description: string
  users: Exclude<Exclude<SpaceMembers['space'], null>['owners'], null>
  invited?: Exclude<SpaceMembers['space'], null>['invited']
  onInvite(): void
  isOwner: boolean
  spaceId: string
  onUpdate(): void
}

function Group({
  title,
  description,
  users,
  onInvite,
  isOwner,
  spaceId,
  invited,
  onUpdate,
}: GroupProps) {
  const [batches, setBatches] = useState(1)
  const batchSize = 4

  const showMore = users.length + (invited?.length ?? 0) > batches * batchSize
  const showCollapse =
    !showMore && users.length + (invited?.length ?? 0) > batchSize

  return (
    <S.Group>
      <S.GroupHead>
        <div>
          <Title size={3}>
            {title}
            <span>{users.length}</span>
          </Title>
          <Text>{description}</Text>
        </div>
        {isOwner && (
          <Button accent filled onClick={onInvite}>
            Invite
          </Button>
        )}
      </S.GroupHead>
      <ol>
        {users
          .slice(0, batches * batchSize)
          .map(({ id, name, handle, headline, profilePictures }) => (
            <S.User key={id}>
              <ProfilePicture
                size={avatarSize}
                imgs={profilePictures}
                linkTo={`/${handle}`}
              />
              <div>
                <Title size={4}>{name}</Title>
                <Text>{headline}</Text>
              </div>
              <S.UserActions>
                <Icon icon="mail" linkTo={`/conversations/new?parts=${id}`} />
                {isOwner && (
                  <Context userId={id} spaceId={spaceId} onUpdate={onUpdate} />
                )}
              </S.UserActions>
            </S.User>
          ))}
        {invited
          ?.slice(0, batches * batchSize - users.length)
          ?.map(({ email, issued }) => (
            <S.User key={email} data-status="invited">
              <ProfilePicture size={avatarSize} />
              <div>
                <Title size={4}>{email}</Title>
                <Text>
                  Invite Sent{' '}
                  {issued && (
                    <S.Issued>
                      {new Date(issued).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </S.Issued>
                  )}
                </Text>
              </div>
            </S.User>
          ))}
      </ol>
      {(showMore || showCollapse) && (
        <S.LoadMore>
          {showMore && (
            <>
              <Button text onClick={() => setBatches(batches + 1)}>
                load more
              </Button>
              <Button text onClick={() => setBatches(Infinity)}>
                show all
              </Button>
            </>
          )}
          {showCollapse && (
            <Button text onClick={() => setBatches(1)}>
              collapse
            </Button>
          )}
        </S.LoadMore>
      )}
    </S.Group>
  )
}

const avatarSize = '2.8rem'

const S = {
  People: styled.div``,

  GroupHead: styled.div`
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    & > div {
      h3 {
        margin: 0;
        font-size: 1.25rem;
        color: #000;

        span {
          font-size: 1.1rem;
          color: var(--cl-text-light);
          white-space: pre;

          &::before {
            content: '  ';
          }
        }
      }

      p {
        margin-top: 0;
        font-size: 0.94rem;
      }
    }

    @media ${mobile} {
      button {
        display: none;
      }
    }
  `,

  Group: styled.div`
    &:not(:first-of-type) {
      margin-top: 1.5rem;
    }

    ol {
      list-style: none;
      padding: 0;
    }
  `,

  User: styled.li`
    display: flex;
    margin: 1rem 0;
    width: 100%;

    picture,
    img {
      width: ${avatarSize};
      height: ${avatarSize};
      border-radius: 50%;
    }

    & > div:first-of-type {
      display: flex;
      flex-direction: column;
      margin-left: 1rem;
      justify-content: space-around;

      * {
        margin: 0;
        line-height: 1rem;
      }

      p {
        font-size: 0.9rem;
      }
    }

    &[data-status='invited'] {
      opacity: 0.5;
    }
  `,

  UserActions: styled.div`
    margin-left: auto;
    padding-right: 1rem;
    display: flex;

    & > * {
      width: 1.4rem;
      height: 1.4rem;
      fill: var(--cl-text-medium);
    }
  `,

  LoadMore: styled.div`
    display: flex;
    width: 100%;
    justify-content: center;
  `,

  Issued: styled.span`
    opacity: 0.5;
    white-space: pre;

    &::before {
      content: '  ';
    }
  `,
}
