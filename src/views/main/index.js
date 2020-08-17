import React, { Component } from 'react';
import encryption from '../login/encryption';
import { connect } from 'react-redux';
import Search_Mode from './search_mode';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner';
import socket from '../../socket' 
import manage_room from './manage_room';
import Chat from '../../components/chat';
import chat_functions from './chat_functions'; 
import admin_functions from '../../redux/reducers/admin';
import search_mode from './search_mode';

class App extends Component {

//  

  refresh = socket.off('personal_refresh').on('personal_refresh', async data=>{
      await this.set_up_rooms(data.add ? data.room_id:false, data.add ? false:data.room_id);
  })

  refresh = socket.off('told_to_refresh').on('told_to_refresh', async data=>{
    await this.set_up_rooms(data.add ? data.room_id:false, data.add ? false:data.room_id);
  })

    

    mapper = socket.off('inform_who_is_online').on('inform_who_is_online', data=>{
      const { user } = this.props.admin;
      socket.emit('i_am_online', { room_id:data.room_id, _id:user._id, 
        i_am_online: data.i_am_online
      
      })
    })

    socket_confirm_join = socket.off('confirm_that_i_am_online').on('confirm_that_i_am_online', data=> {
      
      let { rooms_details, user } = this.props.admin;
        if(data._id != user._id){
          if(rooms_details.hasOwnProperty(data.room_id)){
            let changed = false;
            const target_room = rooms_details[data.room_id];
            const members = target_room.key;
            if(members.hasOwnProperty(data._id)){
                members[data._id].online = data.i_am_online;
                changed = true; 
            } 
            if(changed){
                target_room.key = members;
                rooms_details[data.room_id] = target_room;
                admin_functions.change_attribute('rooms_details', rooms_details);
            }
        }
      }

    })


    mapper = socket.off('inform_who_is_online').on('inform_who_is_online', data=>{
      const { user } = this.props.admin;
      socket.emit('i_am_online', { room_id:data.room_id, _id:user._id, 
        i_am_online: data.i_am_online
      
      })
    })

    recieve_message = socket.off('recieve_message').on('recieve_message', async data=> {
      const { user } = this.props.admin;
      admin_functions.push_message(data)
      // const res = chat_functions.seen_message(data.room_id, data.timestamp, user._id);
      
    })


    state = {
      loading:true,
      search_mode:false,
    } 

    identify_room_name = (_id, members, is_public) => {

        if(is_public) return "Public chat room"

        let name = "";
        members = members.filter(person=>{
            return person._id != _id;
        });


        members.forEach(person=>{
          name+=`${person.full_name||person.user_name}+`;
        })

        name+="You";
        return name
    }

    set_up_rooms = async (new_room=false, old_room=false) => {
      socket.emit('connection')
      const { user } = this.props.admin;
      let { rooms } = user;
      rooms.push("5f32aa2af1f8167792e527f1");
      if(new_room!=false){
          rooms.push(new_room)
      }
      if(old_room){
        rooms = rooms.filter(room=>{
            return room != old_room;
        })
      }
      socket.emit('join_room', { room_id:user._id, _id:user._id })
      let key = {};
      for(let a = 0; a < rooms.length; a++){
          const room = rooms[a]

          const data = await chat_functions.get_room_details(room, user._id);
          
          if(data.success && data.hasOwnProperty('room')){
            const name = this.identify_room_name(user._id, data.room.members, data.room.is_public);
            data.room.name = name;
            key = Object.assign(key, {[room]:data.room})
            socket.emit('join_room', { room_id:room, _id:user._id })
            socket.emit('tell_me_who_is_online', { room_id:room, _id:user._id, i_am_online:true })
          }
      }
      admin_functions.set_up_room_details(key);
      this.setState({loading:false})
    }

    componentDidMount = async () => {
       await this.set_up_rooms();
        const { user } = this.props.admin;
        let { rooms } = user;
        rooms.push("5f32aa2af1f8167792e527f1");
        setInterval(()=>{
          rooms.forEach(room=>{
            socket.emit('tell_me_who_is_online', { room_id:room, _id:user._id, i_am_online:true })
          })
        }, 60000)
    }

    componentWillUnmount = () => {
      const { user } = this.props.admin;
      const { rooms } = user;
      rooms.forEach(room=>{
        socket.emit('tell_me_who_is_online', { room_id:room, _id:user._id, i_am_online:false })
      })
      this.setState({loading:true})
      for(let a = 0; a < rooms.length; a++){
          const room = rooms[a];
          socket.emit('leave_room', { room_id:room, _id:user._id })
      }       


    }


    change_search_mode = search_mode => {
        this.setState({search_mode});
    }

