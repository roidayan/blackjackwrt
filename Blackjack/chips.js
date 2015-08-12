
//Random chips for player
function initPlayerChips()
{
	var sum = 0;
	for (var n=0; n<CHIPS.length; n++)
		sum += Math.floor(Math.random()*400+100);
	payToPlayer(sum);
}

//Pay to player
function payToPlayer(sum)
{
	PLAYER.sumChips += sum;
	BALANCEVIEW.innerHTML = PLAYER.sumChips;
}

//Take chip value from player
function takeChipFromPlayer(chip)
{
	if (PLAYER.sumChips < CHIP_VALUE[chip])
		return false;
	payToPlayer(-1*CHIP_VALUE[chip]);
	return true;
}

//Add chip value to bet
function addChipToBet(chip)
{
	PLAYER.bet.sumChips += CHIP_VALUE[chip];
	BETSVIEW.innerHTML = PLAYER.bet.sumChips;
}

//Return filename for chip
function fnChip(chip)
{
	if (!(chip in CHIP_VALUE))
		return;
	var fn = "images/Chips/"+chip+".gif";
	return fn;
}

//Create new chip image object
function newChipImage(chip,id)
{
	var c = new Image();
	c.src = fnChip(chip);
	c.id = id;
	c.className = 'chip';
	return c;
}

//Draw player betting chip on board
function drawBetChip(c)
{
	var im = newChipImage(c,"betting_chip_"+c);
	if (BETTINGCHIPSVIEW.childNodes.length>1) {//>1 because of the comment
		var top = parseInt(BETTINGCHIPSVIEW.lastChild.style.top);
		var left = parseInt(BETTINGCHIPSVIEW.lastChild.style.left) + CHIP_LEFT_POSITION;
	} else {
		var top=0;
		var left=0;
	}
	//CHIP_ENDLEFT_POSITION
	if (left >= BETTINGCHIPSVIEW.scrollWidth) {
		left=0;
		top += CHIP_TOP_POSITION;
	}
	im.setAttribute("style","left:"+left+"px; top:"+top+"px;");
	BETTINGCHIPSVIEW.appendChild(im);
}

//Draw betting chips according to bets
function drawBetChips()
{
	var sum = PLAYER.bet.sumChips;
	var c;
	for (var n=CHIPS.length-1; n>=0; n--) {
		c=CHIPS[n];
		while (sum >= CHIP_VALUE[c]) {
			drawBetChip(c);
			sum -= CHIP_VALUE[c];
		}
	}
}

//Delete betting/player chips from board
function remChips(what)
{
	if (what!=BETTINGCHIPSVIEW && what!=PLAYERCHIPSVIEW)
		return;
	while (what.childNodes.length > 1)
		what.removeChild(what.lastChild);
}

//ReDraw betting/player chips on board and sum the chips
function refreshChipsView(what)
{
	if (what!=BETTINGCHIPSVIEW && what!=PLAYERCHIPSVIEW)
		return;
	remChips(what);
	if (what==BETTINGCHIPSVIEW)
		drawBetChips();
	else if (what==PLAYERCHIPSVIEW)
		drawPlayerChips();
}

//Clear player bet chips from board
function clearBet()
{
	PLAYER.bet.sumChips=0;
	BETSVIEW.innerHTML=0;
	remChips(BETTINGCHIPSVIEW);
}

//Return bets to player
function returnBet()
{
	payToPlayer(PLAYER.bet.sumChips);
	clearBet();
}

//Draw chip player has on board
function drawPlayerChip(chip)
{
	var im = newChipImage(chip,"player_chip_"+chip);
	im.setAttribute("style","position:relative;");
	im.setAttribute("onclick","placeBet('"+chip+"');");
	//im.setAttribute("onmousedown","placeBet('"+chip+"');");
	//im.setAttribute("onmouseup","stopBet();");
	//im.setAttribute("onmouseout","stopBet();");
	//PLAYERCHIPSVIEW.appendChild(im);
	PLAYERCHIPSVIEW.appendChild(im);
}

//Draw chips player can use on board
function drawPlayerChips()
{
	for (var c in CHIP_VALUE)
		if (PLAYER.sumChips >= CHIP_VALUE[c])
			drawPlayerChip(c);
}

//Player placing a bet - OnMouseDown
function placeBet(chip)
{
	if (!takeChipFromPlayer(chip))
		return;
	vbrbasic();
	//drawBetChip(chip);
	addChipToBet(chip);
	//if (!PLAYER.chips[chip])
		//alert(document.getElementById("player_chip_"+chip));
		//PLAYERCHIPSVIEW.removeChild(document.getElementById("player_chip_"+chip));
	//PlaceBetTimeout = setTimeout("placeBet('"+chip+"');",BET_DELAY);
}
//OnMouseUp
/*function stopBet()
{
	clearTimeout(PlaceBetTimeout);
}*/

//Pay player his bets ratio
function payBet()
{
	var sum = PLAYER.bet.sumChips;
	if (PLAYER.sumCards==21)
		sum = Math.floor( ( sum*PAY_RATIO_BLACKJACK[0] ) / PAY_RATIO_BLACKJACK[1] );
	else
		sum = sum*2;
	payToPlayer(sum);
	clearBet();
}

//Show betting chips on board
function showBettingChips()
{
	PLAYERCHIPSVIEW.style.display = 'none';
	BETTINGCHIPSVIEW.style.display = 'inline';
	refreshChipsView(BETTINGCHIPSVIEW);
}

//Show player chips on board
function showPlayerChips()
{
	PLAYERCHIPSVIEW.style.display = 'inline';
	BETTINGCHIPSVIEW.style.display = 'none';
	refreshChipsView(PLAYERCHIPSVIEW);
}
