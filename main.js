/* GRAPHICS PRIMITIVES ********************************************************/

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const width = (canvas.width = 512);
const height = (canvas.height = 512);

const pbg = document.getElementById("pbg");
const tbg = document.getElementById("tbg");
const psb = document.getElementById("psb");
const tsb = document.getElementById("tsb");
const psg = document.getElementById("psg");
const tsg = document.getElementById("tsg");
const pma = document.getElementById("pma");
const tma = document.getElementById("tma");
const pmg = document.getElementById("pmg");
const tmg = document.getElementById("tmg");

const rm1 = document.getElementById("rm1");
const rm2 = document.getElementById("rm2");

const dl = document.getElementById("dl");
const dg = document.getElementById("dg");
const ao = document.getElementById("ao");
const oo = document.getElementById("oo");
const pa = document.getElementById("pa");
const pt = document.getElementById("pt");
const cm = document.getElementById("cm");
const am = document.getElementById("am");
const cg = document.getElementById("cg");
const wm = document.getElementById("wm");

const br = document.getElementById("br");
const ba = document.getElementById("bf");
const bv = document.getElementById("bv");
const sr = document.getElementById("sr");
const sa = document.getElementById("sf");
const sv = document.getElementById("sv");
const mr = document.getElementById("mr");
const ma = document.getElementById("mf");
const mv = document.getElementById("mv");
const gx = document.getElementById("gx");
const gy = document.getElementById("gy");
const ax = document.getElementById("ax");
const ay = document.getElementById("ay");

function drawLine(x1, y1, x2, y2, color) {
    context.beginPath();
    context.strokeStyle = color;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
}

function drawArc(x, y, r, s, e, color) {
    context.beginPath();
    context.strokeStyle = color;
    context.arc(x, y, r, s, e);
    context.stroke();
}

function drawCircle(x, y, r, color) {
    drawArc(x, y, r, 0, 2 * Math.PI, color);
}

function drawLabel(x, y, w, label) {
    context.beginPath();
    context.strokeStyle = "rgb(255 255 255)";
    context.font = "12px serif";
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
        return m.toString().padStart(3, '0');
    return m.toString().padStart(3, '0') + s + sexi(i - 1, ",", (n - m) * 60);
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
            drawCircle(this.x, this.y, 4, this.color);
        else
            drawCircle(this.x, this.y, 8, this.color);
        
        if (dl.checked)
            drawLabel(this.x + 8 + 2, this.y, 12, this.name);
        
        if (this.next != false)
            this.next.advanceFrame();
        
        this.postFrame();
    }
    
    observe(object) {
        return 180 + xy2f(this.x - object.x, object.y - this.y);
    }
}

class OrbitingBody extends StaticObject {
    constructor(name, color, ocolor, lcolor1, lcolor2, p, r, ro, f, v) {
        super(name, color, p.x + rf2x(r, f), p.y + rf2y(r, f));
        
        this.ocolor = ocolor;
        this.lcolor1 = lcolor1;
        this.lcolor2 = lcolor2;
        
        this.p = p;
        this.r = r;
        this.ro = ro;
        this.f = f;
        this.v = v;
    }
    
    preFrame() {
        if (cm.checked)
            drawCircle(this.p.x, this.p.y, this.r, this.ocolor);
        else if (am.checked)
            drawArc(this.p.x, this.p.y, this.r, -deg2rad(this.f), 0, this.ocolor);
        else if (cg.checked) {}
        
        if (this.next == false) {
            if (ao.checked && !Object.is(this.p, g))
                drawLine(this.p.x, this.p.y, this.x, this.y, this.lcolor1);
            if (pa.checked)
                drawArc(g.x, g.y, this.ro, -deg2rad(g.observe(this)), 0, this.lcolor2);
            if (oo.checked)
                drawLine(g.x, g.y, this.x, this.y, this.lcolor2);
        } else if (ao.checked) {
            drawLine(g.x, g.y, this.x, this.y, this.lcolor1);
        }
    }
    
    postFrame() {
        this.f = (this.f + this.v) % 360;
        
        this.x = this.p.x + rf2x(this.r, this.f);
        this.y = this.p.y - rf2y(this.r, this.f);
    }
}

/* MAIN SECTION ***************************************************************/

var g = new StaticObject("Γ", "#0F0", gx.valueAsNumber, gy.valueAsNumber);

var b = new OrbitingBody("Β", "#F00", "#0FFA", "#F00A", "#FF0A", g, br.valueAsNumber, 0, bf.valueAsNumber, bv.valueAsNumber);
var s = new OrbitingBody("Σ", "#FF0", "#0FFA", "#F00A", "#FF0A", b, sr.valueAsNumber, 72, sf.valueAsNumber, sv.valueAsNumber);
b.next = s;

var a = new StaticObject("Α", "#F00", ax.valueAsNumber, ay.valueAsNumber);
var m = new OrbitingBody("M", "#FF0", "#0FFA", "#F00A", "#FF0A", a, mr.valueAsNumber, 64, mf.valueAsNumber, mv.valueAsNumber);
a.next = m;

function drawScene(bg, fg) {
    fillBox(0, 0, width, height, bg);
    
    if (dg.checked) {
        drawLine(256, 16, 256, 496, fg);
        drawLabel(256 + 6, 16 + 9, 36, "90");
        drawLabel(256 + 6, 496, 36, "270");
        drawLine(16, 256, 496, 256, fg);
        drawLabel(16, 256 - 6, 36, "180");
        drawLabel(496 - 6, 256 - 6, 36, "0");
    }
}

function upva() {
    b.r = br.valueAsNumber;
    b.f = bf.valueAsNumber;
    b.v = bv.valueAsNumber;
    s.r = sr.valueAsNumber;
    s.f = sf.valueAsNumber;
    s.v = sv.valueAsNumber;
    m.r = mr.valueAsNumber;
    m.f = mf.valueAsNumber;
    m.v = mv.valueAsNumber;
    
    g.x = gx.valueAsNumber;
    g.y = gy.valueAsNumber;
    a.x = ax.valueAsNumber;
    a.y = ay.valueAsNumber;
}

function loop() {
    if (wm.checked)
        drawScene("#00000001", "#FFF");
    else
        drawScene("#000", "#FFF");
    
    g.advanceFrame();
    
    if (rm1.checked) {
        b.advanceFrame();
        pbg.value = g.observe(b);
        tbg.textContent = sex3(g.observe(b));
        psb.value = b.observe(s);
        tsb.textContent = sex3(b.observe(s));
        psg.value = g.observe(s);
        tsg.textContent = sex3(g.observe(s));
    }
    
    if (rm2.checked) {
        a.advanceFrame();
        pma.value = a.observe(m);
        tma.textContent = sex3(a.observe(m));
        pmg.value = g.observe(m);
        tmg.textContent = sex3(g.observe(m));
    }
    
    requestAnimationFrame(loop);
}

loop();