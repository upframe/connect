import React from 'react'

export default React.createContext({
  loggedIn: false,
  user: {},
  searchQuery: '',
  isSearchQuery: false,
  changeSearcBarhWidth: false,
  login: () => {},
  logout: () => {},
  saveUserInfo: () => {},
  setSearchQuery: () => {},
  setProfilePic: () => {},
  setSearchBarWidth: () => {},
  showToast: () => {},
  startSearchQuery: () => {},
})
