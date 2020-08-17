import React from 'react';
import moment from 'moment';
import socket from '../../socket';
import { animateScroll } from "react-scroll";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner';
import post_message from './post_message';
import admin_functions from '../../redux/reducers/admin'; 
import chat_functions from '../../views/main/chat_functions'; 
import { connect } from 'react-redux';


class Message_Input extends React.Component {

    state = {
        loading : false,
    }

    recieve_message = socket.off('user_typing').on('user_typing', data=> {
        let { current_room, rooms_details } = this.props.admin;
        const room = rooms_details[current_room];
        if(current_room == data.room_id && room!=undefined){
            const { key } = room;
            const temp_message = key[data._id] + " is typing..."
            this.setState({temp_message});
            setTimeout(()=>{
                this.setState({temp_message:null});
            }, 2000)
        }
    })

    socket_confirm_join = socket.off('confirm_enter_or_leave').on('confirm_enter_or_leave', data=> {
        let { current_room, rooms_details } = this.props.admin;
        const room = rooms_details[current_room];
        if(current_room == data.room_id && room!=undefined){
            const { key } = room;
            const temp_message = key[data._id] + " has " + ( data.join ? "joined ":"left" ) + " the room."
            this.setState({temp_message});
            setTimeout(()=>{
                this.setState({temp_message:null});
            }, 2000)            
        }
    })

    state = {
        active : false,
        hover : 0,
        value: null,
        latest_time_stamp:null,
        // temp_message:"Ryan smith is typing..."
        temp_message:null
    }

    send_message = async () => {
        const { _id } = this.props.user;
        const { value } = this.state;
        if(value!=null){ 
            let { current_room, sent_messages } = this.props.admin;
            const timestamp = new Date().getTime();
            sent_messages.push(timestamp);
            admin_functions.update_sent_messages(sent_messages);
            this.setState({latest_time_stamp:timestamp});            
            let obj_message = {
                message: value,
                from:_id,
                timestamp:timestamp,
                room_id:current_room,
            }
            socket.emit("send_message", obj_message)
            this.setState({value:""})
            const chat_box = document.getElementsByClassName("chat_box");
            chat_box.scrollTop = chat_box.scrollHeight
            delete obj_message.room_id;
            const send_response = await post_message(current_room, obj_message);
            if(send_response.success && send_response.hasOwnProperty('confirmed')){
                const new_array = this.filter_out(sent_messages, send_response.confirmed);
                admin_functions.update_sent_messages(new_array);
            }
        }
    }

    filter_out = (array, _id) => {
        return array.filter(item=>{
            return item != _id;
        })
    }

    scrollToBottom() {
        animateScroll.scrollToBottom({
          containerId: "chat_box"
        });
    } 

    componentDidUpdate() {
        this.scrollToBottom();
    }

    componentDidMount = () => {
        this.scrollToBottom();        
    }






    change = (e) => {
        const { _id } = this.props.user;
        const { current_room } = this.props.admin;
        const { value } = e.target;

        let typing_regex = /\s/
        if(typing_regex.test(value)){
            socket.emit("typing", {_id, room_id:current_room})
        }

        let wsRegex = /^\s*\s*$/
        const new_string = value.replace(wsRegex, '')
        if(new_string!=""){
            this.setState({value})
        }else {
            this.setState({value:null})
        }
    }



    when = (time) => {

        // const date = moment(time).format('L'); 
        const date = new Date(time)
        const str_form = date.toLocaleDateString()+"::"+date.toLocaleTimeString()
        return moment(date, "DD/MM/YYYY::HH:mm:SS").fromNow();     
    } 

    map_message_status = status => ({
        opacity:status<1 ? '0.6':'1',
        width:'100%',
        marginBottom:'1em' 
    })

    // in members obj, each member will have missed array which 
    // when message is sent will push the _id of the new message being 
    // sent into all participants but the person who sent it
    // person who recieves it, when they see the message can undo the previous 
    // operation by making that array empty   

    interpret_status = timestamp => {
        const { sent_messages } = this.props.admin;
        if(sent_messages.indexOf(timestamp)==-1){
            return {message:"Sent", style: {opacity:'1', width:'100%', marginBottom:'1em'}};
        }else {
            return {message:"Sending...", style:{opacity:'0.6', width:'100%', marginBottom:'1em'}}
        }

    }

    accept = async () => {
        this.setState({loading:true})
        let { current_room, rooms_details, user } = this.props.admin;
        const response = await chat_functions.accept_room_request(user._id, current_room);
        if(response.success){
            rooms_details[current_room].send_accept_request = false;
            admin_functions.change_attribute('rooms_details', rooms_details);
            
        }else {
            alert("Unable to accept at this time, try again later.")
        }
        this.setState({loading:false})
    }

    reject = async () => {
        this.setState({loading:true})
        const { current_room, rooms_details, user } = this.props.admin;
        const response = await chat_functions.leave_room(user._id, current_room);
        if(response.success){
            await this.props.set_up_rooms(false, current_room);
            socket.emit('refresh_your_rooms', { room_id:current_room, _id:user._id, add:false })
        }else {
            alert("Unable to reject at this time, try again later.")
        }
        this.setState({loading:false})
    }



    render() {

        const { rooms_details, admin } = this.props;
        const { current_room, sent_messages } = admin;
        const { value, temp_message, loading } = this.state;
        const room = rooms_details[current_room];
        // console.log(sent_messages)
        return(
            <div className="chat_container">
                {
                    room != undefined   ? <div>{
                        
                         room.send_accept_request ? <div className="login_loading_container_2">

                            Accept room request?
                            <button disabled={loading} onClick={this.accept}>Accept</button>
                            <button disabled={loading} onClick={this.reject}>Reject</button>

                        </div> : 
                        <div>

                        <div id="title_chat_container">
                            <p id="chat_username_title">{room.name}</p> 
                            <p className="timestamp">{temp_message||room.members.length+" people in chat room"}</p>
                            {
                                !room.is_public ? 
                                <button disabled={loading} onClick={this.reject}>Leave room</button>
                                : null 
                            }                                        
                        </div> 

                        <div id='chat_box' ref={chat_box => (this.chat_box = chat_box)} className="chat_box">
                            
                            {
                                room.chats.map(chat=>
                                     
                                    {
                                        const data = this.interpret_status(chat.timestamp||0);
                                            return (
                                                <div style={data.style}>
                                                <span>{room.key[chat.from].user_name||"Unkown"}</span>
                                                <p>{chat.message}</p>
                                                <div className="chat_baseline">
                                                    <p className="timestamp">{this.when(chat.timestamp)}</p>                                        
                                                    <p className="timestamp">{data.message}</p>                                        
                                                </div>
                                            </div>
    
                                            )
                                        }
                                    )
                            }
                        </div>
                        <div >
                    <textarea className="chat_text_input" 
                    placeholder={"Enter message here"}  
                    value={value} onChange={this.change}/>

                    <div className="send_button_container">
                    <button disabled={value==null || value==""} className="send_button" onClick={this.send_message}>
                        Send
                    </button>                    

                    </div>
                </div>

                    </div>
                        
                        
                        }</div> : <div>


                    <div className="login_loading_container_2">
                        <Loader type="Circles" color="#000" height={25} width={25} /> 
                        <p>Waiting for room data...</p>
                    </div> 


                    </div>
                }



 
            </div>
        )
    }


 
}

const map_state = state => ({
    user: state.admin.user,
    rooms_details : state.admin.rooms_details,
    admin : state.admin,
    state: state,
})

export default connect(map_state)(Message_Input);