import React, { Component } from 'react';
import moment from 'moment';
import BigCalendar from 'react-big-calendar';

import 'react-big-calendar/lib/css/react-big-calendar.css'
import '../calendar.css';

import * as Api from '../utils/Api';

const localizer = BigCalendar.momentLocalizer(moment) 

export default class SettingsSyncTab extends Component {

  constructor(props) {
    super(props)
    this.state = {
      code: window.location.search.split('?code=')[1],
      googleAccessToken: '',
      calendars: [{
        summary: '',
        id: '',
        checked: false
      }],
      events: [],
      freeSlotsUnsaved: [],
      freeSlotsSaved: [],
      freeSlotsToDelete: [],
      currId: 0,
      upframeCalendarId: ''
    }
  }

  //Are we not synced at all
  //Have we synced and we need to fetch access token
  //Or have we already synced in the past
  componentDidMount() { 
    if (this.state.code) {
      //We have synced. We need to send the code to the backend
      Api.getTokens(this.state.code).then((res) => {
        if (res.ok === 1) {
          //We just synced. 
          //DONE-Lets save the token here 
          //DONE-and add upframe calendar (we can do both at same time)
          //TODO-Add upframe calendar error handling
          //DONE-and fetch calendars
          this.getCalendarList(res.token).then((res) => {
            let newCalendarsList = res.items.filter((element) => {
              return !element.id.includes('#holiday@group.v.calendar.google.com') && !element.id.includes('#contacts@group.v.calendar.google.com')
            }).map((element) => {
              return {
                id: element.id,
                summary: element.summary,
                checked: false
              }
            })
            this.setState({
              calendars: newCalendarsList
            })
          })

          this.addUpframeCalendar(res.token).then((res) => {
            //TODO - Check if add Upframe Calendar was successful
            //if it was save to state
            console.log('Tried to add Upframe Calendar')
            console.log(res)
          })
          this.setState({
            code: '',
            googleAccessToken: res.token
          })
        } else {
          alert('An error ocurred exchanging code for tokens')
        }
      })
    } else {
      //Either we have not synced at all
      //Or we have synced in the past
      Api.getUserInfo().then((res) => {
        if (res.user.googleAccessToken) {
          //We have synced in the past
          //DONE - Here we need to fetch the previous known free slots from our DB
          //DONE - After we get them we need to convert them and display them.
          //DONE - At the same time we need to fetch the users calendar list and display that too
          //DONE - save upframe calendar in state
          this.getCalendarList(res.user.googleAccessToken).then((res) => {
            let newCalendarsList = res.items.filter((element) => {
              return !element.id.includes('#holiday@group.v.calendar.google.com') && !element.id.includes('#contacts@group.v.calendar.google.com')
            }).map((element) => {
              return {
                id: element.id,
                summary: element.summary,
                checked: false
              }
            })
            this.setState({
              calendars: newCalendarsList
            })
          })
          
          let nowDate = new Date()
          let limitDate = moment().add('days', 30)
          Api.getFreeSlots(nowDate, limitDate).then((res) => {
            if (res.ok === 1) {
              this.setState({
                freeSlotsSaved: res.slots.map((unconvertedSlot) => {
                  return {
                    mentorUID: unconvertedSlot.mentorUID,
                    recurrency: unconvertedSlot.recurrency,
                    id: unconvertedSlot.sid,
                    start: new Date(unconvertedSlot.start),
                    end: new Date(unconvertedSlot.end)
                  }
                })
              })
            }
          })
          this.setState({
            upframeCalendarId: res.user.upframeCalendarId
          })
        } else {
          //We have never synced if we dont do anything the button is displayed.
        }
      })
    }
  }

  googleSync = () => {
    Api.getGoogleSyncUrl().then((res) => {
      window.location = res.url
    })
  }

  calendarVisibilityChange = (event) => { //After displaying the calendars we want to show their visibility according to checks
    let newCalendars = this.state.calendars
    newCalendars = this.state.calendars.map((element) => { //Here we find which calendar got checked
      return {
        id: element.id,
        summary: element.summary,
        checked: event.target.id === element.id ? event.target.checked : element.checked
      }
    })
    this.getCalendarEvents(newCalendars).then(data => { //Here we fetch the events for all the checked calendars
      this.setState({
        calendars: newCalendars,
        events: data
      })
    })
  }

