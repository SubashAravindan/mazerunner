var canvas=document.getElementById('canvas');
var ctx=canvas.getContext("2d");
var scoreBox=document.getElementById("score");
var Deepimg=document.createElement("img");
Deepimg.src="assets/images/Deep.png";
var wallImg=document.createElement("img");
wallImg.src="assets/images/brick.jpg";
var hitmanImage=document.createElement("img");
hitmanImage.src="assets/images/hitman.png";
var spikeImg=document.createElement("img");
spikeImg.src="assets/images/spike.png";
var gameAudio=document.getElementById("gameAudio");
var shootAudio=document.getElementById("shootAudio");
var gameOverAudio=document.getElementById("gameOverAudio");

var newGameButton=document.getElementById("newGameButton");
var instructButton=document.getElementById("instructButton");
var instructDiv=document.getElementById("instructDiv");
var closeInstructButton=document.getElementById("closeInstructButton");
var score=0;
var t=0;
var i=0;
var gameVel;
var obstacleArray=[];
var minGapObs=180;
var mousepos={x:undefined,y:undefined}
var colObject;
var spikeWidth=30;
var bulletArray=[];
var bulletIndex=-1;
var f=undefined;

var Deep={
	x: 100,
	y: 250,
	vx: 5,
	vy: 5,
	width:28,
	ht:48,
	resetPos:function(){
		this.x=100;
		this.y=250;
		this.vx=5;
		this.vy=5;
	},
	fixPos:function(){
		detectWallCollision();
		if ((colObject.front==false)&&this.x+this.width<=canvas.width&&mousepos.x-(this.x+this.width)>20) {
			this.x+=this.vx;
			t-=0.05;
		}
		else if (colObject.back==false&&this.x>=0&&mousepos.x-(this.x+this.width)<-20) {
			this.x-=(this.vx+gameVel);
			t-=0.05;
		}

		if (colObject.bottom==false&&this.y+this.ht<canvas.height&&mousepos.y-(this.y+this.ht)>20) {
			this.y+=this.vy;
			t-=0.05;
		}
		else if (colObject.top==false&&this.y>=0&&mousepos.y-(this.y+this.ht)<-20) {
			this.y-=this.vy;
			t-=0.05;
		}
	},
	draw:function (){
		var sx,sy,sw,sh;
		if (colObject.front) {
			this.x-=gameVel;
		}
		switch(Math.floor(t)%5){
			case 0: sx=113;sy=20;sw=75;sh=110;break;
			case 1: sx=192;sy=16;sw=82;sh=117;break; 
			case 2: sx=277;sy=30;sw=92;sh=102;break;
			case 3: sx=390;sy=14;sw=82;sh=118;break;
			case 4: sx=487;sy=28;sw=91;sh=104;break;
		}
		ctx.drawImage(Deepimg,sx,sy,sw,sh,this.x,this.y,this.width,this.ht);
		t+=0.2;
		
	},

}

function obstacle(x,ht,width,direction){
	this.x=x,
	this.ht=ht,
	this.direction=direction,
	this.width=width;
	this.draw= function(){
		
		// ctx.fillRect(this.x,((direction===1)?(canvas.height-this.ht):0),this.width,this.ht);  //1 is for bottom obstacle
		ctx.drawImage(wallImg,28,5,123,this.ht*5,this.x,((direction===1)?(canvas.height-this.ht):0),this.width,this.ht);
	}
}


var hitman={
	x:0,
	y:0,
	width:30,
	ht:50,
	isDead:false,
	minDist:1700,
	generatePosition: function(){
		this.isDead=false;
		this.x=this.minDist+Math.floor(Math.random()*2000);
		this.y=Math.random()*450;
	},
	draw:drawHitman
}

function bullet(x,y,ht,width,vel){
	this.x=x,
	this.y=y,
	this.ht=ht,
	this.width=width,
	this.vel=vel,
	this.draw=function(){
		ctx.drawImage(hitmanImage,293,331,82,8,this.x,this.y,width,ht);
	}
}

function initialiseBulletArray(){
	for (var i = 0; i < 5; i++) {
		bulletArray[i]=new bullet(-100,-100,10,80,7);
	}
	bulletIndex=-1;
}

