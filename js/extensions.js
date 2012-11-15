define(['jquery'], function ($) {
  
(function($) {
var supportedCSS,styles=document.getElementsByTagName("head")[0].style,toCheck="transformProperty WebkitTransform OTransform msTransform MozTransform".split(" ");
for (var a=0;a<toCheck.length;a++) if (styles[toCheck[a]] !== undefined) supportedCSS = toCheck[a];
// Bad eval to preven google closure to remove it from code o_O
// After compresion replace it back to var IE = 'v' == '\v'
var IE = eval('"v"=="\v"');

jQuery.fn.extend({
    rotate:function(parameters)
    {
        if (this.length===0||typeof parameters=="undefined") return;
            if (typeof parameters=="number") parameters={angle:parameters};
        var returned=[];
        for (var i=0,i0=this.length;i<i0;i++)
            {
                var element=this.get(i);  
                if (!element.Wilq32 || !element.Wilq32.PhotoEffect) {

                    var paramClone = $.extend(true, {}, parameters); 
                    var newRotObject = new Wilq32.PhotoEffect(element,paramClone)._rootObj;

                    returned.push($(newRotObject));
                }
                else {
                    element.Wilq32.PhotoEffect._handleRotation(parameters);
                }
            }
            return returned;
    },
    getRotateAngle: function(){
        var ret = [];
        for (var i=0,i0=this.length;i<i0;i++)
            {
                var element=this.get(i);  
                if (element.Wilq32 && element.Wilq32.PhotoEffect) {
                    ret[i] = element.Wilq32.PhotoEffect._angle;
                }
            }
            return ret;
    },
    stopRotate: function(){
        for (var i=0,i0=this.length;i<i0;i++)
            {
                var element=this.get(i);  
                if (element.Wilq32 && element.Wilq32.PhotoEffect) {
                    clearTimeout(element.Wilq32.PhotoEffect._timer);
                }
            }
    }
});

// Library agnostic interface

Wilq32=window.Wilq32||{};
Wilq32.PhotoEffect=(function(){

  if (supportedCSS) {
    return function(img,parameters){
      img.Wilq32 = {
        PhotoEffect: this
      };
            
            this._img = this._rootObj = this._eventObj = img;
            this._handleRotation(parameters);
    }
  } else {
    return function(img,parameters) {
      // Make sure that class and id are also copied - just in case you would like to refeer to an newly created object
            this._img = img;

      this._rootObj=document.createElement('span');
      this._rootObj.style.display="inline-block";
      this._rootObj.Wilq32 = 
        {
          PhotoEffect: this
        };
      img.parentNode.insertBefore(this._rootObj,img);
      
      if (img.complete) {
        this._Loader(parameters);
      } else {
        var self=this;
        // TODO: Remove jQuery dependency
        jQuery(this._img).bind("load", function()
        {
          self._Loader(parameters);
        });
      }
    }
  }
})();

Wilq32.PhotoEffect.prototype={
    _setupParameters : function (parameters){
    this._parameters = this._parameters || {};
        if (typeof this._angle !== "number") this._angle = 0 ;
        if (typeof parameters.angle==="number") this._angle = parameters.angle;
        this._parameters.animateTo = (typeof parameters.animateTo==="number") ? (parameters.animateTo) : (this._angle); 

        this._parameters.step = parameters.step || this._parameters.step || null;
    this._parameters.easing = parameters.easing || this._parameters.easing || function (x, t, b, c, d) { return -c * ((t=t/d-1)*t*t*t - 1) + b; }
    this._parameters.duration = parameters.duration || this._parameters.duration || 1000;
        this._parameters.callback = parameters.callback || this._parameters.callback || function(){};
        if (parameters.bind && parameters.bind != this._parameters.bind) this._BindEvents(parameters.bind); 
  },
  _handleRotation : function(parameters){
          this._setupParameters(parameters);
          if (this._angle==this._parameters.animateTo) {
              this._rotate(this._angle);
          }
          else { 
              this._animateStart();          
          }
  },

  _BindEvents:function(events){
    if (events && this._eventObj) 
    {
            // Unbinding previous Events
            if (this._parameters.bind){
                var oldEvents = this._parameters.bind;
                for (var a in oldEvents) if (oldEvents.hasOwnProperty(a)) 
                        // TODO: Remove jQuery dependency
                        jQuery(this._eventObj).unbind(a,oldEvents[a]);
            }

            this._parameters.bind = events;
      for (var a in events) if (events.hasOwnProperty(a)) 
        // TODO: Remove jQuery dependency
          jQuery(this._eventObj).bind(a,events[a]);
    }
  },

  _Loader:(function()
  {
    if (IE)
    return function(parameters)
    {
      var width=this._img.width;
      var height=this._img.height;
      this._img.parentNode.removeChild(this._img);
              
      this._vimage = this.createVMLNode('image');
      this._vimage.src=this._img.src;
      this._vimage.style.height=height+"px";
      this._vimage.style.width=width+"px";
      this._vimage.style.position="absolute"; // FIXES IE PROBLEM - its only rendered if its on absolute position!
      this._vimage.style.top = "0px";
      this._vimage.style.left = "0px";

      /* Group minifying a small 1px precision problem when rotating object */
      this._container =  this.createVMLNode('group');
      this._container.style.width=width;
      this._container.style.height=height;
      this._container.style.position="absolute";
      this._container.setAttribute('coordsize',width-1+','+(height-1)); // This -1, -1 trying to fix ugly problem with small displacement on IE
      this._container.appendChild(this._vimage);
      
      this._rootObj.appendChild(this._container);
      this._rootObj.style.position="relative"; // FIXES IE PROBLEM
      this._rootObj.style.width=width+"px";
      this._rootObj.style.height=height+"px";
      this._rootObj.setAttribute('id',this._img.getAttribute('id'));
      this._rootObj.className=this._img.className;      
        this._eventObj = this._rootObj; 
        this._handleRotation(parameters); 
    }
    else
    return function (parameters)
    {
      this._rootObj.setAttribute('id',this._img.getAttribute('id'));
      this._rootObj.className=this._img.className;
      
      this._width=this._img.width;
      this._height=this._img.height;
      this._widthHalf=this._width/2; // used for optimisation
      this._heightHalf=this._height/2;// used for optimisation
      
      var _widthMax=Math.sqrt((this._height)*(this._height) + (this._width) * (this._width));

      this._widthAdd = _widthMax - this._width;
      this._heightAdd = _widthMax - this._height; // widthMax because maxWidth=maxHeight
      this._widthAddHalf=this._widthAdd/2; // used for optimisation
      this._heightAddHalf=this._heightAdd/2;// used for optimisation
      
      this._img.parentNode.removeChild(this._img);  
      
      this._aspectW = ((parseInt(this._img.style.width,10)) || this._width)/this._img.width;
      this._aspectH = ((parseInt(this._img.style.height,10)) || this._height)/this._img.height;
      
      this._canvas=document.createElement('canvas');
      this._canvas.setAttribute('width',this._width);
      this._canvas.style.position="relative";
      this._canvas.style.left = -this._widthAddHalf + "px";
      this._canvas.style.top = -this._heightAddHalf + "px";
      this._canvas.Wilq32 = this._rootObj.Wilq32;
      
      this._rootObj.appendChild(this._canvas);
      this._rootObj.style.width=this._width+"px";
      this._rootObj.style.height=this._height+"px";
            this._eventObj = this._canvas;
      
      this._cnv=this._canvas.getContext('2d');
            this._handleRotation(parameters);
    }
  })(),

  _animateStart:function()
  { 
    if (this._timer) {
      clearTimeout(this._timer);
    }
    this._animateStartTime = +new Date;
    this._animateStartAngle = this._angle;
    this._animate();
  },
    _animate:function()
    {
         var actualTime = +new Date;
         var checkEnd = actualTime - this._animateStartTime > this._parameters.duration;

         // TODO: Bug for animatedGif for static rotation ? (to test)
         if (checkEnd && !this._parameters.animatedGif) 
         {
             clearTimeout(this._timer);
         }
         else 
         {
             if (this._canvas||this._vimage||this._img) {
                 var angle = this._parameters.easing(0, actualTime - this._animateStartTime, this._animateStartAngle, this._parameters.animateTo - this._animateStartAngle, this._parameters.duration);
                 this._rotate((~~(angle*10))/10);
             }
             if (this._parameters.step) {
                this._parameters.step(this._angle);
             }
             var self = this;
             this._timer = setTimeout(function()
                     {
                     self._animate.call(self);
                     }, 10);
         }

         // To fix Bug that prevents using recursive function in callback I moved this function to back
         if (this._parameters.callback && checkEnd){
             this._angle = this._parameters.animateTo;
             this._rotate(this._angle);
             this._parameters.callback.call(this._rootObj);
         }
     },

  _rotate : (function()
  {
    var rad = Math.PI/180;
    if (IE)
    return function(angle)
    {
            this._angle = angle;
      this._container.style.rotation=(angle%360)+"deg";
    }
    else if (supportedCSS)
    return function(angle){
            this._angle = angle;
      this._img.style[supportedCSS]="rotate("+(angle%360)+"deg)";
    }
    else 
    return function(angle)
    {
            this._angle = angle;
      angle=(angle%360)* rad;
      // clear canvas 
      this._canvas.width = this._width+this._widthAdd;
      this._canvas.height = this._height+this._heightAdd;
            
      // REMEMBER: all drawings are read from backwards.. so first function is translate, then rotate, then translate, translate..
      this._cnv.translate(this._widthAddHalf,this._heightAddHalf);  // at least center image on screen
      this._cnv.translate(this._widthHalf,this._heightHalf);      // we move image back to its orginal 
      this._cnv.rotate(angle);                    // rotate image
      this._cnv.translate(-this._widthHalf,-this._heightHalf);    // move image to its center, so we can rotate around its center
      this._cnv.scale(this._aspectW,this._aspectH); // SCALE - if needed ;)
      this._cnv.drawImage(this._img, 0, 0);             // First - we draw image
    }

  })()
}

if (IE)
{
Wilq32.PhotoEffect.prototype.createVMLNode=(function(){
document.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
    try {
      !document.namespaces.rvml && document.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
      return function (tagName) {
        return document.createElement('<rvml:' + tagName + ' class="rvml">');
      };
    } catch (e) {
      return function (tagName) {
        return document.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
      };
    }   
})();
}

})(jQuery);



/*
 * timeago: a jQuery plugin, version: 0.9.3 (2011-01-21)
 * @requires jQuery v1.2.3 or later
 *
 * Timeago is a jQuery plugin that makes it easy to support automatically
 * updating fuzzy timestamps (e.g. "4 minutes ago" or "about 1 day ago").
 *
 * For usage and examples, visit:
 * http://timeago.yarp.com/
 *
 * Licensed under the MIT:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright (c) 2008-2011, Ryan McGeary (ryanonjavascript -[at]- mcgeary [*dot*] org)
 */
(function($) {
  $.timeago = function(timestamp) {
    if (timestamp instanceof Date) {
      return inWords(timestamp);
    } else if (typeof timestamp === "string") {
      return inWords($.timeago.parse(timestamp));
    } else {
      return inWords($.timeago.datetime(timestamp));
    }
  };
  var $t = $.timeago;

  $.extend($.timeago, {
    settings: {
      refreshMillis: 60000,
      allowFuture: false,
      strings: {
        prefixAgo: null,
        prefixFromNow: null,
        suffixAgo: "ago",
        suffixFromNow: "from now",
        seconds: "less than a minute",
        minute: "about a minute",
        minutes: "%d minutes",
        hour: "about an hour",
        hours: "about %d hours",
        day: "a day",
        days: "%d days",
        month: "about a month",
        months: "%d months",
        year: "about a year",
        years: "%d years",
        numbers: []
      }
    },
    inWords: function(distanceMillis) {
      var $l = this.settings.strings;
      var prefix = $l.prefixAgo;
      var suffix = $l.suffixAgo;
      if (this.settings.allowFuture) {
        if (distanceMillis < 0) {
          prefix = $l.prefixFromNow;
          suffix = $l.suffixFromNow;
        }
        distanceMillis = Math.abs(distanceMillis);
      }

      var seconds = distanceMillis / 1000;
      var minutes = seconds / 60;
      var hours = minutes / 60;
      var days = hours / 24;
      var years = days / 365;

      function substitute(stringOrFunction, number) {
        var string = $.isFunction(stringOrFunction) ? stringOrFunction(number, distanceMillis) : stringOrFunction;
        var value = ($l.numbers && $l.numbers[number]) || number;
        return string.replace(/%d/i, value);
      }

      var words = seconds < 45 && substitute($l.seconds, Math.round(seconds)) ||
        seconds < 90 && substitute($l.minute, 1) ||
        minutes < 45 && substitute($l.minutes, Math.round(minutes)) ||
        minutes < 90 && substitute($l.hour, 1) ||
        hours < 24 && substitute($l.hours, Math.round(hours)) ||
        hours < 48 && substitute($l.day, 1) ||
        days < 30 && substitute($l.days, Math.floor(days)) ||
        days < 60 && substitute($l.month, 1) ||
        days < 365 && substitute($l.months, Math.floor(days / 30)) ||
        years < 2 && substitute($l.year, 1) ||
        substitute($l.years, Math.floor(years));

      return $.trim([prefix, words, suffix].join(" "));
    },
    parse: function(iso8601) {
      var s = $.trim(iso8601);
      s = s.replace(/\.\d\d\d+/,""); // remove milliseconds
      s = s.replace(/-/,"/").replace(/-/,"/");
      s = s.replace(/T/," ").replace(/Z/," UTC");
      s = s.replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2"); // -04:00 -> -0400
      return new Date(s);
    },
    datetime: function(elem) {
      // jQuery's `is()` doesn't play well with HTML5 in IE
      var isTime = $(elem).get(0).tagName.toLowerCase() === "time"; // $(elem).is("time");
      var iso8601 = isTime ? $(elem).attr("datetime") : $(elem).attr("title");
      return $t.parse(iso8601);
    }
  });

  $.fn.timeago = function() {
    var self = this;
    self.each(refresh);

    var $s = $t.settings;
    if ($s.refreshMillis > 0) {
      setInterval(function() { self.each(refresh); }, $s.refreshMillis);
    }
    return self;
  };

  function refresh() {
    var data = prepareData(this);
    if (!isNaN(data.datetime)) {
      $(this).text(inWords(data.datetime));
    }
    return this;
  }

  function prepareData(element) {
    element = $(element);
    if (!element.data("timeago")) {
      element.data("timeago", { datetime: $t.datetime(element) });
      var text = $.trim(element.text());
      if (text.length > 0) {
        element.attr("title", text);
      }
    }
    return element.data("timeago");
  }

  function inWords(date) {
    return $t.inWords(distance(date));
  }

  function distance(date) {
    return (new Date().getTime() - date.getTime());
  }

  // fix for IE6 suckage
  document.createElement("abbr");
  document.createElement("time");
}(jQuery));


/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 * 
 * Open source under the BSD License. 
 * 
 * Copyright Â© 2008 George McGinley Smith
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
*/

// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
{
  def: 'easeOutQuad',
  swing: function (x, t, b, c, d) {
    //alert(jQuery.easing.default);
    return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
  },
  easeInQuad: function (x, t, b, c, d) {
    return c*(t/=d)*t + b;
  },
  easeOutQuad: function (x, t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
  },
  easeInOutQuad: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t + b;
    return -c/2 * ((--t)*(t-2) - 1) + b;
  },
  easeInCubic: function (x, t, b, c, d) {
    return c*(t/=d)*t*t + b;
  },
  easeOutCubic: function (x, t, b, c, d) {
    return c*((t=t/d-1)*t*t + 1) + b;
  },
  easeInOutCubic: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t + b;
    return c/2*((t-=2)*t*t + 2) + b;
  },
  easeInQuart: function (x, t, b, c, d) {
    return c*(t/=d)*t*t*t + b;
  },
  easeOutQuart: function (x, t, b, c, d) {
    return -c * ((t=t/d-1)*t*t*t - 1) + b;
  },
  easeInOutQuart: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
    return -c/2 * ((t-=2)*t*t*t - 2) + b;
  },
  easeInQuint: function (x, t, b, c, d) {
    return c*(t/=d)*t*t*t*t + b;
  },
  easeOutQuint: function (x, t, b, c, d) {
    return c*((t=t/d-1)*t*t*t*t + 1) + b;
  },
  easeInOutQuint: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
    return c/2*((t-=2)*t*t*t*t + 2) + b;
  },
  easeInSine: function (x, t, b, c, d) {
    return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
  },
  easeOutSine: function (x, t, b, c, d) {
    return c * Math.sin(t/d * (Math.PI/2)) + b;
  },
  easeInOutSine: function (x, t, b, c, d) {
    return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
  },
  easeInExpo: function (x, t, b, c, d) {
    return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
  },
  easeOutExpo: function (x, t, b, c, d) {
    return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
  },
  easeInOutExpo: function (x, t, b, c, d) {
    if (t==0) return b;
    if (t==d) return b+c;
    if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
    return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
  },
  easeInCirc: function (x, t, b, c, d) {
    return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
  },
  easeOutCirc: function (x, t, b, c, d) {
    return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
  },
  easeInOutCirc: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
    return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
  },
  easeInElastic: function (x, t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
  },
  easeOutElastic: function (x, t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
  },
  easeInOutElastic: function (x, t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
    return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
  },
  easeInBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    return c*(t/=d)*t*((s+1)*t - s) + b;
  },
  easeOutBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
  },
  easeInOutBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158; 
    if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
    return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
  },
  easeInBounce: function (x, t, b, c, d) {
    return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
  },
  easeOutBounce: function (x, t, b, c, d) {
    if ((t/=d) < (1/2.75)) {
      return c*(7.5625*t*t) + b;
    } else if (t < (2/2.75)) {
      return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
    } else if (t < (2.5/2.75)) {
      return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
    } else {
      return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
    }
  },
  easeInOutBounce: function (x, t, b, c, d) {
    if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
    return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
  }
});

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 * 
 * Open source under the BSD License. 
 * 
 * Copyright Â© 2001 Robert Penner
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
 */

 /*
 * Copyright 2012 Google Inc.
 *
 * Swiffy runtime version 4.9.0
 *
 * In addition to the Google Terms of Service (http://www.google.com/accounts/TOS),
 * Google grants you and the Google Swiffy end users a personal, worldwide,
 * royalty-free, non-assignable and non-exclusive license to use the Google Swiffy
 * runtime to host it for Google Swiffy end users and to use it in connection with
 * the Google Swiffy service.
 */