  /* Whenever someone clicks on an event in the calendar we will get this function.
   * People can only delete events that are from Upframe. If the event was added 
   * and it wasn't saved then all we have to do is remove it from freeSlotsUnsaved.
   * If the event was added on a previous session then we need to ask our DB to
   * delete it.
   */
  deleteFreeSlot = (event) => {
    let isUnsavedFreeSlot = this.state.freeSlotsUnsaved.some(slot => slot.id === event.id)
    if (isUnsavedFreeSlot) {
      //Simple, we just remove it from the array
      this.setState({
        freeSlotsUnsaved: this.state.freeSlotsUnsaved.filter(slot => slot.id !== event.id)
      })
    } else {
      //This free slots is saved on our DB. We gotta send a delete request.
      //Lets add it to the delete pile.
      //We want to remove it from the freeSlotsSaved and add it to freeSlotsToDelete
      //queremos remover event.id

      let newFreeSlotsSaved = []
      let newFreeSlotsToDelete = this.state.freeSlotsToDelete
      this.state.freeSlotsSaved.forEach(slot => {
        if (slot.id === event.id) { //evento para remover adicionamos ao delete
          newFreeSlotsToDelete.push(slot)
        } else { //outro evento, deixamos estar
          newFreeSlotsSaved.push(slot)
        }
      })

      this.setState({
        freeSlotsSaved: newFreeSlotsSaved,
        freeSlotsToDelete: newFreeSlotsToDelete
      })
    }
  }

  addFreeSlot = (slot) => {
    let today = new Date()
    if (slot.start < today) {
      alert('You can\'t add free slots in the past')
    } else {
      let currentId = this.state.currId
      let newFreeSlots = this.state.freeSlotsUnsaved
      newFreeSlots.push({
        id: currentId + 1,
        start: slot.start,
        end: slot.end,
        title: 'Upframe Free Slot',
        tag: 'upframe-free-slot'
      })
      this.setState({
        currId: currentId + 1,
        freeSlotsUnsaved: newFreeSlots
      }) 
    }
  }

  getCalendarList = (token) => {
    let fetchData = {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    }
    return fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', fetchData).then((res) => res.json())
  }

  getCalendarEvents = (calendarList) => {
    let checkedCalendars = calendarList.filter((calendar) => calendar.checked ? calendar : null)
    let calendarIds = checkedCalendars.map((calendar) => calendar.id)
    let calendarPromises = calendarIds.map((calendarId) => this.calendarEvents(calendarId))
    let eventsPromise = Promise.all(calendarPromises).then((done) => {
      let allEvents = []
      done.map((eachRequest) => {
        allEvents = allEvents.concat(eachRequest.items)
        return 0
      })
      return allEvents
    }).then((final) => {
      return final.map((element) => this.convertEvents(element))
    })
    return eventsPromise
  }

  calendarEvents = (calendarId) => { //TODO - Move to API
    let customHeaders = new Headers()
    let data = new Date()
    let dataLimite = moment().add(30, 'days')
    customHeaders.append('Authorization', 'Bearer ' + this.state.googleAccessToken)
    return fetch('https://www.googleapis.com/calendar/v3/calendars/' + calendarId + '/events?maxResults=2500&timeMin=' + data.toISOString() + '&timeMax=' + dataLimite.toISOString() + '&singleEvents=true',
      {
        method: 'GET',
        mode: 'cors',
        headers: customHeaders
      }).then((response) => response.json())
      .then((data) => {
        return data
      })
  }

  convertEvents = (element) => {
    if (element.start.dateTime) {
      return {
        id: element.id,
        start: new Date(element.start.dateTime),
        end: new Date(element.end.dateTime),
        title: element.summary
      }
    } else {
      return {
        id: element.id,
        start: moment(element.start.date, 'YYYY-MM-DD').toDate(),
        end: moment(element.end.date, 'YYYY-MM-DD').toDate(),
        title: element.summary
      }
    }
  }

