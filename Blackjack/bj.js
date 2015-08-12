/**
	Blackjack by Roi Dayan
**/

//GLOBALS
var VERSION = "0.6";

//CARDS
var SUITE =  [ 'Club', 'Spade', 'Diamond', 'Heart' ];
var CARDS_IN_SUITE = 13;
var CARDS_IN_DECK = SUITE.length * CARDS_IN_SUITE;
var CARD = [ 'ace', 2,3,4,5,6,7,8,9,10, 'jack', 'queen', 'king' ];
var CARD_EXT = "_75x110.png";
var BACK_CARD = "card_background"+CARD_EXT;

var NUMBER_OF_DECKS = 2;
var TOTAL_CARDS = NUMBER_OF_DECKS * CARDS_IN_DECK;
var Cards=[];					//Hold shuffeld cards as 'suite:number'

var CARD_LEFT_POSITION = 40;	//Draw card multiply position

//CHIPS
var CHIPS = [ 'Purple', 'Yellow', 'Red', 'Orange', 'Green', 'Blue', 'Black' ];
var CHIP_VALUE = {'Purple':1, 'Yellow':5, 'Red':25, 'Orange':100, 'Green':200, 'Blue':500, 'Black':1000};
//var CHIP_TOP_POSITION = 15;		//Draw chip multiply top position
//var CHIP_LEFT_POSITION = 10;	//Draw chip multiply left position
var CHIP_TOP_POSITION = 20;		//Draw chip multiply top position
var CHIP_LEFT_POSITION = 20;	//Draw chip multiply left position
var CHIP_ENDLEFT_POSITION;		//Is set according to css #betting_chips width.

var BET_DELAY = 100;
var PlaceBetTimeout;			//Set OnMouseDown and clear OnMouseUp

//STRUCTURES
var HOUSE = {id:'house', cards:[], sumCards:0};
//chips are dictionary of total chips player has of chip:count
//bet dictionary is chips player is betting
var PLAYER = {id:'player', cards:[], sumCards:0, chips:{}, sumChips:0, bet:{chips:{}, sumChips:0}};

//GAME
var GAME_DELAY = 100;
var NO = 0;
var YES = 1;
var PUSH = 2;
var BET = 3;
var Play = NO;
var HIDDEN_CARD = 1;
//var PAY_RATIO = [1,1]; //1 to 1
var PAY_RATIO_BLACKJACK = [3,2]; //3 to 2

/********************************************/

//ELEMENTS
var BODY, MAIN;
var GAMEVIEW, BETTINGCHIPSSVIEW, CHIPSVIEW, PLAYERCHIPSVIEW;
var BUTTON_DEAL, BUTTON_HIT, BUTTON_BET, BUTTON_STAND, BUTTON_DOUBLE;
var MSGVIEW, BALANCEVIEW, BETSVIEW;
//player_sum, house_sum

//PHONE
var sysInfo=null;	//SystemInfo Object
var PORTRAIT = "portrait";
var HORIZONTAL = "horizontal";

function init()
{
	if (!ImagesPreloader.check()) {
		setTimeout("init();",500);
		return;
	}

	//init elements
	BODY = document.getElementById('body');
	MAIN = document.getElementById('main');
	GAMEVIEW = document.getElementById('game');
	BETSVIEW = document.getElementById('bets');
	BETTINGCHIPSVIEW = document.getElementById('betting_chips');
	PLAYERCHIPSVIEW = document.getElementById('player_chips');
	BUTTON_DEAL = document.getElementById('button-deal');
	BUTTON_HIT = document.getElementById('button-hit');
	BUTTON_BET = document.getElementById('button-bet');
	BUTTON_STAND = document.getElementById('button-stand');
	BUTTON_DOUBLE = document.getElementById('button-double');
	MSGVIEW = document.getElementById('msg');
	BALANCEVIEW = document.getElementById('balance');
	BETSVIEW = document.getElementById('bet');

	initPhone();

	initPlayerChips();

	Hold("fade");
		document.getElementById('header').style.display = "none";
		GAMEVIEW.style.display = "inline";
	Update();

	//outScreen(HORIZONTAL);
	startGame();
}

