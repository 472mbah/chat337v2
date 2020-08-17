import React, { Component} from 'react';
import chat_functions from './chat_functions'; 
import Loader from 'react-loader-spinner';
import admin_functions from '../../redux/reducers/admin';
import { connect } from 'react-redux'
import manage_room from './manage_room';

class Search_Mode extends Component {

    state = {
      value:"",
      loading:false,
      results: [],
      generated_room:[],
      okay_to_create:false,
    }

    search_users = async () => {
      const { value } = this.state;
      this.setState({loading:true});
      const response = await chat_functions.get_people(value);
      if(response.success && response.hasOwnProperty('results')){
          this.setState({results:response.results});
      }
      this.setState({loading:false});
    }

    change_value = ({target}) => {
        this.setState({value:target.value})
    }


    add_to_room = (obj, push=true) => {
        const { rooms_details, generated_room } = this.props.admin;
        const results = manage_room(rooms_details, generated_room, obj, push);

        admin_functions.change_attribute('generated_room', results.generated_room)
        admin_functions.change_attribute('generated_room_raw', results.generated_room_raw)
        admin_functions.change_attribute('okay_to_create', results.okay_to_create)
    }

    componentDidMount = () => {
        const { _id } = this.props.admin.user;
        admin_functions.change_attribute('generated_room', [{_id}])
        admin_functions.change_attribute('generated_room_raw', [_id])
    }

    render(){
      const { generated_room_raw } = this.props.admin;
      const { value, loading, results } = this.state;

      return (
        <div>

            <div className="flex_type">
                <input value={value} onChange={this.change_value} className="password_one" placeholder="Search for users"/>
                <button onClick={this.search_users}>Search</button>
            </div>

            {
                  loading ? 

                  <div className="login_loading_container_3">
                    <Loader type="Circles" color="#000" height={25} width={25} /> 
                    <p>Searching...</p>
                  </div> 
                        : null
                }

            {
              results.length == 0 && value!="" ? <p>No results yet</p> : results.length > 0 ?  <div>

                {
                  results.map(person=>
                    <div onClick={()=>null} className="room_button">
                      <p>{person.user_name}</p>
                      <span className="timestamp">{person.full_name}</span>
                      {
                          generated_room_raw.indexOf(person._id) == -1 ? <button onClick={()=>this.add_to_room(person)}>Add to room</button> : null
                      }
                    </div>                    
                  )
                }
                 
              </div> : null
            }

        </div>
      )
    } 

}

const map_state = state => ({
    admin : state.admin,
})

export default connect(map_state)(Search_Mode);

