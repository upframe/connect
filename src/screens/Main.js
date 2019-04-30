import React, { Component } from 'react';

import Api from '../utils/Api';
import MainCategories from '../components/MainCategories'
import MainMentorList from '../components/MainMentorList'
import MainSearchBar from '../components/MainSearchBar'

import aos from 'aos'
import 'aos/dist/aos.css'

export default class Main extends Component {

  constructor (props) {
    super(props)
    this.state = {
      mentors: [],
      searchQuery: '',
    }

    aos.init({
      duration: 750,
      delay: 0,
      offset: 0,
      throttleDelay: 0,
    })
  }

  componentDidMount() {
    Api.getAllMentors().then((res) => {
      this.setState({
        mentors: res.mentors
      })
    })
  }

  setMentors = (mentors) => {
    this.setState({
      mentors: mentors
    })
  }

  updateSearchQuery = (query) => {
    this.setState({ searchQuery: query })
  }

  render() {
    let emptyQuery = this.state.searchQuery.length === 0

    return (
      <main id='home'>
        <div className="container grid" >
          <MainSearchBar setMentors={this.setMentors} searchChanged={this.updateSearchQuery}/>
          { emptyQuery ? 
            <React.Fragment>
              <MainCategories setMentors={this.setMentors} />
              <h1 className='font-150 fontweight-medium' data-aos='fade-up'
                data-aos-delay='600' data-aos-offset='0'>
                <i class="em em-hot_pepper"></i>Featured Mentors
              </h1>
              <p data-aos='fade-up' data-aos-delay='700' data-aos-offset='0'>Our in-house curators work
                alongside with startup founders, community shapers and domain experts across Europe to
                make sure you can find people who can help you tackle the challenges
                of today and tomorrow.
              </p>
            </React.Fragment>
            : null
          }
          <MainMentorList mentors={this.state.mentors} />
        </div>
      </main>
    )
  }
}