(function(){var f=void 0,h=!0,j=null,k=!1,aa=encodeURIComponent,ba=window,m=Object,ca=Function,n=document,da=isNaN,p=Math,ea=Array,q=Number,fa=navigator,ga=Error,ha=Boolean,ia=parseInt,s=String,ja=decodeURIComponent;function ka(a,b){return a.onload=b}function la(a,b){return a.width=b}function ma(a,b){return a.data=b}function na(a,b){return a.color=b}function oa(a,b){return a.currentTarget=b}function pa(a,b){return a.keyCode=b}function qa(a,b){return a.blendmode=b}function ra(a,b){return a.depth=b}
function sa(a,b){return a.type=b}function ta(a,b){return a.name=b}function va(a,b){return a.bounds=b}function wa(a,b){return a.nextSibling=b}function xa(a,b){return a.fillStyle=b}function ya(a,b){return a.stop=b}function za(a,b){return a.toString=b}function Aa(a,b){return a.length=b}function Ba(a,b){return a.actions=b}function Ca(a,b){return a.lineHeight=b}function Da(a,b){return a.target=b}function Ea(a,b){return a.call=b}function Fa(a,b){return a.start=b}
function Ga(a,b){return a.returnValue=b}function Ha(a,b){return a.apply=b}function Ia(a,b){return a.filters=b}function Ka(a,b){return a.height=b}
var t="appendChild",u="push",La="object",Ma="filter",Na="font",Oa="indent",Pa="valueOf",Qa="getParent",Ra="getOwnPropertyNames",Sa="shift",Ta="exec",Ua="width",Va="text",Wa="expand",Xa="round",Ya="slice",w="replace",Za="matrix",$a="toFixed",ab="setCapture",x="data",bb="ceil",cb="events",db="leading",eb="floor",fb="concat",gb="charAt",hb="createTextNode",ib="miter",jb="value",kb="italic",mb="getNamedItem",nb="preventDefault",ob="setAttributeNS",y="indexOf",pb="defineProperties",qb="color",rb="trim",
sb="capture",tb="stops",ub="ratio",vb="setTransform",wb="definition",xb="knockout",yb="linestyles",zb="getName",Ab="charCode",Bb="fillstyles",z="defineProperty",Cb="createElement",Db="sounds",Eb="keyCode",Fb="blendmode",Gb="firstChild",Hb="sound",Ib="forEach",Jb="states",A="setAttribute",Kb="play",Lb="handleEvent",Nb="path",B="depth",Ob="type",Pb="method",Qb="translate",Rb="childNodes",Sb="bind",Tb="emSquareSize",Ub="offset",Vb="name",C="bounds",Wb="code",Xb="nextSibling",Yb="tags",Zb="getPrototypeOf",
$b="clientX",ac="releaseCapture",bc="clientY",cc="substr",dc="fill",ec="stop",fc="toString",gc="altKey",hc="bold",ic="gradient",D="length",jc="propertyIsEnumerable",kc="create",E="prototype",lc="clip",mc="result",nc="index",oc="inner",H="actions",pc="variable",qc="angle",J="createElementNS",rc="ctrlKey",sc="split",tc="constructor",uc="stopPropagation",vc="userAgent",wc="glyphs",xc="records",yc="frameCount",zc="hasOwnProperty",K="style",Ac="body",Bc="removeChild",Cc="getOwnPropertyDescriptor",Dc="target",
L="call",Ec="isEnabled",Fc="line",Gc="start",Hc="getAttribute",Ic="multiply",Jc="init",Kc="charCodeAt",Lc="colortransform",Mc="fireEvent",Nc="substring",Oc="paths",Pc="trackAsMenu",Qc="every",Rc="contains",M="apply",Sc="distance",Tc="filters",Uc="reset",Vc="removeAttribute",Wc="navigator",Xc="parentNode",Yc="update",Zc="height",$c="splice",ad="leftMargin",bd="join",cd="isCaptured",N="transform",dd="nodeValue",ed="quality",fd="toLowerCase",O,gd=this,hd=function(a){var b=typeof a;if("object"==b)if(a){if(a instanceof
ea)return"array";if(a instanceof m)return b;var c=m[E][fc][L](a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a[D]&&"undefined"!=typeof a[$c]&&"undefined"!=typeof a[jc]&&!a[jc]("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a[L]&&"undefined"!=typeof a[jc]&&!a[jc]("call"))return"function"}else return"null";else if("function"==b&&"undefined"==typeof a[L])return"object";return b},P=function(a){return a!==f},id=function(a){var b=hd(a);return"array"==
b||"object"==b&&"number"==typeof a[D]},Q=function(a){return"string"==typeof a},R=function(a){return"function"==hd(a)},jd=function(a){var b=typeof a;return"object"==b&&a!=j||"function"==b},md=function(a){return a[kd]||(a[kd]=++ld)},kd="closure_uid_"+p[eb](2147483648*p.random())[fc](36),ld=0,nd=function(a,b,c){return a[L][M](a[Sb],arguments)},od=function(a,b,c){if(!a)throw ga();if(2<arguments[D]){var d=ea[E][Ya][L](arguments,2);return function(){var c=ea[E][Ya][L](arguments);ea[E].unshift[M](c,d);return a[M](b,
c)}}return function(){return a[M](b,arguments)}},pd=function(a,b,c){pd=ca[E][Sb]&&-1!=ca[E][Sb][fc]()[y]("native code")?nd:od;return pd[M](j,arguments)},qd=function(a,b){var c=ea[E][Ya][L](arguments,1);return function(){var b=ea[E][Ya][L](arguments);b.unshift[M](b,c);return a[M](this,b)}},S=function(a,b){function c(){}c.prototype=b[E];a.r=b[E];a.prototype=new c;a[E].constructor=a};var wd=function(a,b){if(b)return a[w](rd,"&amp;")[w](sd,"&lt;")[w](td,"&gt;")[w](ud,"&quot;");if(!vd.test(a))return a;-1!=a[y]("&")&&(a=a[w](rd,"&amp;"));-1!=a[y]("<")&&(a=a[w](sd,"&lt;"));-1!=a[y](">")&&(a=a[w](td,"&gt;"));-1!=a[y]('"')&&(a=a[w](ud,"&quot;"));return a},rd=/&/g,sd=/</g,td=/>/g,ud=/\"/g,vd=/[&<>\"]/;var xd=ea[E],yd=xd[y]?function(a,b,c){return xd[y][L](a,b,c)}:function(a,b,c){c=c==j?0:0>c?p.max(0,a[D]+c):c;if(Q(a))return!Q(b)||1!=b[D]?-1:a[y](b,c);for(;c<a[D];c++)if(c in a&&a[c]===b)return c;return-1},zd=xd[Ib]?function(a,b,c){xd[Ib][L](a,b,c)}:function(a,b,c){for(var d=a[D],e=Q(a)?a[sc](""):a,g=0;g<d;g++)g in e&&b[L](c,e[g],g,a)},Ad=xd[Qc]?function(a,b,c){return xd[Qc][L](a,b,c)}:function(a,b,c){for(var d=a[D],e=Q(a)?a[sc](""):a,g=0;g<d;g++)if(g in e&&!b[L](c,e[g],g,a))return k;return h},Bd=
function(a,b){var c=yd(a,b),d;(d=0<=c)&&xd[$c][L](a,c,1);return d},Cd=function(a){return xd[fb][M](xd,arguments)},Dd=function(a,b,c){return 2>=arguments[D]?xd[Ya][L](a,b):xd[Ya][L](a,b,c)};var Ed=function(a){var b=[],c=0,d;for(d in a)b[c++]=a[d];return b},Fd=function(a){var b=[],c=0,d;for(d in a)b[c++]=d;return b},Gd=function(a){var b=hd(a);if("object"==b||"array"==b){if(a.I)return a.I();var b="array"==b?[]:{},c;for(c in a)b[c]=Gd(a[c]);return b}return a},Hd="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" "),Id=function(a,b){for(var c,d,e=1;e<arguments[D];e++){d=arguments[e];for(c in d)a[c]=d[c];for(var g=0;g<Hd[D];g++)c=Hd[g],
m[E][zc][L](d,c)&&(a[c]=d[c])}};var Jd,Kd,Ld,Md,Nd,Od=function(){return gd[Wc]?gd[Wc][vc]:j};Nd=Md=Ld=Kd=Jd=k;var Pd;if(Pd=Od()){var Qd=gd[Wc];Jd=0==Pd[y]("Opera");Kd=!Jd&&-1!=Pd[y]("MSIE");Md=(Ld=!Jd&&-1!=Pd[y]("WebKit"))&&-1!=Pd[y]("Mobile");Nd=!Jd&&!Ld&&"Gecko"==Qd.product}var Rd=Jd,Sd=Kd,Td=Nd,Ud=Ld,Vd=Md,Wd=gd[Wc],Xd=-1!=(Wd&&Wd.platform||"")[y]("Mac"),Yd;
a:{var Zd="",$d;if(Rd&&gd.opera)var ae=gd.opera.version,Zd="function"==typeof ae?ae():ae;else if(Td?$d=/rv\:([^\);]+)(\)|;)/:Sd?$d=/MSIE\s+([^\);]+)(\)|;)/:Ud&&($d=/WebKit\/(\S+)/),$d)var be=$d[Ta](Od()),Zd=be?be[1]:"";if(Sd){var ce,de=gd.document;ce=de?de.documentMode:f;if(ce>parseFloat(Zd)){Yd=s(ce);break a}}Yd=Zd}
var ee=Yd,fe={},ge=function(a){var b;if(!(b=fe[a])){b=0;for(var c=s(ee)[w](/^[\s\xa0]+|[\s\xa0]+$/g,"")[sc]("."),d=s(a)[w](/^[\s\xa0]+|[\s\xa0]+$/g,"")[sc]("."),e=p.max(c[D],d[D]),g=0;0==b&&g<e;g++){var i=c[g]||"",l=d[g]||"",r=RegExp("(\\d*)(\\D*)","g"),v=RegExp("(\\d*)(\\D*)","g");do{var G=r[Ta](i)||["","",""],F=v[Ta](l)||["","",""];if(0==G[0][D]&&0==F[0][D])break;b=((0==G[1][D]?0:ia(G[1],10))<(0==F[1][D]?0:ia(F[1],10))?-1:(0==G[1][D]?0:ia(G[1],10))>(0==F[1][D]?0:ia(F[1],10))?1:0)||((0==G[2][D])<
(0==F[2][D])?-1:(0==G[2][D])>(0==F[2][D])?1:0)||(G[2]<F[2]?-1:G[2]>F[2]?1:0)}while(0==b)}b=fe[a]=0<=b}return b},he={},ie=function(a){return he[a]||(he[a]=Sd&&!!n.documentMode&&n.documentMode>=a)};var je=!Sd||ie(9);!Td&&!Sd||Sd&&ie(9)||Td&&ge("1.9.1");Sd&&ge("9");var ke=function(a,b){var c;c=a.className;c=Q(c)&&c.match(/\S+/g)||[];for(var d=Dd(arguments,1),e=c[D]+d[D],g=c,i=0;i<d[D];i++)0<=yd(g,d[i])||g[u](d[i]);a.className=c[bd](" ");return c[D]==e};var le={cellpadding:"cellPadding",cellspacing:"cellSpacing",colspan:"colSpan",frameborder:"frameBorder",height:"height",maxlength:"maxLength",role:"role",rowspan:"rowSpan",type:"type",usemap:"useMap",valign:"vAlign",width:"width"},me=function(a,b,c){var d=arguments,e=d[0],g=d[1];if(!je&&g&&(g[Vb]||g[Ob])){e=["<",e];g[Vb]&&e[u](' name="',wd(g[Vb]),'"');if(g[Ob]){e[u](' type="',wd(g[Ob]),'"');var i={};Id(i,g);delete i[Ob];g=i}e[u](">");e=e[bd]("")}e=n[Cb](e);if(g)if(Q(g))e.className=g;else if("array"==
hd(g))ke[M](j,[e][fb](g));else{var l=e,i=function(a,b){"style"==b?l[K].cssText=a:"class"==b?l.className=a:"for"==b?l.htmlFor=a:b in le?l[A](le[b],a):0==b.lastIndexOf("aria-",0)||0==b.lastIndexOf("data-",0)?l[A](b,a):l[b]=a},r;for(r in g)i[L](f,g[r],r,g)}if(2<d[D]){var v=n,G=e;r=function(a){a&&G[t](Q(a)?v[hb](a):a)};for(g=2;g<d[D];g++){var F=d[g];if(id(F)&&!(jd(F)&&0<F.nodeType)){var i=zd,I;a:{if((I=F)&&"number"==typeof I[D]){if(jd(I)){I="function"==typeof I.item||"string"==typeof I.item;break a}if(R(I)){I=
"function"==typeof I.item;break a}}I=k}if(I)if(I=F[D],0<I){for(var ua=ea(I),Ja=0;Ja<I;Ja++)ua[Ja]=F[Ja];F=ua}else F=[];i(F,r)}else r(F)}}return e},ne=function(a){for(var b;b=a[Gb];)a[Bc](b)},oe=function(a){return a&&a[Xc]?a[Xc][Bc](a):j},pe=function(a,b){var c=b[Xc];c&&c.replaceChild(a,b)},qe=function(a,b){if(a[Rc]&&1==b.nodeType)return a==b||a[Rc](b);if("undefined"!=typeof a.compareDocumentPosition)return a==b||ha(a.compareDocumentPosition(b)&16);for(;b&&a!=b;)b=b[Xc];return b==a};var re=function(a){re[" "](a);return a};re[" "]=function(){};!Sd||ie(9);var se=!Sd||ie(9),te=Sd&&!ge("9");!Ud||ge("528");Td&&ge("1.9b")||Sd&&ge("8")||Rd&&ge("9.5")||Ud&&ge("528");Td&&!ge("8")||Sd&&ge("9");var ue=function(){};var ve=function(a,b){sa(this,a);Da(this,b);oa(this,this[Dc])};O=ve[E];O.ic=k;O.defaultPrevented=k;O.Be=h;O.stopPropagation=function(){this.ic=h};O.preventDefault=function(){this.defaultPrevented=h;this.Be=k};var we=function(a,b){a&&this[Jc](a,b)};S(we,ve);O=we[E];Da(O,j);O.relatedTarget=j;O.offsetX=0;O.offsetY=0;O.clientX=0;O.clientY=0;O.screenX=0;O.screenY=0;O.button=0;pa(O,0);O.charCode=0;O.ctrlKey=k;O.altKey=k;O.shiftKey=k;O.metaKey=k;O.qb=j;
O.init=function(a,b){var c=sa(this,a[Ob]);ve[L](this,c);Da(this,a[Dc]||a.srcElement);oa(this,b);var d=a.relatedTarget;if(d){if(Td){var e;a:{try{re(d.nodeName);e=h;break a}catch(g){}e=k}e||(d=j)}}else"mouseover"==c?d=a.fromElement:"mouseout"==c&&(d=a.toElement);this.relatedTarget=d;this.offsetX=Ud||a.offsetX!==f?a.offsetX:a.layerX;this.offsetY=Ud||a.offsetY!==f?a.offsetY:a.layerY;this.clientX=a[$b]!==f?a[$b]:a.pageX;this.clientY=a[bc]!==f?a[bc]:a.pageY;this.screenX=a.screenX||0;this.screenY=a.screenY||
0;this.button=a.button;pa(this,a[Eb]||0);this.charCode=a[Ab]||("keypress"==c?a[Eb]:0);this.ctrlKey=a[rc];this.altKey=a[gc];this.shiftKey=a.shiftKey;this.metaKey=a.metaKey;this.state=a.state;this.qb=a;a.defaultPrevented&&this[nb]();delete this.ic};O.stopPropagation=function(){we.r[uc][L](this);this.qb[uc]?this.qb[uc]():this.qb.cancelBubble=h};O.preventDefault=function(){we.r[nb][L](this);var a=this.qb;if(a[nb])a[nb]();else if(Ga(a,k),te)try{(a[rc]||112<=a[Eb]&&123>=a[Eb])&&pa(a,-1)}catch(b){}};var xe=function(){},ye=0;O=xe[E];O.key=0;O.Lc=k;O.th=k;O.init=function(a,b,c,d,e,g){if(R(a))this.sh=h;else if(a&&a[Lb]&&R(a[Lb]))this.sh=k;else throw ga("Invalid listener argument");this.yd=a;this.fh=b;this.src=c;sa(this,d);this.capture=!!e;this.Jf=g;this.th=k;this.key=++ye;this.Lc=k};O.handleEvent=function(a){return this.sh?this.yd[L](this.Jf||this.src,a):this.yd[Lb][L](this.yd,a)};var ze={},Ae={},Be={},Ce={},T=function(a,b,c,d,e){if(b){if("array"==hd(b)){for(var g=0;g<b[D];g++)T(a,b[g],c,d,e);return j}var d=!!d,i=Ae;b in i||(i[b]={B:0,Ma:0});i=i[b];d in i||(i[d]={B:0,Ma:0},i.B++);var i=i[d],l=md(a),r;i.Ma++;if(i[l]){r=i[l];for(g=0;g<r[D];g++)if(i=r[g],i.yd==c&&i.Jf==e){if(i.Lc)break;return r[g].key}}else r=i[l]=[],i.B++;var v=De,G=se?function(a){return v[L](G.src,G.key,a)}:function(a){a=v[L](G.src,G.key,a);if(!a)return a},g=G;g.src=a;i=new xe;i[Jc](c,g,a,b,d,e);c=i.key;g.key=
c;r[u](i);ze[c]=i;Be[l]||(Be[l]=[]);Be[l][u](i);a.addEventListener?(a==gd||!a.hh)&&a.addEventListener(b,g,d):a.attachEvent(b in Ce?Ce[b]:Ce[b]="on"+b,g);return c}throw ga("Invalid event type");},Ee=function(a,b,c,d,e){if("array"==hd(b)){for(var g=0;g<b[D];g++)Ee(a,b[g],c,d,e);return j}d=!!d;a:{g=Ae;if(b in g&&(g=g[b],d in g&&(g=g[d],a=md(a),g[a]))){a=g[a];break a}a=j}if(!a)return k;for(g=0;g<a[D];g++)if(a[g].yd==c&&a[g][sb]==d&&a[g].Jf==e)return Fe(a[g].key);return k},Fe=function(a){if(!ze[a])return k;
var b=ze[a];if(b.Lc)return k;var c=b.src,d=b[Ob],e=b.fh,g=b[sb];c.removeEventListener?(c==gd||!c.hh)&&c.removeEventListener(d,e,g):c.detachEvent&&c.detachEvent(d in Ce?Ce[d]:Ce[d]="on"+d,e);c=md(c);Be[c]&&(e=Be[c],Bd(e,b),0==e[D]&&delete Be[c]);b.Lc=h;if(b=Ae[d][g][c])b.nh=h,Ge(d,g,c,b);delete ze[a];return h},Ge=function(a,b,c,d){if(!d.Ae&&d.nh){for(var e=0,g=0;e<d[D];e++)d[e].Lc?d[e].fh.src=j:(e!=g&&(d[g]=d[e]),g++);Aa(d,g);d.nh=k;0==g&&(delete Ae[a][b][c],Ae[a][b].B--,0==Ae[a][b].B&&(delete Ae[a][b],
Ae[a].B--),0==Ae[a].B&&delete Ae[a])}},Ie=function(a,b,c,d,e){var g=1,b=md(b);if(a[b]){a.Ma--;a=a[b];a.Ae?a.Ae++:a.Ae=1;try{for(var i=a[D],l=0;l<i;l++){var r=a[l];r&&!r.Lc&&(g&=He(r,e)!==k)}}finally{a.Ae--,Ge(c,d,b,a)}}return ha(g)},He=function(a,b){a.th&&Fe(a.key);return a[Lb](b)},De=function(a,b){if(!ze[a])return h;var c=ze[a],d=c[Ob],e=Ae;if(!(d in e))return h;var e=e[d],g,i;if(!se){var l;if(!(l=b))a:{l=["window","event"];for(var r=gd;g=l[Sa]();)if(r[g]!=j)r=r[g];else{l=j;break a}l=r}g=l;l=h in
e;r=k in e;if(l){if(0>g[Eb]||g.returnValue!=f)return h;a:{var v=k;if(0==g[Eb])try{pa(g,-1);break a}catch(G){v=h}(v||g.returnValue==f)&&Ga(g,h)}}v=new we;v[Jc](g,this);g=h;try{if(l){for(var F=[],I=v.currentTarget;I;I=I[Xc])F[u](I);i=e[h];i.Ma=i.B;for(var ua=F[D]-1;!v.ic&&0<=ua&&i.Ma;ua--)oa(v,F[ua]),g&=Ie(i,F[ua],d,h,v);if(r){i=e[k];i.Ma=i.B;for(ua=0;!v.ic&&ua<F[D]&&i.Ma;ua++)oa(v,F[ua]),g&=Ie(i,F[ua],d,k,v)}}else g=He(c,v)}finally{F&&Aa(F,0)}return g}d=new we(b,this);return g=He(c,d)};var Je=function(){};S(Je,ue);O=Je[E];O.hh=h;O.mh=j;O.addEventListener=function(a,b,c,d){T(this,a,b,c,d)};O.removeEventListener=function(a,b,c,d){Ee(this,a,b,c,d)};
O.dispatchEvent=function(a){var b=a[Ob]||a,c=Ae;if(b in c){if(Q(a))a=new ve(a,this);else if(a instanceof ve)Da(a,a[Dc]||this);else{var d=a,a=new ve(b,this);Id(a,d)}var d=1,e,c=c[b],b=h in c,g;if(b){e=[];for(g=this;g;g=g.mh)e[u](g);g=c[h];g.Ma=g.B;for(var i=e[D]-1;!a.ic&&0<=i&&g.Ma;i--)oa(a,e[i]),d&=Ie(g,e[i],a[Ob],h,a)&&a.Be!=k}if(k in c)if(g=c[k],g.Ma=g.B,b)for(i=0;!a.ic&&i<e[D]&&g.Ma;i++)oa(a,e[i]),d&=Ie(g,e[i],a[Ob],k,a)&&a.Be!=k;else for(e=this;!a.ic&&e&&g.Ma;e=e.mh)oa(a,e),d&=Ie(g,e,a[Ob],k,
a)&&a.Be!=k;a=ha(d)}else a=h;return a};var Le=function(a,b,c,d,e){if(!Sd&&(!Ud||!ge("525")))return h;if(Xd&&e)return Ke(a);if(e&&!d||!c&&(17==b||18==b||Xd&&91==b))return k;if(Ud&&d&&c)switch(a){case 220:case 219:case 221:case 192:case 186:case 189:case 187:case 188:case 190:case 191:case 192:case 222:return k}if(Sd&&d&&b==a)return k;switch(a){case 13:return!(Sd&&ie(9));case 27:return!Ud}return Ke(a)},Ke=function(a){if(48<=a&&57>=a||96<=a&&106>=a||65<=a&&90>=a||Ud&&0==a)return h;switch(a){case 32:case 63:case 107:case 109:case 110:case 111:case 186:case 59:case 189:case 187:case 61:case 188:case 190:case 191:case 192:case 222:case 219:case 220:case 221:return h;
default:return k}},Me=function(a){switch(a){case 61:return 187;case 59:return 186;case 224:return 91;case 0:return 224;default:return a}};var Ne=function(a,b){a&&this.Jj(a,b)};S(Ne,Je);O=Ne[E];O.Ad=j;O.De=j;O.Mf=j;O.Ee=j;O.Aa=-1;O.Lb=-1;O.Of=k;
var Oe={3:13,12:144,63232:38,63233:40,63234:37,63235:39,63236:112,63237:113,63238:114,63239:115,63240:116,63241:117,63242:118,63243:119,63244:120,63245:121,63246:122,63247:123,63248:44,63272:46,63273:36,63275:35,63276:33,63277:34,63289:144,63302:45},Pe={Up:38,Down:40,Left:37,Right:39,Enter:13,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,"U+007F":46,Home:36,End:35,PageUp:33,PageDown:34,Insert:45},Qe=Sd||Ud&&ge("525"),Re=Xd&&Td;O=Ne[E];
O.kj=function(a){if(Ud&&(17==this.Aa&&!a[rc]||18==this.Aa&&!a[gc]||Xd&&91==this.Aa&&!a.metaKey))this.Lb=this.Aa=-1;-1==this.Aa&&(a[rc]&&17!=a[Eb]?this.Aa=17:a[gc]&&18!=a[Eb]?this.Aa=18:a.metaKey&&91!=a[Eb]&&(this.Aa=91));if(Qe&&!Le(a[Eb],this.Aa,a.shiftKey,a[rc],a[gc]))this[Lb](a);else this.Lb=Td?Me(a[Eb]):a[Eb],Re&&(this.Of=a[gc])};O.Dj=function(){this.Lb=this.Aa=-1};O.lj=function(a){this.Dj();this.Of=a[gc]};
O.handleEvent=function(a){var b=a.qb,c,d,e=b[gc];Sd&&"keypress"==a[Ob]?(c=this.Lb,d=13!=c&&27!=c?b[Eb]:0):Ud&&"keypress"==a[Ob]?(c=this.Lb,d=0<=b[Ab]&&63232>b[Ab]&&Ke(c)?b[Ab]:0):Rd?(c=this.Lb,d=Ke(c)?b[Eb]:0):(c=b[Eb]||this.Lb,d=b[Ab]||0,Re&&(e=this.Of),Xd&&(63==d&&224==c)&&(c=191));var g=c,i=b.keyIdentifier;c?63232<=c&&c in Oe?g=Oe[c]:25==c&&a.shiftKey&&(g=9):i&&i in Pe&&(g=Pe[i]);a=g==this.Aa;this.Aa=g;b=new Se(g,d,a,b);b.altKey=e;this.dispatchEvent(b)};
O.Jj=function(a,b){this.Ee&&this.detach();this.Ad=a;this.De=T(this.Ad,"keypress",this,b);this.Mf=T(this.Ad,"keydown",this.kj,b,this);this.Ee=T(this.Ad,"keyup",this.lj,b,this)};O.detach=function(){this.De&&(Fe(this.De),Fe(this.Mf),Fe(this.Ee),this.Ee=this.Mf=this.De=j);this.Ad=j;this.Lb=this.Aa=-1};var Se=function(a,b,c,d){d&&this[Jc](d,f);sa(this,"key");pa(this,a);this.charCode=b;this.repeat=c};S(Se,we);var Te=function(a){return a};var Ue=function(){};Ue.Ca=function(){return Ue.Dh?Ue.Dh:Ue.Dh=new Ue};Ue[E].Uj=0;Ue[E].Pa=function(){return":"+(this.Uj++)[fc](36)};Ue.Ca();var Ve="StopIteration"in gd?gd.StopIteration:ga("StopIteration"),We=function(){};We[E].next=function(){throw Ve;};We[E].Vf=function(){return this};var Xe=function(a){if("function"==typeof a.Hb)a=a.Hb();else if(id(a)||Q(a))a=a[D];else{var b=0,c;for(c in a)b++;a=b}return a},Ye=function(a){if("function"==typeof a.La)return a.La();if(Q(a))return a[sc]("");if(id(a)){for(var b=[],c=a[D],d=0;d<c;d++)b[u](a[d]);return b}return Ed(a)};var Ze=function(a,b){this.W={};this.O=[];var c=arguments[D];if(1<c){if(c%2)throw ga("Uneven number of arguments");for(var d=0;d<c;d+=2)this.set(arguments[d],arguments[d+1])}else a&&this.wd(a)};O=Ze[E];O.B=0;O.If=0;O.Hb=function(){return this.B};O.La=function(){this.xe();for(var a=[],b=0;b<this.O[D];b++)a[u](this.W[this.O[b]]);return a};O.hc=function(){this.xe();return this.O[fb]()};O.td=function(a){return $e(this.W,a)};
O.Tf=function(a){for(var b=0;b<this.O[D];b++){var c=this.O[b];if($e(this.W,c)&&this.W[c]==a)return h}return k};O.$b=function(a,b){if(this===a)return h;if(this.B!=a.Hb())return k;var c=b||af;this.xe();for(var d,e=0;d=this.O[e];e++)if(!c(this.get(d),a.get(d)))return k;return h};var af=function(a,b){return a===b};O=Ze[E];O.ja=function(){return 0==this.B};
O.xe=function(){if(this.B!=this.O[D]){for(var a=0,b=0;a<this.O[D];){var c=this.O[a];$e(this.W,c)&&(this.O[b++]=c);a++}Aa(this.O,b)}if(this.B!=this.O[D]){for(var d={},b=a=0;a<this.O[D];)c=this.O[a],$e(d,c)||(this.O[b++]=c,d[c]=1),a++;Aa(this.O,b)}};O.get=function(a,b){return $e(this.W,a)?this.W[a]:b};O.set=function(a,b){$e(this.W,a)||(this.B++,this.O[u](a),this.If++);this.W[a]=b};O.wd=function(a){var b;a instanceof Ze?(b=a.hc(),a=a.La()):(b=Fd(a),a=Ed(a));for(var c=0;c<b[D];c++)this.set(b[c],a[c])};
O.I=function(){return new Ze(this)};O.Vf=function(a){this.xe();var b=0,c=this.O,d=this.W,e=this.If,g=this,i=new We;i.next=function(){for(;;){if(e!=g.If)throw ga("The map has changed since the iterator was created");if(b>=c[D])throw Ve;var i=c[b++];return a?i:d[i]}};return i};var $e=function(a,b){return m[E][zc][L](a,b)};var bf=function(a,b,c){this.Gb=a||j;this.wj=!!c};O=bf[E];O.gc=function(){if(!this.$&&(this.$=new Ze,this.B=0,this.Gb))for(var a=this.Gb[sc]("&"),b=0;b<a[D];b++){var c=a[b][y]("="),d=j,e=j;0<=c?(d=a[b][Nc](0,c),e=a[b][Nc](c+1)):d=a[b];d=ja(d[w](/\+/g," "));d=this.ud(d);this.add(d,e?ja(e[w](/\+/g," ")):"")}};O.$=j;O.B=j;O.Hb=function(){this.gc();return this.B};O.add=function(a,b){this.gc();this.eh();var a=this.ud(a),c=this.$.get(a);c||this.$.set(a,c=[]);c[u](b);this.B++;return this};
O.ja=function(){this.gc();return 0==this.B};O.td=function(a){this.gc();a=this.ud(a);return this.$.td(a)};O.Tf=function(a){var b=this.La();return 0<=yd(b,a)};O.hc=function(){this.gc();for(var a=this.$.La(),b=this.$.hc(),c=[],d=0;d<b[D];d++)for(var e=a[d],g=0;g<e[D];g++)c[u](b[d]);return c};O.La=function(a){this.gc();var b=[];if(a)this.td(a)&&(b=Cd(b,this.$.get(this.ud(a))));else for(var a=this.$.La(),c=0;c<a[D];c++)b=Cd(b,a[c]);return b};
O.set=function(a,b){this.gc();this.eh();a=this.ud(a);this.td(a)&&(this.B-=this.$.get(a)[D]);this.$.set(a,[b]);this.B++;return this};O.get=function(a,b){var c=a?this.La(a):[];return 0<c[D]?s(c[0]):b};za(O,function(){if(this.Gb)return this.Gb;if(!this.$)return"";for(var a=[],b=this.$.hc(),c=0;c<b[D];c++)for(var d=b[c],e=aa(s(d)),d=this.La(d),g=0;g<d[D];g++){var i=e;""!==d[g]&&(i+="="+aa(s(d[g])));a[u](i)}return this.Gb=a[bd]("&")});O.eh=function(){this.Gb=j};
O.I=function(){var a=new bf;a.Gb=this.Gb;this.$&&(a.$=this.$.I(),a.B=this.B);return a};O.ud=function(a){a=s(a);this.wj&&(a=a[fd]());return a};var cf=function(a){this.W=new Ze;a&&this.wd(a)},df=function(a){var b=typeof a;return"object"==b&&a||"function"==b?"o"+md(a):b[cc](0,1)+a};O=cf[E];O.Hb=function(){return this.W.Hb()};O.add=function(a){this.W.set(df(a),a)};O.wd=function(a){for(var a=Ye(a),b=a[D],c=0;c<b;c++)this.add(a[c])};O.ja=function(){return this.W.ja()};O.contains=function(a){return this.W.td(df(a))};O.La=function(){return this.W.La()};O.I=function(){return new cf(this)};O.$b=function(a){return this.Hb()==Xe(a)&&this.xj(a)};
O.xj=function(a){var b=Xe(a);if(this.Hb()>b)return k;!(a instanceof cf)&&5<b&&(a=new cf(a));a:if(b=function(b){if("function"==typeof a[Rc])b=a[Rc](b);else if("function"==typeof a.Tf)b=a.Tf(b);else if(id(a)||Q(a))b=0<=yd(a,b);else a:{for(var c in a)if(a[c]==b){b=h;break a}b=k}return b},"function"==typeof this[Qc])b=this[Qc](b,f);else if(id(this)||Q(this))b=Ad(this,b,f);else{var c;if("function"==typeof this.hc)c=this.hc();else if("function"!=typeof this.La)if(id(this)||Q(this)){c=[];for(var d=this[D],
e=0;e<d;e++)c[u](e)}else c=Fd(this);else c=f;for(var d=Ye(this),e=d[D],g=0;g<e;g++)if(!b[L](f,d[g],c&&c[g],this)){b=k;break a}b=h}return b};O.Vf=function(){return this.W.Vf(k)};var ef;ef=k;var ff=Od();ff&&(-1!=ff[y]("Firefox")||-1!=ff[y]("Camino")||-1!=ff[y]("iPhone")||-1!=ff[y]("iPod")||-1!=ff[y]("iPad")||-1!=ff[y]("Android")||-1!=ff[y]("Chrome")&&(ef=h));var gf=ef;var hf=/iPhone|iPod/,jf=function(a,b,c,d){return a<<21|b<<14|c<<7|d},kf=/OS (\d)_(\d)(?:_(\d))?/;m[z]&&!m[pb]&&(m.defineProperties=function(a,b){for(var c in b)m[z](a,c,b[c])});var lf=function(a,b){this.x=a;this.y=b};lf[E].z=function(a){var b=this.x*a.w+this.y*a.m+a.F;this.x=this.x*a.u+this.y*a.l+a.D;this.y=b};lf[E].I=function(){return new lf(this.x,this.y)};var mf=function(a,b,c,d,e,g){this.u=a;this.w=b;this.l=c;this.m=d;this.D=e;this.F=g},nf=new mf(1,0,0,1,0,0),of=new mf(1,0,0,-1,0,0);O=mf[E];O.cf=function(){var a=this.u*this.m-this.w*this.l;return new mf(this.m/a,-this.w/a,-this.l/a,this.u/a,(this.l*this.F-this.m*this.D)/a,(this.w*this.D-this.u*this.F)/a)};
O.multiply=function(a){return new mf(this.u*a.u+this.w*a.l,this.u*a.w+this.w*a.m,this.l*a.u+this.m*a.l,this.l*a.w+this.m*a.m,this.D*a.u+this.F*a.l+a.D,this.D*a.w+this.F*a.m+a.F)};O.yj=function(a,b){return new mf(this.u*a,this.w*a,this.l*b,this.m*b,this.D,this.F)};O.ng=function(a,b){return new mf(this.u*a,this.w*b,this.l*a,this.m*b,this.D*a,this.F*b)};O.df=function(){return p.sqrt(this.u*this.u+this.w*this.w)};O.ef=function(){return p.sqrt(this.l*this.l+this.m*this.m)};
O.translate=function(a,b){return new mf(this.u,this.w,this.l,this.m,this.D+a,this.F+b)};O.Pe=function(a,b){return new mf(this.u,this.w,this.l,this.m,a,b)};za(O,function(){return"matrix("+this.u+" "+this.w+" "+this.l+" "+this.m+" "+this.D+" "+this.F+")"});O.oj=function(){var a=this.df(),b=this.ef();if(!a||!b)return{ac:1,nd:1,angle:0,l:0,m:1};var c=this.u/a,d=this.w/a;return{ac:a,nd:b,angle:-p.atan2(this.w,this.u),l:(c*this.l+d*this.m)/a,m:(c*this.m-d*this.l)/b}};
var pf=function(a,b,c){var d=p.cos(a[qc]),e=p.sin(a[qc]);return new mf(a.ac*d,-a.ac*e,a.ac*d*a.l+a.nd*e*a.m,a.nd*d*a.m-a.ac*e*a.l,b,c)};mf[E].$b=function(a){return!!a&&this.u==a.u&&this.w==a.w&&this.l==a.l&&this.m==a.m&&this.D==a.D&&this.F==a.F};var qf=function(a,b,c,d,e,g,i,l){this.ma=a;this.ua=b;this.la=c;this.ta=d;this.ka=e;this.sa=g;this.ca=i;this.wa=l},rf=new qf(1,0,1,0,1,0,1,0);O=qf[E];
O.wi=function(a){return new qf(this.ma*a.ma,this.ma*a.ua+this.ua,this.la*a.la,this.la*a.ta+this.ta,this.ka*a.ka,this.ka*a.sa+this.sa,this.ca*a.ca,this.ca*a.wa+this.wa)};Ha(O,function(a){return new sf(a.Dc*this.ma+this.ua,a.Cc*this.la+this.ta,a.Bc*this.ka+this.sa,this.vi(a.Sb))});O.vi=function(a){return this.ca*a+this.wa/255};O.$b=function(a){return a!=j&&this.ma==a.ma&&this.ua==a.ua&&this.la==a.la&&this.ta==a.ta&&this.ka==a.ka&&this.sa==a.sa&&this.ca==a.ca&&this.wa==a.wa};
O.zg=function(){return 1==this.ma&&0==this.ua&&1==this.la&&0==this.ta&&1==this.ka&&0==this.sa&&0==this.wa};var tf=function(a,b,c,d){this.e=a;this.g=b;this.k=c;this.p=d;this.ja()&&this.Ze()};O=tf[E];O.Ze=function(){this.g=this.e=q.POSITIVE_INFINITY;this.p=this.k=q.NEGATIVE_INFINITY};O.I=function(){return new tf(this.e,this.g,this.k,this.p)};O.expand=function(a,b){this.Ec(a,b,0)};O.Ec=function(a,b,c){this.e=p.min(this.e,a-c);this.k=p.max(this.k,a+c);this.g=p.min(this.g,b-c);this.p=p.max(this.p,b+c)};
O.add=function(a){this.g+=a.g;this.p+=a.p;this.e+=a.e;this.k+=a.k};O.z=function(a){if(!this.ja()){var b=new lf(this.e,this.g),c=this.k-this.e,d=this.p-this.g;this.Ze();b.z(a);var e=c*a.w,c=c*a.u,g=d*a.l,a=d*a.m;this[Wa](b.x,b.y);this[Wa](b.x+c,b.y+e);this[Wa](b.x+g,b.y+a);this[Wa](b.x+c+g,b.y+e+a)}};O.fi=function(a){return(this.e>=a.e&&this.e<=a.k||this.k>=a.e&&this.k<=a.k||a.e>=this.e&&a.e<=this.k)&&(this.g>=a.g&&this.g<=a.p||this.p>=a.g&&this.p<=a.p||a.g>=this.g&&a.g<=this.p)};
O.contains=function(a,b){return a>=this.e&&a<=this.k&&b>=this.g&&b<=this.p};O.Jc=function(a){this.e=p.min(this.e,a.e);this.k=p.max(this.k,a.k);this.g=p.min(this.g,a.g);this.p=p.max(this.p,a.p)};O.gi=function(a){this.e=p.max(this.e,a.e);this.k=p.min(this.k,a.k);this.g=p.max(this.g,a.g);this.p=p.min(this.p,a.p);this.ja()&&this.Ze()};O.ja=function(){return!(this.e<=this.k&&this.g<=this.p)};O.hi=function(){return new tf(-this.k,-this.p,-this.e,-this.g)};la(O,function(){return p.max(this.k-this.e,0)});
Ka(O,function(){return p.max(this.p-this.g,0)});var uf=function(a){return new tf(a.xmin,a.ymin,a.xmax,a.ymax)};var vf=function(a){this.H=a?a:[];this.Uf=""},wf={"0":1,1:1,2:2,3:0},xf={"0":"M",1:"L",2:"Q",3:"Z"};O=vf[E];za(O,function(){if(!this.Uf){for(var a=this.H[Ya](0),b=0,c=a[D];b<c;){var d=a[b];a[b++]=xf[d];b+=2*wf[d]}this.Uf=c?a[bd](" "):"M 0 0"}return this.Uf});O.qf=function(a){for(var b=this.H,c=0,d=b[D],e=ea(d);c<d;){var g=b[c];e[c]=xf[g];++c;for(g=wf[g];0<g;--g){var i=b[c+0],l=b[c+1];e[c+0]=i*a.u+l*a.l+a.D;e[c+1]=i*a.w+l*a.m+a.F;c+=2}}return e[bd](" ")};
O.z=function(a){if(a==nf)return this;for(var b=0,c=this.H[D],d=ea(c);b<c;){var e=this.H[b];d[b++]=e;for(var g=0;g<wf[e];g++){var i=this.H[b],l=this.H[b+1];d[b]=i*a.u+l*a.l+a.D;d[b+1]=i*a.w+l*a.m+a.F;b+=2}}return new vf(d)};O.concat=function(a){return new vf(this.H[fb](a.H))};
O.jj=function(){var a=this.H;if(13!=a[D]&&16!=a[D]||0!=a[0]||1!=a[3]||1!=a[6]||1!=a[9]||3!=a[a[D]-1])return k;var b=a[1],c=a[2],d=a[4],e=a[5],g=a[7],i=a[8],l=a[10],r=a[11];if(!(c==e&&d==g&&i==r&&b==l||b==d&&e==i&&g==l&&c==r))return k;if(16==a[D]){if(1!=a[12])return k;d=a[14];if(!(b==a[13]&&c==d))return k}return h};O.ji=function(){if(this.jj()){var a=new tf;a[Wa](this.H[1],this.H[2]);a[Wa](this.H[7],this.H[8]);return a}return j};
O.ja=function(){for(var a=0;a<this.H[D];){var b=this.H[a++];switch(b){case 0:case 3:break;case 1:case 2:return k;default:return k}a+=2*wf[b]}return h};O.xh=function(){for(var a=[],b=0;b<this.H[D];){var c=this.H[b++];3!=c&&a[u](c);for(var d=0;d<2*wf[c];d++)a[u](this.H[b++])}return new vf(a)};
var zf=function(a){for(var b=[],c=0,d=yf(function(){return a[Kc](c++)}),e=0,g=0;c<a[D];){var i=d();b[u](i);switch(i){case 0:case 1:e+=d();g+=d();b[u](e);b[u](g);break;case 2:var i=e+d(),l=g+d(),e=e+d(),g=g+d();b[u](i);b[u](l);b[u](e);b[u](g)}}return new vf(b)};var Af,sf=function(a,b,c,d){this.Dc=a;this.Cc=b;this.Bc=c;this.Sb=d};za(sf[E],function(){return"rgb("+this.Dc[$a]()+","+this.Cc[$a]()+","+this.Bc[$a]()+")"});sf[E].fd=function(){return"rgba("+this.Dc[$a]()+","+this.Cc[$a]()+","+this.Bc[$a]()+","+this.Sb[$a](3)+")"};
var Bf=function(a){var b=0,c=yf(function(){return a[Kc](b++)});return new mf(c()/65536+1,c()/65536,c()/65536,c()/65536+1,c(),c())},Df=function(a){for(var b=[],c=0,d=Cf(function(){return a[Kc](c++)}),e=0;c<a[D];)e+=ia(d(),10),b[u](e);return b},Cf=function(a){return function(){var b=a();if(58==b)return 0;for(var c="";48<=b&&57>=b;)c+=s.fromCharCode(b),b=a();return(97<=b?b-96:-(b-64))+c}},yf=function(a){var b=Cf(a);return function(){return ia(b(),10)}},Ef=function(a){a=q(a);return isFinite(a)?a:0},Ff=
function(a){var b=0,c=yf(function(){return a[Kc](b++)});return new qf((c()+256)/256,c(),(c()+256)/256,c(),(c()+256)/256,c(),(c()+256)/256,c())},Gf=function(a,b){var c=a,d=c&255,c=c>>8,e=c&255,c=c>>8,g=c&255,c=c>>8&255,c=c/255;b&&(g=g*b.ma+b.ua,e=e*b.la+b.ta,d=d*b.ka+b.sa,c=c*b.ca+b.wa/255);return new sf(g,e,d,c)},Hf=function(a){a=a[w](/^ *rgb *\( *([^,]+) *, *([^,]+) *, *([^,]+) *\) *$/,function(a,c,d,e){return(c<<16)+(d<<8)+(e<<0)});a=a[w](/^ *#([0-9a-fA-F]+) *$/,function(a,c){var d=ia(c,16);return 4278190080|
d});return a|0},If=function(a,b){P(b)||(b=100);return a&16777215|(2.55*b&255)<<24},Jf=function(a){return 0.04045>=a?a/12.92:p.pow((a+0.055)/1.055,2.4)},Kf=function(a){return 0.0031308>=a?12.92*a:1.055*p.pow(a,1/2.4)-0.055},Lf=function(a){for(var b="",c=0;256>c;c++)b+=q(a(c/255))[$a](5)+" ";return b},Mf=function(a,b){var c=new lf(20*b.x,20*b.y);c.z(a);c.x/=20;c.y/=20;return c},Nf=function(a,b,c){return a+(b-a)*c},Of=function(a){a[A]("opacity",0)},Pf=function(a){if(!Af){var b=function(a){ba.setTimeout(a,
1E3/60)};Af=/iPhone|iPod|iPad/.test(fa[vc])?b:ba.requestAnimationFrame||ba.webkitRequestAnimationFrame||ba.mozRequestAnimationFrame||ba.oRequestAnimationFrame||ba.msRequestAnimationFrame||b}Af[L](ba,a)};var U=function(a,b,c,d){if(jd(a)){var b=b==j?m[Ra](a):Q(b)?b[sc](","):b,e={};d&4&&(e.writable=h);d&2&&(e.configurable=h);d&1&&(e.enumerable=h);c&4&&(e.writable=k);c&2&&(e.configurable=k);c&1&&(e.enumerable=k);for(c=0;c<b[D];++c)(d=m[Cc](a,b[c]))&&d.configurable&&m[z](a,b[c],e)}},Qf=function(){};Qf[E].valueOf=function(){};var V=function(a){return a!=j?m(a):new Qf},Rf=function(a){return a!=j?m(a):m[kc](V[E])};
m[z](V[E],"unwatch",{get:function(){return function(a){if(1>arguments[D])return k;var b=this[a];delete this[a];this[a]=b;return h}}});m[z](V[E],"watch",{get:function(){return function(a,b,c){if(2>arguments[D])return k;for(var d=this,e=j,g=this;m[Zb](g);g=m[Zb](g))if(m[Cc](g,a)!=j){d=g;e=m[Cc](g,a);break}if(!e||e.configurable){var i=d[a];delete d[a];m[z](d,a,{get:function(){return i},set:function(d){return i=b[L](this,a,i,d,c)},configurable:h})}return h}}});var Sf={};
V.registerClass=function(a,b){if(2>arguments[D])return k;Sf[a]=b;return h};V[E].addProperty=function(a,b,c){var d=m[Cc](this,a);if(a==j||""==a||!R(b)||c&&!R(c)||d&&!d.configurable)return k;if(!c||d&&!d.writable)c=function(){};m[z](this,a,{get:b,set:c,configurable:h,enumerable:!(d&&!d.enumerable)});return h};"__proto__"in m||m[z](V[E],"__proto__",{get:function(){return m[Zb](this)}});U(V,j,3);U(V[E],j,3);var Tf=function(a){m[z](this,"__swiffy_s",{value:a})},Uf=function(a,b){for(var c=0;c<this._listeners[D];++c){var d=this._listeners[c],e=d[a.s().d(d,b)];R(e)&&e[L](d)}if(0<this._listeners[D])return h},Vf=function(a){Bd(this._listeners,a);this._listeners[u](a);return h},Wf=function(a){return Bd(this._listeners,a)};
Tf[E].initialize=function(a){a._listeners=[];a.addListener=Vf;a.broadcastMessage=qd(Uf,this.__swiffy_s);a.removeListener=Wf;U(a,["addListener","broadcastMessage","removeListener","_listeners"],3)};U(Tf[E],j,3);var Xf=function(){this.O={};this.Sf=this.Fb=0;U(this,j,3)};Xf[E].getAscii=function(){return this.Sf};Xf[E].getCode=function(){return this.Fb};Xf[E].isDown=function(a){return!!this.O[a]};Xf[E].isToggled=function(){return k};
m[pb](Xf[E],{BACKSPACE:{value:8,writable:k},CAPSLOCK:{value:20,writable:k},CONTROL:{value:17,writable:k},DELETEKEY:{value:46,writable:k},DOWN:{value:40,writable:k},END:{value:35,writable:k},ENTER:{value:13,writable:k},ESCAPE:{value:27,writable:k},HOME:{value:36,writable:k},INSERT:{value:45,writable:k},LEFT:{value:37,writable:k},PGDN:{value:34,writable:k},PGUP:{value:33,writable:k},RIGHT:{value:39,writable:k},SHIFT:{value:16,writable:k},SPACE:{value:32,writable:k},TAB:{value:9,writable:k},UP:{value:38,
writable:k}});Xf[E].Yi=function(a){this.Fb=a[Eb];this.O[a[Eb]]=k};Xf[E].Ui=function(a){this.Fb=a[Eb];this.Sf=a[Ab];this.O[a[Eb]]=h};var Yf={37:1,39:2,36:3,35:4,45:5,46:6,8:8,13:13,38:14,40:15,33:16,34:17,9:18,27:19};Xf[E].ij=function(){var a=Yf[this.Fb];return a?a:this.Sf};U(Xf[E],j,3);var Zf=function(a){this.q=a;U(this,j,3)};O=Zf[E];O.Wa=h;O.update=function(){this.q.P[K].cursor=this.Wa?this.q.be()?"pointer":this.q.Hi()?"pointer":!this.q[cd]()&&this.q.Ii()?"pointer":"default":"none"};O.Vi=function(){this.broadcastMessage("onMouseDown")};O.Si=function(){this.broadcastMessage("onMouseMove")};O.Wi=function(){this.broadcastMessage("onMouseUp")};Zf[E].hide=function(){var a=this.Wa;this.Wa=k;this[Yc]();return a};Zf[E].show=function(){var a=this.Wa;this.Wa=h;this[Yc]();return a};
U(Zf[E],j,3);var $f={ia:function(){return 0}},bg=function(a,b,c){return 1==a[D]?new ag(c(a[0])):new b(c(a[0]),c(a[1]))},ag=function(a){this.value=a};ag[E].Mc=h;ag[E].J=function(){return this[jb]};var cg=function(a,b){this.Vb=a;this.Wb=b};cg[E].Mc=k;cg[E].J=function(a){return Nf(this.Vb,this.Wb,a.ia())};var dg=function(a){return bg(a,cg,Te)},eg=function(a,b){this.Vb=a;this.Wb=b};eg[E].Mc=k;
eg[E].J=function(a){var b=this.Vb,c=this.Wb,a=a.ia();return new mf(Nf(b.u,c.u,a),Nf(b.w,c.w,a),Nf(b.l,c.l,a),Nf(b.m,c.m,a),Nf(b.D,c.D,a),Nf(b.F,c.F,a))};var fg=function(a,b){this.Vb=a;this.Wb=b};fg[E].Mc=k;fg[E].J=function(a){var b=this.Vb,c=this.Wb,a=a.ia();return new sf(Nf(b.Dc,c.Dc,a),Nf(b.Cc,c.Cc,a),Nf(b.Bc,c.Bc,a),Nf(b.Sb,c.Sb,a))};var gg=function(a,b){this.Vb=a;this.Wb=b;this.Ji=a.xh();this.Ki=b.xh()};gg[E].Mc=k;
gg[E].J=function(a){a=a.ia();if(0==a)return this.Vb;if(1==a)return this.Wb;for(var b=[],c=0,d=this.Ji.H,e=this.Ki.H;c<d[D];){var g=d[c++];b[u](g);for(var i=0;i<2*wf[g];i++)b[u](Nf(d[c],e[c++],a))}return new vf(b)};var hg;if(hg=-1!=fa[vc][y]("iPad")||hf.test(fa[vc])){var ig=kf[Ta](fa[vc])||[];ig[Sa]();hg=jf[M](j,ig)<jf(6)}var jg=hg,kg=[j,"reflect","repeat"],lg=[j,"linearRGB"],mg=function(a){na(this,bg(a[qb],fg,Gf))};mg[E].Ha=function(){return j};mg[E].dc=function(a,b,c,d,e){a[A](c,e,this[qb],ng);return c};mg[E].re=k;mg[E].Cb=function(a,b){xa(a,this[qb].J(b).fd());a[dc]();return h};
var og=function(a,b,c,d,e){c[A](e,"url(#"+d.id+")");return c},pg=function(a){a[N]&&(this.transform=bg(a[N],eg,function(a){return Bf(a).yj(16384,16384)}));this.stops=[];for(var b=0;b<a[ic][tb][D];b++){var c=a[ic][tb][b];this[tb][b]={color:bg(c[qb],fg,Gf),offset:dg(c[Ub].map(function(a){return a/255}))}}this.ae=kg[a[ic].spread];this.rh=lg[a[ic].interpolation]};O=pg[E];
O.Ch=function(a,b){a[A]("gradientUnits","userSpaceOnUse");this[N]?b[A](a,"gradientTransform",this[N],qg):a[A]("gradientTransform","scale(16384)");for(var c=0;c<this[tb][D];c++)a[t](rg(this[tb][c],b));this.ae&&a[A]("spreadMethod",this.ae);this.rh&&a[A]("color-interpolation",this.rh);a.id=Ue.Ca().Pa();return a};O.dc=og;O.Ha=function(){};O.Cb=function(){};O.re=k;var sg=function(a){pg[L](this,a)};S(sg,pg);
sg[E].Ha=function(a,b){var c=n[J]("http://www.w3.org/2000/svg","linearGradient");c[A]("x1",-1);c[A]("x2",1);c[A]("y1",0);c[A]("y2",0);return this.Ch(c,b)};sg[E].Cb=function(a,b){if(this.ae)return k;if(this[N]){var c=this[N].J(b);a[N](c.u,c.w,c.l,c.m,c.D,c.F)}else a.scale(16384,16384);for(var c=a.createLinearGradient(-1,0,1,0),d=this[tb],e=0;e<d[D];e++)c.addColorStop(d[e][Ub].J(b),d[e][qb].J(b).fd());xa(a,c);a[dc]();return h};var tg=function(a){pg[L](this,a);a[ic].f&&(this.ie=dg(a[ic].f))};S(tg,pg);
tg[E].Ha=function(a,b){var c=n[J]("http://www.w3.org/2000/svg","radialGradient");c[A]("r",1);c[A]("cx",0);c[A]("cy",0);this.ie&&b[A](c,"fx",this.ie,qg);return this.Ch(c,b)};tg[E].Cb=function(a,b){if(this.ae)return k;if(this[N]){var c=this[N].J(b);a[N](c.u,c.w,c.l,c.m,c.D,c.F)}else a.scale(16384,16384);c=0;this.ie&&(c=this.ie.J(b));for(var c=a.createRadialGradient(c,0,0,0,0,1),d=this[tb],e=0;e<d[D];e++)c.addColorStop(d[e][Ub].J(b),d[e][qb].J(b).fd());xa(a,c);a[dc]();return h};
var ug=function(a){this.Qg=a.bitmap;this.oc=j;this.uf="";a[N]&&(this.transform=Bf(a[N]))};ug[E].Ha=function(a,b,c){this.uf||(this.uf=(this.oc=a=c.oa[this.Qg])?"#"+a.Xg:"missing");return j};
ug[E].dc=function(a,b,c,d){var e;d==j?(e=n[J]("http://www.w3.org/2000/svg","use"),e[ob]("http://www.w3.org/1999/xlink","href",this.uf)):e=d;this[N]&&e[A]("transform",this[N][fc]());a=n[J]("http://www.w3.org/2000/svg","g");a[t](e);if(b=b[x][jb].ji()){if(d==j)var d=new lf(0,0),g=new lf(this.oc[Ua],this.oc[Zc]);else{e=q(d[Hc]("x"));var i=q(d[Hc]("y")),l=q(d[Hc]("width")),g=q(d[Hc]("height")),d=new lf(e,i),g=new lf(e+l,i+g)}this[N]&&(d.z(this[N]),g.z(this[N]));e=p[Xa](d.x);i=p[Xa](d.y);l=p[Xa](g.x-d.x);
g=p[Xa](g.y-d.y);0>l&&(e+=l,l=-l);0>g&&(i+=g,g=-g);if(b.e==e&&b.g==i&&b[Ua]()==l&&b[Zc]()==g)return a}d=n[J]("http://www.w3.org/2000/svg","clipPath");d.id=Ue.Ca().Pa();d[t](c);a[t](d);a[A]("clip-path","url(#"+d.id+")");return a};ug[E].re=h;ug[E].Cb=function(a){if(this[N]){var b=this[N];a[N](b.u,b.w,b.l,b.m,b.D,b.F)}a[lc]();a.drawImage(this.oc.kb,0,0);return h};var vg=function(a){ug[L](this,a)};S(vg,ug);
vg[E].Ha=function(a,b,c){vg.r.Ha[L](this,a,b,c);a=this.oc;if(!a)return j;b=this[N];c=n[J]("http://www.w3.org/2000/svg","pattern");c[A]("width",a[Ua]);c[A]("height",a[Zc]);c[A]("patternUnits","userSpaceOnUse");var d=n[J]("http://www.w3.org/2000/svg","use");d[ob]("http://www.w3.org/1999/xlink","href","#"+a.Xg);c[t](d);c[A]("patternTransform",b[fc]());c.id=Ue.Ca().Pa();return c};vg[E].dc=function(a,b,c,d,e){og(a,b,c,d,e);a=n[J]("http://www.w3.org/2000/svg","g");a[t](c);return a};
vg[E].Cb=function(a,b,c){b=a.createPattern(c.oa[this.Qg].kb,"repeat");this[N]&&(c=this[N],a[N](c.u,c.w,c.l,c.m,c.D,c.F));xa(a,b);a[dc]();return h};var wg=function(a){ug[L](this,a)};S(wg,ug);
wg[E].Ha=function(a,b,c){wg.r.Ha[L](this,a,b,c);b=this.oc;if(!b)return j;c=this[N];a=a[0].I();a.z(c.cf());var d=a[Ua](),e=a[Zc](),c=n[Cb]("canvas");c[A]("width",d);c[A]("height",e);var g=n[J]("http://www.w3.org/2000/svg","image");g[A]("width",d);g[A]("height",e);g[A]("x",a.e);g[A]("y",a.g);gf&&g[A]("transform","rotate(360)");var i=c.getContext("2d");i.rect(0,0,d,e);i[Qb](-a.e,-a.g);b=i.createPattern(b.kb,"repeat");xa(i,b);i[dc]();g[ob]("http://www.w3.org/1999/xlink","href",c.toDataURL("image/png"));
g.id=Ue.Ca().Pa();return g};var rg=function(a,b){var c=n[J]("http://www.w3.org/2000/svg","stop");b[A](c,"offset",a[Ub],qg);b[A](c,"stop-color",a[qb],ng);return c},xg=[j,mg,sg,tg,tg,jg?wg:vg,ug],yg=function(a){var b=xg[a[Ob]];return b?new b(a):j};var zg=["round","butt","square"],Ag=["round","bevel","miter"],Bg=function(a){a[dc]?this.fill=yg(a[dc]):na(this,bg(a[qb],fg,Gf));this.ph=zg[a.cap|0];this.qh=Ag[a.joint|0];a[ib]&&(this.miter=dg(a[ib]));la(this,dg(a[Ua]))},Cg=function(a){return a?new Bg(a):j};Bg[E].Ha=function(a,b,c){return this[dc]?this[dc].Ha(a,b,c):j};Bg[E].re=k;
Bg[E].dc=function(a,b,c,d,e){a[A](c,"stroke-width",this[Ua],Dg);c[A]("stroke-linecap",this.ph);c[A]("stroke-linejoin",this.qh);this[ib]!=j&&a[A](c,"stroke-miterlimit",this[ib],qg);if(this[dc])return this[dc].dc(a,b,c,d,e);a[A](c,e,this[qb],ng);return c};Bg[E].Cb=function(a,b){if(this[dc])return k;a.lineCap=this.ph;a.lineJoin=this.qh;this[ib]!=j&&(a.miterLimit=this[ib].J(b));a.lineWidth=p.max(this[Ua].J(b),20);a.strokeStyle=this[qb].J(b).fd();a.stroke();return h};var Eg=function(a,b){this.Ia=a?a:new tf;this.X=b};O=Eg[E];O.Jc=function(a){this.X?a.X?this.X.Jc(a.X):this.X.Jc(a.Ia):a.X&&(this.X=this.Ia.I(),this.X.Jc(a.X));this.Ia.Jc(a.Ia)};O.z=function(a){this.X&&this.X.z(a);this.Ia.z(a)};O.I=function(){return new Eg(this.Ia.I(),this.X?this.X.I():f)};O.Nb=function(){return this.X?this.X:this.Ia};O.ri=function(a){this.X||(this.X=this.Ia.I());this.Ia=a};var Gg=function(){this.Kb=this.Kc=this.S=j;this.vd=[];this.n=new Fg(this)};O=Gg[E];O.Ce=function(a){if(!this.S||this.S[B]>a)return this.Kb=j;var b=this.S;this.Kb&&a>=this.Kb[B]&&(b=this.Kb);for(;b[Xb]&&b[Xb][B]<=a;)b=b[Xb];return this.Kb=b};O.ye=function(a,b){var c=this.Ce(b);c?(c[Xb]?c[Xb].nb=a:this.Kc=a,a.nb=c,wa(a,c[Xb]),wa(c,a)):(this.S&&(this.S.nb=a,wa(a,this.S)),this.S=a,this.Kc||(this.Kc=a));ra(a,b)};
O.Bd=function(a){this.Kb===a&&(this.Kb=this.Kb[Xb]);a.nb?wa(a.nb,a[Xb]):this.S=a[Xb];a[Xb]?a[Xb].nb=a.nb:this.Kc=a.nb;wa(a,j);a.nb=j;ra(a,f)};O.ug=function(a,b){this.ye(a,b);Hg(this.h,a)};O.tg=function(a){return(a=this.ee(a))?this.Ef(a):j};O.Ef=function(a){this.Bd(a);a.yh(32)?this.vd[u](a):this.Qf(a);return a};O.bi=function(a){for(var b=this.S;b;){var c=b,b=b[Xb];a(c)||this.Ef(c)}};O.ee=function(a){var b=this.Ce(a);return b&&b[B]==a?b:j};
O.forEach=function(a){for(var b=this.S;b;){if(a(b))return h;b=b[Xb]}return k};O.gj=function(a){for(var b=this.S;b;){if(b[zb]()==a)return b;b=b[Xb]}return j};O.hj=function(){return this.Kc?p.max(0,this.Kc[B]+1):0};O.Qf=function(a){Ig(this.h,a);a.A();ra(a,f)};O.A=function(){for(;this.S;){var a=this.S;this.Bd(a);this.Qf(a)}};O.Bb=function(){for(var a=this.S;a;)a.Bb(),a=a[Xb]};O.bj=function(){if(0<this.vd[D]){for(var a=0;a<this.vd[D];a++)this.Qf(this.vd[a]);this.vd=[]}};
O.Ag=function(a){this.h=a;for(var b=this.S;b;)Hg(a,b),b=b[Xb]};O.Nf=function(a,b){this.h&&(Ig(this.h,a),b&&Hg(this.h,a,b))};O.Kf=function(a,b){b<a&&(b=a=b);var c=this.Ce(a),d=this.Ce(b);c&&c[B]==a?this.Bd(c):c=j;d&&d[B]==b?this.Bd(d):d=j;c&&this.ye(c,b);d&&this.ye(d,a)};O.zi=function(a){var b=p.min(-16384,this.S[B])-1;this.Bd(a);this.ye(a,b)};
var Hg=function(a,b,c){if(a&&(P(c)||(c=b[zb]()),c)){var d=b.a.s(),e=d.d(a,c);a[zc](e)||(a[d.Ya(a,c)]=b.K()?b.h:a)}},Ig=function(a,b){if(a){var c=b.K()?b.h:a,d=b[zb](),e=b.a.s();d&&e&&(d=e.d(a,d));d&&c===a[d]&&delete a[d]}},Fg=function(a){this.t=a;this.Gc=[]};O=Fg[E];O.vf=function(){this.N||(this.N=n[J]("http://www.w3.org/2000/svg","g"));return this.N};
O.jb=function(a){this.oi();for(var b=[],c=this.t.S,d=j;c;){for(var e=c.n;0<b[D]&&c[B]>b[b[D]-1].Sc;)b.pop();e.jb(a);e.ni(b);this.Gc[u](c);e=e.Yb();d=d?d[Xb]:this.N[Gb];d!=e&&(this.N.insertBefore(e,d),d=e);c.yg()&&!(c instanceof Jg)&&b[u](c);c=c[Xb]}for(d=d?d[Xb]:this.N[Gb];d;)a=d,d=d[Xb],this.N[Bc](a)};O.Ta=function(a){for(var b="",c=this.t.S;c;)b+=c.n.Fi(a),c=c[Xb];return b};O.Yb=function(){return this.N};
O.oi=function(){for(var a=this.Gc[D]-1;0<=a;--a){var b=this.Gc[a],c=b.n;b.wb&&(c.A(),this.N[Bc](c.Yb()))}this.Gc=[]};O.A=function(){for(var a=0;a<this.Gc[D];++a)this.Gc[a].n.A()};var Kg=function(a){this.a=a;this.Sc=f;this.We="";this.xa=j;wa(this,j);this.nb=j;this.Ie=this.C=0;this.R=15;this.Na=[];this.Ue=j;this.Wa=h;this.pg=0;this.wb=this.hg=k;this.eb=nf;this.pc=j;this.Oa=rf;this.o(4);this.ub=this.Oa;this.Ed=rf;this.xb=this.Kd=j;this.h=this.Td()};O=Kg[E];O.hd=function(){m[z](this.h,"__swiffy_d",{value:this})};
O.Pg=function(){var a=this.xa;if(a){if(this.C&4||a.C&2048)a=a.ub.wi(this.Oa),this.Pb()?(this.Ed=a,this.ub=rf):(this.Ed=rf,this.ub=a),this.o(2048)}else this.C&4&&(this.ub=this.Oa,this.o(2048));this.xf(function(a){a.Pg()})};O.Ba=function(){this.R&1&&(this.Ri=this.xa?this.eb[Ic](this.xa.Ba()):this.eb,this.R^=1);return this.Ri};O.Mb=function(){this.R&2&&(this.cj=this.Ba().cf(),this.R^=2);return this.cj};O.xf=function(){};O.map=function(a){return a(this)};O.Td=function(){return new W};
O.Qa=function(){this.Lj=h};O.Sg=function(){return!!this.Lj};O.setTransform=function(a){this.eb!=a&&(this.o(1),this.eb=a,this.pc=j,this.pe(),this.xa&&this.xa.Zb())};O.Oc=function(){this.pc||(this.pc=this.eb.oj());return this.pc};O.Pf=function(){var a=this.pc;a&&(this[vb](pf(a,this.eb.D,this.eb.F)),this.pc=a)};O.pe=function(){this.R|=3;this.o(1024);this.xf(function(a){a.pe()});0<this.Na[D]&&this.Zb()};O.Zb=function(){this.R|=4;this.o(8192);this.xa&&this.xa.Zb()};O.Ni=function(){this.R|=8;this.Zb()};
O.fa=function(){return this.eb};O.yg=function(){return P(this.Sc)};O.Xe=function(a){this.Sc!=a&&(this.o(16384),this.Sc=a)};O.ia=function(){return this.pg};O.o=function(a){(this.C&a)!=a&&(this.C|=a,this.Ie|=a,this.xa&&this.xa.o(32768))};O.$d=function(a){this.pg=a};O.A=function(){this.wb=h};O.Bb=function(){this.hg=h};O.vb=function(a){this.Oa.$b(a)||(this.o(4),this.Oa=a)};O.jh=function(a){a!=this.Pb()&&(this.o(4096),this.o(4))};O.Od=function(a){var b=this.Pb();this.wh=a;this.jh(b)};
O.Pb=function(){return!this.wh&&0<this.Na[D]?1:this.wh};O.kd=function(a){if(this.Kd!=a){this.o(16384);var b=this.Kd;this.xb&&this.xb.kd(j);b&&(b.xb=j,b.o(16384),b.pe());a&&(a.kd(j),a.Xe(f),a.xb&&a.xb.kd(j),a.xb=this,a.o(16384),a.pe());this.Kd=a}};O.Pd=function(a){if(this.Na!=a&&(0<this.Na[D]||0<a[D])){var b=this.Pb();this.o(2);this.Na=a;this.Ni();this.jh(b)}};O.Hg=function(){if(this.R&8){this.Ue=new tf(0,0,0,0);for(var a=0;a<this.Na[D];a++)this.Ue.add(this.Na[a].Ge());this.R^=8}return this.Ue};
O.hb=function(a){a=s(a);a!=this.We&&this.xa&&this.xa.Nf(this,a);this.We=a};O.getName=function(){return this.We};O.Wd=function(a){(this.xa=a)&&this.C&&a.o(32768)};O.getParent=function(){return this.xa};O.Yj=function(a){this.Wa!=a&&(this.o(8),this.Wa=a)};O.K=function(){return k};O.yh=function(){return k};O.Va=function(){if(this.R&4){this.zf=this.Ic();if(0<this.Na[D]){var a=this.zf.Ia.I();a.z(this.Ba());a.add(this.Hg());a.z(this.Mb());this.zf.ri(a)}this.R^=4}return this.zf};O.ha=function(){this.hd()};
Fa(O,function(){});O.Th=function(){var a=this.Va().Ia.I();a.z(this.Ba());var b=new tf(0,0,20*this.a.Hd,20*this.a.Gd);b.add(this.Hg().hi());a.gi(b);return a};var Lg=function(a){this.b=a;this.nc=this.Fa=this.vc=this.Ga=j;this.bf=[];this.uc=[];this.Tc=1;this.T=[];this.Ye=this.Xd=k;this.$a=j};O=Lg[E];O.Yb=function(){return this.N};O.Gf=function(a){return Gf(a,this.b.ub)};
O.jb=function(a){a&4&&this.Yd();if(this.b.C){var b;this.b.C&16384?(b=this.b.yg()||this.b.xb!=f,this.Xd!=b&&(a|=4,this.Xd=b,this.Yd())):b=this.Xd;b?this.ki(a):this.pa(a);this.b.C=0}};O.ki=function(){if(!this.N){this.N=n[J]("http://www.w3.org/2000/svg","clipPath");this.N.id=this.ke();var a=n[J]("http://www.w3.org/2000/svg","path");this.N[t](a)}var a=nf,b=this.b.xb,c=this.b[Qa]();b&&b[Qa]()!=c&&(a=a[Ic](c.Ba()));b=this.Ta(a);a=this.N[Gb];a[A]("d",b||"M 0 0")};
O.pa=function(a){this.N||(this.N=this.ib=this.gd(a),this.cd&&(this.ib.id=this.cd));a=this.b.C;a&8&&this.ib[A]("display",this.b.Wa?"inline":"none");a&2048&&(a|=4096);a&4096&&this.Yh()&&(a|=2);a&1&&this.ib[A]("transform",this.bd());if(a&2){if(a|=2048,Mg){var b="SourceGraphic";this.Ga&&(ne(this.Ga),this.uc=[]);this.Tc=1;for(var c=this.b.Na,d=0;d<c[D];++d){var e=c[d].Xb(this);this.uc[u](e);e[M](b);b=e[mc]();this.Tc=p.max(this.Tc,c[d].Ig())}this.vc&&(c=this.vc.Xb(this),c[M](b),this.uc[u](c));this.Jg();
this.Fa&&(0<this.Ga[Rb][D]?this.Fa[A]("filter","url(#"+this.Ga.id+")"):this.Fa[Vc]("filter"))}}else this.Ga&&(a&1024||a&8192)&&this.Jg();this.Zh();a&2048&&this.jf()};O.Ta=function(){return""};O.Fi=function(a){if(this.b.C)return this.$a=j,this.b.C=0,this.Ta(a);this.$a==j&&(this.$a=this.Ta(a));return this.$a};O.bd=function(){return this.b.eb[fc]()};var Ng=function(a){var b=n[J]("http://www.w3.org/2000/svg","g");pe(b,a);b[t](a);return b};O=Lg[E];
O.ni=function(a){if(!this.Xd){var b=0,c=this.bf,a=a[Ya](0),d=this.b.Kd;d&&a[u](d);for(var d=p.min(c[D],a[D]),e=this.nc;b<d;)c[b]!=a[b]&&e[A]("clip-path","url(#"+a[b].n.ke()+")"),e=e[Gb],++b;if(a[D]>d){d=a[D];0==b&&(e?(c=e,e=e[Gb]):(e=this.N,this.N=this.nc=c=Ng(e)),c[A]("clip-path","url(#"+a[b].n.ke()+")"),++b);for(;b<d;)c=Ng(e),c[A]("clip-path","url(#"+a[b].n.ke()+")"),++b}else if(c[D]>d){d=c[D];0==b&&(e[Vc]("clip-path"),e=e[Gb],++b);for(;b<d;)c=e[Gb],pe(c,e),e=c,++b}this.bf=a}};
O.ke=function(){P(this.cd)||(this.cd=Ue.Ca().Pa(),this.ib&&(this.ib.id=this.cd));return this.cd};O.A=function(){oe(this.Ga)};O.Yd=function(){this.A();this.N=this.ib=this.nc=this.Ga=j;this.uc=[];this.T=[];this.bf=[];this.$a=j;this.b.C=this.b.Ie};
O.Ea=function(){this.Ga==j&&(this.Ga=n[J]("http://www.w3.org/2000/svg","filter"),this.Ga.id=Ue.Ca().Pa(),this.b.a.Rc[t](this.Ga),this.Fa==j&&(this.Fa=n[J]("http://www.w3.org/2000/svg","g"),pe(this.Fa,this.N),this.nc==j&&(this.nc=Ng(this.N)),this.Fa[t](this.nc),this.N=this.Fa));return this.Ga};
O.Jg=function(){var a=this.b[Qa]().Mb(),b=this.b.Th(),c=this.Ea();if(b.ja())c[A]("width",0),c[A]("height",0);else{var d=p[bb]((b.k-b.e)/20),e=p[bb]((b.p-b.g)/20),g=d,i=e;5E4<d*e&&(g=p[eb](g/this.Tc),i=p[eb](i/this.Tc));b=b.I();b.z(a);c[A]("filterUnits","userSpaceOnUse");c[A]("x",b.e);c[A]("y",b.g);c[A]("width",b.k-b.e);c[A]("height",b.p-b.g);g<d?c[A]("filterRes",g+" "+i):c[Vc]("filterRes")}};O.Zh=function(){for(var a=this.uc,b=0;b<a[D];++b)a[b].jb()};
O.Yh=function(){var a=this.b,b=a.Ed;if(1<a.Pb()||1==a.Pb()&&!b.zg()){if(!this.vc)return this.vc=new Og,this.Fa&&this.Fa[Vc]("opacity"),h}else{a=b.ca[$a](3);if(1!=a||this.Fa)this.Ea(),this.Fa[A]("opacity",a);if(this.vc)return this.vc=j,h}return k};O.Md=function(a,b,c){this.T[u](function(){var d=this.Gf(c);a[A](b,d[fc]());a[A](b+"-opacity",d.Sb[$a](3))})};O.jf=function(){for(var a=this.T,b=0;b<a[D];++b)a[b][L](this);if(a=this.uc)for(b=0;b<a[D];++b)a[b].jf()};var Pg=function(){Ba(this,[])},Qg=function(a){Kg[L](this,a);this.Sa=1;this.Wc=k;this.dd={};this.gg=h;this.sc=2096896};S(Qg,Kg);
var Rg={qk:1,ok:2,uk:4,sk:8,tk:16,Ak:32,mk:64,rk:128,yk:256,zk:512,xk:1024,wk:2048,vk:4096,jk:8192,lk:16384,ik:32768,kk:65536,nk:131072,hk:262144,gk:524288,pk:1048576},Sg={4:"onMouseUp",8:"onMouseDown",16:"onMouseMove",32:"onUnload",64:"onEnterFrame",128:"onLoad",16384:"onDragOver",65536:"onDragOver",256:"onRollOut",512:"onRollOver",1024:"onReleaseOutside",2048:"onRelease",4096:"onPress",8192:"onDragOut",32768:"onDragOut"},Tg=function(a,b){m[z](this,a,{value:b,configurable:h,writable:h,enumerable:h});
var c=this.__swiffy_d;c&&c.lf()},Ug=function(){};O=Qg[E];O.Nd=function(a){this.sc|=a};O.Ih=function(a){this.sc&=~a};O.yh=function(a){return this.dd[a]&&0<this.dd[a][H][D]};O.vh=function(a){var b=this.dd[a];b||(b=new Pg,this.dd[a]=b);return b};O.Tg=function(a,b,c){for(var d in Rg){var e=Rg[d];if(a&e){this.Nd(e);var g=this.vh(e),i={};i.hf=new Vg(c,this.uh());e&1048576&&(i.Cg=function(a){return a.getKey().ij()==b},i.stopPropagation=h);g[H][u](i);e&130816&&this.lf()}}};
O.Fj=function(a,b){for(var c in Rg){var d=Rg[c];a&d&&(this.vh(d).sound=b)}};O.isEnabled=function(){return this.Wc&&this.h.enabled!=k&&!this.wb};O.lf=function(){!this.Wc&&this.gg&&(this.o(128),this.Wc=h)};
O.fireEvent=function(a,b){var c=k;if(this.sc&a){var d=this.a.s(),e=this.dd[a];if(e){for(var g=0;g<e[H][D];++g){var i=e[H][g];if(!i.Cg||i.Cg(this.a))i.hf&&(b?d.kf(i.hf):d.Kg(i.hf)),i[uc]&&(c=h)}e[Hb]&&this.a.zc().Lg(e[Hb])}var l=Sg[a];if(l){var r=this,e=function(){var a=r.h,b=d.d(a,l);if(a[b])a[b]()};b?e():d.Fg(e)}}return c};O.Z=function(a){this.Sa!=a&&(this.Sa=a)};O.trackAsMenu=function(){return k};
O.ge=function(a){this[Ec]()&&(this.a.ii(this),this.a[cd]()==k&&1==this.Sa?(this.Z(2),this[Mc](512)):this[Pc]()&&this.a.be()==k&&1==this.Sa?(this.Z(4),this[Mc](16384)):this.a.ed(this)&&2==this.Sa&&(this.Z(4),this[Mc](65536)),this.a.U(),this.a.Ra(),a[uc]())};
O.qe=function(a){this.a.rf(this);this[Ec]()?(this.a[cd]()==k&&2==this.Sa?(this.Z(1),this[Mc](256)):this[Pc]()&&this.a.be()==k&&4==this.Sa?(this.Z(1),this[Mc](8192)):this.a.ed(this)&&4==this.Sa&&(this.Z(2),this[Mc](32768)),this.a.U(),this.a.Ra(),a&&a[uc]()):this.Z(1)};O.Jd=function(a){this[Ec]()?(this[Pc]()?this.a[ab](this):this.a[ab](this,h,pd(this.li,this)),a[uc](),this.Z(4),this[Mc](4096),this.a.U(),this.a.Ra()):(this.a.rf(this),this.Z(1))};
O.Fd=function(a){if(this[Ec]()){var b=this[Pc]()&&this.a.be()==k||this.a.ed(this);this.a[ac](this);a[uc]();this.Z(2);b?this[Mc](2048):this[Mc](512);this.a.U();this.a.Ra()}else this.a.rf(this),this.Z(1)};O.li=function(){this[Ec]()&&(this.Z(1),this[Mc](1024),this.a.U(),this.a.Ra())};var Wg=function(a){Lg[L](this,a);this.va=[]};S(Wg,Lg);O=Wg[E];
O.pa=function(a){Wg.r.pa[L](this,a);if(this.b.C&128&&this.b.Wc){a=this.he();a[K].pointerEvents="visiblePainted";var b=this.b,c;"createTouch"in n?(c=T(a,"touchmove",this.Le,h,this),this.va[u](c),c=T(a,"touchstart",this.Me,h,this),this.va[u](c),c=T(a,"touchend",this.Ke,h,this)):(c=T(a,"mouseover",this.ge,h,this),this.va[u](c),c=T(a,"mouseout",this.Je,h,this),this.va[u](c),c=T(a,"mousedown",b.Jd,h,b),this.va[u](c),c=T(a,"mouseup",b.Fd,h,b));this.va[u](c)}};
O.Je=function(a){var b=a.relatedTarget;b&&qe(this.he(),b)?a[uc]():this.b.qe(a)};O.ge=function(a){var b=a.relatedTarget;b&&qe(this.he(),b)?a[uc]():this.b.ge(a)};O.Le=function(){this.b.a.ed(this.b)&&(this.b[Mc](8192),this.b.a[ac](this.b.a))};O.Me=function(a){1==a.qb.touches[D]&&(this.b.ge(a),this.b.Jd(a))};O.Ke=function(a){this.b.a.ed(this.b)&&this.b.Fd(a)};O.A=function(){Wg.r.A[L](this);for(var a=0;a<this.va[D];a++)Fe(this.va[a])};var Xg=function(a){Qg[L](this,a);this.t=new Gg};S(Xg,Qg);O=Xg[E];O.A=function(){Xg.r.A[L](this);this.t.A()};O.Ic=function(){var a=new Eg;this.t[Ib](function(b){var c=b.Va().I();c.z(b.fa());a.Jc(c)});return a};O.map=function(a){var b=Xg.r.map[L](this,a);return b=b||this.t[Ib](function(b){return b.map(a)})};O.xf=function(a){this.t[Ib](a)};O.K=function(){return h};O.Tb=function(a,b){this.o(16);a[Qa]()!=j&&a[Qa]()[Bc](a);a.Wd(this);this.t.ug(a,b)};
O.removeChild=function(a){this.o(16);this.t.Ef(a);a.Bb();a.Wd(j)};O.rc=function(a){this.o(16);if(a=this.t.tg(a))a.Bb(),a.Wd(j)};O.hd=function(){Xg.r.hd[L](this);this.t.Ag(this.h)};O.Nf=function(a,b){this.t.Nf(a,b)};O.Td=function(){return new Yg};O.Kf=function(a,b){this.o(16);this.t.Kf(a,b)};var Zg=function(a){Wg[L](this,a)};S(Zg,Wg);Zg[E].pa=function(a){this.b.Wc&&(a|=1);this.b.Na[D]&&(a|=2);Zg.r.pa[L](this,a);var b=this.b;b.C&32784&&b.t.n.jb(a)};Zg[E].Ta=function(a){var b=this.b.fa();return this.b.t.n.Ta(b[Ic](a))};
Zg[E].A=function(){Zg.r.A[L](this);this.b.t.n.A()};var ah=function(a,b){Xg[L](this,b.a);this.c=a;this.mc=b;this.Rd=new Gg;this.n=new $g(this);this.gf(this.t,1);this.gf(this.Rd,8);this.lf()};S(ah,Xg);O=ah[E];O.A=function(){ah.r.A[L](this);this.Rd.A()};O.Z=function(a){a!=this.Sa&&(this.gf(this.t,a,this.Sa),this.a.kc=h);ah.r.Z[L](this,a)};O.uh=function(){return this.mc};O.trackAsMenu=function(){return this.c[Pc]};
O.gf=function(a,b,c){this.o(16);var d=this.c[xc];if(d){if(P(c))for(var e=0;e<d[D];e++){var g=d[e],i=g[Jb]&c,l=g[Jb]&b;i&&!l&&a.tg(g[B])}for(e=0;e<d[D];e++)if(g=d[e],i=g[Jb]&c,(l=g[Jb]&b)&&!i)if(i=this.a.Ve(g.id,this.mc))i.K()&&8!=b&&i.hb(this.a.vg()),i.Wd(this),i.ha(),i[Gc](),a.ug(i,g[B]),g[N]&&i[vb](g[N]),g[Tc]&&i.Pd(g[Tc]),g[Fb]&&i.Od(g[Fb]),g.Bg&&i.vb(g.Bg)}};var $g=function(a){Wg[L](this,a)};S($g,Zg);
$g[E].gd=function(a){var b=this.b.t.n.vf(),c=this.b.Rd.n,d=c.vf();c.jb(a);this.wf=d.cloneNode(h);Of(this.wf);a=n[J]("http://www.w3.org/2000/svg","g");a[t](this.wf);a[t](b);return a};$g[E].he=function(){return this.wf};$g[E].A=function(){$g.r.A[L](this);this.b.Rd.n.A()};var Jg=function(a,b){Kg[L](this,b.a);this.c=a;this.mc=b;this.lc=this.c[qb];this.Da=this.c.html;this.n=new bh(this);this.c[pc]&&b.a.s().ai(this.c[pc],this,b,this.c[Va]);if(!P(this.yb)){var c=this.c[Va];this.$c(P(c)?c:"")}};S(Jg,Kg);O=Jg[E];O.Ic=function(){return new Eg(this.c[C])};O.$c=function(a,b){a=this.a.s().Xa(a);this.yb!=a&&(this.o(32),this.yb=this.Da?a[w](/\n/g,"<br/>"):a);!b&&(this.Da&&this.lc!=this.c[qb])&&(this.o(32),this.lc=this.c[qb])};O.rj=function(a){this.Da!=a&&(this.o(64),this.Da=a)};
O.Xj=function(a){this.lc=16777215&a|this.lc&4278190080;this.Da&&(this.yb=this.yb[w](/(<font [^>]*color=["'])[^"']+(["'][^>]*>)/gi,"$1#"+a[fc](16)+"$2"));this.o(64)};O.Qj=function(){return this.lc&16777215};O.Td=function(){return new ch};O.hd=function(){Jg.r.hd[L](this);var a=this.h;m[pb](a,dh);this.a.s().Id(a);a.addListener(a)};O.A=function(){Jg.r.A[L](this);this.c[pc]&&this.mc.s().mi(this.c[pc],this,this.mc)};O.K=function(){return 6<=this.mc.a.da?h:k};var bh=function(a){Lg[L](this,a)};S(bh,Lg);
bh[E].pa=function(a){this.b.C&64&&this.Yd();bh.r.pa[L](this,a);if(this.b.C&32&&(ne(this.Ne),P(this.b.yb))){var b=this.b.yb;if(this.b.Da){this.Xh(this.Ne,b,this.b.c.multiline);for(a=this.ag;a<this.T[D];++a)this.T[a][L](this)}else for(var a=this.Ne,b=b[sc](/\r\n|\r|\n/g),c=0;c<b[D];c++)if(""==b[c]){var d=n[Cb]("br");a[t](d)}else{var d=n[hb](b[c]),e=n[Cb]("p");e[K].margin=0;e[t](d);a[t](e)}Ud&&this.ib[A]("transform",this.ib[Hc]("transform"))}};
bh[E].gd=function(){var a=this.b.c,b=a[C],c=n[J]("http://www.w3.org/2000/svg","g"),d=this.b.Da;this.T=[];var e=n[J]("http://www.w3.org/2000/svg","foreignObject"),g=n[Cb]("body");e[t](g);var i=n[Cb]("div");this.Ne=i;var l=this.b.a.oa[a[Na]],r=1.15;l&&(i[K].fontFamily="'"+l[Vb]+"'",r=l.lineHeight);Ca(this,r);if(!d){var l=i[K],v=a[Zc],G=a[db]|0;l.fontSize=v+"px";Ca(l,r*v+G+"px");a[hc]&&(i[K].fontWeight="bold");a[kb]&&(i[K].fontStyle="italic")}i[K].textAlign=eh(a.align);a.wrap?d||(i[K].whiteSpace="pre-wrap"):
i[K].whiteSpace="nowrap";i[K].wordWrap="break-word";this.dg(i[K],this.b.lc);i[K].textIndent=a[Oa]+"px";0>a[Oa]+a[ad]?(r=-(a[Oa]+a[ad]),l=-a[Oa],d=b.e+30-r,e[A]("width",b.k-b.e-60+r),i[K].marginLeft=l+"px"):(d=b.e+30,e[A]("width",b.k-b.e-60),i[K].marginLeft=a[ad]+"px");i[K].marginRight=a.rightMargin+"px";this.Fh="translate("+d+",0)";e[A]("x",0);r=n[J]("http://www.w3.org/2000/svg","rect");r[A]("x",b.e-d);r[A]("y",b.g);r[A]("width",b.k-b.e);r[A]("height",b.p-b.g);a.border?(r[A]("stroke-width","10"),
this.Md(r,"fill",4294967295),this.Md(r,"stroke",4278190080)):Of(r);c[t](r);r=40-0.5*(a[db]|0);a=0;0<r&&(a=r,r=0);i[K].paddingTop=a+"px";e[A]("y",b.g+r);e[A]("height",b.p-b.g-r-40);g[t](i);c[t](e);this.ag=this.T[D];return c};bh[E].dg=function(a,b){this.T[u](function(){na(a,this.Gf(b).fd())})};
bh[E].Xh=function(a,b,c){var d=this.b,e=this.lineHeight,g=d.c[Zc],i=d.c[db]|0,l=k,r=a,v=[];this.T[$c](this.ag);var G=function(a,b){var c=n[Cb](a);r[t](c);r=c;v[u](l);v[u](g);v[u](e);v[u](b)},F=this,I=b[w](/&nbsp;/g," "),a={Wh:function(a,b){switch(a){case "p":G("p",a);r[K].margin=0;var v=b[mb]("align");v&&(r[K].textAlign=v[dd]);c||(r[K].display="inline");break;case "b":case "i":case "u":G(a,a);break;case "a":G(a,a);(v=b[mb]("href"))&&r[A]("href",v[dd]);(v=b[mb]("target"))&&r[A]("target",v[dd]);r[K].pointerEvents=
"all";na(r[K],"inherit");r[K].textDecoration="inherit";break;case "br":case "sbr":v=n[Cb]("br");r[t](v);break;case "font":G("span",a);(v=b[mb]("color"))&&F.dg(r[K],Hf(v[dd]));if(v=b[mb]("face")){r[K].fontFamily=v[dd];a:{var I=d.a.oa,lb;for(lb in I)if(I[lb]instanceof fh&&I[lb][Vb]==v[dd]){e=I[lb].lineHeight;break a}e=1.15}}(lb=b[mb]("size"))&&(g=20*lb[dd]);if(v||lb)v=r[K],lb=g,I=e,v.fontSize=lb+"px",Ca(v,I*lb+i+"px"),l=h}},Vh:function(a){v[v[D]-1]==a&&(v.pop(),e=v.pop(),g=v.pop(),l=v.pop(),r=r[Xc])},
Uh:function(a){a=n[hb](a);if(l)r[t](a);else{var b=n[Cb]("span"),c=b[K],d=g,v=e;c.fontSize=d+"px";Ca(c,v*d+i+"px");b[t](a);r[t](b)}}},b=n[Cb]("div");b.innerHTML=I;for(I=0;I<b[Rb][D];I++)gh(b[Rb][I],a)};var eh=function(a){switch(a){case 0:return"left";case 2:return"center";case 1:return"right";case 3:return"justify";default:return"left"}},gh=function(a,b){switch(a.nodeType){case Node.ELEMENT_NODE:var c=a.nodeName[fd]();b.Wh(c,a.attributes);for(var d=0;d<a[Rb][D];d++)gh(a[Rb][d],b);b.Vh(c);break;case Node.TEXT_NODE:b.Uh(a.textContent)}};
bh[E].Ta=function(){return""};bh[E].bd=function(){return bh.r.bd[L](this)+" "+this.Fh};var hh=function(a,b,c){a[A]("tableValues",Lf(function(a){return Jf(Kf(a)*b+c)}))},ih=function(a,b,c){a[A]("slope",b);a[A]("intercept",c)},jh=function(a,b,c,d,e,g,i){c==e&&d==g||(1==c&&0==d?b[Xc]&&a[Bc](b):(i(b,c,d/255),b[Xc]||a[t](b)))},kh=function(a){var b=j,c=j,d=j,e=j,g=j,i=j,l=new qf(1,0,1,0,1,0,1,0);return function(){var r=this.b.ub;r.zg()?(b&&b[Xc]&&(oe(b),a[Vc]("filter")),a[A]("opacity",r.ca[$a](3))):(b||(b=n[J]("http://www.w3.org/2000/svg","filter"),b.id=Ue.Ca().Pa(),b[A]("x","0%"),b[A]("y",
"0%"),b[A]("width","100%"),b[A]("height","100%"),i=n[J]("http://www.w3.org/2000/svg","feComponentTransfer"),b[t](i),c=n[J]("http://www.w3.org/2000/svg","feFuncR"),c[A]("type","discrete"),d=n[J]("http://www.w3.org/2000/svg","feFuncG"),d[A]("type","discrete"),e=n[J]("http://www.w3.org/2000/svg","feFuncB"),e[A]("type","discrete"),g=n[J]("http://www.w3.org/2000/svg","feFuncA"),g[A]("type","linear")),a[Vc]("opacity"),b[Xc]||(a[t](b),a[A]("filter","url(#"+b.id+")")),jh(i,c,r.ma,r.ua,l.ma,l.ua,hh),jh(i,
d,r.la,r.ta,l.la,l.ta,hh),jh(i,e,r.ka,r.sa,l.ka,l.sa,hh),jh(i,g,r.ca,r.wa,l.ca,l.wa,ih),l=r)}};var qg=function(a,b,c,d){this.n=a;this.je=b;ta(this,c);this.value=d;this.Eb=0;d.Mc||(this.Eb|=256)};Ha(qg[E],function(){this.je[A](this[Vb],this[jb].J(this)[fc]())});qg[E].ia=function(){return this.n.b.ia()/65535};var Dg=function(a,b,c,d){qg[L](this,a,b,c,d);this.Eb|=1024};S(Dg,qg);Ha(Dg[E],function(){var a=this[jb].J(this),b=this.n.b.Ba(),b=14/((b.df()+b.ef())/2);this.je[A](this[Vb],a<b?b:a)});
var ng=function(a,b,c,d){qg[L](this,a,b,c,d);this.opacity=("-color"==c[Ya](-6)?c[Ya](0,-6):c)+"-opacity";this.Eb|=2048};S(ng,qg);Ha(ng[E],function(){var a=this[jb].J(this),a=this.n.b.ub[M](a);this.je[A](this[Vb],a[fc]());this.je[A](this.opacity,a.Sb[$a](3))});var mh=function(a,b){Kg[L](this,b.a);this.definition=a;this.n=new lh(this)};S(mh,Kg);mh[E].Ic=function(){return this[wb].Ic(this.ia())};mh[E].$d=function(a){a!=this.ia()&&(this.o(256),this.Zb());mh.r.$d[L](this,a)};
var lh=function(a){Lg[L](this,a);this.Ud=[];this.Vd=[];this.jd=[];this.qa=this.yf=this.ff=j};S(lh,Lg);O=lh[E];O.gd=function(a){this.T=[];for(var b=this.b,c=b[wb],d=c[Bb],e=0;e<d[D];e++)if(d[e]){var g=d[e].Ha(c[C],this,b.a);g!=j&&(this.Ud[e]=g,b.a.Rc[t](g))}d=c[yb];for(e=0;e<d[D];e++)d[e]&&(g=d[e].Ha(c[C],this,b.a),g!=j&&(this.Vd[e]=g,b.a.Rc[t](g)));this.qa=this.$h(a);this.ff=n[J]("http://www.w3.org/2000/svg","g");this.Ye=f;this.qg(a);return this.ff};
O.si=function(){var a=this.b[wb];if(!this.yf){var b=n[J]("http://www.w3.org/2000/svg","image");b[A]("width",a.sg);b[A]("height",a.rg);b[A]("x",a.$e);b[A]("y",a.af);b[ob]("http://www.w3.org/1999/xlink","href",a.Te);gf&&b[A]("transform","rotate(360)");this.yf=b}return this.yf};
O.$h=function(){for(var a=this.b[wb],b=a[Oc],c=[],d=0;d<b[D];d++){var e=b[d],g=n[J]("http://www.w3.org/2000/svg","path");this[A](g,"d",e[x],qg);e[Fc]!=j&&(g=a[yb][e[Fc]].dc(this,e,g,this.Vd[e[Fc]],"stroke"));if(e[dc]!=j){var i=a[Bb][e[dc]],g=i.dc(this,e,g,this.Ud[e[dc]],"fill");i.re&&this.T[u](kh(g))}else g[A]("fill","none");c[u](g)}if(1==c[D])g=c[0];else{g=n[J]("http://www.w3.org/2000/svg","g");for(d=0;d<c[D];d++)g[t](c[d])}return g};
O.Ta=function(a){var b=this.b[wb],c;if(0==this.b.ia())c=b.Ta();else{c=new vf;for(var d=0;d<b[Oc][D];d++)if(b[Oc][d][dc]!=j){var e=b[Oc][d][x].J(this);c=c[fb](e)}}b=this.b.fa();return c.qf(b[Ic](a))};O.ia=function(){return this.b.ia()/65535};O.dj=function(a){a[M]();a.Eb&&this.jd[u](a)};O.setAttribute=function(a,b,c,d){d==qg&&c.Mc?a[A](b,c.J(j)[fc]()):this.dj(new d(this,a,b,c))};
O.A=function(){lh.r.A[L](this);for(var a=0;a<this.Ud[D];a++)oe(this.Ud[a]);for(a=0;a<this.Vd[D];a++)oe(this.Vd[a]);this.jd=[]};O.ui=function(a,b){var c=this.b.Ba(),d=c.df(),c=c.ef();return d>=a&&d<=b&&c>=a&&c<=b};O.qg=function(a){var b=this.ff;b&&(a=nh&&0==(a&1)&&0==(a&2)&&this.b[wb].Te!=j&&this.b.ub.$b(rf)&&this.ui(0.2,1),this.Ye!=a&&(b[Gb]&&b[Bc](b[Gb]),a?b[t](this.si()):b[t](this.qa),this.Ye=a))};
O.pa=function(a){var b=this.b.C;lh.r.pa[L](this,a);this.qg(a);for(a=0;a<this.jd[D];a++)b&this.jd[a].Eb&&this.jd[a][M]()};var qh=function(a){mh[L](this,new oh(-1,[],j,[],[]),a);this.clear();this.ld=this.Hc=j;this.n=new ph(this);this.Qa()};S(qh,mh);qh[E].duplicate=function(a){a=new qh(a);a.definition=Gd(this[wb]);return a};qh[E].clear=function(){this[wb].fillstyles=[];this[wb].linestyles=[];this[wb].paths=[];this.ec=this.fc=this.pd=this.qd=0;this.o(512);this.Zb()};qh[E].Fe=function(a){var b=this.Hc,c=this.ld,d;c&&(d=c);b&&b!=c&&(d=b);if(d){b=d[x][jb].H;for(c=0;c<a[D];c++)b[u](a[c]);this.o(512);this.Zb()}};
qh[E].moveTo=function(a,b){P(a)&&P(b)&&(a*=20,b*=20,this.Fe([0,a,b]),this.ec=a,this.fc=b,this.pd=a,this.qd=b)};qh[E].lineTo=function(a,b){P(a)&&P(b)&&(a*=20,b*=20,a==this.ec&&b==this.fc&&!this.ld?this.Fe([3]):this.Fe([1,a,b]),this.pd=a,this.qd=b)};qh[E].curveTo=function(a,b,c,d){P(c)&&P(d)&&(P(a)&&P(b))&&(c*=20,d*=20,this.Fe([2,20*a,20*b,c,d]),this.pd=c,this.qd=d)};
qh[E].sd=function(a,b,c,d){var e=this[wb][Oc],g=e[e[D]-1],a=new rh(new ag(new vf([0,a,b])),d,c);!g||!g[x][jb].ja()?e[u](a):e[e[D]-1]=a;return a};qh[E].Bj=function(a){var b=this.Hc,c=this.ld;if(c){if(c[x][jb].ja()){b=c;b.line=a;this.Hc=b;return}b==c&&(b=this.sd(0,0,c[Fc],f),ma(b,c[x]),delete c[Fc])}this.Hc=b=P(a)?this.sd(this.pd,this.qd,a,f):j};
qh[E].Yf=function(a){var b=this.ld;b&&b[x][jb].H[u](3);var c=this.Hc;!b||!c||c==b?(b=P(a)?this.sd(this.ec,this.fc,f,a):j,c&&(b?(b.line=c[Fc],c=b):c=this.sd(this.ec,this.fc,c[Fc],f))):(b=c[x][jb].H,b[u](1),b[u](this.ec),b[u](this.fc),P(a)?c=b=this.sd(this.ec,this.fc,c[Fc],a):b=j);this.ld=b;this.Hc=c;this.pd=this.ec;this.qd=this.fc;this.o(512)};
qh[E].lineStyle=function(a,b,c,d,e,g,i,l){d=f;if(P(a)){d=this[wb][yb];e={};la(e,[20*a]);na(e,[If(b,c)]);switch(g){case "none":e.cap=zg.NONE;break;case "square":e.cap=zg.ek}switch(i){case "bevel":e.joint=Ag.ck;break;case "miter":e.joint=Ag.dk}P(l)&&(e.miter=[l]);d[u](new Bg(e));d=d[D]-1}this.Bj(d)};qh[E].beginFill=function(a,b){if(P(a)){var c=this[wb][Bb],d={};sa(d,xg.fk);na(d,[If(a,b)]);c[u](new mg(d));this.Yf(c[D]-1)}else this.Yf()};qh[E].endFill=function(){this.Yf()};
var ph=function(a){lh[L](this,a)};S(ph,lh);ph[E].pa=function(a){this.b.C&512&&this.Yd();ph.r.pa[L](this,a)};var th=function(a,b){Kg[L](this,b.a);this.definition=a;this.n=new sh(this)};S(th,Kg);th[E].Ic=function(){return new Eg(this[wb][C])};var sh=function(a){Lg[L](this,a);this.Xc=k;this.b.o(1)};S(sh,Lg);O=sh[E];O.gd=function(){return uh?this.Gj():this.Hj()};O.Hj=function(){var a=this.Mj(),b;if(1==a[D])b=a[0];else{b=n[J]("http://www.w3.org/2000/svg","g");for(var c=0;c<a[D];c++)b[t](a[c])}return b};
O.Mj=function(){for(var a=this.b[wb],b=[],c=0;c<a[xc][D];c++){var d=a[xc][c],e=n[J]("http://www.w3.org/2000/svg","text");e[t](n[hb](d[Va]));var g=this.b.a.oa[d[Na]];g&&e[A]("font-family","'"+g[Vb]+"'");e[A]("font-size",d[Zc]);d[hc]&&e[A]("font-weight","bold");d[kb]&&e[A]("font-style","italic");e[A]("x",d.x[bd](" "));e[A]("y",d.y);e[A]("fill-rule","nonzero");e[A]("style","white-space:pre");e[A]("unicode-bidi","bidi-override");this.Md(e,"fill",d[qb]);b[u](e)}return b};
O.Gj=function(){var a=n[J]("http://www.w3.org/2000/svg","g");a[A]("fill-rule","nonzero");var b=this.b[wb],c=b[C],d=n[J]("http://www.w3.org/2000/svg","rect");d[A]("x",c.e);d[A]("width",c.k-c.e);d[A]("y",c.g);d[A]("height",c.p-c.g);Of(d);a[t](d);for(c=0;c<b[xc][D];c++){var d=b[xc][c],e=this.Gg(d),g=n[J]("http://www.w3.org/2000/svg","path");g[A]("d",e[fc]());a[t](g);this.Md(g,"fill",d[qb])}return a};
O.Ta=function(a){for(var b=this.b[wb][xc],c=new vf,d=0;d<b[D];d++)var e=this.Gg(b[d]),c=c[fb](e);a=this.b[wb][Za][Ic](this.b.fa())[Ic](a);return c.qf(a)};O.Gg=function(a,b){var c=new vf,d=a[Va],e=this.b.a.oa[a[Na]];if(e)for(var g=a[Zc]/e[Tb],i=0;i<d[D];i++){var l=e.ei(d[gb](i));if(l)var r=new mf(g,0,0,g,a.x[i],a.y),r=P(b)?b[Ic](r):r,l=l.z(r),c=c[fb](l)}return c};
O.pa=function(a){var b=this.b;if(b.C&1024){var c=b.Ba(),d=b.a.Oe,e=b.Va().Ia.I();e.z(d);e.z(c);1>e[Ua]()||1>e[Zc]()?this.Xc||(this.Xc=h,b.C|=1):this.Xc&&(this.Xc=k,b.C|=1)}sh.r.pa[L](this,a)};O.bd=function(){return this.Xc?"scale(0)":sh.r.bd[L](this)+" "+this.b[wb][Za][fc]()};var vh={getRGB:{value:function(){return!this.h||!this.h.__swiffy_d?f:this.Yg}},setRGB:{value:function(a){if(this.h){var b=this.h.__swiffy_d;b&&(this.Yg=a,a=new qf(0,(a&16711680)>>16,0,(a&65280)>>8,0,a&255,1,0),b.vb(a),b.Qa())}}},setTransform:{value:function(a){if(this.h&&a){var b=this.h.__swiffy_d;if(b){var c=b.a.s(),d=c.d(a,"ra"),e=c.d(a,"rb"),g=c.d(a,"ga"),i=c.d(a,"gb"),l=c.d(a,"ba"),r=c.d(a,"bb"),v=c.d(a,"aa"),c=c.d(a,"ab"),G=b.Oa,a=new qf(P(a[d])?a[d]/100:G.ma,P(a[e])?a[e]:G.ua,P(a[g])?a[g]/100:
G.la,P(a[i])?a[i]:G.ta,P(a[l])?a[l]/100:G.ka,P(a[r])?a[r]:G.sa,P(a[v])?a[v]/100:G.ca,P(a[c])?a[c]:G.wa);b.vb(a);b.Qa()}}}},getTransform:{value:function(){if(this.h){var a=this.h.__swiffy_d;if(a)return a=a.Oa,{ra:100*a.ma,rb:a.ua,ga:100*a.la,gb:a.ta,ba:100*a.ka,bb:a.sa,aa:100*a.ca,ab:a.wa}}}}};var xh=function(a,b){this.c=a;Xg[L](this,b);this.Mg=[];this.Y=-1;this.Ng=this.Zd=k;this.Hh=[];this.Zc={};this.n=new wh(this);this.wc=j;this.a.di(this);this.sc=2097023};S(xh,Xg);O=xh[E];O.ha=function(){xh.r.ha[L](this);for(var a=this.c[Yb],b=0;b<a[D];b++)for(var c=0;a[b]&&c<a[b][D];++c)a[b][c].Eg(this);this[Mc](524288,h);this.Dg()[M](this.h);!this.tc&&this.a.M!==this&&this[Mc](128);this.tc&&this.Nd(128)};Fa(O,function(){this.Ng||(this.Ng=h,this[Kb](),this.oh(k),this.tc&&this[Mc](128))});O.uh=function(){return this};
O.Bb=function(){this.hg||(this.t.Bb(),this[Mc](32));xh.r.Bb[L](this)};O.play=function(){this.Zd=h};O.pf=function(){this.t.bj();this.Zd?this.oh(h):this[Mc](64)};O.oh=function(a){var b=this.Y+1;b>=this.c[yc]&&(b=0);(0!=this.c[yc]||this.a.M!=this)&&this.le(b,a)};ya(O,function(){this.Zd=k});O.yc=function(a,b){0<=a&&(a>=this.c[yc]&&(a=this.c[yc]-1),this.le(a),this.Zd=b)};O.od=function(a){var b=f;"string"==typeof a&&this.c.fe[a]!=f?b=this.c.fe[a]:(a=q(a)-1,0<=a&&a==p[eb](a)&&(b=a));return b};O.qi=function(a){return this.c[Yb][a]};
O.le=function(a,b){if(a==this.Y)b&&this[Mc](64);else if(a>this.Y){for(;a>++this.Y;){this.Og(this.Y);var c=this.c[Yb][this.Y];if(c)for(var d=0;d<c[D];d++)c[d].pb(this)}b&&this[Mc](64);this.Og(this.Y);if(c=this.c[Yb][this.Y])for(d=0;d<c[D];d++)c[d].pb(this),c[d].de(this)}else{this.Y=a;b&&this[Mc](64);var c=this.c.og[this.Y],e=[];if(c)for(d=0;d<c[D];d++)e[u](c[d].Ac(this)),c[d].de(this);var g=this;this.t.bi(function(a){if(0<=a[B]||0<=e[y](a))return h;g.o(16);a.Bb();return k});this.C&16&&this.t.Ag(this.h)}c=
this.Hh[this.Y];R(c)&&c()};O.Og=function(a){if(!this.Mg[a]){for(var b=this.c.cc[a],c=0;b&&c<b[D];c++)b[c].ne(this);this.Mg[a]=h}};O.zh=function(){0<this.Y&&this.le(this.Y-1);this[ec]()};O.He=function(){this.Y+1<this.c[yc]&&this.le(this.Y+1);this[ec]()};O.s=function(){return this.a.s()};O.zc=function(){return this.a.zc()};O.Lf=function(a,b){this.h[a]=b};O.setCapture=function(a,b,c){this.a[ab](a,b,c)};O.releaseCapture=function(a){this.a[ac](a)};
O.duplicate=function(a,b,c){var d=new xh(this.c,this.a);d.tc=h;d.hb(b);d[vb](this.fa());this.wc&&(d.wc=this.wc.duplicate(d),d.Tb(d.wc,-16385));d.ha();d[Gc]();a.rc(c);a.Tb(d,c);d.vb(this.Oa);return d};O.Dg=function(){var a=f;this.c.id&&(a=Sf[this.a.bg[this.c.id]]);return a?a:X};O.Td=function(){return m[kc](this.Dg()[E])};O.jc=function(a,b){var c=this.wc;c||(this.wc=c=new qh(this),this.Tb(c,-16385));c[a][M](c,b)};
O.Z=function(a){if(a!=this.Sa){var b;switch(a){case 1:b="_up";break;case 4:b="_down";break;case 2:b="_over"}var c=this.c.fe;P(b)&&P(c[b])&&(this.yc(c[b],k),this.a.kc=h)}xh.r.Z[L](this,a)};var wh=function(a){Wg[L](this,a)};S(wh,Zg);wh[E].gd=function(){return this.b.t.n.vf()};wh[E].he=function(){return this.Yb()};var yh=function(){this.Bh=[];this.Cd=[]};yh[E].Ci=function(a,b){this.Bh[a]=b};yh[E].Lg=function(a){this.Cd[a]=new Audio(this.Bh[a]);this.Cd[a][Kb]()};yh[E].pj=function(){for(var a=0;a<this.Cd[D];a++)P(this.Cd[a])&&this.Cd[a].pause()};var zh=function(a,b,c,d){this.Ff=a;this.url=b;Da(this,""==c?"_self":c);this.method=d};
zh[E].zj=function(){if(0!=this[Dc][y]("_level")&&""!=this.url)if(this.url.match(/^fscommand:/i))this.Cj();else switch(this[Pb]){case 0:ba.open(this.url,this[Dc]);break;case 1:case 2:var a=me("form");a.acceptCharset="utf-8";a.method=1==this[Pb]?"get":"post";for(var b in this.Ff)if("$"!=b[gb](0)){var c=me("input",{type:"hidden",name:b,value:this.Ff[b]});a[t](c)}a.action=this.url;Da(a,this[Dc]);a[K].visibility="hidden";n[Ac][t](a);a.submit();oe(a);break;default:ba.open(this.url,this[Dc])}};
zh[E].Cj=function(){var a=this.Ff.__swiffy_d;if(a&&(a=a.a[zb]())){var a=a+"_DoFSCommand",b=this.url[cc](10),c=this[Dc];if(ba[a])ba[a](b,c)}};var uh=!Ud,Mg="undefined"!=eval("typeof SVGFilterElement"),nh=Vd,Eh=function(a,b){this.Ob=a;this.kc=k;this.Uc=new lf(0,0);this.oa=[];this.code=[];this.P=n[J]("http://www.w3.org/1999/xhtml","div");this.P[K].position="relative";Ka(this.P[K],"100%");b.backgroundColor!=f&&(this.P[K].background=Gf(b.backgroundColor)[fc]());this.P[K].webkitTapHighlightColor="rgba(0,0,0,0)";this.Qh=new yh;this.Hd=b.frameSize.xmax/20;this.Gd=b.frameSize.ymax/20;this.Oh=b.v;this.Gh=b.fileSize;this.qa=n[J]("http://www.w3.org/2000/svg",
"svg");this.qa[K].fillRule="evenodd";this.qa[K].pointerEvents="none";this.qa[K].MozUserSelect="none";this.qa[K].webkitUserSelect="none";this.qa[K].$j="none";la(this.qa[K],"100%");Ka(this.qa[K],"100%");this.P[t](this.qa);this.Qe=n[J]("http://www.w3.org/2000/svg","g");this.qa[t](this.Qe);this.Ab="showAll";this.Qb=0;this.Ld=h;this.fg=new Ah(b.frameRate,this);this.Yc=[];this.fb=new Y(this);var c=new Bh(0,b[yc],this);this.oa[0]=c;Ch(b,c);this.da=b.version;this.zb=[];this.M=new xh(c,this);ra(this.M,-16384);
this.M.gg=k;this.M.Ih(524288);this.M[Kb]();this.ob=j;this.Re=k;this.Sd=j;this.$f={};this.bg={};this.lb=new Zf(this);this.fb.Id(this.lb);this.qc=new Xf;this.fb.Id(this.qc);this.Qd=new Dh(this);this.fb.Id(this.Qd);this.Sh=1;this.Ja=j;this.va=[];"createTouch"in n?(T(this.P,"touchstart",this.Me,k,this),T(this.P,"touchmove",this.Le,k,this),T(this.P,"touchend",this.Ke,k,this),c=T(n,"touchstart",this.Rh,k,this)):(T(this.P,"mousedown",this.ig,h,this),T(this.P,"mouseup",this.lg,h,this),T(this.P,"mousemove",
this.jg,h,this),T(this.P,"mouseover",this.Mh,h,this),T(this.P,"mousedown",this.Jd,k,this),T(this.P,"mouseup",this.Fd,k,this),T(this.P,"mouseout",this.Je,k,this),c=T(n,"mousedown",this.Lh,k,this),this.va[u](c),c=T(n,"mouseup",this.Nh,k,this));this.va[u](c);T(n,"keyup",this.Kh,k,this);T(new Ne(n),"key",this.Jh,k,this);this.M.ha();this.Rc=n[J]("http://www.w3.org/2000/svg","defs");for(c=this.Se=0;c<this.oa[D];c++)if(P(this.oa[c])){var d=this.oa[c].ha(this);d&&this.Rc[t](d)}this.Yc[u](function(){});this.kg();
this.qa[t](this.Rc);c=ba.location.search+ba.location.hash;d=c[y]("?");0<=d&&this.mg(c[Ya](d+1));this.eg();this.Ob[t](this.P);this.cg=k;this.Rb=[];this.Ph()},Fh=["swiffy","Stage"],Gh=gd;!(Fh[0]in Gh)&&Gh.execScript&&Gh.execScript("var "+Fh[0]);for(var Hh;Fh[D]&&(Hh=Fh[Sa]());)!Fh[D]&&P(Eh)?Gh[Hh]=Eh:Gh=Gh[Hh]?Gh[Hh]:Gh[Hh]={};O=Eh[E];O.Pi=function(){this.Se++};O.lh=function(){this.Se--;this.kg()};O.Ah=function(){return 0==this.Se};O.Ej=function(a){this.Ah()?a():this.Yc[u](a)};
O.kg=function(){if(this.Ah()){for(var a=0;a<this.Yc[D];a++)(0,this.Yc[a])();this.Yc=[]}};O.Oj=function(){this.fg[ec]();for(var a=0;a<this.va[D];a++)Fe(this.va[a]);this.M.A();this.M.n.A();var a=this.P,b=f,c=0,d=b==j,b=!!b;if(a==j){var a=function(a){for(var e=a[D]-1;0<=e;e--){var g=a[e];if(d||b==g[sb])Fe(g.key),c++}},e;for(e in Be)a[L](f,Be[e],e,Be)}else if(e=md(a),Be[e]){e=Be[e];for(a=e[D]-1;0<=a;a--){var g=e[a];if(d||b==g[sb])Fe(g.key),c++}}oe(this.P)};Eh[E].destroy=Eh[E].Oj;O=Eh[E];
O.xd=function(a){for(var b=this.zb[D]-1;0<=b;b--)this.zb[b].wb||this.zb[b][Mc](a)};O.Xi=function(a){this.M.map(function(b){if(b instanceof Qg)return b[Mc](a)})};O.ig=function(){this.xd(8);this.U();this.lb.Vi();this.Ra()};O.jg=function(a){this.we(a);this.xd(16);this.U();this.lb.Si();this.Ra()};O.Mh=function(a){this.we(a)};O.lg=function(){this.xd(4);this.U();this.lb.Wi();this.Ra()};O.Me=function(a){this.Ja!=j&&this.Ja.qe(a);var b=a.qb.touches;1==b[D]&&this.we(b[0]);this.ig(a)};
O.Rh=function(a){this.Ja!=j&&this.Ja.qe(a)};O.Le=function(a){var b=a.qb.touches;1==b[D]&&this.we(b[0]);this.jg(a)};O.Ke=function(a){a[uc]();this.lg(a)};O.Jd=function(a){a[uc]();this[ab](this)};O.Fd=function(a){a[uc]();this[ac](this)};O.Lh=function(){this[ab](this,h)};O.Nh=function(){this[ac](this)};O.Je=function(a){this[cd]()&&a[Dc]==this.P&&this[ab](this)};
O.we=function(a){if(this.bh){var b=0,c=0;if(a.pageX||a.pageY)b=a.pageX,c=a.pageY;else if(a[$b]||a[bc])b=a[$b]+n[Ac].scrollLeft+n.documentElement.scrollLeft,c=a[bc]+n[Ac].scrollTop+n.documentElement.scrollTop;this.Uc.x=b;this.Uc.y=c;this.Uc.z(this.bh)}};O.Kh=function(a){this.qc.Yi(a);this.xd(1);this.U();this.qc.broadcastMessage("onKeyUp");this.Ra()};O.Jh=function(a){this.qc.Ui(a);this.xd(2);this.U();this.qc.broadcastMessage("onKeyDown");this.Xi(1048576);this.U();this.Ra()};O.getKey=function(){return this.qc};
O.Ii=function(){return this.Ja!=j};O.ii=function(a){this.Ja!=j&&this.Ja!=a&&this.Ja.qe();this.Ja=a;this.lb[Yc]()};O.rf=function(a){this.Ja==a&&(this.Ja=j);this.lb[Yc]()};O.isCaptured=function(){return this.ob!=j};O.be=function(){return this.ob!=j&&this.Re};O.ed=function(a){return this.ob==a};O.Hi=function(){return this.ob!=j&&this.ob==this.Ja};O.setCapture=function(a,b,c){this[ac](a);this.ob=a;b&&(this.Re=h);c&&(this.Sd=c,this.lb[Yc]())};
O.releaseCapture=function(a){this.ob&&(this.lb[Yc](),this.ob!=a&&this.Sd&&this.Sd(),this.ob=this.Sd=j,this.Re=k)};Fa(O,function(){var a=this.fg;this.Ej(function(){a[Gc]()})});Fa(Eh[E],Eh[E][Gc]);O=Eh[E];O.Ve=function(a,b){var c=this.oa[a];return c?c.qj(b):j};O.K=function(a){return(a=this.oa[a])?a.K:k};O.di=function(a){this.zb[u](a)};
O.pf=function(){this.zb=this.zb[Ma](function(a){return!a.wb});for(var a=this.zb[D]-1;0<=a;--a)this.zb[a].pf();this.cg||(this.M.h.$version=this.ti(),this.U(),this.M.Nd(128),this.M[Mc](128),this.cg=h);this.U();this.Ra();this.kc=h};O.s=function(){return this.fb};O.U=function(){this.fb.U()};O.Ra=function(){for(var a=0;a<this.Rb[D];++a)this.Rb[a].zj();this.Rb=[]};O.Ug=function(a){for(var b=0;b<this.Rb[D];++b)if(this.Rb[b][Dc]==a[Dc]){this.Rb[b]=a;return}this.Rb[u](a)};O.zc=function(){return this.Qh};
O.mg=function(a){for(var a=new bf(a),b=a.hc(),c=0;c<b[D];c++){var d=b[c];this.M.Lf(d,a.get(d))}};Eh[E].setFlashVars=Eh[E].mg;O=Eh[E];O.vg=function(){return"instance"+this.Sh++};O.ti=function(){return"Swiffy "+this.Oh};O.fj=function(a){this.Ab!=a&&(this.Ab=a,this.Ld=h,"noScale"==this.Ab&&(a=this.se!=this.Gd,(this.te!=this.Hd||a)&&this.Qd.broadcastMessage("onResize")))};O.ej=function(a){this.Qb!=a&&(this.Qb=a,this.Ld=h)};O.Li=function(){return this.Qb&1?0:this.Qb&4?2:1};
O.Mi=function(){return this.Qb&2?0:this.Qb&8?2:1};O.eg=function(){var a=this.Ob.offsetWidth,b=this.Ob.offsetHeight,c,d=this.Ob,e=c=0;if(d.offsetParent){do c+=d.offsetLeft,e+=d.offsetTop;while(d=d.offsetParent)}c=[c,e];d=c[0];c=c[1];e=k;if(this.sf!=d||this.tf!=c)this.sf=d,this.tf=c,e=h;if(this.te!=a||this.se!=b)this.te=a,this.se=b,"noScale"==this.Ab&&this.Qd.broadcastMessage("onResize"),e=h;return e};
O.yi=function(){var a=this.te,b=this.se,c=this.Hd,d=this.Gd,e=a/c,g=b/d;switch(this.Ab){case "noScale":e=g=1;break;case "showAll":e<g?g=e:e=g;break;case "noBorder":e>g?g=e:e=g}var i=0,l=0;switch(this.Li()){case 1:i=(a-c*e)/2;break;case 2:i=a-c*e}switch(this.Mi()){case 1:l=(b-d*g)/2;break;case 2:l=b-d*g}this.Oe=new mf(e/20,0,0,g/20,this.sf+i,this.tf+l);this.bh=this.Oe.cf()};
O.jb=function(){var a=this.eg();if(this.Ld||a)this.yi(),a=this.Oe[Qb](-this.sf,-this.tf),this.Qe[A]("transform",a[fc]()),this.Ld=k;this.kc&&(this.M.Pg(),this.M.n.jb(0),a=this.M.n.Yb(),a[Xc]||this.Qe[t](a),this.kc=k)};O.getName=function(){return this.Ob.id};
O.Ph=function(){var a=this;this.Ob.SetVariable=function(b,c){var d=a.fb.xc(s(b),a.M.h);if(d[Nb]){var e=a.fb.Ya(d[Nb],d.Ub);d[Nb][e]=s(c)}};this.Ob.GetVariable=function(b){b=a.fb.xc(s(b),a.M.h);if(b[Nb]){var c=a.fb.d(b[Nb],b.Ub);return c in b[Nb]?s(b[Nb][c]):j}return j}};var Ih=function(){};Ih[E].Xb=function(a){return new Jh(a,this)};var Kh=[];Ih[E].Ge=function(){return new tf(0,0,0,0)};var Mh=function(a,b,c,d){var e=new tf,c=Lh(b,c),b=Lh(b,d);e[Wa](3*-c,3*-b);e[Wa](3*+c,3*+b);a.add(e)},Nh=function(a,b,c){a[Wa](20*p.cos(b)*c,20*p.sin(b)*c)};Ih[E].Ig=function(){return 1};var Lh=function(a,b){var c=1;switch(a){case 1:c=5;break;case 2:c=3;break;case 3:c=2}return p.abs(20*b/c)},Jh=function(a,b){this.n=a;this.filter=b;this.Gi=Ue.Ca().Pa();this.T=[];this.ce=[]},Oh,Ph;
O=Jh[E];Ha(O,function(){});O.result=function(){return this.Gi};O.kh=function(a,b,c,d,e){var g=n[J]("http://www.w3.org/2000/svg","feGaussianBlur");P(d)&&g[A]("in",d);P(e)&&g[A]("result",e);d=function(d){var e=new lf(b,c);e.z(d);g[A]("stdDeviation",Lh(a,e.x)+" "+Lh(a,e.y))};d(this.of());this.ce[u](d);this.Ea()[t](g)};
O.ad=function(a,b,c,d,e,g,i){var l=n[J]("http://www.w3.org/2000/svg","feComponentTransfer");P(g)&&l[A]("in",g);P(i)&&l[A]("result",i);P(e)||(e="linear");g=["feFuncR","feFuncG","feFuncB","feFuncA"];a=[a,b,c,d];for(b=0;4>b;++b){var c=j,r;for(r in a[b])c==j&&(c=n[J]("http://www.w3.org/2000/svg",g[b]),c[A]("type",e)),c[A](r,a[b][r]);c&&l[t](c)}this.Ea()[t](l);return l};
O.Af=function(a,b,c){var d=this.ad({intercept:0},{intercept:0},{intercept:0},{slope:0},f,f,c),e=this;this.T[u](function(){for(var c=e.n.Gf(a),i=0;i<d[Rb][D];++i){var l=d[Rb][i];switch(l.localName){case "feFuncR":l[A]("intercept",Jf(c.Dc/255));break;case "feFuncG":l[A]("intercept",Jf(c.Cc/255));break;case "feFuncB":l[A]("intercept",Jf(c.Bc/255));break;case "feFuncA":l[A]("slope",c.Sb*b)}}})};O.wg=function(a,b){var c=Oh;c||(Oh=c={tableValues:Lf(Kf)});this.ad(c,c,c,j,"discrete",a,b)};
O.xg=function(a,b){var c=Ph;c||(Ph=c={tableValues:Lf(Jf)});this.ad(c,c,c,j,"discrete",a,b)};O.za=function(a,b,c,d,e){var g=n[J]("http://www.w3.org/2000/svg","feComposite");P(e)&&g[A]("result",e);P(b)&&g[A]("in",b);P(c)&&g[A]("in2",c);g[A]("operator",a);if(P(d))for(var i in d)g[A](i,d[i]);this.Ea()[t](g)};O.xi=function(a){var b=n[J]("http://www.w3.org/2000/svg","feFlood");P(a)&&b[A]("result",a);this.Ea()[t](b)};
O.sj=function(a,b,c,d){var e=20*p.cos(a)*b,g=20*p.sin(a)*b,i=n[J]("http://www.w3.org/2000/svg","feOffset");P(c)&&i[A]("in",c);P(d)&&i[A]("result",d);a=function(a){var b=new lf(e,g);b.z(a);i[A]("dx",b.x);i[A]("dy",b.y)};a(this.of());this.ce[u](a);this.Ea()[t](i)};O.Bf=function(a,b,c,d,e,g,i){if(0<c||0<d)this.kh(b,c,d,a),a=f;0!=g&&(this.sj(e,g,a),a=f);this.ad({slope:0},{slope:0},{slope:0},{},"linear",a,i)};O.Za=function(){return Ue.Ca().Pa()};O.Ea=function(){return this.n.Ea()};
O.jf=function(){for(var a=this.T,b=0;b<a[D];++b)a[b][L](this)};O.of=function(){var a=this.n.b[Qa]();return a?a.Mb().Pe(0,0):nf};O.jb=function(){if(this.n.b.C&1024)for(var a=this.of(),b=0;b<this.ce[D];++b)this.ce[b](a)};var Qh=function(a){this.tb=a[Za];this.tb[4]/=255;this.tb[9]/=255;this.tb[14]/=255;this.tb[19]/=255};S(Qh,Ih);Kh[3]=Qh;Qh[E].Xb=function(a){return new Rh(a,this)};var Rh=function(a,b){Jh[L](this,a,b)};S(Rh,Jh);Ha(Rh[E],function(a){var b=this.Za(),c=this.Za();this.wg(a,b);var a=this.Ea(),d=n[J]("http://www.w3.org/2000/svg","feColorMatrix");d[A]("in",b);d[A]("result",c);d[A]("type","matrix");d[A]("values",this[Ma].tb[bd](" "));a[t](d);this.xg(c,this[mc]())});var Sh=function(a){this.c=a};S(Sh,Ih);Kh[2]=Sh;Sh[E].Xb=function(a){return new Th(a,this)};Sh[E].Ig=function(){return 1<this.c.x&&1<this.c.y?2:1};Sh[E].Ge=function(){var a=this.c,b=new tf(0,0,0,0);Mh(b,a[ed],a.x,a.y);return b};var Th=function(a,b){Jh[L](this,a,b)};S(Th,Jh);Ha(Th[E],function(a){var b=this[Ma].c;this.kh(b[ed],b.x,b.y,a,this[mc]())});var Uh=function(a){this.c=a};S(Uh,Ih);Kh[1]=Uh;Uh[E].Xb=function(a){return new Vh(a,this)};Uh[E].Ge=function(){var a=this.c,b=new tf(0,0,0,0);Nh(b,a[qc],a[Sc]);Mh(b,a[ed],a.x,a.y);return b};var Vh=function(a,b){Jh[L](this,a,b)};S(Vh,Jh);
Ha(Vh[E],function(a){this.T=[];var b=this[Ma].c,c=this.Ea();b[oc]&&this.xi("black");this.Bf(a,b[ed],b.x,b.y,b[qc],b[Sc]);b[oc]&&this.za("arithmetic",f,"black",{k2:-1,k3:1});var d=this.Za();this.Af(b[qb],b.strength,d);!b[oc]&&!b[xb]&&!b.hideObject?this.za("over",a,d):b[oc]&&!b[xb]&&!b.hideObject?this.za("atop",d,a):!b[oc]&&b[xb]?this.za("out",d,a):b[oc]&&this.za("in",d,a);c.lastChild[A]("result",this[mc]())});var Wh=function(a){this.c=a};S(Wh,Ih);Kh[4]=Wh;Wh[E].Xb=function(a){return new Xh(a,this)};Wh[E].Ge=function(){var a=this.c,b=new tf(0,0,0,0);Nh(b,a[qc],-a[Sc]);Nh(b,a[qc],a[Sc]);Mh(b,a[ed],a.x,a.y);return b};var Xh=function(a,b){Jh[L](this,a,b)};S(Xh,Jh);
Ha(Xh[E],function(a){this.T=[];var b=this[Ma].c,c=this.Ea(),d=this.Za(),e=this.Za(),g=this.Za(),i=this.Za(),l=this.Za();this.Bf(a,b[ed],b.x,b.y,b[qc],-b[Sc],e);this.Bf(a,b[ed],b.x,b.y,b[qc],b[Sc],d);this.za("arithmetic",e,d,{k2:1,k3:-1});this.Af(b.highlight,b.strength,i);this.za("arithmetic",d,e,{k2:1,k3:-1});this.Af(b.shadow,b.strength,g);this.za("arithmetic",i,g,{k2:1,k3:1},l);b[xb]?b[oc]?this.za("in",l,a):b.onTop||this.za("out",l,a):b[oc]?this.za("atop",l,a):b.onTop?this.za("over",l,a):this.za("over",
a,l);c.lastChild[A]("result",this[mc]())});var Og=function(){};S(Og,Ih);Og[E].Xb=function(a){return new Yh(a,this)};var Yh=function(a,b){Jh[L](this,a,b)};S(Yh,Jh);Ha(Yh[E],function(a){this.Ij(a)});
Yh[E].Ij=function(a){var b=this.Za(),c=this.Za();this.wg(a,b);var d=this.ad({intercept:0},{intercept:0},{intercept:0},{slope:0},"linear",b,c);this.xg(c);var e=this;this.T[u](function(){for(var a=e.n.b.Ed,b=0;b<d[Rb][D];++b){var c=d[Rb][b];switch(c.localName){case "feFuncR":c[A]("slope",a.ma);c[A]("intercept",a.ua/255);break;case "feFuncG":c[A]("slope",a.la);c[A]("intercept",a.ta/255);break;case "feFuncB":c[A]("slope",a.ka);c[A]("intercept",a.sa/255);break;case "feFuncA":c[A]("slope",a.ca),c[A]("intercept",
a.wa/255)}}})};var Zh=function(){};Zh[E].Jb=function(){};var $h=[];var ai=function(a){this.id=a};S(ai,Zh);O=ai[E];O.K=k;O.ha=function(){return j};O.Qc=function(){return j};O.qj=function(a){return this.Qc(a)};O.Jb=function(a){a.a.oa[this.id]=this};var bi=function(){};S(bi,Zh);O=bi[E];O.Eg=function(){};O.Ac=function(){};O.ne=function(){};O.pb=function(){};O.de=function(){};O.Xf=function(){};O.Pc=function(){};var di=function(a,b){for(var c=0;c<a[D];++c)if(a[c]instanceof ci&&a[c][B]==b)return c;return-1};bi[E].Jb=function(a,b){a[Yb][b]||(a[Yb][b]=[]);a[Yb][b][u](this)};var ei=function(a,b,c,d,e,g,i){this.id=a;ra(this,b);this.transform=c;this.states=d;this.Bg=e;Ia(this,g);qa(this,i)},fi=function(a,b,c){Ba(this,a);this.key=b;this.events=c},gi=function(a,b){this.events=a;this.sound=b},hi=function(a,b,c,d,e){this.id=a;this.trackAsMenu=b;this.records=c;Ba(this,d);this.sounds=e};S(hi,ai);
$h[10]=function(a,b){for(var c=[],d=0;a[xc]&&d<a[xc][D];d++){var e=a[xc][d],g=e[N]?Bf(e[N]):j,i=e[Lc]?Ff(e[Lc]):j,l=f;if(e[Tc])for(var l=[],r=0;r<e[Tc][D];r++)l[u](new Kh[e[Tc][r][Ob]](e[Tc][r]));c[u](new ei(e.id,e[B],g,e[Jb],i,l,e[Fb]))}e=[];for(d=0;a[H]&&d<a[H][D];d++)g=a[H][d],e[u](new fi(b.s().cb(g[H]),g.key,g[cb]));g=[];for(d=0;a[Db]&&d<a[Db][D];d++)i=a[Db][d],g[u](new gi(i[cb],i[Hb]));return new hi(a.id,a[Pc],c,e,g)};
hi[E].Qc=function(a){for(var a=new ah(this,a),b=0;b<this[H][D];b++){var c=this[H][b];a.Tg(c[cb],c.key,c[H])}for(b=0;b<this[Db][D];b++)c=this[Db][b],a.Fj(c[cb],c[Hb]);return a};hi[E].K=h;var ii=function(a,b,c,d){this.id=a;this.font=b;Ka(this,c);na(this,P(d)?d:4278190080)};S(ii,ai);$h[13]=function(a,b){var c=new ii(a.id,a[Na],a[Zc],a[qb]);c.text=a[Va];c.align=a.align;va(c,uf(a[C]));c.bold=!!a[hc];c.italic=!!a[kb];c.html=!!a.html;c.wrap=!!a.wrap;c.multiline=!!a.multiline;c.indent=a[Oa];c.leading=a[db];c.leftMargin=a[ad];c.rightMargin=a.rightMargin;c.border=!!a.border;c.variable=a[pc];c.K=6<=b.da;return c};ii[E].Qc=function(a){return new Jg(this,a)};ii[E].K=h;var ji=function(a,b,c){ma(this,a);this.unicode=b;this.advance=c},fh=function(a,b,c,d,e,g,i,l){this.id=a;ta(this,b);this.glyphs=c;this.emSquareSize=d;this.ascent=e;this.descent=g;this.bold=i;this.italic=l;Ca(this,(e+g)/d);this.Zf={};for(a=0;a<c[D];a++)this.Zf[c[a].unicode]=c[a]};S(fh,ai);$h[5]=function(a){for(var b=a[Tb]?a[Tb]:1024,c=[],d=0;a[wc]&&d<a[wc][D];d++)c[u](new ji(zf(a[wc][d][x]),a[wc][d].unicode,a[wc][d].advance));return new fh(a.id,a[Vb],c,b,a.ascent,a.descent,a[hc],a[kb])};fh[E].Yb=function(){return this.Nc};
fh[E].ei=function(a){return this.Zf[a]?this.Zf[a][x]:j};
fh[E].ha=function(){if(uh)return j;var a=n[J]("http://www.w3.org/2000/svg","font");this[Vb]||ta(this,Ue.Ca().Pa());var b=n[J]("http://www.w3.org/2000/svg","font-face");b[A]("font-family","'"+this[Vb]+"'");b[A]("units-per-em",this[Tb]);b[A]("ascent",this.ascent);b[A]("descent",this.descent);b[A]("font-weight",this[hc]?"bold":"normal");b[A]("font-style",this[kb]?"italic":"normal");if(this[Vb]&&!this[wc][D]){var a=n[J]("http://www.w3.org/2000/svg","font-face-src"),c=n[J]("http://www.w3.org/2000/svg",
"font-face-name");c[A]("name",this[Vb]);a[t](c);b[t](a);this.Nc=b}else{a[A]("horiz-adv-x",this[Tb]);a[t](b);for(b=0;b<this[wc][D];b++){var c=this[wc][b],d=n[J]("http://www.w3.org/2000/svg","glyph");d[A]("unicode",c.unicode);var e=c[x].qf(of);d[A]("d",e||"M 0 0");c.advance&&d[A]("horiz-adv-x",c.advance);a[t](d)}this.Nc=a}return this.Nc};var ki=function(a,b,c,d,e){this.id=a;ma(this,b);this.mask=c;la(this,d);Ka(this,e);this.kb=j};S(ki,ai);$h[8]=function(a){return new ki(a.id,a[x],a.mask,a[Ua],a[Zc])};ki[E].Yb=function(){return this.Nc};ki[E].ha=function(a){var b=this.Oi(this[x]);this.Nc=b;gf&&b[A]("transform","rotate(360)");a.Pi();this.mask?this.Qi(b,a):(this.kb=new Image,ka(this.kb,function(){a.lh()}),this.kb.src=this[x]);b.id=this.Xg=Ue.Ca().Pa();return this.Nc};
ki[E].Qi=function(a,b){var c=this[Ua],d=this[Zc],e=n[Cb]("canvas");la(e,this[Ua]);Ka(e,this[Zc]);var g=new Image,i=new Image,l=k,r=k,v=this,G=function(){if(l&&r){var F=e.getContext("2d");F.clearRect(0,0,c,d);F.drawImage(g,0,0,c,d);F.globalCompositeOperation="destination-in";F.drawImage(i,0,0,c,d);F=e.toDataURL("image/png");a[ob]("http://www.w3.org/1999/xlink","href",F);v.kb=new Image;ka(v.kb,function(){b.lh()});v.kb.src=F}};ka(g,function(){l=h;G()});ka(i,function(){r=h;G()});g.src=this[x];i.src=this.mask};
ki[E].Oi=function(a){var b=n[J]("http://www.w3.org/2000/svg","image");b[A]("width",this[Ua]);b[A]("height",this[Zc]);b[ob]("http://www.w3.org/1999/xlink","href",a);return b};var oh=function(a,b,c,d,e){this.id=a;this.paths=b;va(this,c);this.fillstyles=d;this.linestyles=e;this.Te=j;this.af=this.$e=this.rg=this.sg=0};S(oh,ai);oh[E].ci=function(){if(!this[C]||1<this[C][D])return k;for(var a=0,b=0;b<this[Oc][D];b++){var c=this[Oc][b],d=c[x].J($f).H,e=c[dc]!=j?this[Bb][c[dc]]:j;if(e instanceof ug)return k;a+=d[D]*(!!e+2*!(c[Fc]==j||!this[yb][c[Fc]]))}return 100<a};
oh[E].ha=function(a){if(!nh||!this.ci())return j;if(this[C]&&1==this[C][D]){var b=n[Cb]("canvas"),c=this[C][0],d=p[bb](c.k/20)+1,e=p[bb](c.p/20)+1,g=p[eb](c.e/20)-1,c=p[eb](c.g/20)-1;this.sg=20*(d-g);this.rg=20*(e-c);this.$e=20*g;this.af=20*c;la(b,d-g);Ka(b,e-c);d=b.getContext("2d");d.save();d[N](0.05,0,0,0.05,0,0);d[Qb](-this.$e,-this.af);for(e=0;e<this[Oc][D];e++){var i=this[Oc][e],g=i[x].J($f).H,c=i[Fc]!=j?this[yb][i[Fc]]:j,i=i[dc]!=j?this[Bb][i[dc]]:j;d.beginPath();for(var l=0;l<g[D];)switch(g[l++]){case 0:d.moveTo(g[l++],
g[l++]);break;case 2:d.quadraticCurveTo(g[l++],g[l++],g[l++],g[l++]);break;case 1:d.lineTo(g[l++],g[l++]);break;case 3:d.closePath()}if(i){d.save();if(!i.Cb(d,$f,a))return j;d.restore()}if(c&&!c.Cb(d,$f,a))return j}a=b.toDataURL("image/png");"data:image/png"==a[cc](0,14)&&(this.Te=a)}};$h[1]=function(a){var b=a[Bb]?a[Bb].map(yg):[],c=a[yb]?a[yb].map(Cg):[];return new oh(a.id,a[Oc].map(li),a[C].map(uf),b,c)};oh[E].Qc=function(a){return new mh(this,a)};
oh[E].Ta=function(){if(!this.$a){this.$a=new vf;for(var a=0;a<this[Oc][D];a++)if(this[Oc][a][dc]!=j){var b=this[Oc][a][x].J($f);this.$a=this.$a[fb](b)}}return this.$a};
oh[E].Ic=function(a){if(this[C]){if(1==this[C][D])return new Eg(this[C][0]);var b=a/65535,b=new tf(Nf(this[C][0].e,this[C][1].e,b),Nf(this[C][0].g,this[C][1].g,b),Nf(this[C][0].k,this[C][1].k,b),Nf(this[C][0].p,this[C][1].p,b));return new Eg(b,this[C][0])}for(var b={ia:function(){return a/65535}},c=new tf,d=this[Oc],e=0;e<d[D];++e){var g=d[e][x].J(b).H,i=0;d[e][Fc]!=j&&(i=this[yb][d[e][Fc]][Ua].J(b)/2);for(var l=0,r=0,v=0;l<g[D];)switch(g[l++]){case 0:r=g[l++];v=g[l++];break;case 1:c.Ec(r,v,i);r=
g[l++];v=g[l++];c.Ec(r,v,i);break;case 2:var G=g[l++],F=g[l++],I=g[l++],ua=g[l++],Ja=(G-r)/(2*G-r-I),Mb=(F-v)/(2*F-v-ua);0<Mb&&1>Mb&&c.Ec(r,(1-Mb)*(1-Mb)*v+2*(1-Mb)*Mb*F+Mb*Mb*ua,i);0<Ja&&1>Ja&&c.Ec((1-Ja)*(1-Ja)*r+2*(1-Ja)*Ja*G+Ja*Ja*I,v,i);r=I;v=ua;c.Ec(r,v,i)}}return new Eg(c)};var rh=function(a,b,c){ma(this,a);this.fill=b;this.line=c},li=function(a){return new rh(bg(a[x],gg,zf),a[dc],a[Fc])};var mi=function(a,b){this.id=a;this.sound=b};S(mi,ai);$h[11]=function(a){return new mi(a.id,a[x])};mi[E].Jb=function(a){a.a.zc().Ci(this.id,this[Hb])};var ni=function(a,b,c,d,e,g,i,l){this.text=a;this.font=b;Ka(this,c);this.x=d;this.y=e;na(this,g);this.bold=i;this.italic=l},oi=function(a,b,c,d){this.id=a;this.matrix=b;this.records=c;va(this,d)};S(oi,ai);$h[6]=function(a){for(var b=uf(a[C]),c=Bf(a[Za]),d=[],e=0;a[xc]&&e<a[xc][D];e++){var g=a[xc][e];d[u](new ni(g[Va],g[Na],g[Zc],Df(g.x),q(g.y),g[qb],g[hc],g[kb]))}return new oi(a.id,c,d,b)};oi[E].Qc=function(a){return new th(this,a)};var pi=function(a){Ba(this,a)};S(pi,bi);$h[9]=function(a,b){var c=b.s().cb(a[H]);return new pi(c)};pi[E].Ac=function(){};pi[E].de=function(a){a.s().Kg(new Vg(this[H],a))};pi[E].ne=function(a){a.s().kf(new Vg(this[H],a))};pi[E].Pc=function(a){a[u](this)};var qi=function(a,b){this.c=a;this.a=b};S(qi,bi);$h[18]=function(a,b){return new qi(a,b)};qi[E].Eg=function(){this.a.ak.bk(j)};var ri=function(a){this.Fb=a};S(ri,bi);$h[21]=function(a){return new ri(a[Wb])};O=ri[E];O.pb=function(){};O.Ac=function(){};O.de=function(a){var b=a.s();b.Fg(b.pi(a.a[Wb][this.Fb],a))};O.ne=function(a){a.wb||(a.s()[Uc](a),a.a[Wb][this.Fb]())};O.Pc=function(a){a[u](this)};var si=function(a){Ba(this,a)};S(si,pi);$h[20]=function(a,b){var c=b.s().cb(a[H]);return new si(c)};si[E].Jb=function(a,b){a.cc[b]||(a.cc[b]=[]);a.cc[b][u](this)};var ti=function(a){this.Fb=a};S(ti,ri);$h[22]=function(a){return new ti(a[Wb])};ti[E].Jb=function(a,b){a.cc[b]||(a.cc[b]=[]);a.cc[b][u](this)};var ui=function(a){this.id=a};S(ui,bi);$h[12]=function(a,b){return new ui(a.id,b)};ui[E].pb=function(a){a.zc().Lg(this.id)};ui[E].Ac=ui[E].pb;ui[E].Pc=function(a){a[u](this)};var vi=function(a){this.Cf=a};S(vi,bi);$h[16]=function(a){return new vi(a[x])};vi[E].pb=function(a){for(var b in this.Cf)a.a.$f[b]=this.Cf[b],a.a.bg[this.Cf[b]]=b};var wi=function(a){this.references=a};S(wi,bi);$h[19]=function(a,b){return new wi(a.references,b)};wi[E].Jb=function(){var a=this.references,b;for(b in a);};var xi=function(a){this.Aj=a};S(xi,bi);$h[15]=function(a){return new xi(a.label)};xi[E].Jb=function(a,b){a.fe[this.Aj]=b};var ci=function(a,b,c){this.id=a;ra(this,b);this.matrix=c};S(ci,bi);$h[3]=function(a,b){var c,d=b.s();P(a[H])&&(c=a[H].map(function(a){return{events:a[cb],key:a.key,actions:d.cb(a[H])}}));var e;e=P(a[Za])?a[Za]?Bf(a[Za]):nf:f;e=new ci(a.id,a[B],e);ta(e,a[Vb]);e.ratio=a[ub];e.replace=a[w];e.K=b.K(a.id);e.clip=a[lc];e.colortransform=P(a[Lc])?Ff(a[Lc]):f;qa(e,a[Fb]);var g=f;if(a[Tc])for(var g=[],i=0;i<a[Tc][D];i++)g[u](new Kh[a[Tc][i][Ob]](a[Tc][i]));Ia(e,g);Ba(e,c);return e};O=ci[E];
O.pb=function(a){var b=this[B]+-16384,c=a.t.ee(b),d=j;if(!this[w]==!c){if(c)if(this.id&&!c.K()&&!this.K){if(a.rc(b),d=this.me(a))d[vb](c.fa()),d.vb(c.Oa),d.Pd(c.Na),d.Od(c.Pb()),d.Xe(c.Sc),d.hb(c[zb]())}else d=c;else d=this.me(a);d&&!d.Sg()&&(this[Za]&&d[vb](this[Za]),this[Lc]&&d.vb(this[Lc]),P(this[ub])&&d.$d(this[ub]),P(this[Tc])&&d.Pd(this[Tc]),P(this[Fb])&&d.Od(this[Fb]))}};
O.Ac=function(a){var b=a.t.ee(this[B]+-16384),c=j;b?b.K()&&this.K&&b.ia()==(this[ub]|0)?c=b:(a.t.zi(b),c=this.me(a)):c=this.me(a);if(c)return c.Sg()||(c[vb](this[Za]?this[Za]:nf),c.vb(this[Lc]?this[Lc]:rf),c.$d(this[ub]|0),c.Pd(this[Tc]?this[Tc]:[]),c.Od(this[Fb]|0)),c};
O.me=function(a){var b=a.a.Ve(this.id,a);if(!b)return j;this[Vb]?b.hb(this[Vb]):b.K()&&b.hb(a.a.vg());this[lc]&&b.Xe(this[lc]+-16384);if(this[H]){b.Nd(128);for(var c=0;c<this[H][D];++c){var d=this[H][c];b.Tg(d[cb],d.key,d[H])}}a.Tb(b,this[B]+-16384);b.ha();b[Gc]();return b};O.Xf=function(a){a[u](this)};
O.Pc=function(a){var b=di(a,this[B]);if(0>b)this[w]||a[u](this);else if(this[w]){var c=a[b];a[$c](b,1);b=c.id;!c.K&&(!this.K&&P(this.id))&&(b=this.id);b=new ci(b,this[B],P(this[Za])?this[Za]:c[Za]);ta(b,c[Vb]);b.ratio=P(this[ub])?this[ub]:c[ub];b.replace=k;b.K=c.K;b.clip=c[lc];b.colortransform=P(this[Lc])?this[Lc]:c[Lc];qa(b,P(this[Fb])?this[Fb]:c[Fb]);Ia(b,P(this[Tc])?this[Tc]:c[Tc]);Ba(b,c[H]);a[u](b)}};
O.vj=function(a){if(!this[H]||!this.K)return k;for(var b=0;b<this[H][D];++b)if(0!=(this[H][b][cb]&a))return h;return k};O.tj=function(){var a=new ci(this.id,this[B]+-65536,this[Za]);ta(a,this[Vb]);a.ratio=this[ub];a.replace=k;a.K=h;a.clip=0;a.colortransform=this[Lc];qa(a,this[Fb]);Ia(a,this[Tc]);Ba(a,this[H]);return a};var yi=function(a){this.Wf=a};S(yi,bi);$h[4]=function(a){return new yi(a[B])};O=yi[E];O.pb=function(a){a.rc(this.Wf+-16384)};O.Ac=yi[E].pb;O.Xf=function(a){a[u](this)};O.Pc=function(a){var b=di(a,this.Wf);if(0<=b){var c=a[b];if(c.vj(160))a[b]=c.tj(),a[u](this.uj());else a[$c](b,1)}};O.uj=function(){return new yi(this.Wf+-65536)};var Bh=function(a,b,c){this.id=a;this.a=c;this.og=[];this.fe={};this.frameCount=b;this.tags=[];this.cc=[]};S(Bh,ai);$h[7]=function(a,b){var c=new Bh(a.id,a[yc],b);Ch(a,c);return c};var Ch=function(a,b){for(var c=0,d=0;a[Yb]&&d<a[Yb][D];d++){var e=a[Yb][d];if(2==e[Ob])c++;else{var g=$h[e[Ob]];g&&g(e,b.a).Jb(b,c)}}b.Bi(c-1)};Bh[E].K=h;Bh[E].Qc=function(){return new xh(this,this.a)};
Bh[E].Bi=function(a){for(var b=[],c=0;c<=a;++c){for(var d=this[Yb][c],e=[],g=0;g<b[D];++g)b[g].Xf(e);if(d)for(g=0;g<d[D];++g)d[g].Pc(e);b=this.og[c]=e}};var Ah=function(a,b){this.Ti=a?a:60;this.gh=1E3/this.Ti;this.zd=0;this.q=b;this.ze=k};Fa(Ah[E],function(){this.ze||(this.ze=h,this.zd=Date.now(),Pf(pd(this.ih,this)))});ya(Ah[E],function(){this.ze=k});Ah[E].ih=function(){if(this.ze){var a=Date.now();a>=this.zd&&(this.q.pf(),this.zd+=(p[eb]((a-this.zd)/this.gh)+1)*this.gh);this.q.jb();Pf(pd(this.ih,this))}};var Vg=function(a,b){this.Ei=a;this.b=b};var zi=function(a,b){this.object=a;this.method=b};zi[E].Vg=function(){for(var a=k,b=this[La][tc];b;b=b.r&&b.r[tc]){if(a)return b[E];for(var c=m[Ra](b[E]),d=0;d<c[D]&&!a;d++)b[E][c[d]]===this[Pb]&&(a=h)}};var Ai=function(a,b){this.G=a;ma(this,{});this.V=b};O=Ai[E];O.get=function(a){var b=this.G.d(this[x],a);return b in this[x]?this[x][b]:this.V.get(a)};
Ea(O,function(a,b){var c=this.G.d(this[x],a);if(c in this[x])if(c=this[x][c],c instanceof zi){var d=c[Pb].r[tc];if(R(d))return d[M](c[La],b)}else{if(R(c))return c[M](this.na(),b)}else return this.V[L](a,b)});O.set=function(a,b){var c=this.G.d(this[x],a);return c in this[x]?(this[x][c]=b,h):this.V.set(a,b)};O.Ua=function(a,b){this[x][this.G.Ya(this[x],a)]=b};O.rd=function(a){a=this.G.Ya(this[x],a);a in this[x]||(this[x][a]=f)};O.Db=function(a){return this.G.d(this[x],a)in this[x]?k:this.V.Db(a)};
O.sb=function(a){this.V.sb(a)};O.na=function(){return this.V.na()};O.bc=function(){return this.V.bc()};var Bi=function(a,b,c){this.G=a;ma(this,c);this.V=b};O=Bi[E];O.get=function(a){var b=this.G.d(this[x],a);return b in this[x]?this[x][b]:this.V.get(a)};Ea(O,function(a,b){var c=this.G.d(this[x],a);if(c in this[x]){if(c=this[x][c],R(c))return c[M](this[x],b)}else return this.V[L](a,b)});O.set=function(a,b){var c=this.G.d(this[x],a);return c in this[x]?(this[x][c]=b,h):this.V.set(a,b)};
O.Ua=function(a,b){var c=this.G.d(this[x],a);c in this[x]?this[x][c]=b:this.V.Ua(a,b)};O.rd=function(a){this.G.d(this[x],a)in this[x]||this.V.rd(a)};O.Db=function(a){var b=this.G.d(this[x],a);return b in this[x]?this.G.md(this[x],b):this.V.Db(a)};O.sb=function(a){this.V.sb(a)};O.na=function(){return this.V.na()};O.bc=function(){return this.V.bc()};var Ci=function(a,b,c){this.G=a;ma(this,c);this.Rf=c;this.Df=b;this.Hf=c};O=Ci[E];
O.get=function(a){var b=this.G.d(this[x],a);return b in this[x]?this[x][b]:"this"==a[fd]()?this.Hf:this.Df.get(a)};Ea(O,function(a,b){var c=this.G.d(this[x],a),d=this[x][c];if(c in this[x]){if(R(d))return d[M](this[x],b)}else return this.Df[L](a,b)});O.set=function(a,b){var c=this.G.Ya(this[x],a);this[x][c]=b;return h};O.Ua=function(a,b){var c=this.G.Ya(this[x],a);this[x][c]=b};O.rd=function(a){a=this.G.Ya(this[x],a);a in this[x]||(this[x][a]=f)};
O.Db=function(a){var b=this.G.d(this[x],a);return b in this[x]?this.G.md(this[x],b):this.Df.Db(a)};O.sb=function(a){a?(this.Rf=a,ma(this,a)):(this.Rf=j,ma(this,this.Hf))};O.na=function(){return this.Rf};O.bc=function(){return this.Hf};var Di=function(a,b){this.G=a;ma(this,new Z(b));this[x]._global=this[x];U(this[x],"_global",3)};O=Di[E];O.get=function(a){return this[x][this.G.d(this[x],a)]};Ea(O,function(a,b){var c=this[x][this.G.d(this[x],a)];if(R(c))return c[M](this[x],b)});O.set=function(){return k};
O.Ua=function(){};O.rd=function(){};O.Db=function(a){a=this.G.d(this[x],a);return this.G.md(this[x],a)};O.sb=function(){};O.na=function(){return j};O.bc=function(){return j};var W=function(){};S(W,V);W[E].valueOf=function(){for(var a="",b=this.__swiffy_d;b&&b[zb]();)a="."+b[zb]()+a,b=b[Qa]();b&&b instanceof xh&&b.a.M==b&&(a="_level0"+a);return a};W[E].getDepth=function(){var a=this.__swiffy_d;return a?a[B]:f};
var Ei=function(a,b,c,d){m[z](a,b,{get:function(){var a=this.__swiffy_d;if(a)return c[L](this,a)},set:function(a){var c=this.__swiffy_d;c?d[L](this,c,a):m[z](this,b,{value:a})}})},Fi=function(a,b,c,d){Ei(a,b,c,function(a,b){var c=a.a.s().mb(b);da(c)||d[L](this,a,c)})},Gi=function(a,b){Ei(a,b,function(){return 0},function(){})},Hi=function(a,b,c){Ei(a,b,c,function(){})};Fi(W[E],"_x",function(a){return a.fa().D/20},function(a,b){var c=a.fa();a[vb](c[Qb](20*b-c.D,0));a.Qa()});
Fi(W[E],"_y",function(a){return a.fa().F/20},function(a,b){var c=a.fa();a[vb](c[Qb](0,20*b-c.F));a.Qa()});Fi(W[E],"_xscale",function(a){return 100*a.Oc().ac},function(a,b){a.Oc().ac=b/100;a.Pf();a.Qa()});Fi(W[E],"_yscale",function(a){return 100*a.Oc().nd},function(a,b){a.Oc().nd=b/100;a.Pf();a.Qa()});Fi(W[E],"_alpha",function(a){return(256*a.Oa.ca|0)/2.56},function(a,b){var c=a.Oa;a.vb(new qf(c.ma,c.ua,c.la,c.ta,c.ka,c.sa,b/100,c.wa));a.Qa()});
Fi(W[E],"_visible",function(a){return a.Wa},function(a,b){a.Yj(ha(b))});Fi(W[E],"_rotation",function(a){return-180*a.Oc()[qc]/p.PI},function(a,b){a.Oc().angle=-b*p.PI/180;a.Pf();a.Qa()});Ei(W[E],"_name",function(a){return a[zb]()},function(a,b){a.hb(b)});Gi(W[E],"_quality");Gi(W[E],"_highquality");Gi(W[E],"_soundbuftime");Hi(W[E],"_parent",function(a){return(a=a[Qa]())?a.h:a});Hi(W[E],"_xmouse",function(a){var b=a.a.Uc.I();b.z(a.Mb());return b.x/20});
Hi(W[E],"_ymouse",function(a){var b=a.a.Uc.I();b.z(a.Mb());return b.y/20});Hi(W[E],"_url",function(){return n.location.href});Ei(W[E],"_width",function(a){var b=a.Va().Nb();if(b.ja())return 0;b=b.I();b.z(a.fa());return(b.k-b.e)/20},function(a,b){var c=a.a.s().mb(b);if(0<=c){var d=this._width,e=a.fa();if(0==d)d=a.Va().Nb()[Ua]()/20,0==d&&(d=1),a[vb](new mf(c/d,e.w,0,e.m,e.D,e.F));else a[vb](e.ng(c/d,1).Pe(e.D,e.F));a.Qa()}});
Ei(W[E],"_height",function(a){var b=a.Va().Nb();if(b.ja())return 0;b=b.I();b.z(a.fa());return(b.p-b.g)/20},function(a,b){var c=a.a.s().mb(b);if(0<=c){var d=this._height,e=a.fa();if(0==d)d=a.Va().Nb()[Zc]()/20,0==d&&(d=1),a[vb](new mf(e.u,0,e.l,c/d,e.D,e.F));else a[vb](e.ng(1,c/d).Pe(e.D,e.F));a.Qa()}});U(W[E],j,3);var Yg=function(){};S(Yg,W);U(Yg[E],j,3);var Ii=function(a){ta(this,"Error");this.message=P(a)?a:"Error"};za(Ii[E],function(){return this.message});U(Ii[E],j,3);var Ji=function(a){return V[L](this,a)};S(Ji,V);m[z](Ji,"__swiffy_wrapped_type",{value:ca});var Ki=function(a){return V(a)};m[z](ca,"__swiffy_override",{value:Ki});m[z](Ji,"__swiffy_override",{value:Ki});Ha(Ji[E],function(a,b){var c=this;if(R(c))return"__swiffy_override"in c&&(c=c.__swiffy_override),ca[E][M][L](c,V(a),"array"==hd(b)?b:[])});m[z](ca[E][M],"__swiffy_override",{value:Ji[E][M]});ca[E][Sb]&&m[z](ca[E][Sb],"__swiffy_override",{value:f});
Ea(Ji[E],function(a,b){return Ji[E][M][L](this,a,ea[E][Ya][L](arguments,1))});m[z](ca[E][L],"__swiffy_override",{value:Ji[E][L]});U(Ji,j,3);U(Ji[E],j,3);var X=function(){};S(X,Yg);X[E].enabled=h;X[E].gotoAndStop=function(a){var b=this.__swiffy_d;b&&b.yc(b.od(a),k)};X[E].gotoAndPlay=function(a){var b=this.__swiffy_d;b&&b.yc(b.od(a),h)};X[E].play=function(){var a=this.__swiffy_d;a&&a[Kb]()};ya(X[E],function(){var a=this.__swiffy_d;a&&a[ec]()});X[E].nextFrame=function(){var a=this.__swiffy_d;a&&a.He()};X[E].prevFrame=function(){var a=this.__swiffy_d;a&&a.zh()};
X[E].globalToLocal=function(a){var b=this.__swiffy_d;if(b){var c=b.a.s(),d=c.Rg(a);if(d!=j){var e=c.d(a,"x"),c=c.d(a,"y"),b=Mf(b.Mb(),d);a[e]=b.x;a[c]=b.y}}};X[E].localToGlobal=function(a){var b=this.__swiffy_d;if(b){var c=b.a.s(),d=c.Rg(a);if(d!=j){var e=c.d(a,"x"),c=c.d(a,"y"),b=Mf(b.Ba(),d);a[e]=b.x;a[c]=b.y}}};X[E].createEmptyMovieClip=function(a,b){var c=this.__swiffy_d;if(c){var d=new xh(new Bh(0,0,c.a),c.a);d.tc=h;d.hb(a);d.ha();d[Gc]();c.rc(b);c.Tb(d,b);return d.h}};
X[E].createTextField=function(a,b,c,d,e,g){if(!(6>arguments[D])){var a=s(a),b=Ef(b),c=Ef(c),d=Ef(d),e=p.abs(Ef(e)),g=p.abs(Ef(g)),i=this.__swiffy_d;if(i){var l=new ii(-1,-1,240,4278190080);va(l,new tf(0,0,20*e,20*g));l=new Jg(l,i);l.hb(a);l[vb](new mf(1,0,0,1,20*c,20*d));l.ha();i.rc(b);i.Tb(l,b);return l.h}}};X[E].getNextHighestDepth=function(){var a=this.__swiffy_d;return a?a.t.hj():f};
X[E].getInstanceAtDepth=function(a){var b=this.__swiffy_d;if(b&&!(-16384>a)&&(a=b.t.ee(a)))return a instanceof Qg?a.h:b.h};X[E].getSWFVersion=function(){var a=this.__swiffy_d;return a?a.a.da:-1};X[E].setMask=function(a){var b=this.__swiffy_d;if(b){var c;c=Q(a)?b.a.s().Wg(a):a;if(c instanceof X)return b.kd(c.__swiffy_d),h;b.kd(j);return!P(a)}};
X[E].attachMovie=function(a,b,c,d){var e=this.__swiffy_d;if(e&&(a=e.a.$f[a],P(a))){a=e.a.Ve(a,e);a.tc=h;a.hb(b);a.ha();a[Gc]();e.rc(c);e.Tb(a,c);if(P(d)){var b=a.h,g;for(g in d)b[g]=d[g]}return a.h}};X[E].duplicateMovieClip=function(a,b,c){var d=this.__swiffy_d;if(d){var e=d[Qa]();if(e){a=d.duplicate(e,a,b);if(P(c)){var b=a.h,g;for(g in c)b[g]=c[g]}return a.h}}};X[E].removeMovieClip=function(){var a=this.__swiffy_d;if(a){var b=a[Qa]();0<=a[B]&&(a.tc&&b)&&(a.A(),b[Bc](a))}};
X[E].swapDepths=function(a){var b=this.__swiffy_d,c=b?b[Qa]():f;if(c){var d=f;if(a instanceof W){a=a.__swiffy_d;if(a[Qa]()!=c)return;d=a[B]}else"number"===typeof a&&(d=a);P(d)&&c.Kf(b[B],d)}};m[pb](X[E],function(){var a={},b;for(b in Sg)if(b&130816){var c=Sg[b];a[c]={get:Ug,set:qd(Tg,c)}}return a}());X[E].getBytesTotal=function(){var a=this.__swiffy_d;if(a)return a.a.Gh};X[E].getBytesLoaded=X[E].getBytesTotal;
X[E].getBounds=function(a){var b=this.__swiffy_d;if(b){var c=b.Va().Nb().I();c.ja()&&c[Wa](134217728,134217728);if(P(a)){var d=j;Q(a)&&(a=b.a.s().Vc(a,this));a instanceof X&&(d=a.__swiffy_d);if(d)a=d.Mb(),c.z(b.Ba()[Ic](a));else return}b={};b.xMin=c.e/20;b.xMax=c.k/20;b.yMin=c.g/20;b.yMax=c.p/20;return b}};X[E].getURL=function(a,b,c){var d=this.__swiffy_d;if(d){var e=0;Q(c)&&(c=c[fd](),"get"==c?e=1:"post"==c&&(e=2));d.a.Ug(new zh(this,a,b,e))}};
X[E].hitTest=function(a,b,c){var d=this.__swiffy_d;if(P(a)&&d){var e=d.Va().Nb().I();e.z(d.Ba());if(!P(b)&&!P(c)){if(b=j,a instanceof X?b=a.__swiffy_d:Q(a)&&(b=d.a.s().Vc(a,this)),b!=j)return a=b.Va().Nb().I(),a.z(b.Ba()),e.fi(a)}else if(P(b))return e[Rc](20*a,20*b)}return k};X[E].clear=function(){var a=this.__swiffy_d;a&&a.jc("clear",arguments)};X[E].moveTo=function(){var a=this.__swiffy_d;a&&a.jc("moveTo",arguments)};X[E].lineTo=function(){var a=this.__swiffy_d;a&&a.jc("lineTo",arguments)};
X[E].curveTo=function(){var a=this.__swiffy_d;a&&a.jc("curveTo",arguments)};X[E].lineStyle=function(){var a=this.__swiffy_d;a&&a.jc("lineStyle",arguments)};X[E].beginFill=function(){var a=this.__swiffy_d;a&&a.jc("beginFill",arguments)};X[E].endFill=function(){var a=this.__swiffy_d;a&&a.jc("endFill",arguments)};Hi(X[E],"_currentframe",function(a){return p.max(1,a.Y+1)});Hi(X[E],"_totalframes",function(a){return a.c[yc]});Hi(X[E],"_framesloaded",function(a){return a.c[yc]});Hi(X[E],"_root",function(a){return a.a.M.h});
Hi(X[E],"_target",function(){var a=this._root;if(this==a)return"/";for(var b="",c=this;c&&c!=a;)b="/"+c._name+b,c=c._parent;return b});Hi(X[E],"_level0",function(a){return a.a.M.h});U(X[E],j,3);var ch=function(){};S(ch,W);
var dh={text:{get:function(){var a=this.__swiffy_d;if(a){var b=a.yb;a.Da&&(b=b[w](/<[^>]+>|&[^;]+;/g,function(a){switch(a){case "&amp;":return"&";case "&lt;":return"<";case "&gt;":return">";case "&quot;":return'"';case "&apos;":return"'";case "&nbsp;":return" ";case "</p>":case "<br>":case "<br/>":return"\n"}return""}));return b}},set:function(a){var b=this.__swiffy_d;b&&(b.Da&&(a=s(a)[w](/[<>&]/g,function(a){switch(a){case "&":return"&amp;";case "<":return"&lt;";case ">":return"&gt;"}return a})),b.$c(a,
h))}},htmlText:{get:function(){var a=this.__swiffy_d;if(a){var b=a.yb;if(a.Da){for(var a=s(b),b=/\s*<p(?: [^>]*)?>.*?<\/p>\s*/ig,c=0,d=b[Ta](a),e="";d;)d[nc]>c&&(e+="<p>"+a[Nc](c,d[nc])+"</p>"),e+=d[0],c=b.lastIndex,d=b[Ta](a);a[D]>c&&(e+="<p>"+a[Nc](c)+"</p>");b=e}return b}},set:function(a){var b=this.__swiffy_d;b&&b.$c(a)}},html:{get:function(){var a=this.__swiffy_d;if(a)return a.Da},set:function(a){var b=this.__swiffy_d;if(b&&(a=!!a,a!=b.Da)){var c=this[Va];b.rj(a);this.text=c}}},textColor:{get:function(){var a=
this.__swiffy_d;return a?a.Qj():f},set:function(a){var b=this.__swiffy_d;b&&b.Xj(a)}}};U(ch[E],j,3);var Dh=function(a){this.q=a;this.showMenu=h};m[z](Dh[E],"height",{get:function(){return"noScale"==this.q.Ab?this.q.se:this.q.Gd},set:function(){}});m[z](Dh[E],"width",{get:function(){return"noScale"==this.q.Ab?this.q.te:this.q.Hd},set:function(){}});
m[z](Dh[E],"align",{get:function(){var a=this.q.Qb,b="";a&1&&(b+="L");a&2&&(b+="T");a&4&&(b+="R");a&8&&(b+="B");return b},set:function(a){var a=s(a).toUpperCase(),b=0;-1<a[y]("L")&&(b|=1);-1<a[y]("T")&&(b|=2);-1<a[y]("R")&&(b|=4);-1<a[y]("B")&&(b|=8);this.q.ej(b)}});m[z](Dh[E],"scaleMode",{get:function(){return this.q.Ab},set:function(a){switch(s(a)[fd]()){case "exactfit":a="exactFit";break;case "noborder":a="noBorder";break;case "noscale":a="noScale";break;default:a="showAll"}this.q.fj(a)}});
U(Dh[E],j,3);var Li=function(){this.allowDomain=function(){return h};this.allowInsecureDomain=function(){return h}};U(Dh[E],j,3);var Z=function(a){m[z](this,"__swiffy_s",{value:a});this.String=Mi(s,function(b){return a.s().Xa(b)},["fromCharCode"]);U(this,"String",3);this.Number=Mi(q,function(b){return a.s().mb(b)},["MAX_VALUE","MIN_VALUE","NaN","NEGATIVE_INFINITY","POSITIVE_INFINITY"]);U(this,"Number",3);this.Boolean=Mi(ha,function(b){return a.s().ah(b)});U(this,"Boolean",3);var b=function(b){this.h=a.s().ve(b);this.Yg=0};m[pb](b[E],vh);this.Color=b;U(this,"Color",3);this.AsBroadcaster=new Tf(a);U(this,"AsBroadcaster",3)},
Mi=function(a,b,c){b.__swiffy_override=function(c){return new a(b(c))};b.__swiffy_wrapped_type=a;if(P(c))for(var d=0;d<c[D];d++)b[c[d]]=a[c[d]];U(b,j,3);return b};Z[E].ASSetPropFlags=U;Z[E].clearInterval=function(a){ba.clearInterval(a)};Z[E].clearTimeout=function(a){ba.clearTimeout(a)};Z[E].escape=function(a){return escape(a)[w](/[-@*+.\/_]/g,function(a){return"%"+a[Kc](0)[fc](16).toUpperCase()})};Z[E].parseFloat=parseFloat;
Z[E].parseInt=!Sd?ia:function(a,b){if(!P(b)){var c=s(a)[rb]();"0"==c[gb](0)&&"x"!=c[gb](1)[fd]()&&(b=8)}return ia(a,b)};Z[E].isFinite=function(a){return isFinite(a)};Z[E].isNaN=function(a){return da(a)};Z[E].unescape=function(a){return unescape(a)};
var Ni=function(a,b){var c=b[0],d=this;if(R(c)&&2<=b[D]){var e=ea[E][Ya][L](b,2),g=b[1];return a[L](ba,function(){c[M](d,e);d.__swiffy_s.U()},g)}if(jd(c)&&3<=b[D]){var i=b[1],e=ea[E][Ya][L](b,3),g=b[2];return a[L](ba,function(){R(c[i])&&(c[i][M](c,e),d.__swiffy_s.U())},g)}};Z[E].setInterval=function(){return Ni[L](this,ba.setInterval,arguments)};Z[E].setTimeout=function(){return Ni[L](this,ba.setTimeout,arguments)};Z[E].updateAfterEvent=function(){this.__swiffy_s.kc=h};Z[E].Error=Ii;Z[E].Math=p;
Z[E].MovieClip=X;Z[E].TextField=ch;Z[E].Date=Date;m[z](Date,"__swiffy_override",{value:function(a,b,c,d,e,g,i){switch(arguments[D]){case 0:return new Date(Date.now());case 1:return new Date(arguments[0]);default:return c=P(c)?c:1,d=P(d)?d:0,e=P(e)?e:0,g=P(g)?g:0,i=P(i)?i:0,new Date(a,b,c,d,e,g,i)}}});Z[E].Array=ea;m[z](ea,"__swiffy_override",{value:ea});Z[E].Function=Ji;Z[E].Object=V;m[z](V,"__swiffy_override",{value:Rf});m[z](V,"__swiffy_wrapped_type",{value:m});
m[z](Z[E],"Key",{get:function(){return this.__swiffy_s.getKey()},set:function(){}});m[z](Z[E],"Mouse",{get:function(){return this.__swiffy_s.lb},set:function(){}});m[z](Z[E],"Stage",{get:function(){return this.__swiffy_s.Qd},set:function(){}});Z[E].System=new function(){this.security=new Li};U(Z[E],j,3);var Y=function(a){this.Q=[];this.$g=[];this.q=a;this.Ai=this.Zg();this.ue=[];this.oe=k;this.ya=0;this.Ka=4;this.nf=j;this.mf=new Di(this,a)};O=Y[E];O.Kg=function(a){this.ue[u](pd(function(){this.kf(a)},this))};O.Fg=function(a){this.ue[u](a)};O.U=function(){if(!this.oe){for(this.oe=h;0<this.ue[D];)this.ue[Sa]()();this.oe=k}};O.Zg=function(){return Date.now()};O.Id=function(a){this.mf.get("AsBroadcaster").initialize(a)};
O.reset=function(a){this.Q=[];this.ya=0;this.Ka=4;Aa(this.Q,this.Q[D]+this.Ka);this.j=new Ci(this,this.mf,a.h)};O.Fc=function(a){for(var b=0;b<a[D];)b=a[b][L](this,b+1)};O.kf=function(a){a.b.wb||(this[Uc](a.b),this.Fc(a.Ei))};O.pi=function(a,b){return qd(function(c){b.wb||(c[Uc](b),a())},this)};var Oi=function(a){a=a[w](/\.\.|\/:?|:/g,function(a){return".."==a?"_parent":"."});"."==a[0]&&(a="_root"+a);"."==a[a[D]-1]&&(a=a[Nc](0,a[D]-1));return a};
Y[E].xc=function(a,b){P(b)||(b=this.na());var c=0<a[y](":")?a[sc](":"):a[sc](".");if(1<c[D]){var d=c[Ya](0,c[D]-1)[bd]("."),c=c[c[D]-1];return{path:this.Vc(d,b),Ub:c}}return{path:b,Ub:a}};var Pi={"boolean":{},number:{},string:{},undefined:{}},Qi=function(a){for(var b=m[Ra](a[tc][E]),a=Pi[typeof a],c=0;c<b[D];++c){var d=b[c],e=d[fd]();d!=e&&(a[e]=d)}};Qi(k);Qi(0);Qi("");
var Ri=function(a){if(!a)return{constructor:"constructor"};var b=a.__swiffy_nm;if(!b||b.__swiffy_nm!=a){for(var b=m[kc](Ri(m[Zb](a))),c=m[Ra](a),d=0;d<c[D];++d){var e=c[d],g=e[fd]();e!=g&&(b[g]=e)}m[z](b,"__swiffy_nm",{value:a,writable:h});m[z](a,"__swiffy_nm",{value:b,writable:h})}return b};O=Y[E];
O.d=function(a,b){if(7<=this.q.da){if(a instanceof W){if(b in a)return b;var c=b[fd]();if(c in a&&-1<Si[y](c))return c}return b}var d=Pi[typeof a];if(!d){if(b in a)return b;d=Ri(a)}c=b[fd]();return(d=d[c])?d:c};O.Ya=function(a,b){if(7<=this.q.da){if(a instanceof W){if(b in a)return b;var c=b[fd]();if(c in a&&-1<Si[y](c))return c}return b}var d=Pi[typeof a];if(d)return c=b[fd](),(d=d[c])?d:c;if(b in a)return b;var e=Ri(a),c=b[fd]();return(d=e[c])?d:b==c||c in a?c:e[c]=b};
O.Rg=function(a){if(jd(a)){var b=a[this.d(a,"x")],a=a[this.d(a,"y")];if("number"==typeof b&&"number"==typeof a)return new lf(b,a)}return j};O.na=function(){return this.j.na()};O.Ib=function(){var a=this.j.na();return a?a.__swiffy_d:j};O.push=function(a){this.Q[u](a)};O.pop=function(){if(this.Q[D]>this.ya+this.Ka)return this.Q.pop()};O.i=function(){return this.mb(this.pop())};O.L=function(){return this.Xa(this.pop())};O.Dd=function(){return this.ah(this.pop())};O.dh=function(){return this.ve(this.pop())};
O.ve=function(a){return a instanceof W?a:this.Wg(s(a))};O.Vc=function(a,b){if(!b||!a)return b;for(var a=Oi(a),c=b,d=a[sc]("."),e=0;e<d[D]&&c;e++)c=c[this.d(c,d[e])];return c};O.Wg=function(a){return this.Vc(a,this.na())};
O.ai=function(a,b,c,d){this.oe||this[Uc](c);a=Oi(a);c=this.xc(a,c.h);if(c[Nb]&&c[Nb].__swiffy_d){var a=c[Nb].__swiffy_d,e=c[Nb],c=this.Ya(e,c.Ub);P(a.Zc[c])||(a.Zc[c]=[]);a.Zc[c][u](b);c in e&&(b.$c(s(e[c])),d=e[c]);var g=a.Zc[c],i=d;m[z](e,c,{get:function(){return i},set:function(a){i=a;for(var b=0;b<g[D];b++)g[b].$c(a)},configurable:h})}};O.mi=function(a,b,c){a=Oi(a);c=this.xc(a,c.h);if(c[Nb]){var d=c[Nb];if(a=c[Nb].__swiffy_d)c=this.d(d,c.Ub),Bd(a.Zc[c],b)}};
O.md=function(a,b){if(a!=j){var c=b in a,d=delete a[b];delete a[b];if(a instanceof X){var e=a.__swiffy_d;e&&(e=e.t.gj(b))&&Hg(a,e,b)}return c&&d}return k};O.cb=function(a){for(var b=[],c=0;c<a[D];++c)b[c]=this.Kj(a[c]);return b};O.Kj=function(a){var b=$[a[Ob]];if(!b)return pd(Ti,this,a[Ob]);b.ea&&(b=b(a,this));return b};
var Si="_x _y _xscale _yscale _currentframe _totalframes _alpha _visible _width _height _rotation _target _framesloaded _name _droptarget _url _highquality _focusrect _soundbuftime _quality _xmouse _ymouse".split(" "),$={4:function(a){this.He();return a}};Y[E].He=function(){var a=this.Ib();a&&a.He()};$[5]=function(a){this.Vj();return a};Y[E].Vj=function(){var a=this.Ib();a&&a.zh()};$[6]=function(a){this[Kb]();return a};Y[E].play=function(){var a=this.Ib();a&&a[Kb]()};$[7]=function(a){this[ec]();return a};
ya(Y[E],function(){var a=this.Ib();a&&a[ec]()});$[9]=function(a){this.Zj();return a};Y[E].Zj=function(){var a=this.Ib();a&&a.zc().pj()};$[10]=function(a){var b=this.i(),c=this.i();this[u](c+b);return a};$[11]=function(a){var b=this.i(),c=this.i();this[u](c-b);return a};$[12]=function(a){var b=this.i(),c=this.i();this[u](c*b);return a};$[13]=function(a){var b=this.i(),c=this.i();this[u](c/b);return a};$[14]=function(a){var b=this.i(),c=this.i();this[u](this.aj(c,b));return a};
$[15]=function(a){var b=this.i(),c=this.i();this[u](c<b);return a};$[16]=function(a){var b=this.Dd(),c=this.Dd();this[u](c&&b);return a};$[17]=function(a){var b=this.Dd(),c=this.Dd();this[u](c||b);return a};$[18]=function(a){var b=this.Dd();this[u](!b);return a};$[19]=function(a){var b=this.L(),c=this.L();this[u](c==b);return a};$[20]=function(a){var b=this.L();this[u](b[D]);return a};$[21]=function(a){var b=this.pop(),c=this.pop(),d=this.L();this[u](this.nj(d,c,b));return a};
Y[E].nj=function(a,b,c){a=this.Xa(a);c=q(c);b=p.max(0,q(b)-1);return a[cc](b,c)};$[23]=function(a){this.pop();return a};$[24]=function(a){var b=this.i(),b=0>b?p[bb](b):p[eb](b);this[u](b);return a};$[28]=function(a){var b=this.L();this[u](this.mj(b));return a};Y[E].mj=function(a){var a=Oi(a),a=a[sc]("."),b=this.j.get(a[0]);if(1<a[D]){var c;for(c=1;P(b)&&c<a[D]-1;++c)b=b[this.d(b,a[c])];P(b)&&(b=b[this.d(b,a[c])])}return b};$[29]=function(a){var b=this.pop(),c=this.L();this.Lf(c,b);return a};
Y[E].Lf=function(a,b){var a=Oi(a),c=a[sc](".");if(1==c[D])this.j.set(a,b);else{var d=this.j.get(c[0]),e;for(e=1;P(d)&&e<c[D]-1;++e)d=d[this.d(d,c[e])];P(d)&&(d[this.Ya(d,c[e])]=b)}};$[33]=function(a){var b=this.L(),c=this.L();this[u](c+b);return a};$[34]=function(a){var b=this.i(),c=this.pop();this[u](this.$i(c,b));return a};Y[E].$i=function(a,b){var c=this.ve(a),d=Si[b];if(c)return c[d]};$[35]=function(a){var b=this.pop(),c=this.i(),d=this.pop();this.setProperty(d,c,b);return a};
Y[E].setProperty=function(a,b,c){b=Si[b];(a=this.ve(a))&&b&&(a[b]=c)};$[36]=function(a){var b=this.i(),c=this.L(),d=this.dh(),e=this.Ib();d&&(e&&d.__swiffy_d)&&d.__swiffy_d.duplicate(e,c,b+-16384);return a};$[37]=function(a){var b=this.dh();b instanceof X&&b.removeMovieClip();return a};$[38]=function(a){this.trace(this.pop());return a};Y[E].trace=function(a){ba.console&&ba.console.log("[trace] "+(P(a)?this.Xa(a):"undefined"))};var Ti=function(a,b){return b};
$[51]=function(a){var b=this.i();this[u](s.fromCharCode(b));return a};$[50]=function(a){var b=this.L();this[u](b[Kc](0));return a};$[52]=function(a){this[u](this.getTime());return a};Y[E].getTime=function(){return this.Zg()-this.Ai};$[48]=function(a){var b=this.i();this[u](this.random(b));return a};Y[E].random=function(a){var b;do b=p[eb](p.random()*a);while(b==a&&0<a);return b};$[60]=function(a){var b=this.pop(),c=this.pop();this.j.Ua(c,b);return a};
$[65]=function(a){var b=this.pop();this.j.rd(b);return a};$[59]=function(a){var b=this.Nj(this.pop());this[u](b);return a};Y[E].Nj=function(a){var a=this.Xa(a),a=Oi(a),b=a[sc](".");if(1==b[D])return this.j.Db(a);var a=this.j.get(b[0]),c;for(c=1;P(a)&&c<b[D]-1;++c)a=a[this.d(a,b[c])];return this.md(a,this.d(a,b[c]))};$[62]=function(){Ga(this,this.pop());return q.MAX_VALUE};$[63]=function(a){var b=this.i(),c=this.i();this[u](c%b);return a};
$[71]=function(a){var b=this.pop(),c=this.pop();this[u](this.add(c,b));return a};$[72]=function(a){var b=this.pop(),c=this.pop();this[u](this.Eh(c,b));return a};Y[E].Eh=function(a,b){if("object"===typeof a&&a!==j&&(a=a[Pa](),"object"===typeof a)||"object"===typeof b&&b!==j&&(b=b[Pa](),"object"===typeof b))return k;if("string"===typeof a&&"string"===typeof b)return a<b;"number"!==typeof a&&(a=this.mb(a));"number"!==typeof b&&(b=this.mb(b));return da(a)||da(b)?f:a<b};
$[103]=function(a){var b=this.pop(),c=this.pop();this[u](this.Eh(b,c));return a};$[73]=function(a){var b=this.pop(),c=this.pop();this[u](this.$b(c,b));return a};
Y[E].$b=function(a,b){if(!(typeof a===typeof b&&a===j==(b===j)&&6<=this.q.da)){"object"===typeof a&&a!==j&&(a=a[Pa]());"object"===typeof b&&b!==j&&(b=b[Pa]());if("object"===typeof a||"object"===typeof b)return a===f||a===j?b===f||b===j:a===b;if("string"===typeof a&&("boolean"===typeof b||"number"===typeof b))""==a[rb]()&&(a=q.NaN);else if("string"===typeof b&&("boolean"===typeof a||"number"===typeof a)&&""==b[rb]())b=q.NaN}return a==b};
$[102]=function(a){var b=this.pop(),c=this.pop();this[u](c===b);return a};$[41]=function(a){var b=this.L(),c=this.L();this[u](c<b);return a};$[42]=function(){throw this.pop();};$[104]=function(a){var b=this.L(),c=this.L();this[u](c>b);return a};$[105]=function(a){var b=this.pop(),c=this.pop();R(b)&&R(c)&&S(c,b);return a};$[74]=function(a){var b=this.i();this[u](b);return a};$[75]=function(a){var b=this.L();this[u](b);return a};$[76]=function(a){var b=this.pop();this[u](b);this[u](b);return a};
$[77]=function(a){var b=this.pop(),c=this.pop();this[u](b);this[u](c);return a};$[78]=function(a){var b=this.pop(),c=this.pop();this[u](this.Pj(c,b));return a};Y[E].Pj=function(a,b){if(a!=j)if(a instanceof zi&&(a=a.Vg()),"number"===typeof b){if("string"!==typeof a)return a[b]}else return a[this.d(a,this.Xa(b))]};$[79]=function(a){var b=this.pop(),c=this.pop(),d=this.pop();this.Wj(d,c,b);return a};
Y[E].Wj=function(a,b,c){a!=j&&("number"===typeof b?a[b]=c:(a[this.Ya(a,this.Xa(b))]=c,R(a)&&"prototype"==b&&(a.r=c[tc][E],c.constructor=a)))};$[80]=function(a){var b=this.i();this[u](++b);return a};$[81]=function(a){var b=this.i();this[u](--b);return a};$[96]=function(a){var b=this.i(),c=this.i();this[u](b&c);return a};$[97]=function(a){var b=this.i(),c=this.i();this[u](b|c);return a};$[98]=function(a){var b=this.i(),c=this.i();this[u](c^b);return a};
$[99]=function(a){var b=this.i(),c=this.i();this[u](c<<b);return a};$[100]=function(a){var b=this.i(),c=this.i();this[u](c>>b);return a};$[101]=function(a){var b=this.i(),c=this.i();this[u](c>>>b);return a};$[58]=function(a){var b=this.L(),c=this.pop(),b=this.md(c,this.d(c,b));this[u](b);return a};$[129]=function(a,b){return pd(Ui,b,a.frame)};$[129].ea=h;var Ui=function(a,b){this.Rj(a);return b};Y[E].Rj=function(a){var b=this.Ib();b&&b.yc(a,k)};$[140]=function(a,b){return pd(Vi,b,a.label)};
$[140].ea=h;var Vi=function(a,b){this.Sj(a);return b};Y[E].Sj=function(a){var b=this.Ib();b&&(a=b.od(a),a!=f&&b.yc(a,k))};$[136]=function(a,b){for(var c=a.constants,d=ea(c[D]),e=0;e<c[D];++e){var g=pd(Wi,b,c[e]);d[e]=g}b.$g=d;return Xi};$[136].ea=h;$[136].Tj=h;var Xi=function(a){return a};$[32]=function(a){this.sb(this.pop());return a};Y[E].sb=function(a){a instanceof W||(a=s(a),a=this.Vc(a,this.j.bc()),a instanceof W||(a=f));this.j.sb(a)};
$[69]=function(a){var b=this.pop(),c=f;b instanceof W&&(c=b[Pa]());this[u](c);return a};$[305]=function(a,b){return pd(Wi,b,a[jb])};$[305].ea=h;var Wi=function(a,b){this[u](a);return b};$[306]=function(a){this[u](f);return a};$[307]=function(a){this[u](q.POSITIVE_INFINITY);return a};$[308]=function(a){this[u](q.NEGATIVE_INFINITY);return a};$[309]=function(a){this[u](q.NaN);return a};$[304]=function(a,b){return b.$g[a[nc]]};$[304].ea=h;$[304].Tj=h;$[303]=function(a,b){return pd(Yi,b,a[nc])};
$[303].ea=h;var Yi=function(a,b){0<=a&&a<this.Ka?this[u](this.Q[this.ya+a]):this[u](f);return b};$[135]=function(a,b){return pd(Zi,b,a[nc])};$[135].ea=h;var Zi=function(a,b){0<=a&&a<this.Ka&&(this.Q[this.ya+a]=this.Q[this.Q[D]-1]);return b};$[154]=function(a,b){return pd($i,b,a[Pb])};$[154].ea=h;var $i=function(a,b){var c=this.L(),d=this.L();this.q.Ug(new zh(this.na(),d,c,a));return b};$[148]=function(a,b){return pd(aj,b,b.cb(a[Ac]))};$[148].ea=h;
var aj=function(a,b){var c=this.pop();if(!(c instanceof m))return b;var d=this.j;this.j=new Bi(this,d,c);try{this.Fc(a)}finally{this.j=d}return b};$[155]=function(a,b){return pd(bj,b,a.args,b.cb(a[Ac]),[],0,4)};$[155].ea=h;$[142]=function(a,b){return pd(bj,b,a.args,b.cb(a[Ac]),a.preloads,a.suppress,a.registerCount)};$[142].ea=h;
var bj=function(a,b,c,d,e,g){var i=this;this[u](this.Di(function(){var d=i.ya,g=i.Ka;i.ya=i.Q[D];i.Ka=e;Aa(i.Q,i.Q[D]+i.Ka);for(var v=0;v<c[D]&&v+1<e;++v)i.Q[i.ya+v+1]=i.j.get(c[v]);for(v=0;v<a[D];++v)Q(a[v])?i.j.Ua(a[v],arguments[v]):i.Q[i.ya+a[v]]=arguments[v];Ga(i,f);try{i.Fc(b)}finally{Aa(i.Q,i.ya),i.ya=d,i.Ka=g}return i.returnValue},d));return g};
Y[E].Di=function(a,b){var c=this,d=this.j,e=function(){var g=c.j,i=c.j.na(),l=c.nf;if(5<c.q.da)c.j=new Ai(c,d);else{var r=new Ci(c,c.mf,this);c.j=new Ai(c,r)}b&4||c.j.Ua("this",this);b&1||c.j.Ua("super",new zi(this,e));b&2||(r=ea[E][Ya][L](arguments),r.callee=e,r.caller=l,c.j.Ua("arguments",r));c.nf=e;var v;try{v=a[M](V(this),arguments)}finally{c.j=g,c.j.sb(i)}c.nf=l;return v};S(e,V);return e};
$[143]=function(a,b){return pd(cj,b,b.cb(a.tryBlock),a.catchBlock?b.cb(a.catchBlock):j,a.finallyBlock?b.cb(a.finallyBlock):j,a.register,a[pc])};$[143].ea=h;var cj=function(a,b,c,d,e,g){try{this.Fc(a)}catch(i){if(b!=j){var l;P(e)?(l=this.j.get(e),this.j.Ua(e,i)):0<=d&&d<this.Ka&&(this.Q[this.ya+d]=i);try{this.Fc(b)}finally{P(e)&&(P(l)?this.j.Ua(e,l):this.j.Db(e))}}else throw i;}finally{c!=j&&this.Fc(c)}return g};
$[61]=function(a){for(var b=this.L(),c=this.i(),d=[],e=0;e<c;++e)d[e]=this.pop();this[u](this.j[L](b,d));return a};Ea(Y[E],function(a,b){return this.j[L](a,b)});$[82]=function(a){for(var b=this.pop(),c=this.pop(),d=this.i(),e=[],g=0;g<d;g++)e[g]=this.pop();this[u](this.Zi(b,c,e));return a};
Y[E].Zi=function(a,b,c){if(b!=j)if(a==j||""===a)if(b instanceof zi){var d=b[Pb].r[tc];if(R(d))return d[M](V(b[La]),c)}else{if((d=this.j.na())||(d=this.j.bc()),R(b)&&"__swiffy_override"in b&&(b=b.__swiffy_override),R(b))return b[M](V(d),c)}else if(d=b,d instanceof zi&&(b=d.Vg(),d=d[La]),b=b[this.d(b,s(a))],R(b)&&"__swiffy_override"in b&&(b=b.__swiffy_override),R(b))return b[M](V(d),c)};
$[64]=function(a){for(var b=this.L(),b=this.j.get(b),c=this.i(),d=[],e=0;e<c;++e)d[e]=this.pop();R(b)||(b=V);R(b)&&"__swiffy_override"in b?c=b.__swiffy_override[M](V(j),d):(c=m[kc](b[E]),b[M](V(c),d));this[u](c);return a};$[83]=function(a){for(var b=this.pop(),c=this.pop(),d=this.i(),e=[],g=0;g<d;g++)e[g]=this.pop();d=f;c!=j&&(d=b==j||""===b?c:c[this.d(c,s(b))]);R(d)||(d=V);R(d)&&"__swiffy_override"in d?b=d.__swiffy_override[M](V(j),e):(b=m[kc](d[E]),d[M](V(b),e));this[u](b);return a};
$[67]=function(a){for(var b=Rf(),c=this.i(),d=0;d<c;d++){var e=this.pop(),g=this.L();b[g]=e}this[u](b);return a};$[66]=function(a){for(var b=[],c=this.i(),d=0;d<c;d++){var e=this.pop();b[d]=e}this[u](b);return a};$[68]=function(a){var b=this.pop();this[u](b instanceof X?"movieclip":b==j||b==f?s(b):typeof b);return a};$[85]=function(a){var b=this.pop();this[u](f);if("string"!==typeof b)for(var c in b)this[u](c);return a};$[153]=function(a,b){return pd(dj,b,a[Dc])};$[153].ea=h;var dj=function(a){return a};
$[157]=function(a,b){return pd(ej,b,a[Dc])};$[157].ea=h;var ej=function(a,b){return ha(this.pop())?a:b};$[158]=function(a){var b=this.L(),c=this.xc(b);if(c[Nb]&&c[Nb].__swiffy_d&&(b=c[Nb].__swiffy_d))if(c=b.od(c.Ub),c!=f&&(c=b.qi(c))){for(var d=this.j,e=this.ya,g=this.Ka,i=this.Q,l=0;l<c[D];l++)c[l].ne(b);this.Q=i;this.j=d;this.ya=e;this.Ka=g}return a};$[159]=function(a,b){return pd(fj,b,a.frameBias,a[Kb])};$[159].ea=h;
var fj=function(a,b,c){var d=this.L(),e=this.xc(d);if(e[Nb]&&e[Nb].__swiffy_d&&(d=e[Nb].__swiffy_d))e=d.od(e.Ub),e!=f&&d.yc(e+a,b);return c};$[44]=function(a){var b=this.pop(),c=this.i(),b=(b=b?b[E]:j)?b:{},d;b[zc]("__swiffy_if")?d=b.__swiffy_if:(d=new cf,b.__swiffy_if&&d.wd(b.__swiffy_if),m[z](b,"__swiffy_if",{value:d}));for(var e=0;e<c;++e){var g=this.pop();if(b=g?g[E]:j)d.add(g),b.__swiffy_if&&d.wd(b.__swiffy_if)}return a};
var gj=function(a,b){if(R(b)){"__swiffy_wrapped_type"in b&&(b=b.__swiffy_wrapped_type);if(a instanceof b)return a;if(a instanceof m){var c=a.__swiffy_if;if(c&&c[Rc](b))return a}}return j};$[43]=function(a){var b=this.pop(),c=this.pop();this[u](gj(b,c));return a};$[84]=function(a){var b=this.pop(),c=this.pop();this[u](!!gj(c,b));return a};O=Y[E];O.mb=function(a){return 7<=this.q.da?!P(a)||a===j||Q(a)&&""===a[rb]()?q.NaN:q(a):5<=this.q.da&&7>this.q.da?!P(a)||a===j?0:Q(a)&&""===a[rb]()?q.NaN:q(a):!P(a)||this.q.da===j?0:Q(a)?(a=q(a),da(a)?0:a):q(a)};O.Xa=function(a){5>this.q.da&&"boolean"==typeof a&&(a=a?"1":"0");return 7>this.q.da&&!P(a)?"":a+""};O.ah=function(a){return 7<=this.q.da?ha(a):"string"==typeof a?ha(q(a)):ha(a)};O.aj=function(a,b){return 5>this.q.da?a==b?1:0:a==b};
O.add=function(a,b){return Q(a)||Q(b)?this.Xa(a)+this.Xa(b):this.mb(a)+this.mb(b)};})()
})