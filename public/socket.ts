var socket:WebSocket;
function Connect() {
    socket = new WebSocket("ws://127.0.0.1:8080/ws/chat");
    socket.onmessage = function (message) {
        console.log(message);
        console.log(message.data);
        var mes = JSON.parse(message.data);
        document.getElementById("chat_data").innerHTML += mes.name + ": " + mes.text + "\n";
    };
    socket.onopen = function () {
        socket.send(JSON.stringify({ name: GetName(), text: "が入室しました" }));
        console.log("sock opened");
        console.log(socket);
    };
    socket.onclose = function () {
        console.log("closed");
    };
}
function Send() {
    var input_text = (<HTMLInputElement> document.getElementById("chat_input")).value;
    console.log(input_text);
    socket.send(JSON.stringify({ name: GetName(), text: input_text }));
}
function GetName() {
    var query_string = window.location.search.slice(1);
    var queries = query_string.split("&");
    var query_hash = [];
    for (var i = 0; i < queries.length; i++) {
        var key_value = queries[i].split("=");
        query_hash[key_value[0]] = key_value[1];
    }
    return decodeURI(query_hash["user_name"]);
}