const moment = require('moment');

const generateMessage = (username,message) =>{
    const time = new Date().getTime();
    if(!message){
        return{username}
    }
    return{
        username,
        message,
        sentAt: moment(time).format("h:mm a")
    }
}

const generateLocationMessage = (username,url) =>{
    const time = new Date().getTime();
    return{
        username,
        url,
        sentAt: moment(time).format("h:mm a")
    }
}

module.exports = {generateMessage, generateLocationMessage};