  render(){

    const { page, user, rooms_details, generated_room, okay_to_create, generated_room_raw } = this.props.admin;
    const { rooms } = user;
    const { loading, search_mode } = this.state;
    const { change_page } = admin_functions;

    return (
      <div className="home">
             {
            search_mode ? <Generated_rooms_handler search_mode={search_mode} change_search_mode={this.change_search_mode}
            set_up={this.set_up_rooms}
            generated_room_raw={generated_room_raw} rooms_details={rooms_details}
            generated_room={generated_room} okay_to_create={okay_to_create}/>
            : null
            }
            <Chat set_up_rooms={this.set_up_rooms} room_id={rooms[0]}/>
            <Room_display search_mode={search_mode} change_search_mode={this.change_search_mode} _id={user._id} user={user} loading={loading} rooms={rooms_details}/>

      </div>
    )
  }
}

class Generated_rooms_handler extends Component {

  state = {
    loading:false,
  }

  remove_from_room = (obj, push=false) => {
    const { rooms_details, generated_room } = this.props;
    const results = manage_room(rooms_details, generated_room, obj, push);
    admin_functions.change_attribute('generated_room', results.generated_room)
    admin_functions.change_attribute('generated_room_raw', results.generated_room_raw)
    admin_functions.change_attribute('okay_to_create', results.okay_to_create)
  }

  create_room = async () => {
    this.setState({loading:true})
      const { generated_room, generated_room_raw } = this.props;
      const sender = generated_room[0]._id;
      const to_send = generated_room_raw.filter(_id=>{
        return _id != sender;
      })

      const response = await chat_functions.create_room(sender, to_send)
      if(response.success){
          this.props.change_search_mode(false)
          await this.props.set_up(response.room_id);
          
          to_send.forEach(new_member=>{
            console.log(new_member)
            socket.emit('refresh_your_rooms_indiv', { room_id:response.room_id, _id:new_member, add:true });
          })



      }else {
        admin_functions.change_attribute('okay_to_create', -1)
      }
      this.setState({loading:false})

  }


  render(){

    const { generated_room, okay_to_create } = this.props;
    const { loading } = this.state;
    // console.log(generated_room, okay_to_create)
    return (
      <div className="chat_container_less">
        {
            loading ? 

            <div className="login_loading_container">
              <Loader type="Circles" color="#000" height={25} width={25} /> 
              <p>Creating room</p>
            </div> 
            
            : <div>
        <div className="flex_3">
          <h3>Generate new room</h3>
          <button onClick={()=>this.props.change_search_mode(false)}>Cancel</button>
        </div>
        <p>Search and add on the right panel. Final changes here.</p>

        {
          generated_room.map(person=>
          person.hasOwnProperty('user_name') ? 
            
          <div className="flex_3">
            <h2>{person.user_name}</h2>
            <button onClick={()=>this.remove_from_room(person)}>Remove account</button>            

          </div>
          
          : null
            )
        }

        <button onClick={this.create_room} disabled={!okay_to_create || !(generated_room.length > 1)}> Create chat room </button>
        {
          generated_room.length > 1 ?
          <p className="err_message"> {!okay_to_create ? "Either add or remove users to generate room. This error message indicates their is a duplicate room":null} </p>

          : null

        }  

        {
          <p className="err_message"> {okay_to_create==-1 ? "Unable to create room at the moment":null} </p>

        }            
            </div>
        }
      </div>
    )
  }
}

class Room_display extends Component {

    state = {
      delete_room : false,
      err:null,
      password:"",
      loading_2:false,
      show_pref:true,
    }

    change_attribute = (key) => {
        admin_functions.change_attribute('current_room', key);
    }

    summarize_key = (key, _id) => {
        let output_str = "";
        for(let a in key){
          if(a!=_id){
                output_str += key[a].user_name + " is " + (key[a].online ? "online " : "offline ");
            }
        }
        return output_str;
    }

    render_room_content = () => {
      const { rooms, _id } = this.props; 
      return (
        <div>
          {
            Object.entries(rooms).map(([key, value]) => 
                <div onClick={()=>this.change_attribute(key)} className="room_button">
                  <p>{value.name}</p>
                  <span className="timestamp">{this.summarize_key(value.key, _id)}</span>
                </div>
            )            
          }          
        </div>        
      )
    }

    delete_acc = async () => {
        this.setState({loading_2:true})
        const { _id, user  } = this.props; 
        let { password  } = this.state; 
        if(password!=""){

            for(let b = 0; b < user.rooms.length; b++){
                const temp_del = await chat_functions.leave_room(_id, user.rooms[b]);
                if(temp_del.success){
                    socket.emit('refresh_your_rooms', { room_id:user.rooms[b], _id:_id, add:false })
                }
            }
            password = encryption.encrypt(password);
            const response = await chat_functions.delete_account(_id, password);
            if(response.success){
              alert("Your account has been removed, have a good day!");
              admin_functions.add_details(null);
            }else {
              this.setState({err:response.message});
            }
        }
        this.setState({loading_2:false})
    }



