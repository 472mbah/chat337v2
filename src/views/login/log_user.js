import axios from 'axios';

const domain = "https://CHAT33720.momodoubah1.repl.co/"; 


const log_user = async ({username, password}, login=true) => {

    const url_main = `${domain}users/${login ? 'login':'register'}`;
    const body = {
        user_name: username,
        password,
        email: null,
        full_name: null
    }
    const response = await axios.post(url_main, body).then(res => {
        return res.data}).catch(err => {
            console.log(err)
            return { success:false, message:"Unable to get details."}
    });
    return response;

}

export default log_user;