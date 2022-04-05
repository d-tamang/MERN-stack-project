import React from 'react';

class NavBar extends React.Component {
  constructor(props) {
    super(props);
  }

  logoutUser(e) {
    e.preventDefault();
    this.props.logout();
  }

  showLinks() {
    if (this.props.loggedIn) {
      return <div><button onClick={(e) => this.logoutUser(e)}>LOGOUT</button></div>
    } else {
      return <div>
        <button onClick={() => this.props.openModal('login')}>LOG IN</button>
        <button onClick={() => this.props.openModal('signup')}>SIGN UP</button>
      </div>
    }
  }

  render() {
    return (
      <div>
        {this.showLinks()}
      </div>
    )
  }
}

export default NavBar;