    preferences_section = () => {
        const { user } = this.props;
        const { delete_room } = this.state; 
        const keys_to_display = ['user_name'];
        const keys_to_edit_but_hide = ['password'];
        const keys_to_edit = ['email', 'full_name'];

        return (
          <div className="reg_spacing">
              {
                keys_to_display.map(item=>
                  <p>{item}: {user[item]}</p>
                  )
              }
              {
                keys_to_edit_but_hide.map(item=>
                  <div>
                    <Change_this _id={user._id} text={item+": *******"} type="password" key_name={item}/>
                  </div>                  
                  )
              }
              {
                keys_to_edit.map(item=>
                  <div>
                    <Change_this _id={user._id} text={item+`: ${user[item]||'Not set'}`} type="text" key_name={item}/>
                  </div>                  
                  )
              } 
            <div className="flex_type">                
                    <button 
                    onClick={()=>admin_functions.add_details(null)}
                    className="send_button" >Logout</button> 
                    <button className="send_button" onClick={this.toggle_del} >{delete_room ? "Cancel":"Delete account"}</button> 

            </div>                                         
          </div>


        )

    }


    change_pass_val = ({target}) => {
      this.setState({password:target.value, err:null})
    }

    toggle_del = () => {
      this.setState({delete_room:!this.state.delete_room})
    }

    toggle_mode = () => {
      this.props.change_search_mode(!this.props.search_mode)
    }

    

    render(){

      const { loading, search_mode  } = this.props; 
      const { delete_room, err, password, loading_2, success, show_pref } = this.state;

      return (
        <div className="chat_container_less">
        <div className="flex_3">
          <h3>Preferences</h3>
          <button onClick={()=>this.setState({show_pref:!show_pref})}>Toggle preferences</button>          
        </div>
        {
          show_pref ? 
          
          <div>
            {this.preferences_section()}
 

          </div>
          
           : null
        }

                  {
                    delete_room ? 
                    <div >
                    <div className="flex_type">
                      <input value={password} onChange={this.change_pass_val} className="password_one" type="password" placeholder="Enter password to confirm"/>
                  <button disabled={loading_2} onClick={this.delete_acc}>{loading_2 ? 'Deleting...':'Delete!'}</button>
                    </div>
                    <p>You will be removed from all rooms including the chats on the public one as well. Thank you!</p>

                    </div>
                    
                    : null
                    } 

              <p className="err_message">{err}</p>
              <p className="success_message">{success}</p>

            <div className="flex_3">
              <h3>Rooms</h3>
                  <button onClick={this.toggle_mode}>{search_mode ? 'Existing rooms':'Add rooms'}</button>
            </div>
                  {

                    search_mode ? <Search_Mode /> : 
                    <div>
                      {
                        this.render_room_content()
                      }
                      {
                        loading ? 

                        <div className="login_loading_container">
                          <Loader type="Circles" color="#000" height={25} width={25} /> 
                          <p>Loading rooms</p>
                        </div> 
                        
                        : null
                      }                      
                    </div>

                  }
        </div>
      )
    }
}

class Change_this extends Component {

  state = {
    change:false,
    value: "",
    password:"",
    loading: false,
    success:"",
    err:null,
  }

  toggle = () => {
    this.setState({change:!this.state.change})
  }

  update = async () => {
    this.setState({loading:true})
    const { _id, key_name  } = this.props; 
    let { value, password  } = this.state; 
    if(password!="" && value!=""){
        if(key_name=='password'){
          value = encryption.encrypt(value)
        }
        const response = await chat_functions.update_key(key_name, value, encryption.encrypt(password), _id);
        if(response.success){

          this.setState({password:"", value:"", success:response.message, change:false});
          setTimeout(()=>{
            this.setState({success:""})
          }, 3000)

        }else {
          this.setState({err:response.message});
          if(response.logout){
            setTimeout(()=>{
              admin_functions.add_details(null);
            }, 3000)
          }
        }
    }else {
      this.setState({err:"Please give an input for both fields above"})
    }
    this.setState({loading:false})
  }

  change_input = ({target}) => {
    this.setState({value:target.value, err:null});
  }

  change_input_ps = ({target}) => {
    this.setState({password:target.value, err:null});
  }

  render(){

    const { change, loading, err, value, password, success } = this.state;
    const { key_name, type, text } = this.props;

    return (
      <div>
        <div className="flex_3">
            <p>{text}</p>  
            <button onClick={this.toggle} > {!change ? 'Change '+key_name :'Cancel key change'} </button>
        </div>
        {
          change ? <div>

              <input className="password_one" placeholder={"Set new "+key_name} value={value} type={type} onChange={this.change_input}/>
              <div className="flex_type">
                <input className="password_one" placeholder={"Enter password to confirm"} value={password} type={"password"} onChange={this.change_input_ps}/>
                <button onClick={this.update} disabled={loading || (value=="" || password=="") } >{loading ? 'Making changes...':'Proceed'}</button>
              </div>
          </div> : null
        }
        <p className="err_message">{err}</p>
        <p className="success_message">{success}</p>

      </div>
    )
  }

} 


const manage_state = state => ({
  admin: state.admin
})

export default connect(manage_state)(App);