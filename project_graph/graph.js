var defaultFillColor = '#474747';
var defaultOutlineColor = 'white';
var defaultBackgroundColor = '#212121';
var canvas_id = "project-graph"

window.onload = function(){
  var canvas_anchor = document.getElementById("canvas-anchor");
  var w, h;
  w = 800;
  h = 600;

  var canvas = document.createElement('CANVAS');
  canvas.setAttribute('id', canvas_id);
  canvas.setAttribute('width', w);
  canvas.setAttribute('height', h);
  canvas.setAttribute('tabindex', 1);
  canvas_anchor.appendChild(canvas);

  var graph = d3.select('#'+canvas_id);
  var context = graph.node().getContext("2d");
  var canvas = document.getElementById(canvas_id);
  canvas.setAttribute('style', 'position: relative');

  var view = {
    scale : 0.2,
    x: 3000, //center coords, be careful
    y: 3000,
    w: w,
    h: w,
    worldw: 6000,
    worldh: 6000,
    noderad: 0,
    strokew: 0,
    linestrokew: 0
  }

  var global = {
    'data': undefined,
    'view': view,
    'graph': graph,
    'context': context,
    'noderad': 0,
    'strokew': 0,
    'dragging': false,
    'dragpos': undefined,
    'applydrag': undefined,
    'selected': undefined,
    'unclicked': false
  }

  function addEvent(el, ev, func) {
    if (el.addEventListener) {
        el.addEventListener(ev, func, false);
    } else if (el.attachEvent) {
        el.attachEvent("on" + ev, func);
    } else {
        el["on"+ev] = func; // Note that this line does not stack events. You must write you own stacker if you don't want overwrite the last event added of the same type. Btw, if you are going to have only one function for each event this is perfectly fine.
    }
  }

  addEvent(canvas, "mousewheel", function(e){
    if (e.deltaY > 0){ //dezoom
      global.view.scale /= 1.2;
    } else { //zoom
      global.view.scale *= 1.2;
    }
    return false;
  });

  addEvent(canvas, "DOMMouseScroll", function(e){
    if (e.detail > 0) {
      global.view.scale /= 1.2;
    } else if (e.detail < 0) {
      global.view.scale *= 1.2;
    }
    e.preventDefault();
    return false;
  })

  canvas.onmousewheel = function(){
    return false;
  }


  addEvent(canvas, 'mousedown', function(e){
    var canx, cany;
    canx = e.layerX;
    cany = e.layerY;
    global.dragging = true;
    global.dragpos = [canx, cany];
    return false;
  }, true);

  function select(e){
    global.unclicked = true;
    var canx, cany;
    canx = e.layerX;
    cany = e.layerY;
    global.dragging = false;
    var select = false;
    global.mapped.projects.forEach(function(e, i){
      if (e.kind == 'piscine'){
        if (canx >= e.mx-50*global.view.scale && canx <= e.mx+50*global.view.scale &&
            cany >= e.my-25*global.view.scale && cany <= e.my+25*global.view.scale) {
          e.selected = true;
          global.selected = e;
          select = i;
        }
      } else {
        var dx, dy;
        dx = canx - e.mx;
        dy = cany - e.my;
        if (Math.sqrt(dx*dx+dy*dy) < global.view.noderads[e.difficulty]){
          e.selected = true;
          global.selected = e;
          select = i;
        }
      }
    });
    if (select != false){
      global.mapped.projects.forEach(function(e, i){
        if (select != i){
          e.selected = false;
        }
      });

      var elem = document.createElement('DIV');
      var title = document.createElement('DIV');
      var tier = document.createElement('DIV');
      var desc = document.createElement('DIV');

      elem.setAttribute('id', 'project-data-container');

      title.appendChild(document.createTextNode(global.selected.name));
      title.setAttribute('id', 'project-data-title');

      tier.appendChild(document.createTextNode(global.selected.difficulty));
      tier.setAttribute('id', 'project-data-tier');

      desc.appendChild(document.createTextNode(global.selected.description))
      desc.setAttribute('id', 'project-data-description');

      elem.appendChild(title);
      elem.appendChild(tier);
      elem.appendChild(desc);

      var anchor = document.getElementById('project-desc-insert-point');
      while (anchor.firstChild){
        anchor.removeChild(anchor.firstChild);
      }
      anchor.appendChild(elem);
    }
    return false;
  }

  d3.json('project_graph/graph.json', function(error, data){
    if (error){throw error;}
    data.forEach(function(node){
      node.selected = false;
    })
    global.data = data;
  });

  addEvent(canvas, 'mousemove', function(e){
    if (global.unclicked){
      select(e);
      global.unclicked = false;
    }
    if (global.dragging == true){
      var canx, cany;
      canx = e.layerX;
      cany = e.layerY;
      var mx, my;
      mx = global.dragpos[0] - canx;
      my = global.dragpos[1] - cany;
      global.applydrag = [mx, my];
      global.dragpos = [canx, cany];
      global.view.x += global.applydrag[0] / global.view.scale;
      global.view.y += global.applydrag[1] / global.view.scale;
    }
    return false;
  }, true);

  addEvent(canvas, 'click', function(e){
    global.unclicked = true;
    select(e);
    return false;
  }, true);

  d3.json('project_graph/graph.json', function(error, data){
    if (error){throw error;}
    data.forEach(function(node){
      node.selected = false;
    })
    global.data = data;
  })

  function map_view(v, data){
    var caminx, caminy, camaxx, camaxy;
    caminx = v.x - (v.w / v.scale) / 2.0;
    caminy = v.y - (v.h / v.scale) / 2.0;
    camaxx = v.x + (v.w / v.scale) / 2.0;
    camaxy = v.y + (v.h / v.scale) / 2.0;

    data.forEach(function(e){
        e.mx = (e.x - caminx) * v.scale;
        e.my = (e.y - caminy) * v.scale;
        e.mby = [];
        e.by.forEach(function(line, j){
          var nline = {"points":[], "parent_id": line.parent_id};
          line.points.forEach(function(point, i){
            var npoint = [];
            npoint.push((point[0] - caminx) * v.scale);
            npoint.push((point[1] - caminy) * v.scale);
            nline.points.push(npoint);
          });
          e.mby.push(nline);
        });
    });

    var x, y;
    x = (3000 - caminx) * v.scale;
    y = (3000 - caminy) * v.scale;
    var arcs = [
      {x:x, y:y, rad:1000*v.scale},
      {x:x, y:y, rad:2200*v.scale}
    ];

    return {
      projects: data,
      arcs: arcs
    };
  }

  setInterval(function (){
    var v = global.view;
    // v.noderad = 30 * v.scale;
    v.noderad = 50 * v.scale;
    v.noderads = {
      "Tier 0": 50 * v.scale,
      "Tier 1": 50 * v.scale,
      "Tier 2": 50 * v.scale,
      "Tier 3": 70 * v.scale,
      "Tier 4": 70 * v.scale,
      "Tier 5": 100 * v.scale,
      "Tier ": 120 * v.scale
    }
    v.strokew = 5 * v.scale;
    v.linestrokew = 10 * v.scale;

    var context = global.context;
    context.beginPath();
    context.fillStyle = defaultBackgroundColor;
    context.rect(0, 0, view.w, view.h);
    context.fill();
    context.closePath();

    //coordinates mapping from viewport
    var mapped = map_view(v, global.data);
    global.mapped = mapped;

    if (global.selected != undefined){
      var e = global.selected;
      var rad = v.noderads[e.difficulty];
      if (e.name.startsWith('KFS')){
        rad = v.noderads['Tier 1'];
      }
      var grd = context.createRadialGradient(e.mx, e.my, rad, e.mx, e.my, rad*1.3);
      grd.addColorStop(0, defaultOutlineColor);
      grd.addColorStop(1, defaultBackgroundColor);
      context.fillStyle = grd;
      context.fillRect(e.mx-200*v.scale, e.my-200*v.scale, 400*v.scale, 400*v.scale);
    }
    mapped.arcs.forEach(function(e){
      context.beginPath();
      context.arc(e.x, e.y, e.rad, 0, 2 * Math.PI, true);
      context.lineWidth = v.strokew;
      context.strokeStyle = "darkgrey";
      context.stroke();
      context.closePath();
    })
    mapped.projects.forEach(function(e, index){
      context.lineWidth = v.linestrokew;
      context.strokeStyle = 'lightgrey';
      e.mby.forEach(function(line){
        if (line.points.length != 2){console.log("You're a lousy programmer");}
        var start = line.points[0];
        var end = line.points[1];
        context.beginPath();
        context.moveTo(start[0], start[1]);
        context.lineTo(end[0], end[1]);
        context.stroke();
        context.closePath();
      })
    });
    mapped.projects.forEach(function(e){
      context.fillStyle = defaultFillColor;
      context.strokeStyle = defaultOutlineColor;
      context.lineWidth = v.strokew;
      context.beginPath();
      if (e.kind == "piscine"){
        context.rect(e.mx-70*v.scale, e.my-25*v.scale, 140*v.scale, 50*v.scale);
      } else {
        if (e.name.startsWith('KFS')){
          context.arc(e.mx, e.my, v.noderads["Tier 1"], 0, 2 * Math.PI, true);
        } else {
          context.arc(e.mx, e.my, v.noderads[e.difficulty], 0, 2 * Math.PI, true);
        }
      }
      context.fill();
      context.stroke();
      context.closePath();
      context.fillStyle = defaultOutlineColor;
      context.textAlign = "center"
      var fontweight = Math.round(25*v.scale);
      if (e.kind == 'piscine'){
        if (e.name.length > (10*v.noderads[e.difficulty])/(50*v.scale)){
          fontweight = Math.round((20*v.scale) - ((20*v.scale) * (e.name.length / 40)));
        }
      } else {
        if (e.name.length > (8*v.noderads[e.difficulty])/(100*v.scale)){
          fontweight = Math.round((20*v.scale) - ((20*v.scale) * (e.name.length / 30)));
        }
      }

      context.font = fontweight+'px Monaco';
      context.fillText(e.name, e.mx, e.my+(fontweight/2));
    });
  }, 17);
}