//init phone settings
function initPhone()
{
	if (!window.widget)
		return;

	window.menu.hideSoftkeys();

	//getDisplayOrientation();
	setInterval("getDisplayOrientation()",500);

	// Obtain the SystemInfo object
    try {
        sysInfo = document.embeds[0];
    } catch (ex) {
        alert("SystemInfo object cannot be found.");
        return;
    }

}

// Display Information
function getDisplayOrientation()
{
    //if (widget.isrotationsupported)

	// Change the screen orientation
	//widget.setDisplayLanscape();

	var h = window.screen.height;
	var w = window.screen.width;
	
	if (h > w)
		outScreen(PORTRAIT);
  	else
		outScreen(HORIZONTAL);
}

//Phone vibration
function vbr(duration,intensity) {
	if (sysInfo==null)
		return;
	durationvalue = Number(duration);
	intensityvalue = Number(intensity);
	sysInfo.startvibra(durationvalue, intensityvalue);
}
function vbrbasic() {
	if (sysInfo==null)
		return;
	sysInfo.startvibra(18,10);
}

//Widget transition
function Hold(style)
{
	if (sysInfo==null)
		return;
	widget.prepareForTransition(style);
}
function Update()
{
	if (sysInfo==null)
		return;
	setTimeout("widget.performTransition();", 0);
}

//Show cards if player has a bet, else shows the chips.
function refreshView()
{
	updateButtons();
	if (Play==BET)
		showPlayerChips();
	else if (Play==YES && PLAYER.bet.sumChips > 0) {
		showBettingChips();
		showCard(HOUSE,0);
		setTimeout("showCards(PLAYER); checkPlayerCards(); updateButtons(1);",GAME_DELAY);
	}
}

//Update game buttons status
//If initial==YES it means showing first cards so to allow double.
function updateButtons(initial)
{
	//if ((Play==YES && !initial) || (Play==PUSH)) {
	//if (Play==YES && !initial) 
	if (Play==BET) {
		showButton(BUTTON_BET);
		hideButton(BUTTON_DOUBLE);
	} else if (initial) {
		hideButton(BUTTON_BET);
		showButton(BUTTON_DOUBLE);
	} else {
		BUTTON_BET.disabled = true;
		BUTTON_DOUBLE.disabled = true;
	}
//	if (Play==PUSH)
//		return;
	if (Play==YES && PLAYER.bet.sumChips > 0) {
		BUTTON_HIT.disabled = false;
		BUTTON_STAND.disabled = false;
	} else {
		BUTTON_HIT.disabled = true;
		BUTTON_STAND.disabled = true;
	}
}

//Show and enable button
function showButton(btn)
{
		btn.disabled = false;
		btn.style.display = 'inline';
}
//Hide and disable button
function hideButton(btn)
{
	btn.disabled = true;
	btn.style.display = 'none';
}

//Sum cards according to rules
function sumCards(whom)
{
	if (whom != HOUSE && whom != PLAYER)
		return;
	var sum = 0;
	var aces = 0;
	var c;
	for (var i in whom.cards)
	{
		c = parseInt(whom.cards[i].split(':')[1]);
		if (c>10)
			c=10;
		else if (c==1)
			aces++;
		sum += c;
		if (c==1)
			sum+=10;
	}
	
	while (sum>21 && aces>0)
	{
		aces--;
		sum-=10;
	}
	
	document.getElementById(whom.id+'_sum').innerHTML = sum;
	whom.sumCards = sum;
}

//Hit a card - draw and check
function hitCard()
{
	if (Play==NO)
		return;
	vbrbasic();
	BUTTON_BET.disabled = true;
	BUTTON_DOUBLE.disabled = true;
	drawCard(PLAYER);
	checkPlayerCards();
}

//Show a message for the player
function msgPlayer(msg)
{
	MSGVIEW.innerHTML = msg;
	MSGVIEW.style.display = 'inline';
}

