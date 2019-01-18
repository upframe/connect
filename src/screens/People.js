import React, { Component } from 'react'

import * as Api from '../utils/Api'

import Breadcrumbs from '../components/Breadcrumbs'
import MentorMeetupPopup from '../components/MentorMeetupPopup'

export default class People extends Component {

  constructor(props) {
    super(props)
    this.state = {
      selectedSlot: '',
      showPopup: 0,
      mentorExists: 0,
      mentor: {
        bio: 'Loading',
        company: 'Loading',
        dribbble: 'Loading',
        email: 'Loading',
        facebook: 'Loading',
        github: 'Loading',
        linkedin: 'Loading',
        location: 'Loading',
        name: 'Loading',
        profilePic: 'Loading',
        role: 'Loading',
        twitter: 'Loading',
        uid: 'Loading',
        website: 'Loading',
        tags: [],
        freeSlots: [],
        favoriteLocations: ['Startup Lisboa', 'Arabesco']
      }
    }
  }

  componentDidMount() {
    let keycode = window.location.pathname.split('/')[1]
    Api.getMentorInfo(keycode).then((res) => {
      if (res.message) {
        this.setState({
          mentorExists: 2
        })
      } else {
        this.setState({
          mentorExists: 1,
          mentor: {
            bio: res.mentor.bio,
            company: res.mentor.company,
            dribbble: res.mentor.dribbble,
            email: res.mentor.email,
            facebook: res.mentor.facebook,
            github: res.mentor.github,
            linkedin: res.mentor.linkedin,
            location: res.mentor.location,
            name: res.mentor.name,
            profilePic: res.mentor.profilePic,
            role: res.mentor.role,
            twitter: res.mentor.twitter,
            uid: res.mentor.uid,
            website: res.mentor.website,
            tags: res.mentor.tags ? JSON.parse(res.mentor.tags) : [],
            freeSlots: res.mentor.slots,
            favoriteLocations: res.mentor.favoriteLocations ? JSON.parse(res.mentor.favoriteLocations) : []
          }
        })
      }
    })
  }

  selectSlot = (event) => {
    let target = event.target
    while(target.parentNode && !target.dataset.id && !target.classList.contains('mentor-card-slot')) target = target.parentNode
    
    if(target.dataset.id && target.classList.contains('mentor-card-slot')) {
      // remove current active slot
      document.querySelectorAll('.mentor-card-slot.active').forEach((slot) => slot.classList.remove('active'))
      // change selected slot to active mode
      target.classList.add('active') 

      this.setState({ selectedSlot: target.dataset.id }, () => { console.log(this.state) })
    }
  }

  showPopup = (event) => {
    if (this.state.selectedSlot) {
      this.setState({
        showPopup: 1
      })
    }
  }

  hidePopup = () => {
    this.setState({
      showPopup: 0
    })
  }

  mentorTagsToElement = (tags) => {
    return tags.map((tag, i) => {
      return (
        <li key={i} className='flex align-items-center mentor-tag'>{tag.text}</li>
      )
    })
  }

  displayFreeSlots = () => {
    let days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

    if (this.state.mentor.freeSlots) {
      return this.state.mentor.freeSlots.map((slot, i) => {
        let startDate = new Date(slot.start)
        return (
          <li className="mentor-card-slot flex justify-center" data-id={slot.sid} key={slot.sid} onClick={this.selectSlot}>
            <div className='flex align-items-center'>
              <div>
                <span id='month' className='font-weight-bold text-uppercase'>{months[startDate.getMonth()]}</span>
                <span id="day">{startDate.getDate()}</span>
              </div>
              <div>
                <span id='time'>{days[startDate.getDay()]} {startDate.getHours() > 12 ? startDate.getHours() - 12: startDate.getHours()}:{startDate.getMinutes() < 10 ? `0${startDate.getMinutes()}` : startDate.getMinutes() } {startDate.getHours() >= 12 ? 'PM' : 'AM'}</span>
              </div>
            </div>
          </li>
        )
      })
      
    }
  }

  render() {
    if (this.state.mentorExists === 1) {
      return (
        <main id='people' className='container'>
          {this.state.showPopup === 1
              ?
              <MentorMeetupPopup
                show={this.state.showPopup}
                hidePopup={this.hidePopup}
                sid={this.state.selectedSlot}
                locations={this.state.mentor.favoriteLocations}
                name={this.state.mentor.name} />
              :
              null
          }
          <Breadcrumbs />
          <div className='card mentor-card flex justify-center'>
            <div>
              <div className='flex justify-center'>
                <img className="mentor-profilepic" src={this.state.mentor.profilePic} alt='Profile' />
              </div>
              <div className='mentor-info'>
                <h1 id='name' className="font-weight-normal">{this.state.mentor.name}</h1>
                <p id='role-company'>{this.state.mentor.role} at {this.state.mentor.company}</p>
                <p id='location' className='flex align-items-center'><i className='fa fa-map-marker icon color-primary font-150'></i>{this.state.mentor.location}</p>
                <ul id='tags' class='flex'>
                  {this.mentorTagsToElement(this.state.mentor.tags)}
                </ul>
                <p id='bio'>{this.state.mentor.bio}</p>
              </div>
            </div>
            
            <span className="hr"></span>

            <div>
              {/*<a href={'http://www.twitter.com/' + this.state.mentor.twitter}>Twitter</a><br />
              <a href={'http://www.linkedin.com/' + this.state.mentor.linkedin}>LinkedIn</a><br />
              <a href={'http://www.github.com/' + this.state.mentor.github}>Github</a><br />
              <a href={'http://www.facebook.com/' + this.state.mentor.facebook}>Facebook</a><br />
              <a href={'http://www.dribbble.com/' + this.state.mentor.dribbble}>Dribbble</a>*/}
              <ul className='mentor-card-slots grid'>
                {this.displayFreeSlots()}
                { this.state.mentor.freeSlots.length
                  ? <button className='btn btn-primary btn-fill mentor-card-slot-request' onClick={this.showPopup}>Request</button>
                  : null
                }
              </ul>
              </div>
          </div>
        </main>
      )
    } else if (this.state.mentorExists === 2)  {
      return (
        <h1>Este mentor não existe</h1>
      );
    } else {
      return (
        <div className="center-container">
          <div className="loader"></div>
        </div>
      )
    }
  }

} 