  addUpframeCalendar = (token) => { //TODO - Move to API
    let body = {
      'summary': 'Upframe Calendar'
    }
    let fetchData = {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    }
    return fetch('https://www.googleapis.com/calendar/v3/calendars', fetchData).then((res) => res.json())
  }

  /* There is a lot of stuff to do here. First we want to delete the slots
   * that were saved in our DB and the user deleted now (they are in
   * freeSlotsToDelete). We also want to save the freeSlotsUnsaved. So 
   * we need to call our API request.
   * After this is done we want to clear the delete list because and
   * we want to merge our unsaved slots into the saved pile since
   * we already sent that to our backend.
   */
  saveFreeSlots = () => { 
    //1. Delete toDelete + Save unsaved
    //2. clear to Delete
    //3. merge unsaved into saved
    Api.addFreeSlots(this.state.freeSlotsUnsaved, this.state.freeSlotsToDelete).then((res) => {
      console.log(res)
      if (res.ok === 1) { //We have added new slots and deleted the ones that were saved (not created in this session)
        //Wrong! Because the new saved slots are in incorrect form
        //We need to fetch slots again
        let nowDate = new Date()
        let limitDate = moment().add('days', 30)
        Api.getFreeSlots(nowDate, limitDate).then((res) => {
          console.log(res)
          if (res.ok === 1) {
            this.setState({
              freeSlotsSaved: res.slots.map((unconvertedSlot) => {
                return {
                  mentorUID: unconvertedSlot.mentorUID,
                  recurrency: unconvertedSlot.recurrency,
                  id: unconvertedSlot.sid,
                  start: new Date(unconvertedSlot.start),
                  end: new Date(unconvertedSlot.end)
                }
              }),
              freeSlotsToDelete: [],
              freeSlotsUnsaved: []
            })
          } else {
            //Free slots saved but we couldnt fetch them all again
            if (res.ok === 0 && res.code === 404) {
              //All slots deleted
              this.setState({
                freeSlotsSaved: [],
                freeSlotsToDelete: [],
                freeSlotsUnsaved: []
              })
            }
          }
        }, () => {
          alert('Free slots saved')
        })
      } else {
        //An eror ocurred
        alert('We could not save the changes... Try again in a few minutes')
      }
    })
  }

  render() {
    console.log(this.state)
    //Ou temos token para ir buscar calendários ou nao temos
    if (this.state.googleAccessToken === '') {
      //Nao temos token, queremos ir busca lo
      return (
        <div id='settings-synctab' className='tab center'>
          <h1>Syncronize your google account here</h1>
          <button onClick={this.googleSync}>Google Sync</button>
          <button onClick={this.saveFreeSlots}>Save slots</button>
          <BigCalendar
            localizer={localizer}
            showMultiDayTimes={true}
            selectable
            defaultDate={new Date()}
            defaultView='week'
            events={[...this.state.events, ...this.state.freeSlotsSaved, ...this.state.freeSlotsUnsaved]}
            onSelectEvent={event => this.deleteFreeSlot(event)}
            onSelectSlot={slot => this.addFreeSlot(slot)}
          />
        </div>
      )       
    } else {
      return (
        <div>
          {this.state.calendars.map(element => {
            return (
              <div>
                <label>{element.summary}</label>
                <input type='checkbox' id={element.id} onChange={this.calendarVisibilityChange} defaultChecked={element.checked}/>
              </div>
            )
          })}
          <button onClick={this.saveFreeSlots}>Save slots</button>
          <BigCalendar
            localizer={localizer}
            showMultiDayTimes={true}
            selectable
            defaultDate={new Date()}
            defaultView='week'
            events={[...this.state.events, ...this.state.freeSlotsSaved, ...this.state.freeSlotsUnsaved]}
            onSelectEvent={event => this.deleteFreeSlot(event)}
            onSelectSlot={slot => this.addFreeSlot(slot)}
          />
        </div>
      )
    }
  }
}