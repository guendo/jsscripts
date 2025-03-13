function Getsys( arr,idok,idcl  ) {
  var inp, type, cpict;
  this.list = arr;
  for( var i = 0; i < arr.length; i++ ) {
    inp = GI$( arr[i][0] );
    if( inp ) {
      inp.numget = i;
      inp.value = arr[i][3] || this.empval( arr[i][1] );
      if( !arr[i][1] ) {
        inp.size = inp.value.length || 1;
        inp.className = "dis";
        inp.disabled = 1;
      }
      else {
        inp.onkeydown = function(event){ return Getsys.o.chkmsk(event,this) };
        inp.onkeypress = function(event){ return Getsys.o.kpress(event) };
        inp.onblur = function(){ return Getsys.o.lfocus(this) };
        type = arr[i][1].substring( 0,1 ); cpict = arr[i][1].substring( 1 );
        if( type == 'D' || type == 'N' )
          inp.size = inp.maxLength = cpict.length;
        else {
          var pos = cpict.indexOf('/');
          inp.maxLength = parseInt(cpict);
          inp.size = (pos==-1)? inp.maxLength : parseInt(cpict.substring(pos+1));
        }
      }
      this.SetCurPos( inp,0 );
    }
  }
  this.retval = true;
  this.fkeys = null;
  this.idok = idok; this.idcl = idcl;
}

Getsys.prototype.GetCurPos = function( inp ) {
  if( document.selection )
  {
    inp.focus();
    var Sel = document.selection.createRange();
    Sel.moveStart( 'character', -inp.value.length );
    return Sel.text.length;
  }
  else if( inp.selectionStart || inp.selectionStart == '0' )
    return inp.selectionStart;
  else
    return 0;
};

Getsys.prototype.SetCurPos = function( inp,pos ) {
  if( inp.setSelectionRange )
  {
    inp.focus();
    inp.setSelectionRange(pos,pos);
  }
  else if( inp.createTextRange )
  {
    var range = inp.createTextRange();
    range.collapse(true);
    range.moveEnd('character', pos);
    range.moveStart('character', pos);
    range.select();
  }
};

Getsys.prototype.UpdCurPos = function( inp,iPos,keycode,cpict ) {
  if( keycode == 37 )
    iPos = (iPos==0)? 0 : iPos-1;
  else if( keycode == 36 )
    iPos = 0;
  else if( keycode == 39 )
    iPos = (iPos>=inp.value.length-1)? inp.value.length-1 : iPos+1;
  else if( keycode == 35 )
    iPos = inp.value.length-1;
  cKey = cpict.substring( iPos,iPos+1 );
  if( cKey != 'X' && cKey != '9' )
  {
    if( iPos == 0 )
      iPos++;
    else if( iPos == inp.value.length-1 || keycode == 37 )
      iPos--;
    else if( keycode == 39 )
      iPos++;
  }
  this.SetCurPos( inp,iPos );
};

Getsys.prototype.isDigit = function( code ) {
  return (code <= 57 && code >= 48);
};

Getsys.prototype.isChar = function( code ) {
  return ( (code <= 47 && code >= 32) || (code <= 90 && code >= 58) || (code <= 192 && code >= 186) || (code <= 222 && code >= 219) );
},

Getsys.prototype.allTrim = function( s ) {
  return s.replace( /^\s+|\s+$/,"" );
};

Getsys.prototype.recode = function( code ) {
  if( code >= 96 && code <= 105 )
    return code - 48;
  else if( code == 110 )
    return 190;
  else
    return code;
};

Getsys.prototype.retFalse = function( e ) {
  e.preventDefault ? e.preventDefault() : (e.returnValue=false);
  this.retval = false;
  return false;
};

