/* GRAPHICS PRIMITIVES ********************************************************/

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;
const bg1 = "rgb(0 0 0)";
const fg1 = "rgb(255 255 255)";
const fg2 = "rgb(0 255 255 / 50%)";
const bg2 = "rgb(255 255 0 / 50%)";
var rm1 = document.getElementById("rm1");
var rm2 = document.getElementById("rm2");
var ba = document.getElementById("bf");
var bv = document.getElementById("bv");
var ga = document.getElementById("gf");
var gv = document.getElementById("gv");
var ea = document.getElementById("ef");
var ev = document.getElementById("ev");

function drawLine(x1, y1, x2, y2, color) {
    context.beginPath();
    context.strokeStyle = color;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
}

function drawCircle(x, y, r, color) {
    context.beginPath();
    context.strokeStyle = color;
    context.arc(x, y, r, 0, 2 * Math.PI);
    context.stroke();
}

function drawLabel(x, y, w, label) {
    context.beginPath();
    context.strokeStyle = "rgb(255 255 255)";
    context.font = "12px monospace, monospace";
    context.strokeText(label, x, y, w);
}

function fillBox(x, y, w, h, color) {
    context.beginPath();
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
}

/* COORDINATE CONVERSIONS *****************************************************/

function rf2x(r, f) {return r * Math.cos(deg2rad(f))}
function rf2y(r, f) {return r * Math.sin(deg2rad(f))}
function xy2r(x, y) {return Math.hypot(x, y)}
function xy2f(x, y) {return rad2deg(Math.atan2(y, x))}

/* UNIT CONVERSIONS ***********************************************************/

function rad2deg(n) {return n * (180 / Math.PI)}
function deg2rad(n) {return n / (180 / Math.PI)}

function sexi(i, s, n) {
    var m = Math.floor(n);
    if (i == 0)
        return m.toString().padStart(3, ' ');
    return m.toString().padStart(3, ' ') + s + sexi(i - 1, ",", (n - m) * 60);
}

function sex3(n) {
    return sexi(2, ";", n);
}

/* HEAVENLY BODIES ************************************************************/

class StaticObject {
    next = false;
    
    constructor(name, x, y) {
        this.name = name;
        
        this.x = x;
        this.y = y;
    }
    
    preFrame() {}
    
    postFrame() {}
    
    advanceFrame() {
        this.preFrame();
        
        drawCircle(this.x, this.y, height / 64, fg1);
        drawLabel(this.x + height / 64 + 2, this.y, 12, this.name);
        
        if (this.next != false)
            this.next.advanceFrame();
        
        this.postFrame();
    }
    
    observe(object) {
        return 180 + xy2f(this.x - object.x, object.y - this.y);
    }
}

class OrbitingBody extends StaticObject {
    constructor(name, p, r, f, v) {
        super(name, p.x + rf2x(r, f), p.y + rf2y(r, f));
        
        this.p = p;
        this.r = r;
        this.f = f;
        this.v = v;
    }
    
    preFrame() {
        drawLine(this.p.x, this.p.y, this.x, this.y, bg2);
        drawCircle(this.p.x, this.p.y, this.r, fg2);
    }
    
    renderGraph(i, p) {
        drawLabel(2, i * 12 + 9, 27, `${this.name}:${p.name}`);
        drawLabel(129, i * 12 + 9, width, sex3(p.observe(this)));
        fillBox(27, i * 12, 100, 12, bg2);
        fillBox(27, i * 12, p.observe(this) / 3.6, 12, fg2);
    }
    
    postFrame() {
        this.f = (this.f + this.v) % 360;
        
        this.x = this.p.x + rf2x(this.r, this.f);
        this.y = this.p.y - rf2y(this.r, this.f);
    }
}

/* MAIN SECTION ***************************************************************/

var a = new StaticObject("α", width / 2, height / 2 + width / 18);
var b = new OrbitingBody("β", a, width / 3, bf.valueAsNumber, bv.valueAsNumber);
var g = new OrbitingBody("γ", b, width / 9, gf.valueAsNumber, gv.valueAsNumber);
var d = new StaticObject("δ", width / 2, height / 2 - width / 18);
var e = new OrbitingBody("ε", d, width / 3, ef.valueAsNumber, ev.valueAsNumber);
a.next = b; b.next = g; d.next = e;

function upva() {
    b.f = bf.valueAsNumber;
    b.v = bv.valueAsNumber;
    g.f = gf.valueAsNumber;
    g.v = gv.valueAsNumber;
    e.f = ef.valueAsNumber;
    e.v = ev.valueAsNumber;
}

function loop() {
    context.fillStyle = bg1;
    context.fillRect(0, 0, width, height);
    
    if (rm1.checked) {
        a.advanceFrame();
        b.renderGraph(0, a);
        g.renderGraph(1, b);
        g.renderGraph(2, a);
    }
    
    if (rm2.checked) {
        d.advanceFrame();
        e.renderGraph(4, d);
        e.renderGraph(5, a);
    }
    
    requestAnimationFrame(loop);
}

loop();