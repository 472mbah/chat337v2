import store from '../store';
import actions from '../actions';

const state = (prop) => {
    return store.getState()[prop];
}


const change_page = page => {
    store.dispatch(actions.change_page(page))
}

const add_details = details => {
    store.dispatch(actions.add_details(details))
}

const set_up_room_details = rooms => {
    store.dispatch(actions.set_up_room_details(rooms))
}

const change_attribute = (key, value) => {
    store.dispatch(actions.change_attribute(key, value))
}

const push_message = message => {
    store.dispatch(actions.push_message(message))
}

const update_sent_messages = sent_messages => {
    store.dispatch(actions.update_sent_messages(sent_messages))
}


export default { state, change_page, add_details, 
    set_up_room_details, change_attribute, push_message, update_sent_messages }