function drawBulletArray(){
	bulletArray.forEach(function(b){
		if (b.x+b.width>0) {
			b.draw();
			b.x-=b.vel;
		}
	})
}

function shootBullet(){
	if (hitman.x>0) {
		shootAudio.play();
		bulletArray[(++bulletIndex)%5].x=hitman.x-50;
		bulletArray[bulletIndex%5].y=hitman.y+10;		
	}

}

function drawHitman(){

	if (this.x<=-10) {
		this.generatePosition();
		this.isDead=false;
	}


	if (this.x<=canvas.width) 
	{
		if (this.isDead) {
			ctx.save();
			ctx.globalAlpha=0.6;
			this.width=60;
			this.ht=40;
			ctx.drawImage(hitmanImage,480,258,51,27,this.x,this.y,this.width,this.ht);
			ctx.restore();
		} 
		else {
			if ((Math.round(this.x/100)*100)%200===0) {
				if (Math.floor(this.x/100)*100!==Math.floor((this.x-gameVel)/100)*100) {
					shootBullet();
				}
				this.width=45;
				this.ht=50;
				ctx.drawImage(hitmanImage,407,318,43,52,this.x,this.y,this.width,this.ht);
			}
			 else {
				this.width=30;
				this.ht=50;
				ctx.drawImage(hitmanImage,570,314,25,52,this.x,this.y,this.width,this.ht);
		
			}			
		}

	}

	this.x-=gameVel;


}



document.addEventListener("mousemove",function (event) {
	updateMousePos(event);
})

