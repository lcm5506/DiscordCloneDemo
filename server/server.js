const io = require('socket.io')(3000, {
    cors: {
        origin: "http://127.0.0.1:5500",
        methods: ["GET", "POST"]
      }
});

// users is a map with userid as keys and user obj as value
const users = new Map();
users.set('admin', { 
    userid: 'admin', 
    password: 'admin', 
    firstName: 'Admin', 
    lastName: 'Test', 
    email: 'admin@test.com', 
    channels: [],
});
users.set('lcm5506', { 
    userid: 'lcm5506', 
    password: 'lcm5506', 
    firstName: 'Charles', 
    lastName: 'Lee', 
    email: 'lcm5506@test.com', 
    channels: [],
});
users.set('c57lee', { 
    userid: 'c57lee', 
    password: 'c57lee', 
    firstName: 'Charlie', 
    lastName: 'Mongster', 
    email: 'c57lee@test.com', 
    channels: [],
});

const onlineUsers = [];

/* channel obj = {
    name: channel name,
    users: [array of usernames who joined this channel currently],
    subgroup: 'subgroup name for the channel. ie. general chat channel under group 'Community Conversations'',
    slowModeTimer: -1 if disabled, and if 20 then users can send msg only every 20 seconds

}
*/
let serverName = 'Test Server For Noobs';
let serverAdmins = ['admin', 'lcm5506',];
let serverProfileImg = 'https://www.freepnglogos.com/uploads/javascript-png/javascript-logo-transparent-logo-javascript-images-3.png';
const connectedUsers = [];
const channels = {};
let newUserCounter = 0;
let randomAnimalNames = ['Bear', 'Camel', 'Zebra', 'Dog', 'Fox', 'Horse', 'Cheetah', 'Elephant', 'Giraffe', 'Tiger', 'Goat', 'Lion', 'Pnather', 'Leopard', 'Turtle', 'Turoise', 'Crocodile', 'Porcupine', 'Alligator', 'Armadillo', 'Goose', 'Beaver', 'Hawk', 'Chihuahua', 'Cobra', 'Kangaroo', 'Eagle'];
// test data
channels['channel first'] = {channelid: 1,name: 'channel first', users: {}, log: [{content: 'HELLO MY WORLD', timestamp: new Date(2022, 8, 22, 15, 20, 33, 33), sender: 'admin'}], server: serverName, defaultConnection: true};
channels['channel second'] = {channelid: 2, name: 'channel second', users: {}, log: [
    {content: 'HELLO MY WORLD', timestamp: new Date(2022, 8, 22, 15, 20, 33, 33), sender: 'admin', }, 
    {content: 'HELLO MY WORLD', timestamp: new Date(2022, 8, 22, 15, 21, 33, 33), sender: 'c57lee', }, 
    {content: 'HELLO MY WORLD', timestamp: new Date(2022, 8, 22, 15, 22, 33, 33), sender: 'lcm5506', }], 
    server: serverName, defaultConnection: true};
channels['optional channel'] = {channelid: 3, name: 'optional channel', users: {}, log: [], server: serverName, defaultConnection: false};

io.on('connection', (socket)=>{
    console.log(`${socket.id} connected`);
    let user;

    socket.on('new-user', userdata => {
        console.log(`new user registered`);
        users.set(userdata.userid, userdata);
        user = JSON.parse(JSON.stringify(userdata));
        delete user.password;
        socket.join(userdata.userid);
        Object.keys(channels).forEach((value,index) => {
            if (channels[value].defaultConnection){
                joinChannel(value, userdata.userid);
                // socket.join(value);
                // channels[value].users.set(user.userid, user);
                // socket.broadcast.emit('user-joined-channel', user, value);  
            }
        });
        socket.emit('user-connected', user, {name: serverName, admins: serverAdmins, profileImg: serverProfileImg, channels: channels})
    });

    socket.on('new-user', socket => {
        // Generate random userid
        newUserCounter++;
        let randomName = randomAnimalNames[Math.floor(Math.random() * (randomAnimalNames.length - 1))];
        let randomUserId = `${randomName}${newUserCounter.toString(16)}`;
        console.log(`new user connected with randomly generated userid ${randomUserId}`);

        // create temporary user object with random user id
        user = {
            userid: randomUserId,
        }

        connectedUsers.push(user.userid);
        Object.keys(channels).forEach((value) => {
            if (channels[value].defaultConnection) {
                joinChannel(value, user.userid);
            }
        });

        socket.emit('user-connected', user, {name: serverName, admins: serverAdmins, profileImg: serverProfileImg, channels: channels});
    });

    socket.on('user-login-attempt', (userid, password) => {
        console.log(`login attempted: ${userid}, ${password}`);
        console.log('keys: ' + users.keys());
        if (!users.has(userid)) {
            console.log('login denied: invalid userid');
            socket.emit('login-attempt-denied', 'User ID is invalid.');
        }
        else if (users.get(userid).password !== password) {
            console.log('login denied: invalid password');
            socket.emit('login-attemp-denied', "Password is invalid.");
        } 
        else {
            console.log('user validated and logged in');
            user = JSON.parse(JSON.stringify(users.get(userid)));
            delete user.password;
            console.log("password: "+user.password);
            console.log("stored password: "+ users.get(userid).password);
            
            socket.join(user.userid);
            Object.keys(channels).forEach((value,index) => {
                joinChannel(value, user.userid);
                // socket.join(value);
                // channels[value].users[user.userid] = user;
                // socket.broadcast.emit()
            });
            socket.emit('user-connected', user, {name: serverName, admins: serverAdmins, profileImg: serverProfileImg, channels: channels});
            if (user.friends) user.friends.forEach(friendId=> socket.to(friendId).emit('friend-login-notification', user.userid, profilePicture, profileName));
            // if (user.channels) user.channels.forEach(channelId => socket.join(channelId));
        }
    });

    socket.on('join-channel', (channelId) => {
        joinChannel(channelId, user.userid);
    });

    function joinChannel(channelId, userid){
        let user = users.get(userid);
        socket.join(channelId);
        socket.to(channelId).emit('user-joined-channel', user, channelId);
        user.channels.push(channelId);
        channels[channelId].users[userid] = user;
    }
    /* msg object = {
        sender: userid,
        content: msg content,
        attachment: files, imgs, ...,
        recipient type: user, channel, server,
        recipient name: userid, channelid, servername,
        timestamp: time @ msg sent
    }
    */
    socket.on('send-global-msg', msg => {
        socket.broadcast.emit('global-msg', msg);
    });

    socket.on('send-channel-msg', msg => {
        channels[msg.recipientName].log.push(msg);
        socket.to(msg.recipientName).emit('channel-msg', msg);
    });

    socket.on('send-personal-msg', msg => {
        socket.to(msg.recipientName).emit('personal-msg', msg);
    });

    socket.on('send-notification', (notificationType, notificationMsg, notificationTarget) => {
        if (notificationTarget == 'everyone') socket.braodcast.emit('notification', notificationType, notificationMsg);
        else if (Object.keys().includes(notificationTarget)) socket.to(notificationTarget).emit('notification', notificationType, notificationMsg);
        else socket.to(notificationTarget).emit('notification', notificationType, notificationMsg);
    });

    socket.on('disconnect', () => {

    });
});