
// create new account button
const createBtn = document.getElementById('create-btn');
createBtn.addEventListener('click', (e)=>{
    let activeForm = document.querySelector('.overlay-form.active');
    activeForm.classList.remove('active');
    document.getElementById('create-form').classList.add('active');
});


function makeActiveServerLinks(tabLink){
    tabLink.addEventListener('click', (e)=>{
        let activeLink = document.querySelector('server-tab-link.active');
        if (activeLink) activeLink.classList.remove("active");
        e.target.classList.add("active");
        let server = e.target.dataset.serverName;

        let activeChannelTab = document.querySelector('.channel-tab.active');
        activeChannelTab.classList.remove('active');
        let channelTab = document.querySelector(`.channel-tab-container > [data-server="${e.target.dataset.server}"]`);
        channelTab.classList.add('active');
        let channel = channelTab.dataset.server;

        let activeChatMsgContainer = document.querySelector(`.chat-message-container.active`);
        activeChatMsgContainer.classList.remove('active');
        let chatMsgContainer = document.querySelector(`.chat-message-container[data-server="${server}"][data-channel="${channel}"]`);
        chatMsgContainer.classList.add('active');
        updateChannel();
    });
}

function makeActiveChannelLinks(channelTabLink){
    channelTabLink.addEventListener('click', e => {
        let activeLink = document.querySelector(`.channel-tab-link.active[data-server="${channelTabLink.dataset.server}"]`);
        activeLink.classList.remove('active');
        e.target.classList.add('active');

        // add active functionality to chat-message-container
        let activeChatMsgContainer = document.querySelector(`.chat-message-container.active[data-server="${channelTabLink.dataset.server}"]`);
        activeChatMsgContainer.classList.remove('active');
        let selectedChatMsgContainer = document.querySelector(`.chat-message-container[data-server="${channelTabLink.dataset.server}"][data-channel="${channelTabLink.dataset.channel}"]`);
        selectedChatMsgContainer.classList.add('active');

        // add active functionality to connected-users-tab
        let activeUsersTab = document.querySelector(`.connected-users-tab.active[data-server="${channelTabLink.dataset.server}"]`);
        activeUsersTab.classList.remove('active');
        let selectedUsersTab = document.querySelector(`.connected-users-tab[data-server="${channelTabLink.dataset.server}"][data-channel="${channelTabLink.dataset.channel}"]`);
        selectedUsersTab.classList.add('active');

        updateChannel();
    });
}


function appendMessage(message){
    let msgElement = createMsgDiv(message);
    let msgContainer = document.querySelector(`.chat-message-container[data-server="${message.serverName}"][data-channel="${message.recipientName}"]`);
    msgContainer.append(msgElement);
    msgContainer.scrollTop = msgContainer.scrollHeight;
}

function createMsgDiv(message){
    let msgElement = document.createElement('div');
    msgElement.classList.add('msg');

    let msgProfileImg = document.createElement('img');
    // msgProfileImg = msg.sender.profileImg;
    msgProfileImg.classList.add('msg-profile-img');

    let msgSender = document.createElement('h2');
    msgSender.innerHTML = message.sender;
    msgSender.classList.add('msg-sender');
    
    let msgTimestamp = document.createElement('h4');
    // msgTimestamp.innerHTML = message.timestamp.toLocaleString();
    let currentDate = new Date();
    if (currentDate.toLocaleDateString() == message.timestamp.toLocaleDateString) msgTimestamp.innerHTML = message.timestamp.toLocaleTimeString();
    else msgTimestamp.innerHTML = message.timestamp.toLocaleString();
    msgTimestamp.classList.add('msg-timestamp');

    let msgContent = document.createElement('p');
    msgContent.innerHTML = message.content;
    msgContent.classList.add('msg-content');

    msgElement.append(msgProfileImg, msgSender, msgTimestamp, msgContent);
    return msgElement;
}
let activeServer;
let activeChannel;

function updateChannel(){
    activeServer = document.querySelector('.server-tab-link.active');
    console.log(activeServer);
    console.log(activeServer.dataset.server);
    activeChannel = document.querySelector(`.channel-tab-link.active[data-server="${activeServer.dataset.server}"]`);
}

const socket = io('http://localhost:3000');

const loginForm = document.querySelector('#login-form');
const useridInput = document.querySelector('#userid-input');
const passwordInput = document.querySelector('#password-input');
const errorDisplay = document.querySelector('#error-msg');

function validateLogin(){
    let userid = useridInput.value;
    let password = passwordInput.value;

    if (userid == '' || password == '') errorDisplay.value = "Error: user id and/or password is empty";
    socket.emit('user-login-attempt', userid, password);
}

loginForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    validateLogin();
});

socket.on('login-attempt-denied', msg => {
    console.log(msg);
    errorDisplay.innerHTML = msg;
});

let currentUser;
socket.on('user-connected', (user, server) => {
    console.log('user-connected');
    console.log(user, server);
    currentUser = user;
    document.querySelector('.overlay.active').classList.remove('active');
    addServer(server);

});

socket.on('channel-msg', msg =>{
    console.log(`msg: ${msg}`);
    appendMessage(msg);
})

socket.on('user-joined-channel', (user, channelName)=> {
    addNewUserToChannel(user, channelName);

    // how to keep the user object for extra info that MYABE needed later.
});

const messageForm = document.querySelector('#message-form');
const messageInput = document.querySelector('#message-input');
const messageContainer = document.querySelector('#chat-message-container');

messageForm.addEventListener('submit', (e)=>{
    updateChannel();
    e.preventDefault();
    console.log(activeChannel);
    const message = {
        sender: currentUser.userid,
        content: messageInput.value,
        recipientType: 'channel',
        recipientName: activeChannel.dataset.channel,
        timestamp: new Date(),
        serverName: activeChannel.dataset.server,
    };
    console.log(message);
    appendMessage(message);
    socket.emit('send-channel-msg', message);
    messageInput.value = '';
});

