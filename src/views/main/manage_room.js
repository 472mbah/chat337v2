export default (rooms_details, generated_room, obj, push=true) => {
    let create_room = true; 
    delete rooms_details['5f32aa2af1f8167792e527f1'] ;

    const room_keys = Object.keys(rooms_details);

    for(let a = 0; a < room_keys.length; a++){
        let gen_2 = JSON.parse(JSON.stringify(generated_room));
        
        if(!create_room){
          break;
        }

        if(push){
            gen_2.push(obj); //array_obj
        }else {
            gen_2 = gen_2.filter(person=>{
              return person._id != obj._id;
            })
        } 

        const { key } = rooms_details[room_keys[a]];
        const members_here = Object.keys(key); //array_ids
        if(gen_2.length > members_here.length){
            create_room = true;
        }else {
          let count = 0;
          gen_2.forEach(person=>{
              if(members_here.indexOf(person._id)!= -1){
                count++;
              }              
          })
          create_room = count != members_here.length;  

        }        
    }

    if(push){
      generated_room.push(obj); //array_obj
  }else {
      generated_room = generated_room.filter(person=>{
        return person._id != obj._id;
      })
  } 

    let raw = [];
    generated_room.forEach(item=>{
        raw.push(item._id);
    }) 

    return { 
        generated_room, generated_room_raw:raw, okay_to_create:create_room
    }
}