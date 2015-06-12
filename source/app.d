import vibe.d;

shared static this()
{
	auto router = new URLRouter;
	router.get("/",staticRedirect("/index.html"));
	router.get("/ws/chat",handleWebSockets(&websocket_chat));
	router.get("*",serveStaticFiles("public/"));

	auto settings = new HTTPServerSettings;
	settings.port = 8080;
	settings.bindAddresses = ["::1", "127.0.0.1"];
	listenHTTP(settings, router);

	logInfo("Please open http://127.0.0.1:8080/ in your browser.");
}

void websocket_chat(scope WebSocket socket)
{
	import std.json;
	static int connected_sockets = 0;
	static WebSocket[] socket_list;
	static JSONValue[] strokes;

	socket_list ~= socket;
	int id = connected_sockets++;
	logInfo("opened %s",id);
	foreach(s;strokes){
		socket.send(s.toString);
	}

	while(true){
		socket.waitForData();
		if(!socket.connected){
			break;
		}

		auto text = socket.receiveText;
		try{
			auto var = text.parseJSON;
			logInfo("json received. %s: %s",id,var);
			strokes ~= var;
			foreach(WebSocket s;socket_list){
				s.send(text);
			}
		}
		catch(JSONException exp){
			//just ignore
			logInfo("not json. %s: %s",id,text);
			continue;
		}
	}
	logInfo("closed %s",id);
}
