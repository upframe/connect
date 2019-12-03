import React, { Component } from 'react'

import { WithContext as ReactTags } from 'react-tag-input'
import AppContext from './AppContext'
import Api from '../utils/Api'

const KeyCodes = {
  comma: 188,
  enter: 13,
}

const delimiters = [KeyCodes.comma, KeyCodes.enter]

export default class SettingsPublicTab extends Component {
  static contextType = AppContext

  constructor(props, context) {
    super(props, context)
    this.state = {
      tags: context.user.tags ? JSON.parse(context.user.tags) : [],
      favoriteLocations: context.user.favoriteLocations
        ? JSON.parse(context.user.favoriteLocations)
        : [],
      suggestions: [],
      profilePic: context.user.profilePic,
      name: context.user.name,
      location: context.user.location,
      role: context.user.role,
      company: context.user.company,
      website: context.user.website,
      twitter: context.user.twitter,
      linkedin: context.user.linkedin,
      github: context.user.github,
      facebook: context.user.facebook,
      dribbble: context.user.dribbble,
      bio: context.user.bio,
      keycode: context.user.keycode,
      email: context.user.email,
      newsfeed: context.user.newsfeed === 'N',
    }
  }

  handleNameChange = event => {
    this.setState({ name: event.target.value })
  }
  handleLocationChange = event => {
    this.setState({ location: event.target.value })
  }
  handleRoleChange = event => {
    this.setState({ role: event.target.value })
  }
  handleCompanyChange = event => {
    this.setState({ company: event.target.value })
  }
  handleWebsiteChange = event => {
    this.setState({ website: event.target.value })
  }
  handleTwitterChange = event => {
    this.setState({ twitter: event.target.value })
  }
  handleLinkedinChange = event => {
    this.setState({ linkedin: event.target.value })
  }
  handleGithubChange = event => {
    this.setState({ github: event.target.value })
  }
  handleFacebookChange = event => {
    this.setState({ facebook: event.target.value })
  }
  handleDribbbleChange = event => {
    this.setState({ dribbble: event.target.value })
  }
  handleBioChange = event => {
    this.setState({ bio: event.target.value })
  }
  handleKeycodeChange = event => {
    this.setState({ keycode: event.target.value })
  }
  handleHideProfile = event => {
    this.setState({ newsfeed: event.target.checked })
  }

  handleFirstFavoriteLocationChange = event => {
    let newFavoriteLocations = this.state.favoriteLocations
    newFavoriteLocations[0] = event.target.value
    this.setState({ favoriteLocations: newFavoriteLocations })
  }

  handleSecondFavoriteLocationChange = event => {
    let newFavoriteLocations = this.state.favoriteLocations
    newFavoriteLocations[1] = event.target.value
    this.setState({ favoriteLocations: newFavoriteLocations })
  }

  handleThirdFavoriteLocationChange = event => {
    let newFavoriteLocations = this.state.favoriteLocations
    newFavoriteLocations[2] = event.target.value
    this.setState({ favoriteLocations: newFavoriteLocations })
  }

  handleKeyUp = e => {
    if (e.keyCode === 13) {
      let inputs = document.querySelectorAll('input')
      for (let i = 0; i < inputs.length; i++) {
        if (e.target.id === 'location-3') {
          break
        }
        if (e.target.id === 'dribbble') {
          document.getElementById('bio-text').focus()
          break
        }
        if (inputs[i].id === e.target.id) {
          inputs[i + 1].focus()
          break
        }
      }
    }
  }

  openUploadDialog = () => {
    document.querySelector("input[type='file']").click()
  }

  uploadPhoto = () => {
    let fileSize =
      document.querySelector('input[type="file"]').files[0].size / 1048576
    if (fileSize < 5) {
      document.getElementById('title').innerHTML = 'Uploading'
      Api.uploadPhoto().then(res => {
        if (res.ok === 1) {
          this.context.showToast('File upload successful')
          this.context.setProfilePic(res.url)
          document.getElementById('title').innerHTML = 'Profile Picture'
          this.setState({
            profilePic: res.url,
          })
        } else {
          alert('Could not update picture')
          document.getElementById('title').innerHTML = 'Profile Picture'
        }
      })
    } else {
      alert('Sorry but that file is too big for upload')
    }
  }

  removePhoto = () => {
    this.context.saveUserInfo({
      profilePic:
        'https://connect-api-profile-pictures.s3.amazonaws.com/default.png',
    })
    this.setState({
      profilePic:
        'https://connect-api-profile-pictures.s3.amazonaws.com/default.png',
    })
  }

