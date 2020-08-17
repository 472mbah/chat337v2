import React, { Component } from 'react';
import { connect } from 'react-redux';
import Login from './views/login';
import Main from './views/main';
import ParticlesBg from "particles-bg";
// import socket from './socket';

// https://fullstackworld.com/post/a-react-particles-animation-background-component
import Chat from './components/chat';
import admin_functions from './redux/reducers/admin';
import './styles/index.css';

class App extends Component {

  componentDidMount = () => {

  }

  render(){

    const { page, user } = this.props.admin;
    const { change_page } = admin_functions;

    let config = {
      num: [4, 7],
      rps: 0.1,
      radius: [5, 40],
      life: [1.5, 3],
      v: [2, 3],
      tha: [-40, 40],
      alpha: [0.6, 0],
      scale: [.1, 0.4],
      position: "all",
      color: ["random", "#ff0000"],
      cross: "dead",
      // emitter: "follow",
      random: 15
    };

    if (Math.random() > 0.85) {
      config = Object.assign(config, {
        onParticleUpdate: (ctx, particle) => {
          ctx.beginPath();
          ctx.rect(
            particle.p.x,
            particle.p.y,
            particle.radius * 2,
            particle.radius * 2
          );
          ctx.fillStyle = particle.color;
          ctx.fill();
          ctx.closePath();
        }
      });
    }


    return (
      <div >
        {
          user==null ? <Login/> : <Main/>
        }
        <ParticlesBg type="custom" config={config} bg={true} />
      </div>
    )
  }
}

const manage_state = state => ({
  admin: state.admin
})

export default connect(manage_state)(App);