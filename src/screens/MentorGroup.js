import React, { useState, useEffect } from 'react'
import Api from '../utils/Api'

import MainMentorList from '../components/MainMentorList/index'
import MainSearchBar from '../components/MainSearchBar'

const MentorGroup = props => {
  const [mentors, setMentors] = useState([])

  useEffect(() => {
    const listPage = props.location.pathname.substring(1)
    Api.searchFull(listPage).then(res => {
      if (res.ok === 1) {
        setMentors(res.search)
      }
    })
  }, [props.location.pathname])

  return (
    <main id="home">
      <div className="container grid">
        <MainSearchBar setMentors={setMentors} />
        <MainMentorList mentors={mentors} />
      </div>
    </main>
  )
}

export default MentorGroup
