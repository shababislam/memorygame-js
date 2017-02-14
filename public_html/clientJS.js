/**************************
Shabab Islam
100815199

sendReq()
	Runs on page load, prompts for user name and starts new game.
	
newGame()
	Sends GET request to server with the name of person
	and when done, displays board with data recieved from
	server.
	
displayGame(d)
	Takes a 2d array as input parameter, loops through and
	creates divs with unique ids for each of the cards.
	
	Appends click function to each 'card' div.
	
	'record' var keeps track of matched/inactive cards.
	IF record array is populated, then displayGame also 
	'unflips' the cards.
	
clickTile()
	Game logic function. Long function, so all the comments
	are in the function itself.
	

***************************/

var person; //not godzilla. definitely not godzilla. 
var clicked = {}; //json obj to check if card has been clicked or not
var board = [[],[]]; //board copy
var prev = null; //prev card
var prevID;	//prev card ID
var record = []; //array of inactive cardIDs
var record1 = {}; //JSON obj of inactive/matched cardIDs and their values
var notMatch; //value to keep track of unmatched attempts
var count = 0;

function sendReq(){
	person = prompt("Enter your name: ","Boaty McBoatFace");
	if(person!== null){
		newGame();
	}
}

function newGame(){
	notMatch = 0;
	record = [];
	record1 = {};
	$.get('/memory/intro',{username: person})
	.done(function(data){
		alert("Hey "+person+"!");
		var newBoard = JSON.parse(data);
		board = newBoard.gameBoard;
		displayGame(board);
	});	
}

function displayGame(d){	
	$("#userPrompt").empty();
	$("#gameboard").empty();

	$("#gameboard").append("<tr>");
	for (var i = 0;i<d.length;i++){
		for(var j = 0;j<d.length;j++){

			if(j%d.length===0){
				$("#gameboard").append("<br>");
			}
			
			$("#gameboard").append("<div id="+i+"_"+j+" class='tile' style='background-color:"+d[i][j]+"; '></div>");

			clicked[i+"_"+j] = false;
			$("#"+i+"_"+j).click(clickTile);
			prev = null;
		}
	}
	if(record.length!=0){
		for (var k = 0;k<record.length;k++){
				$("#"+record[k]).append("<p>"+record1[record[k]]+"</p>");
				document.getElementById(record[k]).className = "tileFlipped";
		}
	}
	$("#gameboard").append("</tr>");
}


function clickTile(){
	var _choice = $(this).attr('id'); //grabs id of clicked box
	if(!record1[_choice]){ /* checks if clicked card is active or not */
		vals = _choice.split("_");
		x = vals[0]; /* row */
		y = vals[1]; /* column */
		count++; /* keep track of click count */

		$.get('/memory/card',{username: person, row: x, col: y}) /* GET req with username, row and column indices */
		.done(function(data){
			if(clicked[_choice] === false){ 
				clicked[_choice] = true;
				if(prev){ /* check if there's a previously clicked button */						
					if(count===2){ 
						count = 0;
					} 
					if(prev === data && prevID !=_choice){ /* if the prev card matches current card AND we're not just clicking the same card twice */
						record.push(prevID);  /* keeping track of ids and active/inactive cards */
						record.push(_choice);
						record1[_choice] = data;
						record1[prevID] = prev;	
						if(record.length === (board.length*board.length)){  /* check if all cards are unflipped */
							alert("You won! Number of matching attempts: "+notMatch);
							newGame();
						}
					}
					if(!(prev === data && prevID !=_choice)){ 
						notMatch++; /* keep track of number of flipping attempts */
					}
					
					$("#"+_choice).empty(); 
					$("#"+_choice).append("<p>"+data+"</p>"); /* append the actual value of the card to div */
					prev = null;
					prevID = null;
				
				} else {
					displayGame(board); 
					$("#"+_choice).append("<p>"+data+"</p>");
					prev = data;
					prevID = _choice;
				}
			}
		document.getElementById(_choice).className = "tileFlipped"; //set the class of flipped card
			
		});
	}
	
}

