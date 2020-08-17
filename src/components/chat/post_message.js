import axios from 'axios';

const post_message = async (room_id, message) => {

    const url_main = `http://localhost:80/rooms/push_message`;
    const body =  { _id: room_id, message }

    const response = await axios.post(url_main, body).then(res => {
        return res.data}).catch(() => {
            return { success:false, message:"Unable to get details."}
    });
    return response;

}

export default post_message;