// socket.on('chat-message', data => {
//     appendMessage(`${data.name}: ${data.message}`);
// });

// socket.on('user-connected', (user, server) => {
//     console.log(user, server);
// });

// socket.on('user-disconnected', name => {
//     appendMessage(`${name} has disconnected`);
// });

const serverTabs = document.querySelector('.server-tab');
const channelTabContainer = document.querySelector('.channel-tab-container');
const chatContainer = document.querySelector('.chat-container');
const servers = {};

function addServer(server, activeChannelIndex=0){
    servers[server.name] = server;
    // add Server
    let serverImg = document.createElement('img');
    serverImg.dataset.server = server.name;

    let activeServerImg = document.querySelector(`.server-tab-link.active`);
    if (activeServerImg) activeServerImg.classList.remove('active');

    serverImg.classList.add('server-img', 'server-tab-link', 'tab-link');
    serverImg.classList.add('active');
    serverImg.src = server.profileImg;
    serverTabs.append(serverImg);

    // add Channel Tab
    let activeChannelTab = document.querySelector('.channel-tab.active');
    if (activeChannelTab) activeChannelTab.classList.remove('active');
    let channelTab = document.createElement('div');
    channelTab.classList.add('channel-tab', 'tab', 'active');
    channelTab.dataset.server = server.name;
    channelTabContainer.append(channelTab);

    // add Channels
    let channels = server.channels;
    let channelNames = Object.keys(channels);
    for (let i=0; i<channelNames.length; i++) {
        let channel = channelNames[i];
        let currentChannel = channels[channel];
        if (i===activeChannelIndex) addChannel(currentChannel, true);
        else addChannel(currentChannel);
        // let channelDiv = document.createElement('div');
        // channelDiv.classList.add('channel-tab-link', 'tab-link');
        // if (i==activeChannelIndex) channelDiv.classList.add('active');
        // channelDiv.dataset.server = server.name;
        // channelDiv.dataset.channel = currentChannel.name;
        // channelDiv.innerHTML = currentChannel.name;
        // let channelTabSelected = document.querySelector(`.channel-tab[data-server="${server.name}"]`);
        // channelTabSelected.append(channelDiv);
        // makeActiveChannelLinks(channelDiv);

        // // add chat-message-container
        // let chatMsgContainer = document.createElement('div');
        // chatMsgContainer.classList.add('chat-message-container');
        // if (i==activeChannelIndex) chatMsgContainer.classList.add('active');
        // chatMsgContainer.dataset.server=server.name;
        // chatMsgContainer.dataset.channel=channel;
        // document.querySelector(`.chat-container`).append(chatMsgContainer);

        // // add messages in log to chat-msg-container.
        // // at most 50 recent msgs.
        // for (let i=Math.min(currentChannel.log.length-1, 50); i>=0; i--){
        //     let index = currentChannel.log.length-1-i;
        //     chatMsgContainer.append(createMsgDiv(currentChannel.log[index]));
        // }
    }

    // apply makeActive*Link function 
    makeActiveServerLinks(serverImg);
    
}

function addChannel(channel, active=false){
    let channelDiv = document.createElement('div');
    channelDiv.classList.add('channel-tab-link', 'tab-link');
    if (active) channelDiv.classList.add('active');
    channelDiv.dataset.server = channel.server;
    channelDiv.dataset.channel = channel.name;
    channelDiv.innerHTML = channel.name;
    console.log("serverName: "+channel.server);
    let channelTabSelected = document.querySelector(`.channel-tab[data-server="${channel.server}"]`);
    console.log("selected cahnnel tab: "+channelTabSelected);
    channelTabSelected.append(channelDiv);
    makeActiveChannelLinks(channelDiv);

    // add corresponding chat-message-container
    let chatMsgContainer = document.createElement('div');
    chatMsgContainer.classList.add('chat-message-container');
    if (active) chatMsgContainer.classList.add('active');
    chatMsgContainer.dataset.server=channel.server;
    chatMsgContainer.dataset.channel=channel.name;
    document.querySelector(`.chat-container`).append(chatMsgContainer);

    // add messages in log to chat-msg-container.
    // at most 50 recent msgs.
    for (let i=Math.min(channel.log.length-1, 50); i>=0; i--){
        let index = channel.log.length-1-i;
        chatMsgContainer.append(createMsgDiv(channel.log[index]));
    }

    // add corresponding connected-users-tab
    let usersTab = document.createElement('div');
    usersTab.classList.add('connected-users-tab', 'tab');
    if (active) usersTab.classList.add('active');
    usersTab.dataset.server = channel.server;
    usersTab.dataset.channel = channel.name;
    document.querySelector(`.connected-users-tab-container`).append(usersTab);
    let userNames = Object.keys(channel.users);
    userNames.forEach( userName => {
        addNewUserToChannel(channel.users[userName], channel.name);
    });
    
}

function addNewUserToChannel(user, channelName){
    console.log(`adding user to usersTab: ${user.userid}`);
     let userTabLink = document.createElement('div');
     userTabLink.classList.add('user-tab-link', 'tab-link');
     userTabLink.dataset.channel = channelName;
     userTabLink.dataset.userid = user.userid;
     userTabLink.dataset.firstName = user.firstName;
     userTabLink.dataset.lastName = user.lastName;
     userTabLink.dataset.email = user.email;
     userTabLink.innerHTML = user.userid;
     document.querySelector(`.connected-users-tab[data-channel="${channelName}"]`)?.append(userTabLink);
}