//Finnish game
function finishGame()
{
	updateScore();
	//Play=NO;
	//if (Play==PUSH)
		//
	refreshView();
	showButton(BUTTON_DEAL);
}

//Player is standing
function Stand()
{
	if (Play==NO)
		return;
	Play=NO;
	vbrbasic();
	updateButtons();
	if (PLAYER.sumCards>21)
		finishGame();
	else {
		setTimeout("showCard(HOUSE,1); document.getElementById(HOUSE.id+'_sum').style.display = 'inline';",GAME_DELAY);
		setTimeout("housePlay();",GAME_DELAY);
	}
}

//House is playing, assumption Play=NO
//TODO: done here?
function housePlay()
{
	if (HOUSE.sumCards<17)
	{
		setTimeout("drawCard(HOUSE); housePlay()",GAME_DELAY);
		return;
	}
	
	//can add soft17 mode here.

	finishGame();
}

//Update score and player message
function updateScore()
{
	var win = NO;

	if (PLAYER.sumCards > 21)
		msgPlayer("Busted");
	else if (HOUSE.sumCards > 21) {
		msgPlayer("House Busted");
		win=YES;
	} else if (HOUSE.sumCards==PLAYER.sumCards) {
		msgPlayer("Push");
		win=PUSH;
	} else if (HOUSE.sumCards < PLAYER.sumCards) {
		msgPlayer("You Win");
		win=YES;
	} else if (HOUSE.sumCards > PLAYER.sumCards)
		msgPlayer("You Lost");
	
	if (win==NO) {
		clearBet();
		return;
	} else if (win==PUSH) {
		Play=PUSH;
		return;
	}
	
	if (PLAYER.sumCards==21)
		msgPlayer("Blackjack");
	
	payBet();
}

//Deal cards for new game
function dealCards()
{
	vbrbasic();
	//TODO: i dont think i'm done here
	Play=BET;
	hideButton(BUTTON_DEAL);
	MSGVIEW.style.display = 'none';
	resetPlayersCards();
	startGame();
}

//Reset player and house cards information
function resetPlayersCards()
{
	HOUSE.cards=[];
	HOUSE.sumCards=0;
	PLAYER.cards=[];
	PLAYER.sumCards=0;
	remAllCards();
}

//Start game (assuming new game) - deal house one card, deal player 2 cards
function startGame()
{
	Play=NO;
	refreshView();
	document.getElementById(HOUSE.id+'_sum').style.display = 'none';
	document.getElementById(PLAYER.id+'_sum').style.display = 'none';
	setTimeout("drawCard(HOUSE,HIDDEN_CARD)",GAME_DELAY);
	setTimeout("drawCard(HOUSE,HIDDEN_CARD)",2*GAME_DELAY);
	setTimeout("drawCard(PLAYER,HIDDEN_CARD)",3*GAME_DELAY);
	setTimeout("drawCard(PLAYER,HIDDEN_CARD); Play=BET; refreshView();",4*GAME_DELAY);
}

//Player decided on bet, continue playing.
function setBet()
{
	if (PLAYER.bet.sumChips==0 || Play!=BET)
		return;
	Play=YES;
	refreshView();
}

//Player wants to clear the bet
function resetBet()
{
	if (Play!=BET)
		return;
	returnBet()
	refreshChipsView(PLAYERCHIPSVIEW);
}

//Double the bet
function doubleBet()
{
	vbrbasic();
	if (PLAYER.sumChips < PLAYER.bet.sumChips)
	{
		alert("You do not have enough chips, ("+PLAYER.bet.sumChips+"<"+PLAYER.sumChips+").");
		return;
	}
	//
	var sum = PLAYER.bet.sumChips;
	var c;
	for (var n=CHIPS.length-1; n>=0 && sum>0; n--)
	{
		c=CHIPS[n];
		while (sum>0 && sum>=CHIP_VALUE[c] && takeChipFromPlayer(c)) {
			drawBetChip(c);
			addChipToBet(c);
			sum -= CHIP_VALUE[c];
		}
	}
	drawCard(PLAYER);
	checkPlayerCards(1);
}