function updateMousePos(event){
	rect=canvas.getBoundingClientRect();
	mousepos.x=(event.clientX - rect.left) / (rect.right - rect.left) * canvas.width; 
	mousepos.y= (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
	return mousepos;
}

canvas.addEventListener("click",function(event){
	// mousepos1=updateMousePos(event);
	mousepos1={x:0,y:0};
	rect1=canvas.getBoundingClientRect();
	mousepos1.x=(event.clientX - rect1.left) / (rect1.right - rect.left) * canvas.width; 
	mousepos1.y= (event.clientY - rect1.top) / (rect1.bottom - rect.top) * canvas.height;
	if ((mousepos1.x>=hitman.x)&&(mousepos1.x<=(hitman.x+hitman.width))&&(mousepos1.y>=hitman.y)&&(mousepos1.y<=hitman.y+50)){
		hitman.isDead=true;
	}
})

function generateObstacles(){
	while(obstacleArray.length<10)
	obstacleArray.push(randomObstacle());
}

function randomObstacle() {
	if (obstacleArray.length==0) {
		return new obstacle(400,250,30,0);
	} 
	else {
		return (new obstacle(obstacleArray[obstacleArray.length-1].x+minGapObs+Math.floor(Math.random()*100),Math.floor(200+Math.random()*200),30,Math.floor(Math.random()*2)))
	
	}
}

function drawObstacles() {
	obstacleArray.forEach(function (o){
		o.draw();
		o.x-=gameVel;
		if (o.x<=-100) {
			obstacleArray.shift();
			obstacleArray.push(randomObstacle());
		}
	})
}


function updateScore() {
	score=Math.floor(gameVel*10*i/canvas.width);
	scoreBox.textContent=score;
}

function spikeTouchCheck(){
	if(Deep.x<=spikeWidth){
		gameOver();
	}
}

function detectWallCollision() {
	colObject={
		front:false,
		back:false,
		top:false,
		bottom:false
	}
	obstacleArray.forEach(function(o){
		if (o.x-(Deep.x+28)<=3&&Deep.x<o.x&&(o.direction===1?(Deep.y+48>canvas.height-o.ht&&Deep.y+48<=canvas.height+5):(Deep.y>=-10&&Deep.y<o.ht))){
			colObject.front= true; 							//collision on face
		} 
		if(Deep.x-(o.x+o.width)<=3&&Deep.x>o.x&&(o.direction===1?(Deep.y+48>canvas.height-o.ht&&Deep.y+48<=canvas.height+5):(Deep.y>=-10&&Deep.y<o.ht))){

			colObject.back= true;      //collision on back	
		}
		if(Deep.y-o.ht<=2&&o.direction===0&&((Deep.x>=o.x&&Deep.x<=o.x+o.width)||(Deep.x+28>=o.x&&Deep.x+28<=o.x+o.width))){

			colObject.top= true;      //collision on top     
		}
		if((canvas.height-o.ht)-(Deep.y+48)<=2&&o.direction===1&&((Deep.x>=o.x&&Deep.x<=o.x+o.width)||(Deep.x+28>=o.x&&Deep.x+28<=o.x+o.width))){

			colObject.bottom= true;    //collision on bottom
		}
		
		
	})

}

function dectectCollision(one,two){
	if ((one.x>=two.x&&one.x<=two.x+two.width)||(one.x+one.width>=two.x&&one.x+one.width<=two.x+two.width)||(one.x>=two.x&&one.x<=two.x+two.width&&one.x+one.width>=two.x&&one.x+one.width<=two.x+two.width)||(two.x>=one.x&&two.x<=one.x+one.width&&two.x+two.width>=one.x&&two.x+two.width<=one.x+one.width)) {
		if ((one.y>=two.y&&one.y<=two.y+two.ht)||(one.y+one.ht>=two.y&&one.y+one.ht<=two.y+two.ht)||(one.y>=two.y&&one.y<=two.y+two.ht&&one.y+one.ht>=two.y&&one.y+one.ht<=two.y+two.ht)||(two.y>=one.y&&two.y<=one.y+one.ht&&two.y+two.ht>=one.y&&two.y+two.ht<=one.y+one.ht)) {
			return true;
		}
	}
}

function collisionCheck(){
	if (dectectCollision(Deep,hitman)&&!hitman.isDead) {
		gameOver();
		return;
	}
	bulletArray.forEach((b)=>{if (dectectCollision(b,Deep)) {
		gameOver();
	}})
}

function drawSpike(){
	for (var i = 0; i < 4; i++) {
		ctx.drawImage(spikeImg,0,i*325,spikeWidth,325);
	}
	
}

closeInstructButton.addEventListener("click",closeInstructions);

function closeInstructions(){
	instructButton.classList.remove("hidden");
	canvas.classList.remove("hidden");
	instructDiv.classList.add("hidden");
}
instructButton.addEventListener("click",function () {
	if (i===0) {
		instructButton.classList.add("hidden");
		canvas.classList.add("hidden");
		instructDiv.classList.remove("hidden");

	}
})

function updateGameVel(){
	if(score%25===0&&score){
		gameVel+=0.5;
		bulletArray.forEach((b)=>b.vel+=0.5)
		Deep.vx+=0.1;
		Deep.vy+=0.1;
		hitman.minDist-=50;
	}
}

function gameOver(){
	cancelAnimationFrame(f);
	gameOverAudio.play();
	gameAudio.pause();
	instructButton.classList.remove("hidden");
	ctx.fillStyle="rgba(0, 0, 0, 0.6)";
	ctx.fillRect(0,0,canvas.width,canvas.height);
	ctx.font="70px Arial";
	ctx.fillStyle="#46D420";
	ctx.fillText("Game Over",500,200);
	ctx.font="20px Arial";
	ctx.fillText("You failed to save the legendary programmer:(",480,250);
	resetGame();
}

function resetGame(){
	obstacleArray=[];
	generateObstacles();
	hitman.generatePosition();
	Deep.resetPos();
	initialiseBulletArray();
	i=0;
	gameVel=3;
}

function gamePlay() {
	gameAudio.play();
	i++;
	ctx.fillStyle="black";
	ctx.fillRect(0,0,canvas.width,canvas.height);
	drawObstacles();
	hitman.draw();
	Deep.fixPos();
	updateScore();
	Deep.draw();
	drawBulletArray();
	updateGameVel();
	drawSpike();
	f=requestAnimationFrame(gamePlay);
	spikeTouchCheck();
	collisionCheck();
}

newGameButton.addEventListener("click",function(){
 	closeInstructions();
 	instructButton.classList.add("hidden");
 	if(f){
 		cancelAnimationFrame(f);
 	}
 	resetGame();
 	gamePlay();
 });

