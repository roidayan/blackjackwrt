
//Prepare playing cards and shuffle
function initCards()
{
	//Cards=[];
	for (var d=0; d<NUMBER_OF_DECKS; d++)
		addDeck();
	shuffleCards();
	//for(var i=0; i<90; i++)
	//		Cards.pop();
	console.log("initCards: "+Cards.length);
}

//Add another shuffled deck of cards
function addDeck()
{
	for (var s=0; s<SUITE.length; s++)
		for (var c=0; c<CARDS_IN_SUITE; c++)
			Cards.push(s+':'+(c+1));
		shuffleCards();
}

function swapCards(a,b)
{
	var tmp=Cards[a];
	Cards[a]=Cards[b];
	Cards[b]=tmp;
}

//Shuffle playing cards
function shuffleCards()
{
	for (var n=0; n<Cards.length; n++)
		swapCards(Math.floor(Math.random()*Cards.length),n);
}

//Return filename for card 'suite:number'
function fnCard(card)
{
	var x = card.split(':');
	if (x[0] < 0 || x[0] >= SUITE.length || x[1] < 1 || x[1] > CARDS_IN_SUITE)
		return;
	var fn = "images/"+SUITE[x[0]]+'s/'+SUITE[x[0]]+'_'+CARD[x[1]-1]+CARD_EXT;
	return fn;
}

//Create new card image object
function newCardImage(card,id)
{
	var c = new Image();
	var src = fnCard(card);
	c.src = src;
	c.id = id;
	c.className = 'card';
	return c;
}

//Draw card on board
function drawCard(whom, hidecard)
{
	if (whom != HOUSE && whom != PLAYER)
		return;
	if (Cards.length==0)
		initCards();
		//msgPlayer("Shuffled a new deck.");
	var card = Cards.pop();
	if (!card)//we shouldnt get here
		throw("Error, undefined card. length="+Cards.length);
	//console.log("drawCard: "+card+" (left: "+Cards.length+")");
	var pos = whom.cards.length * CARD_LEFT_POSITION;
	whom.cards.push(card);
	var c = newCardImage(card,whom.id+"_card"+whom.cards.length);
	if (hidecard==HIDDEN_CARD)
		c.src = "images/"+BACK_CARD;
	c.setAttribute("style","left:"+pos+"px;");
	//hitCard doesnt check if player placed a bet.
	//if (whom==PLAYER)
	//	c.setAttribute("onclick","hitCard();");
	var h = document.getElementById(whom.id+'_cards');
	h.appendChild(c);
	sumCards(whom);
}

//Delete cards from board
function remCards(whom)
{
	if (whom != HOUSE && whom != PLAYER)
		return;
	var t = document.getElementById(whom.id+'_cards');
	while (t.childNodes.length > 1)
		t.removeChild(t.lastChild);
}

//Delete all cards from board
function remAllCards()
{
	remCards(HOUSE);
	remCards(PLAYER);
}