  informationChanged = () => {
    let old = this.context.user
    let actual = this.state

    return (
      old.bio !== actual.bio ||
      old.company !== actual.company ||
      old.dribbble !== actual.dribbble ||
      old.facebook !== actual.facebook ||
      old.github !== actual.github ||
      old.keycode !== actual.keycode ||
      old.linkedin !== actual.linkedin ||
      old.location !== actual.location ||
      old.name !== actual.name ||
      old.role !== actual.role ||
      old.tags !== JSON.stringify(actual.tags) ||
      old.twitter !== actual.twitter ||
      old.website !== actual.website ||
      old.newsfeed !== actual.newsfeed
    )
  }

  saveChanges = () => {
    let numOfChars = JSON.stringify(this.state.tags).length
    if (numOfChars > 254) {
      this.context.showToast(
        'Your expertise tags are too long! Delete some so we can save your info :D'
      )
    } else if (this.informationChanged()) {
      this.context.saveUserInfo({
        tags: JSON.stringify(this.state.tags),
        name: this.state.name,
        location: this.state.location,
        role: this.state.role,
        company: this.state.company,
        website: this.state.website,
        twitter: this.state.twitter,
        linkedin: this.state.linkedin,
        github: this.state.github,
        facebook: this.state.facebook,
        dribbble: this.state.dribbble,
        bio: this.state.bio,
        keycode: this.state.keycode,
        profilePic: this.state.profilePic,
        email: this.state.email,
        newsfeed: this.state.newsfeed ? 'N' : 'Y',
      })
    }
  }

  handleDeleteTag = i => {
    const { tags } = this.state
    this.setState({
      tags: tags.filter((tag, index) => index !== i),
    })
  }

  handleAddTag = () => {
    let tagInput = document.querySelector('.ReactTags__tagInputField')
    let tag = {
      id: tagInput.value,
      text: tagInput.value,
    }

    this.setState(state => ({ tags: [...state.tags, tag] }))
    tagInput.value = ''
  }

  handleDragTag = (tag, currPos, newPos) => {
    const tags = [...this.state.tags]
    const newTags = tags.slice()

    newTags.splice(currPos, 1)
    newTags.splice(newPos, 0, tag)

    this.setState({ tags: newTags })
  }

