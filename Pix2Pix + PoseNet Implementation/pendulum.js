//THIS CODE IS ADAPTED FROM THE CODING TRAIN VIDEO,
//FOUND HERE: https://www.youtube.com/watch?v=uWzPe_S-RVE
//WITH THE SKETCH: https://editor.p5js.org/codingtrain/sketches/jaH7XdzMK

class Pendulum {
  constructor(){
    this.grav = 0.5;
    this.force = 0;
    this.len1 = 100;
    this.len2 = 100;
    this.bob1 = createVector(0,0);
    this.bob2 = createVector(0,0);
    this.angle1 = PI / 2;
    this.angle1A = 0;
    this.angle1V = 0;
    this.angle2 = -1*sqrt(this.angle1);
    this.angle2A = 0;
    this.angle2V = 0;
    this.mass1 = 10;
    this.mass2 = 10;
    this.origin = createVector(0,0);
    let mousePos;
  }
  
  setAngle(_phi){
    this.angle1 = _phi;
  }
  
  setPosition(_x, _y){
    this.origin.set(_x, _y);
  }
  
  calcAngles(){
    //CALCULATE ANGLE 1------------------
    let num1 = -this.grav * (2 * this.mass1 + this.mass2) * sin(this.angle1);
    let num2 = -this.mass2 * this.grav * sin(this.angle1 - 2 * this.angle2);
    let num3 = -2 * sin(this.angle1 - this.angle2) * this.mass2;
    let num4 = this.angle2V * this.angle2V * this.len2 + this.angle1V * this.angle1V * this.len1 * cos(this.angle1 - this.angle2);
    let den = this.len1 * (2 * this.mass1 + this.mass2 - this.mass2 * cos(2 * this.angle1 - 2 * this.angle2));
    this.angle1V *= 0.999;
    this.angle1A = (num1 + num2 + num3 * num4) / den;
    //-----------------------------------

    //CALCULATE ANGLE 2------------------
    num1 = 2 * sin(this.angle1 - this.angle2);
    num2 = (this.angle1V * this.angle1V * this.len1 * (this.mass1 + this.mass2));
    num3 = this.grav * (this.mass1 + this.mass2) * cos(this.angle1);
    num4 = this.angle2V * this.angle2V * this.len2 * this.mass2 * cos(this.angle1 - this.angle2);
    den = this.len2 * (2 * this.mass1 + this.mass2 - this.mass2 * cos(2 * this.angle1 - 2 * this.angle2));
    this.angle2V *= sq(0.999);
    this.angle2A = (num1 * (num2 + num3 + num4)) / den;
    //-----------------------------------
  }
  
  applyAngles(){
    //ADD ANGLES, VELOCITIES, ACCELERATION--
    //--------------------------------------
    this.angle1V += this.angle1A;
    this.angle2V += this.angle2A;
    this.angle1 += this.angle1V;
    this.angle2 += this.angle2V;
  }
  
  draw(){
    this.calcAngles();
    //DRAW PENDULUM-------------------------
    //--------------------------------------

    fill(200);
    stroke(0,0,0,80);
    strokeWeight(2);
    
    circle(this.origin.x, this.origin.y, this.mass1);
    
    this.bob1.x = this.origin.x + this.len1 * sin(this.angle1);
    this.bob1.y = this.origin.y + this.len1 * cos(this.angle1);

    line(this.origin.x, this.origin.y, this.bob1.x, this.bob1.y);
    circle(this.bob1.x, this.bob1.y, this.mass1);

    this.bob2.x = this.bob1.x + this.len2 * sin(this.angle2);
    this.bob2.y = this.bob1.y + this.len2 * cos(this.angle2);

    line(this.bob1.x, this.bob1.y, this.bob2.x, this.bob2.y);
    circle(this.bob2.x, this.bob2.y, this.mass2);
    
    this.applyAngles();
  }
}