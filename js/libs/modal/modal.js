define(['jquery', 'mustache', 'form', 'text!templates/modals/inlineedit.html'], function ($, Mustache, FormFactory, inlineEditTpl) {
  var defaultOptions = {
  // inline : {
  // 	from : $(ev.currentTarget),					required. element to inline edit
  //   	model : this.options.model,					required. model to run the update on
  //   	field : 'description',						required. field to update in the model
  // 	value : 'value to prefill with',			defaults to value of element to inline, or its text contents
  //	errordef : string							A block of markup to inflate into the dialog's error handler div for handling of serverside errors.
  //												Edits which could result in any kind of client error should provide this field to avoid having the global error handler called.
  //   	title : 'Edit description',					title for inline edit dialog. Defaults to 'data-inline-title' attribute of 'from' element.
  // 	savetext : 'text for OK button',			default 'Save'
  // 	canceltext : 'text for cancel button'		default 'Cancel'
  // }
  };
  var modal = function (options) {
    var options = $.extend({}, defaultOptions, options),
    	that = this;

    // add overlay
    this.overlay = $('<div>');
    this.overlay.addClass('overlay')
    $('body').append(this.overlay);

    // create container element
    this.el = $('<div>');
    this.el.addClass('modal')
    this.el.css({visibility: 'hidden'});

    // set contents as appropriate
    if (options.content) {
	    this.el.html(options.content);
	} else if (options.inline) {
		var from = $(options.inline.from);
		this.el.html(Mustache.render(inlineEditTpl, {
			title : options.inline.title || from.attr('data-inline-title') || 'Edit field',
			value : $.trim(options.inline.value || from.val() || from.text()),
			errordef : options.inline.errordef || '',
			savetext : options.inline.savetext || 'Save',
			canceltext : options.inline.canceltext || 'Cancel'
		}));
	}

    // append to DOM
    $('body').append(this.el);

    // position onscreen depending on modal type
    if(options.inline) {
      var to = $(".inline-field", this.el),
      	fromTop = from.offset().top,
      	fromLeft = from.offset().left,
      	toTop = this.el.offset().top - to.offset().top,
      	toLeft = this.el.offset().left - to.offset().left;

      to.css({
        width: from.width(),
        height: from.height()
      });

      this.el.css({
        top: fromTop + toTop,
        left: fromLeft + toLeft,
        position: 'absolute'
      });
    } else {
      $(this.el).css({
        'margin-left': -($(this.el).width() / 2) + 'px'
      });
    }

    // bind form controller if one is specified in options
    if (options.form) {
    	this.form = FormFactory.create($(options.form.element, this.el), options.form.model, options.form);
    }
    // otherwise, bind submit event for inline modals
    else if (options.inline && options.inline.model && options.inline.field) {
    	this.form = FormFactory.create($('form.inline-edit', this.el), options.inline.model, $.extend({
    		onPreValidate : function(attribs) {
    			attribs[options.inline.field] = attribs.field;
    			delete attribs.field;

    			if (options.inline.form && options.inline.form.onPreValidate) {
    				attribs = options.inline.form.onPreValidate.call(that.form, attribs);
    			}

    			return attribs;
    		},
    		success : function(model, response, options) {
    			try {
    				from.val(model.get(options.inline.field));
    			} catch(e) {
    				from.text(model.get(options.inline.field));
    			}
    			if (options.inline.form && options.inline.form.success) {
    				options.inline.form.success.call(this, model, response, options);
    			}
    			that.hide();
    		}
    	}, options.inline.form || {}));
    }

    this.el.css({visibility: 'visible'});

  };

  modal.prototype.show = function () {
    this.el.addClass('shown')
  };

  modal.prototype.hide = function (animation) {
    var that = this;
    this.el.fadeOut(200);
    this.overlay.fadeOut(200, function () {

      that.el.remove();
      that.overlay.remove();
      delete that.form;
      delete that;
    });
  };



  var create = function (options) {
    var Modal = new modal(options);
    $('.js-close-modal', Modal.el).on('click', function (){
      Modal.hide();
    });

    $(document).on('keydown', function (ev){
      if(ev.which == 27){

       Modal.hide();
      }
    })
    return Modal;
  };


  return {
    create: create
  };

});

