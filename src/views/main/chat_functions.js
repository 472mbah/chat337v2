import axios from 'axios';

const domain = "https://CHAT33720.momodoubah1.repl.co/"; 

const get_room_details = async (room_id, user_id) => {

    const url_main = `${domain}rooms/get_room_by_id/${room_id}/${user_id}`;
    const response = await axios.get(url_main).then(res => 
        {return res.data}).catch(() => {
            return { success:false, message:"Unable to get details."}
    });


    return response;

}

const delete_account = async (_id, password) => {

    const url_main = `${domain}users/remove_account`;

    const body = { _id, password }

    const response = await axios.post(url_main, body).then(res => 
        {return res.data}).catch((e) => {
            console.log(e)
            return { success:false, message:"Unable to delete account, try again later."}
    });


    return response;

}

const update_key = async (key, value, password, _id) => {

    const url_main = `${domain}users/edit_details`;

    const body = { key, value, password, _id }

    const response = await axios.post(url_main, body).then(res => 
        {return res.data}).catch((e) => {
            return { success:false, logout:true, message:"Logging you out, either because you don't have an internet connection or becuase password entered was incorrect"}
    });


    return response;

}


const get_people = async (user_name) => {

    const url_main = `${domain}users/find_by_username/${user_name}`;
    const response = await axios.get(url_main).then(res => 
        {return res.data}).catch(() => {
            return { success:false, message:"Unable to get results at this time"}
    });


    return response;

}

const create_room = async (_id, members_add) => {

    const url_main = `${domain}rooms/create_room`;

    const body = { _id, members_add }

    const response = await axios.post(url_main, body).then(res => 
        {return res.data}).catch((e) => {
            return { success:false, message:"Unable to create room at this time, try again later."}
    });


    return response;

} 

const leave_room = async (_id, room_id) => {
    const url_main = `${domain}rooms/leave_room`;

    const body = { _id, room_id }

    const response = await axios.post(url_main, body).then(res => 
        {return res.data}).catch((e) => {
            return { success:false, message:"Unable to create room at this time, try again later."}
    });


    return response;

} 

const seen_message = async (_id, timestamp, person_id) => {
    const url_main = `${domain}rooms/seen_message`;

    const body = { _id, timestamp, person_id }

    const response = await axios.post(url_main, body).then(res => 
        {return res.data}).catch((e) => {
            console.log(e)
            return { success:false, message:"Unable to create room at this time, try again later."}
    });


    return response;

} 

const accept_room_request = async (_id, room_id) => {
    const url_main = `${domain}rooms/accept_room_request`;

    const body = { _id, room_id }

    const response = await axios.post(url_main, body).then(res => 
        {return res.data}).catch((e) => {
            return { success:false, message:"Unable to create room at this time, try again later."}
    });


    return response;

} 


export default {get_room_details, delete_account, update_key, get_people, create_room, leave_room, seen_message, accept_room_request};