import React, { useState, useRef } from 'react'
import styled from 'styled-components'
import Item from '../Settings/Item'
import { gql, queries, fragments, useQuery, useMutation } from 'gql'
import { useDebouncedInputCall, useHistory, useSignIn } from 'utils/hooks'
import {
  Button,
  Text,
  ProfilePicture,
  Title,
  ProfilePhotoCrop,
  Tagselect,
} from '../../components'

const COMPLETE_SIGNUP = gql`
  mutation CompleteSignUp(
    $token: ID!
    $name: String!
    $handle: String!
    $biography: String!
    $location: String
    $headline: String
    $photo: String
    $tags: [String]
  ) {
    completeSignup(
      token: $token
      name: $name
      handle: $handle
      biography: $biography
      location: $location
      headline: $headline
      photo: $photo
      tags: $tags
    ) {
      ...PersonBase
      ... on Mentor {
        calendarConnected
        spaces {
          id
          handle
        }
      }
    }
  }
  ${fragments.person.base}
`

export default function Step2({
  token,
  info: { name: initialName, picture, defaultPicture, role },
}) {
  const [name, _setName] = useState(initialName || '')
  const [handle, _setHandle] = useState(handleFromName(name))
  const [location, setLocation] = useState('')
  const [headline, setHeadline] = useState('')
  const [biography, setBiography] = useState('')
  const [photo, setPhoto] = useState(picture?.url ?? defaultPicture?.url)
  const [rawPhoto, setRawPhoto] = useState()
  const [cstHandle, setCstHandle] = useState(false)
  const [tags, setTags] = useState([])
  const checkData = useDebouncedInputCall({
    name,
    handle,
    biography,
    location,
    headline,
  })
  const [invalid, setInvalid] = useState({})
  const [highlightInvalid, setHighlightInvalid] = useState(false)
  const fileInput = useRef(null)
  const signIn = useSignIn()
  const history = useHistory()

  const [completeSignup] = useMutation(COMPLETE_SIGNUP, {
    variables: {
      name,
      handle,
      biography,
      token,
      location,
      headline,
      ...(photo !== defaultPicture?.url && { photo }),
      tags: tags.map(({ name }) => name),
    },
    onCompleted({ completeSignup: user }) {
      signIn(user)
      history.push(
        user.spaces?.length ? `/s/${user.spaces[0].handle}` : '/settings/public'
      )
    },
  })

  const { loading } = useQuery(queries.CHECK_VALIDITY, {
    variables: checkData,
    onCompleted({ checkValidity }) {
      setInvalid(
        Object.fromEntries(
          !checkValidity
            ? []
            : checkValidity
                .filter(({ valid }) => !valid)
                .map(({ field, reason }) => [field, reason])
        )
      )
    },
  })

  function handleFromName(v) {
    return v
      .replace(/\s\w/g, v => v[1].toUpperCase())
      .normalize('NFKD')
      .replace(/[^\w\-.]/g, '')
      .slice(0, 20)
  }

  function setName(v) {
    _setName(v)
    if (cstHandle) return
    _setHandle(handleFromName(v))
  }

  function setHandle(v) {
    if (!cstHandle) setCstHandle(true)
    _setHandle(v)
  }

  function editPhoto(e) {
    const reader = new FileReader()
    reader.onload = e => setRawPhoto(e.target.result)
    reader.readAsDataURL(e.target.files[0])
  }

  return (
    <S.Step2 onSubmit={e => e.preventDefault()}>
      <S.Head>
        <ProfilePicture imgs={[{ url: photo }]} size="11.125rem" />
        <div>
          <Title size={2}>Profile Picture</Title>
          <Text>
            We're big on pictures here.
            <br />
            Add an updated picture so you don't look like a&nbsp;
            <span role="img" aria-label="robot">
              🤖
            </span>
          </Text>
          <div>
            <Button accent onClick={() => fileInput.current.click()}>
              Upload photo
            </Button>
            {photo !== defaultPicture?.url && (
              <Button onClick={() => setPhoto(defaultPicture.url)}>
                Remove
              </Button>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInput}
            onChange={editPhoto}
            hidden
          />
        </div>
      </S.Head>
      <Item
        label="Name"
        autoComplete="name"
        input={name}
        onChange={setName}
        {...((name.length || highlightInvalid) &&
          'name' in invalid && { hint: invalid.name, error: true })}
        required
      />
      <Item
        label="Username"
        autoComplete="username"
        input={handle}
        onChange={setHandle}
        {...(handle && { hint: `https://upframe.io/${handle}` })}
        {...((handle.length || highlightInvalid) &&
          'handle' in invalid && {
            hint: invalid.handle,
            error: highlightInvalid,
          })}
        required
      />
      <Item
        label="Location"
        autoComplete="address-level2"
        input={location}
        onChange={setLocation}
        required
        {...(highlightInvalid &&
          'location' in invalid && {
            hint: invalid.location,
            error: highlightInvalid,
          })}
      />
      <Item
        label="Headline"
        autoComplete="organization-title"
        input={headline}
        onChange={setHeadline}
        required
        {...(highlightInvalid &&
          'headline' in invalid && {
            hint: invalid.headline,
            error: highlightInvalid,
          })}
      />
      <Item
        label="Biography"
        text={biography}
        onChange={setBiography}
        required
        placeholder={
          role === 'USER'
            ? "When you reach out to mentors, they will see your profile. Write something that describes who you are and what you're working on here."
            : 'Help people understand how you can help them by describing what you built or achieved.'
        }
        {...(biography.length < 20 && {
          hint: `minimum ${
            biography.length ? `${biography.length}/` : ''
          }20 characters`,
        })}
        {...(highlightInvalid &&
          'biography' in invalid && {
            hint: invalid.biography,
            error: highlightInvalid,
          })}
      />
      {role === 'MENTOR' && (
        <>
          <Title size={2}>Experience</Title>
          <Text>
            What can you advise people on? Add up to 6 skills to display in your
            profile. The more specific, the better ('Event Marketing' is easier
            to picture than 'Marketing').
          </Text>
          <Tagselect
            selection={tags}
            onChange={setTags}
            placeholder="Add up to 6 skills to display in your profile"
          />
        </>
      )}
      <S.SubmitWrap onClick={() => setHighlightInvalid(true)}>
        <Button
          accent
          type="submit"
          disabled={Object.keys(invalid).length > 0 || loading}
          onClick={completeSignup}
          loading={loading}
          loadingHideText
        >
          Create Account
        </Button>
      </S.SubmitWrap>
      {rawPhoto && (
        <ProfilePhotoCrop
          photo={rawPhoto}
          name={name}
          onSave={file => {
            setRawPhoto()
            setPhoto(file)
          }}
          onCancel={() => setRawPhoto()}
        />
      )}
    </S.Step2>
  )
}

const S = {
  Step2: styled.form`
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 2rem;
    margin: 0;
    margin-top: -2rem;
    padding: 0 calc((100vw - 50rem) / 2);
    max-width: 95vw;

    @media (max-width: 52.5rem) {
      padding: 0 2.5vw;
    }

    @media (max-width: 600px) {
      *[data-action] {
        grid-column: 1 / span 2;
      }
    }

    *[data-action='textbox'],
    *[data-label='location'],
    *[data-label='headline'],
    *[data-label='biography'],
    & > div:nth-last-child(2),
    & > p {
      grid-column: 1 / span 2;
    }

    & > h2 {
      margin-bottom: 0;
    }

    & > p {
      margin-top: 0;
    }
  `,

  Head: styled.div`
    display: flex;
    justify-content: flex-start;
    grid-column: 1 / span 2;
    margin-bottom: 1rem;

    img {
      height: 11.125rem;
      border-radius: var(--border-radius);
    }

    & > div {
      margin-left: 2rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      * {
        margin-top: 0;
        margin-bottom: 0;
      }

      p {
        margin-bottom: 1rem;
      }
    }

    @media (max-width: 600px) {
      h2,
      p {
        display: none;
      }

      flex-direction: column;
      align-items: center;

      & > div {
        margin-top: 2rem;
      }
    }
  `,

  SubmitWrap: styled.div`
    grid-column: 2;
    margin: 3rem 0;

    button {
      width: 100%;
    }

    button:disabled {
      pointer-events: none;
    }
  `,
}
