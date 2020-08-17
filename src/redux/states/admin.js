
const admin = (state={page:1, user:null, rooms_details:{},
     current_room:"5f32a4fc7a25325b2c951a2d", sent_messages:[], generated_room:[], okay_to_create:false, 
    generate_room_raw:[]}, action) => {
    switch(action.type){
            //setup of page
        case 0:
            return { ...state, page:action.props.page }
            //setup of the user details  
        case 1:
            return { ...state, user:action.props }
            // setup of the rooms
        case 2:
            return { ...state, rooms_details:action.props}

        case 3:
            return { ...state, [action.props.key]:action.props.value }

        case 4:
            const message =  action.props;
            state.rooms_details[message.room_id].chats.push(message);
            return { ...state, rooms_details:state.rooms_details }

        case 5:
            state.sent_messages = action.props.sent_messages;
            return { ...state };
                             
        default:
            return state
    }
}

const temp_user = {
    user_name:"472mbah",
    full_name:"Momodou Bah",
    _id:"5f36dd5a86265165ec022bff",
    email:"google.co.uk",
    password:null,
    rooms:["5f32aa2af1f8167792e527f1", "5f37a237f94ce134445345d5"],

}   

export default admin;
