
const change_page = (page) => ({
    type:0,
    props:{page}
})

const add_details = user => ({
    type:1,
    props:user
})

const set_up_room_details = rooms => ({
    type:2,
    props:rooms,
})

const change_attribute = (key, value) => ({
    type:3,
    props:{key, value},
})

const push_message = message => ({
    type:4,
    props:message,
})

const update_sent_messages = sent_messages => ({
    type:5,
    props:{sent_messages},    
}) 

export default { add_details, change_page, set_up_room_details,
     push_message, change_attribute, 
     update_sent_messages
    }