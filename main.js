/* GRAPHICS PRIMITIVES ********************************************************/

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
//const width = (canvas.width = window.innerWidth / 2);
//const height = (canvas.height = window.innerWidth / 2);
const width = canvas.width;
const height = canvas.height;

const rm1 = document.getElementById("rm1");
const rm2 = document.getElementById("rm2");

const wm = document.getElementById("wm");

const ba = document.getElementById("bf");
const bv = document.getElementById("bv");
const ga = document.getElementById("gf");
const gv = document.getElementById("gv");
const ea = document.getElementById("ef");
const ev = document.getElementById("ev");

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
    
    constructor(name, color, x, y) {
        this.name = name;
        this.color = color;
        
        this.x = x;
        this.y = y;
    }
    
    preFrame() {}
    
    postFrame() {}
    
    advanceFrame() {
        this.preFrame();
        
        if (this.next != false)
            drawCircle(this.x, this.y, height / 96, this.color);
        else
            drawCircle(this.x, this.y, height / 64, this.color);
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
    constructor(name, color, ocolor, lcolor1, lcolor2, p, r, f, v) {
        super(name, color, p.x + rf2x(r, f), p.y + rf2y(r, f));
        
        this.ocolor = ocolor;
        this.lcolor1 = lcolor1;
        this.lcolor2 = lcolor2;
        
        this.p = p;
        this.r = r;
        this.f = f;
        this.v = v;
    }
    
    preFrame() {
        drawCircle(this.p.x, this.p.y, this.r, this.ocolor);
        if (this.next == false) {
            if (!Object.is(this.p, a))
                drawLine(this.p.x, this.p.y, this.x, this.y, this.lcolor1);
            drawLine(a.x, a.y, this.x, this.y, this.lcolor2);
        } else {
            drawLine(a.x, a.y, this.x, this.y, this.lcolor1);
        }
    }
    
    renderGraph(i, p) {
        drawLabel(2, i * 12 + 9, 27, `${p.name}-${this.name}`);
        drawLabel(129, i * 12 + 9, width, sex3(p.observe(this)));
        fillBox(27, i * 12, 100, 12, this.lcolor1);
        fillBox(27, i * 12, p.observe(this) / 3.6, 12, this.lcolor2);
    }
    
    postFrame() {
        this.f = (this.f + this.v) % 360;
        
        this.x = this.p.x + rf2x(this.r, this.f);
        this.y = this.p.y - rf2y(this.r, this.f);
    }
}

/* MAIN SECTION ***************************************************************/

var a = new StaticObject("α", "#FFF", width / 2, height / 2 + width / 18);

var b = new OrbitingBody("β", "#FFF", "#0FFA", "#F00A", "#FF0A", a, width / 3, bf.valueAsNumber, bv.valueAsNumber);
var g = new OrbitingBody("γ", "#FFF", "#0FFA", "#F00A", "#FF0A", b, width / 9, gf.valueAsNumber, gv.valueAsNumber);
b.next = g;

var d = new StaticObject("δ", "#FFF", width / 2, height / 2 - width / 18);
var e = new OrbitingBody("ε", "#FFF", "#0FFA", "#F00A", "#FF0A", d, width / 3, ef.valueAsNumber, ev.valueAsNumber);
d.next = e;

function upva() {
    b.f = bf.valueAsNumber;
    b.v = bv.valueAsNumber;
    g.f = gf.valueAsNumber;
    g.v = gv.valueAsNumber;
    e.f = ef.valueAsNumber;
    e.v = ev.valueAsNumber;
}

function loop() {
    if (wm.checked)
        context.fillStyle = "#00000001";
    else
        context.fillStyle = "#000";
    context.fillRect(0, 0, width, height);
    
    a.advanceFrame();
    
    if (rm1.checked) {
        b.advanceFrame();
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