//Check player cards
function checkPlayerCards(forcestand)
{
	if (PLAYER.sumCards < 21 && !forcestand)
		return;
	if (PLAYER.sumCards==21)
		msgPlayer("Blackjack");
	Stand();
}

//Hide cards
function hideCard(whom,index)
{
	document.images[whom.id+'_card'+(index+1)].src = "images/"+BACK_CARD;
}
function hideCards(whom)
{
	if (whom != HOUSE && whom != PLAYER)
		return;
	for (var n=0; n<whom.cards.length; n++)
		hideCard(whom,n);
		//document.images[whom.id+'_card'+(n+1)].src = "images/"+BACK_CARD;
}

//Show cards
function showCard(whom,index)
{
	document.images[whom.id+'_card'+(index+1)].src = fnCard(whom.cards[index]);
}
function showCards(whom)
{
	if (whom != HOUSE && whom != PLAYER)
		return;
	for (var n=0; n<whom.cards.length; n++)
		showCard(whom,n);
		//document.images[whom.id+'_card'+(n+1)].src = fnCard(whom.cards[n]);
	document.getElementById(whom.id+'_sum').style.display = 'inline';
}

//Change output screen between horizontal and portrait
function outScreen(t)
{
	if (t == BODY.className)
		return;

	BODY.className = t;
	MAIN.className = t;
}

//Show about information
function showInfo()
{
	vbrbasic();
	Hold("fade");
		GAMEVIEW.style.display = "none";
		document.getElementById('info').style.display = "inline";
	Update();
}
//Close about information
function closeInfo()
{
	vbrbasic();
	Hold("fade");
		GAMEVIEW.style.display = "inline";
		document.getElementById('info').style.display = "none";
	Update();
}

//About information text
function about()
{
	document.writeln("Blackjack v"+VERSION+"<br>by Roi Dayan<br><br>");
	document.writeln("<span style='font-size:20px;'>http://blackjackwrt.googlecode.com<br><br>Click here to continue</span>");
}


/*
//Cookies

function setCookie(c_name,value,expiredays)
{
	var exdate = new Date();
	exdate.setDate(exdate.getDate()+expiredays);
	document.cookie = c_name+"="+escape(value)+((expiredays==null) ? "" : ";expires="+exdate.toGMTString());
}

function getCookie(c_name)
{
	if (document.cookie.length>0)
	{
		c_start = document.cookie.indexOf(c_name+'=');
		if (c_start!=-1)
		{ 
			c_start = c_start+c_name.length+1; 
			c_end = document.cookie.indexOf(";",c_start);
			if (c_end==-1) c_end = document.cookie.length;
			return unescape(document.cookie.substring(c_start,c_end));
		}
	}
	return "";
}

var tmp="BlackjackWidget";
setCookie(tmp,'a103',100);
alert(getCookie(tmp));
*/

//Images Preloader
var ImagesPreloader = {
	list: [],
	images: [],

	add: function(src) {
		this.list = this.list.concat(src);
	},

	start: function(src) {
		var im;
		for (var i=0; i<this.list.length; i++) {
			im = new Image();
			im.src = src;
			this.images.push(im);
		}
	},

	check: function() {
		for (var i=0; i<this.images.length; i++)
			if (!this.images[i].complete)
				return false;
		return true;
	}
}
//Preload images
function preloadImages()
{
	for (var s=0; s<SUITE.length; s++)
		for (var c=0; c<CARDS_IN_SUITE; c++)
			ImagesPreloader.add("images/"+SUITE[s]+'s/'+SUITE[s]+'_'+CARD[c]+CARD_EXT);
	for (var c in CHIP_VALUE)
		ImagesPreloader.add("images/Chips/"+c+".gif");
	ImagesPreloader.add("images/"+BACK_CARD);
	ImagesPreloader.add("images/deskh.PNG");
	ImagesPreloader.add("images/deskp.PNG");
	ImagesPreloader.add("images/Info.gif");
	ImagesPreloader.add("images/Close.gif");
	ImagesPreloader.start();
}
