/************************

Shabab Islam
100815199
Used base code provided in tutorial 6, as well as makeBoard code 
provided by prof.

Request handler function has two major path checks:
	1. '/memory/intro'
		Checks to see if user[query.username] exists.
		If the user doesn't exist, create new client object,
		create new gameboard and send it to client side.
		If user exists, make a board that corresponds to
		his difficulty level and send that instead.
		Both statements also print a cheat board on console
		so it's easier to test out the game.
	
	2. '/memory/card'
		Looks for users[query.username] and retrieves the value
		of the card stored at [row,col]. Sends that back to client.
		
	3. Error checking:
		If requested page doesn't exist, redirect to 404 and send
		corresponding code back to server. Didn't really change anything
		here.
		

*************************/
//An asynchronous server that serves static files

// load necessary modules
var http = require('http');
var fs = require('fs');
var mime = require('mime-types');
var url = require('url');
const ROOT = "./public_html";

var users = {};
var client;

const ROOT = "./public_html";

// create http server
var server = http.createServer(handleRequest); 
server.listen(2406);
console.log('Server listening on port 2406');

function makeBoard(size){
	//assume size%2==0
	items = [];
	for(var i=0;i<(size*size)/2;i++){
		items.push(i);
		items.push(i);
	}

	board = [];
	for(var i=0;i<size;i++){
		board[i]=[]
		for(var j=0;j<size;j++){
			var r = (Math.floor(Math.random()*items.length));
			board[i][j]= items.splice(r,1)[0];  //remove item r from the array
			
		}
	}
	return board;
}



function handleRequest(req, res) {
	
	//process the request
	console.log(req.method+" request for: "+req.url);
	
	//parse the url
	var urlObj = url.parse(req.url,true);
	var filename = ROOT+urlObj.pathname;

		
	//the callback sequence for static serving...
	fs.stat(filename,function(err, d){
		if(urlObj.pathname === '/memory/intro'){
			if(!users[urlObj.query.username]){				
				client = {gameBoard: makeBoard(4)};
				client.level = 0;
				console.log("Board layout --- use this to cheat :D ");
				for(var i = 0;i<client.gameBoard.length;i++){		
					for(var j = 0;j<client.gameBoard.length;j++){		
						if(j%client.gameBoard.length==0){
							process.stdout.write('\n');
						}				
						process.stdout.write(client.gameBoard[i][j].toString()+" ");					
					}		 
				}
				client.level+=2;
				process.stdout.write('\n\n');
				users[urlObj.query.username] = client;
				respond(200,JSON.stringify(client));
			} else {
				client = users[urlObj.query.username];
				
				//capping player level so that max board is 8x8. 	
				if(client.level+4>8){
					client.level = 4;
				}								
				client.gameBoard = makeBoard(4+users[urlObj.query.username].level);
				console.log("Board layout --- use this to cheat :D ");
				for(var i = 0;i<client.gameBoard.length;i++){		
					for(var j = 0;j<client.gameBoard.length;j++){		
						if(j%client.gameBoard.length==0){
							process.stdout.write('\n');
						}				
						process.stdout.write(client.gameBoard[i][j].toString()+" ");					
					}		 
				}
				process.stdout.write('\n\n');
				users[urlObj.query.username] = client;
				respond(200,JSON.stringify(client));				
			}
		}	
		else if(urlObj.pathname === '/memory/card'){
			//get user and his cards
			client = users[urlObj.query.username];
			var resObj = client.gameBoard[urlObj.query.row][urlObj.query.col].toString();
			respond(200,resObj);			
		}
		else if(err){   //try and open the file and handle the error, handle the error
			respondErr(err);
		}else{
			if(stats.isDirectory())	filename+="/index.html";
		
			fs.readFile(filename,"utf8",function(err, data){
				if(err)respondErr(err);
				else respond(200,data);
			});
		}
	});			
	
	//locally defined helper function
	//serves 404 files 
	function serve404(){
		fs.readFile(ROOT+"/404.html","utf8",function(err,data){ //async
			if(err)respond(500,err.message);
			else respond(404,data);
		});
	}
		
	//locally defined helper function
	//responds in error, and outputs to the console
	function respondErr(err){
		console.log("Handling error: ",err);
		if(err.code==="ENOENT"){
			serve404();
		}else{
			respond(500,err.message);
		}
	}
		
	//locally defined helper function
	//sends off the response message
	function respond(code, data){
		// content header
		res.writeHead(code, {'content-type': mime.lookup(filename)|| 'text/html'});
		// write message and signal communication is complete
		res.end(data);
	}	
	
};//end handle request



