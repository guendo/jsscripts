function isIE() { return window.ActiveXObject };
function Browse( id ) {
  var tbl = GI$(id), tr;
  this.id = id; this.trhea; this.trbod = ""; this.ntr = -1; this.onrow = null; this.onesc = null; this.scrtop = 0;
  for( var i = 0; i<tbl.rows.length; i++ ) {
    tr = tbl.rows[i];
    if( i == 0 && tr.parentNode.nodeName == "THEAD" ) {
      this.trhea = tr.className || "trhea";
      tr.className = this.trhea;
      this.ntr++;
    }
    else {
      if( !this.trbod )
        this.trbod = tr.className || "trbod";
      tr.cells[0].className = "lf";
    }
  }
  this.ntr++;
}

Browse.prototype.key = function( e ) {
  var o = Browse.o, tbl = GI$(o.id), tr, trc;
  if( !tbl ) {
    document.onkeydown = null;
    return true;
  }
  e = e || window.event;
  if( e.keyCode == 38 || e.keyCode == 40 ) {
    trc = tr = tbl.rows[o.ntr];
    if( e.keyCode == 38 ) { // Up
      while( (tr = tr.previousSibling) != null ) {
        if( tr.nodeType == 1 ) {
          break;
        }
      }
      if( o.h && tr.offsetTop+4 < o.tbo.scrollTop ) {
        o.tbo.scrollTop = tr.offsetTop;
        o.lScr = true;
      }
    }
    else if( e.keyCode == 40 ) { // Down
      while( (tr = tr.nextSibling) != null ) {
        if( tr.nodeType == 1 ) {
          break;
        }
      }
      if( o.h && tr.offsetTop+4 > (o.h+o.tbo.scrollTop) ) {
        o.tbo.scrollTop = tr.offsetTop + tr.offsetHeight - o.h;
        o.lScr = true;
      }
    }
    if( tr ) {
      trc.className = o.trbod;
      tr.className = "trsel";
    }
    o.ntr = tr.ntr;
    e.preventDefault ? e.preventDefault() : (e.returnValue=false);
    return false;
  }
  else if( e.keyCode == 13 && o.onrow ) {
    o.onrow();
    e.preventDefault ? e.preventDefault() : (e.returnValue=false);
    return false;
  }
  else if( e.keyCode == 27 && o.onesc ) {
    o.onesc();
    e.preventDefault ? e.preventDefault() : (e.returnValue=false);
    return false;
  }
  return true;
};

Browse.prototype.click = function( e ) {
  var tr, o = Browse.o, tbl = GI$(o.id), trc = tbl.rows[o.ntr];
  e = e || window.event; tr = (e.target || e.srcElement).parentNode;
  if( tr.parentNode.nodeName !== "THEAD" ) {
    trc.className = o.trbod;
    tr.className = "trsel";
    o.ntr = tr.ntr;
  }
};

Browse.prototype.scro = function() {
  var o = Browse.o, rows = GI$(o.id).rows, i, tr = rows[o.ntr];
  if( o.lScr || o.scrtop == o.tbo.scrollTop )
    o.lScr = false;
  else if( o.tbo.scrollTop > o.scrtop ) {    
    for( i=rows.length-2; i>=0; i-- )
      if( rows[i].offsetTop < o.h+o.tbo.scrollTop ) {
        tr.className = o.trbod;
        i++; o.tbo.scrollTop = rows[i].offsetTop + rows[i].offsetHeight - o.h;
        rows[i].className = "trsel";
        o.ntr = i;
        //o.lScr = true;
        break;
      }
  }
  else {
    for( i=1; i<rows.length; i++ )
      if( rows[i].offsetTop > o.tbo.scrollTop ) {
        tr.className = o.trbod;
        i--; o.tbo.scrollTop = rows[i].offsetTop;
        rows[i].className = "trsel";
        o.ntr = i;
        //o.lScr = true;
        break;
      }
  }
  o.scrtop = o.tbo.scrollTop;
  return true;
};

Browse.prototype.tr = function() {
  return GI$(this.id).rows[this.ntr];
};

Browse.prototype.init = function(h) {
  var tbl = GI$(this.id), tr, ntr = -1, i, arr;
  Browse.o = this;
  for( i = 0; i<tbl.rows.length; i++ ) {
    tr = tbl.rows[i];
    tr.ntr = i;
    if( !this.trhea || tr.className !== this.trhea )
      tr.className = this.trbod;
    else
      ntr++;
  }
  ntr++;
  tbl.rows[this.ntr].className = "trsel";
  if( ( this.tbo || ( h && h < tbl.clientHeight && tbl.rows.length > 3 ) ) && (arr=tbl.getElementsByTagName('tbody')).length == 1 ) {
    var tbo = arr[0], trh, tr0 = tbl.rows[0];
    if( isIE() ) {
      var dv = tbl.parentNode;
      dv.id = "wbtb";
      dv.style.height = this.h = h + tr0.clientHeight;
      this.tbo = dv;
    }
    else {
      tr = tbl.rows[ntr];
      arr = [];
      for( i = 0; i<tr.cells.length; i++ )
        arr[i] = tr.cells[i].clientWidth;
      tbo.className = "tbscroll";
      for( i = 0; i<tr.cells.length; i++ )
        tr.cells[i].style.width = arr[i]+'px';
      for( i = 0; i<tr.cells.length; i++ ) {
        tr.cells[i].style.width = arr[i]-(tr.cells[i].clientWidth-arr[i])+'px';
        if( ntr > 0 )
          tr0.cells[i].style.width = tr.cells[i].style.width;
      }
      trh = tbl.rows[ntr+1].offsetTop - tr.offsetTop;
      this.h = trh * (Math.floor(h/trh));
      tbo.style.height = this.h + 'px';
      this.tbo = tbo;
    }
    this.tbo.onscroll = this.scro;
  }
  document.onkeydown = this.key;
  tbl.onclick = this.click;
  tbl.ondblclick = function() { if( Browse.o.onrow ) Browse.o.onrow(); };
};
