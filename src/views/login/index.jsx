import React, { Component } from 'react';
import encryption from './encryption';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner';
import admin_functions from '../../redux/reducers/admin';
import log_user from './log_user';

class Login extends Component {

    state = {
        login:true,
        loading:false,
        form: { username:null, password:null, password_confirm:null },
        err:null,
    }

    render_input_containers = () => {

        const { form, login, loading } = this.state;

        if(loading){

            return (
                <div className="login_loading_container">
                    <Loader type="Circles" color="#000" height={25} width={25} /> 
            <p>{login ? "Logging in":"Creating account for"} {form.username}</p>
                </div>                
            )
           
        }else {
            let output_arr = [];

            for(let key in form){
                output_arr.push(
                    <input type={key.includes("password")?"password":"text"} onChange={(e)=>this.change_input(e, key)} disabled={loading} key={key} placeholder={"Enter "+key} />
                )
            }
    
            if(login) output_arr = output_arr.slice(0, 2);
    
    
    
            return <div className="login_box_inputs">
                {
                    output_arr.map((item, index)=>item)
                }
            </div>;
    
        }


    }

    is_proceed_disabled = () => {
        const { form } = this.state;
        let null_entries = 0;

        for(let key in form){
            null_entries = form[key]==null ? null_entries+1 : null_entries;
        }

        return null_entries!=0
        
    }

    click_proceed = async () => {
        let { form, login } = this.state;
        const { password, password_confirm } = form;
        this.setState({loading:true})
        if(login){
            form.password_confirm = form.password;
        }
        if(password==password_confirm){
            form.password = encryption.encrypt(form.password);
            this.setState({err:null})
            const response = await log_user(form, login);
            if(response.success && response.hasOwnProperty('data') && response.data != null && response.data != undefined ){
                admin_functions.add_details(response.data)
            }
            else {
                this.setState({err:response.message})
            }
        }else {
            this.setState({err:"Ensure both passwords match"})
        }
        this.setState({loading:false})
        
    } 

    toggle = () => {
        let { login } = this.state;
        this.setState({login:!login})
        if(login){
            alert("Passwords are encrypted, but since the source code for this application is public, they can be decrypted easily. Thank you.")
        }
    }

    change_input = ({target}, key) => {
        const { form, login } = this.state;
        const { value } = target;
        const actual_val = value=="" ? null : value
        form[key] = actual_val;
        if(login && key=='password'){
            form.password_confirm = actual_val;
        }
        
        this.setState({form})
    }

    render(){

        const { login, loading, err } = this.state;
        const not_proceed = loading || this.is_proceed_disabled();
        


        return(
            <div className="login_container">
                <p className="logo_main">CHAT337</p>
                {this.render_input_containers()}
                <div className="instead_button_container">


                    <button className={loading ? "instead_button_dis":'instead_button'} disabled={loading} onClick={this.toggle} >{login ? 'Register':'Login'} instead</button>
                    

                    
                    <button onClick={this.click_proceed} id={not_proceed ? null:"proceed_button"} 
                        disabled={not_proceed} className={not_proceed ? "instead_button_dis":'instead_button'}>
                        {login? 'Login':'Register'}
                    </button>

                </div>
                <p className="err_message">{err}</p>

            </div>
        )
    }
}

export default Login;