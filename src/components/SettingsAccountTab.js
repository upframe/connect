import React, { PureComponent } from 'react';

import * as Api from '../utils/Api'
import AppContext from './AppContext'

export default class SettingsAccountTab extends PureComponent {

  static contextType = AppContext

  changeEmail = () => {
    Api.changeEmail(this.context.user.email).then((res) => {
      if (res.ok === 1) {
        alert('An email has been sent to you')
      }
    })
  }

  changePassword = () => {
    Api.resetPassword(this.context.user.email).then((res) => {
      if (res.ok === 1) {
        alert('An email has been sent to you')
      }
    })
  }

  render() {
    return (
      <div id='settings-accounttab' className='tab center'>
        <h1 className='font-weight-normal'>Email</h1>
        <p>
          Your email address is <a href={'mailto:' + this.context.user.email}>{this.context.user.email}</a>. This information will not be publicly displayed
        </p>
        <button onClick={this.changeEmail}>Change Email</button>
        <h1 className='font-weight-normal'>Password</h1>
        <p>Set a unique password to protect your account</p>
        <button onClick={this.changePassword}>Change Password</button>
      </div>
    );
  }
}