  render() {
    return (
      <React.Fragment>
        <div id="settings-publictab" className="tab center">
          <div className="flex" id="profile-picture">
            <img
              className="profile-pic"
              alt="profile-pic"
              src={this.state.profilePic}
            />
            <input
              id="file-select"
              type="file"
              accept="image/*"
              onChange={this.uploadPhoto}
            />
            <div id="bio">
              <h1 id="title" className="fontweight-normal">
                Profile Picture
              </h1>
              <p>We're big on pictures around here.</p>
              <p>
                Add an updated picture so you don't look like a{' '}
                <span role="img" aria-label="robot">
                  🤖
                </span>
              </p>
              <button
                className="btn btn-round btn-primary fontweight-thin"
                onClick={this.openUploadDialog}
              >
                Upload new picture
              </button>
              <button
                className="btn btn-round fontweight-thin"
                onClick={this.removePhoto}
              >
                Remove
              </button>
            </div>
          </div>

          <div id="personal-info">
            <div className="input-group">
              <label className="fontweight-bold" htmlFor="name">
                Your Name<span className="required-icon"></span>
              </label>
              <input
                type="text"
                onChange={this.handleNameChange}
                value={this.state.name}
                id="name"
                maxLength="50"
                onKeyUp={this.handleKeyUp}
              />
            </div>

            <div className="input-group">
              <label className="fontweight-bold" htmlFor="username">
                Username
              </label>
              <input
                type="text"
                onChange={this.handleKeycodeChange}
                value={this.state.keycode}
                maxLength="50"
                onKeyUp={this.handleKeyUp}
              />

              <p className="mt1">
                Your Upframe URL:{' '}
                <strong>{'https://upframe.io/' + this.state.keycode}</strong>
              </p>
            </div>

            <div className="input-group">
              <label className="fontweight-bold" htmlFor="location">
                Location<span className="required-icon"></span>
              </label>
              <input
                type="text"
                onChange={this.handleLocationChange}
                value={this.state.location}
                id="location"
                maxLength="50"
                onKeyUp={this.handleKeyUp}
              />
            </div>

            <div className="input-group">
              <label className="fontweight-bold" htmlFor="role">
                Your Position<span className="required-icon"></span>
              </label>
              <input
                type="text"
                onChange={this.handleRoleChange}
                value={this.state.role}
                id="role"
                maxLength="50"
                onKeyUp={this.handleKeyUp}
              />
            </div>

            <div className="input-group">
              <label className="fontweight-bold" htmlFor="company">
                Company<span className="required-icon"></span>
              </label>
              <input
                type="text"
                onChange={this.handleCompanyChange}
                value={this.state.company}
                id="company"
                maxLength="50"
                onKeyUp={this.handleKeyUp}
              />
            </div>

            <div className="input-group">
              <label className="fontweight-bold" htmlFor="website">
                Website
              </label>
              <input
                type="text"
                onChange={this.handleWebsiteChange}
                value={this.state.website}
                id="website"
                maxLength="50"
                onKeyUp={this.handleKeyUp}
              />
            </div>

            <div className="input-group">
              <label className="fontweight-bold" htmlFor="bio">
                Biography
                <span className="required-icon"></span>
              </label>
              <textarea
                rows="5"
                type="text"
                onChange={this.handleBioChange}
                value={this.state.bio}
                id="bio-text"
                maxLength="600"
              />

              <p className="color-blue--grey">URLs are hyperlinked.</p>
            </div>

            <div className="input-group">
              <h2>Social Profiles</h2>

              <div className="input-group">
                <label className="fontweight-bold" htmlFor="twitter">
                  Twitter
                </label>
                <input
                  type="text"
                  placeholder="@upframed"
                  onChange={this.handleTwitterChange}
                  value={this.state.twitter}
                  id="twitter"
                  maxLength="50"
                  onKeyUp={this.handleKeyUp}
                />
              </div>
              <div className="input-group">
                <label className="fontweight-bold" htmlFor="linkedin">
                  LinkedIn
                </label>
                <input
                  type="text"
                  onChange={this.handleLinkedinChange}
                  value={this.state.linkedin}
                  id="linkedin"
                  maxLength="50"
                  onKeyUp={this.handleKeyUp}
                />
              </div>
              <div className="input-group">
                <label className="fontweight-bold" htmlFor="github">
                  Github
                </label>
                <input
                  type="text"
                  onChange={this.handleGithubChange}
                  value={this.state.github}
                  id="github"
                  maxLength="50"
                  onKeyUp={this.handleKeyUp}
                />
              </div>
              <div className="input-group">
                <label className="fontweight-bold" htmlFor="facebook">
                  Facebook
                </label>
                <input
                  type="text"
                  onChange={this.handleFacebookChange}
                  value={this.state.facebook}
                  id="facebook"
                  maxLength="50"
                  onKeyUp={this.handleKeyUp}
                />
              </div>
              <div className="input-group">
                <label className="fontweight-bold" htmlFor="dribbble">
                  Dribbble
                </label>
                <input
                  type="text"
                  onChange={this.handleDribbbleChange}
                  value={this.state.dribbble}
                  id="dribbble"
                  maxLength="50"
                  onKeyUp={this.handleKeyUp}
                />
              </div>
            </div>

            <div className="input-group" id="experience">
              <h2 className="mb1">Experience</h2>
              <p className="mb2">
                Add up to 6 skills to display in your profile. Other people will
                see them under the section “I can advise you on”.
              </p>

              <div className="flex alignitems-center">
                <ReactTags
                  tags={this.state.tags}
                  autofocus={false}
                  handleDelete={this.handleDeleteTag}
                  handleAddition={this.handleAddTag}
                  handleDrag={this.handleDragTag}
                  delimiter={delimiters}
                />

                <button
                  className="btn btn-fill btn-primary block ml2"
                  onClick={this.handleAddTag}
                >
                  Add tag
                </button>
              </div>
            </div>

            <div className="input-group">
              <h2>Privacy</h2>
              <label htmlFor="newsfeed">
                <input
                  type="checkbox"
                  id="newsfeed"
                  onChange={this.handleHideProfile}
                  checked={this.state.newsfeed}
                ></input>{' '}
                Hide my profile from the homepage
              </label>
            </div>
          </div>
        </div>
        {/* <div className="fixed-save-changes">
          <button
            className="btn btn-fill btn-primary block save-changes"
            onClick={this.saveChanges}
          >
            Save changes
          </button>
        </div> */}
      </React.Fragment>
    )
  }
}
