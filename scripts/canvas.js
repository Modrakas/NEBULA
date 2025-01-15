//canvas setup
const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');


//function to generate a random number within a range
const randomBetween = (min, max) => {
 return Math.random() * (max - min) + min;
}


//array that will contain all of the circles and their properties
let circles = [];
//colors to use in the gradient
const colors = ['#f1c4fe', '#b0bdfd', '#cdeefd', '#e9e5fe', '#cedfff', '#fcfeff', '#eff9fe', '#abafd2', '#fff', '#e6e7ff', '#c8e3fa'];
//set body background to one of the colors
document.body.style.backgroundColor = '#fff';
//create circle data
const initateCircles = () => {
 //clear previous circle data
 circles = [];
 //set the amount of circles based on screen size
 let circleCount = window.innerWidth / 100;
 //loop the code inside as many times as there are circles
 for (let i = 0; i < circleCount; i++) {
   //set circle radius
   let radius = window.innerWidth / 4;
   //set random circle position inside the canvas on x axis
   let circleX = randomBetween(radius, canvas.width - radius);
   //set random circle position inside the canvas on y axis
   let circleY = randomBetween(radius, canvas.height - radius);
   //set random velocity on x axis based on screen size
   let velocityX = randomBetween(window.innerWidth / -1000, window.innerWidth / 1000);
   //set random velocity on y axis based on screen size
   let velocityY = randomBetween(window.innerWidth / -1000, window.innerWidth / 1000);
   //set random color to circle from the colors array
   let color = colors[Math.floor(Math.random() * colors.length)];
   //add the new cirlce data inside the circles array
   circles.push({circleX, circleY, velocityX, velocityY, radius, color});
 }
}


//draw the circles with the new values
const drawCircles = (circle) => {
 //begin circle path
 ctx.beginPath();
 //create circle with previously established parameters
 ctx.arc(circle.circleX, circle.circleY, circle.radius, 0, Math.PI * 2, false);
 //create a fill with the previously established color
 ctx.fillStyle = circle.color;
 //fill the circle
 ctx.fill();
 //close circle path
 ctx.closePath();
}


//animation function
const animate = () => {
 //create animation byt looping animate function
 requestAnimationFrame(animate);
 //clear all previously drawn elements from the circle
 ctx.clearRect(0, 0, canvas.width, canvas.height);
 //loop through all circles
 circles.forEach(circle => {
   //if the circle reaches the edge of the canvas on the x axis on eight side
   if (circle.circleX + circle.radius > canvas.width || circle.circleX - circle.radius < 0) {
     //reverse the velocity of the circle / bounce off the edge into the other direction
     circle.velocityX = -circle.velocityX;
   }
   //if the circle reaches the edge of the canvas on the y axis on eight side
   if (circle.circleY + circle.radius > canvas.width || circle.circleY - circle.radius < 0) {
     //reverse the velocity of the circle / bounce off the edge into the other direction
     circle.velocityY = -circle.velocityY;
   }
   //in any other case keep moving in the initial direction
   circle.circleX += circle.velocityX;
   circle.circleY += circle.velocityY;
   //move circle by looping draw circle animation
   drawCircles(circle);
 });
}


//function making canvas size dynamic and slightly larger than the screen size
const resizeCanvas = () => {
 canvas.width = window.innerWidth * 1.5;
 canvas.height = window.innerHeight * 1.5;
 //create new circle data for new screen size
 initateCircles();
}

//make canvas full width on page load
resizeCanvas();

//make canvas ful width when screen is resized
window.addEventListener('resize', resizeCanvas);

//create circle data on page load
initateCircles();

//run animation on page
animate();