Getsys.prototype.chkmsk = function( ev, inp ) {
  var o = Getsys.o, iPos = o.GetCurPos( inp ), cpict, keycode, ctype, i;

  ev = ev || window.event;
  keycode = o.recode( ev.keyCode );
  cpict = o.list[inp.numget][1];
  ctype = cpict.substring(0,1); cpict = cpict.substring(1);
  o.retval = true;
  if( keycode == 38 ) // Up
  {
    for( i=inp.numget-1; i>=0; i-- )
      if( o.list[i][1] )
        break;
    if( i >= 0 )
      o.SetCurPos( GI$(o.list[i][0]),0 );
    return o.retFalse(ev);
  }
  else if( keycode == 40 || keycode == 13 || keycode == 9 || keycode == 34 ) // Down
  {
    if( inp.numget+1 < o.list.length && keycode !== 34 ) {
      for( i=inp.numget+1; i<o.list.length; i++ )
        if( o.list[i][1] )
          break;
      if( i < o.list.length )
        o.SetCurPos( GI$(o.list[i][0]),0 );
    }
    else if( ( keycode == 34 || keycode == 13 ) && o.idok ) {
      o.lfocus( inp );
      GI$(o.idok).onclick();
    }
    return o.retFalse(ev);
  }
  else if( keycode == 27 ) // Esc
  {
    if( o.idcl )
    {
      GI$(o.idcl).onclick();
      return o.retFalse(ev);
    }
    else
      return true;
  }
  else if( keycode >= 112 && keycode <= 123 ) // F1..F12
  {
    if( o.fkeys && o.fkeys[String(keycode)] )
    {
      o.fkeys[String(keycode)](keycode,inp);
      return o.retFalse(ev);
    }
    else
      return true;
  }
  if( ctype == "C" )
    return true;
  else
  {
    if( keycode >= 35 && keycode <= 39 )
    {
      o.UpdCurPos( inp,iPos,keycode,cpict );
      return o.retFalse(ev);
    }
    if( iPos < inp.value.length )
    {
      if( keycode == 46 || keycode == 8 )
      {
        if( keycode == 8 ) {
          if( iPos == 0 )
            return o.retFalse(ev);
          else
            do iPos--; while( iPos > 0 && cpict.charAt(iPos) !== '9' )
        }
        for( i=iPos;i<cpict.length;i++ )
          if( cpict.charAt(i) !== '9' )
            break;
        inp.value = inp.value.substring(0,iPos) + inp.value.substring(iPos+1,i) + ' ' + inp.value.substring(i);
        o.SetCurPos( inp,iPos );
      }
      else
      {
        if( cpict.substring( iPos,iPos+1 ) == '9' )
        {
          if( o.isDigit(keycode) ) {
            if( iPos == 0 && inp.value.charAt(0) == ' ' ) {
              var csp = "";
              for( i=iPos+1;i<cpict.length;i++ )
                if( cpict.charAt(i) !== '9' )
                  break;
                else
                  csp += ' ';
              inp.value = (keycode-48) + csp + inp.value.substring(i);
            }
            else
              inp.value = inp.value.substring(0,iPos) + (keycode-48) + inp.value.substring(iPos+1);
            o.UpdCurPos( inp,iPos,39,cpict );
          }
          else if( keycode == 190 && ctype == "N" && (i = cpict.indexOf('.')) !== -1 ) {
            inp.value = o.delsp( inp.value, cpict );
            o.UpdCurPos( inp,i,39,cpict );
          }
          return o.retFalse(ev);
        }
      }
    }
    return o.retFalse(ev);
  }
  return true;
};

Getsys.prototype.kpress = function(ev) {
  if( this.retval )
    return true;
  else
    return this.retFalse(ev);
};

Getsys.prototype.delsp = function( s,cpict ) {
  var i, s1 = "", c, s2;
  for( i=0; i<cpict.length; i++ ) {
    if( cpict.charAt(i) == '.' )
      break;
    if( (c = s.charAt(i)) >= '0' && c <= '9' )
      s1 += c;
    else
      s1 = ' ' + s1;
  }
  s2 = s.substring(i);
  for( i=i-1; i>=0; i-- )
    s2 = ( ((c = cpict.charAt(i)) !== '9')? c : s1.charAt(i) ) + s2;
  return s2;
};

Getsys.prototype.empval = function( s ) {
  var type = s.substring( 0,1 ), cpict = s.substring( 1 ), value;
  if( type == "D" )
    value = cpict.replace(/9/g,' ');
  else if( type == "N" )
  {
    var npos = cpict.lastIndexOf(".");
    if( npos >= 0 )
      value = (cpict.substring(0,npos-1)+cpict.substring(npos-1).replace(/9/g,'0')).replace(/9/g,' ');
    else
      value = cpict.replace(/9$/,'0').replace(/9/g,' ');
  }
  else
    value = "";
  return value;
};

Getsys.prototype.post = function() {
  var arr = this.list, inp, s = "";
  for( var i = 0; i < arr.length; i++ ) {
    inp = GI$( arr[i][0] );
    if( inp.value !== this.empval( arr[i][1] ) )
      s += "&" + arr[i][2] + '=' + inp.value;
  }
  return s;
},

Getsys.prototype.haserr = function() {
  var o = Getsys.o;
  for( var i = 0; i < o.list.length; i++ )
    if( GI$(o.list[i][0]).className == "geterr" )
      return true;
  return false;
};

Getsys.prototype.lfocus = function( inp ) {
  var o = Getsys.o, cpict, ctype, ad = [31,29,31,30,31,30,31,31,30,31,30,31];
  if( inp.id !== o.list[inp.numget][0] )
    return;
  cpict = o.list[inp.numget][1]; ctype = cpict.substring(0,1);
  if( inp.value !== o.empval( cpict ) ) {
    cpict = cpict.substring(1);
    if( ctype == 'D' ) {
      var nd = parseInt(inp.value,10), nm = parseInt(inp.value.substring(3),10);
      if( inp.value.indexOf(' ') != -1 || nm > 12 || nm == 0 || nd == 0 || nd > ad[nm-1] ) {
        inp.className = "geterr";
      }
      else
        inp.className = "";
    }
    else if( ctype == 'N' )
      inp.value = o.delsp( inp.value, cpict );
  }
},

Getsys.prototype.init = function( inp ) {
  Getsys.o = this;
  (inp)? inp.focus() : GI$(this.list[0][0]).focus();
};
