/**************************************************************
 * JavaScript FileUploader
 * @version v1.1.0
 *
 * @description
 * The way to use this plugin is as follows:
 * 	1. Creates a div where the image will be previewed
 *	2. Initialize fileUploader plugin: $(div).fileUploader();
 * 
 * @see https://github.com/lcapps-es/jquery-fileuploader
 * @author LCApps
 * 
 * Copyright (c) 2017 - Licensed MIT
 **************************************************************/


/**
 * FileUploader Globals.
 */
var FileUploader = {
	/**
	 * Constant Types.
	 */
	Types: {
		IMAGE: "image/*",
		VIDEO: "video/*"
	},

	/**
	 * Onchange Methods.
	 */
	OnChange: {

		/**
		 * Onchange's Image method.
		 */
		changeImage: function( el ) {
			var id = $(el).attr('id');

			// Gets file
			var f = FileUploader.Files.getFile( id );

			// Gets File Orientation.
			FileUploader.Image.getOrientation( f, function( orientation ) {

				var file = new FileReader();
				file.readAsDataURL( f );
				file.onload = function( ev ) {
					// changeCanvas to show image.
					FileUploader.Image.changeCanvas( ev, el, orientation );
				}

			});
		},

		/**
		 * Onchange's Video Method.
		 */
		changeVideo: function( el ) {
			var id = $(el).attr('id');
			var canvas = $(el).prev();

			// Gets file
			var f = FileUploader.Files.getFile( id );

			// prepare fileURL
			var URL = window.URL || window.webkitURL;
			var fileURL = URL.createObjectURL(f)

			// Appends URL to video canvas.
			canvas.attr('src', fileURL);
		}
	},

	/**
	 * Files Methods.
	 */
	Files: {

		/**
		 * Get file loaded.
		 */
		getFile: function( inputId ){
			// Includes galleryCamera plugin compatibility.
			if( navigator !== undefined && navigator.galleryCamera !== undefined ) {
				return navigator.galleryCamera.getFile( inputId );
			}else{
				if( document.getElementById( inputId ) !== undefined && document.getElementById( inputId ) !== null ){
					return document.getElementById( inputId ).files[0];
				}

				return null;
			}
		},
	},

	/**
	 * Image Methods.
	 */
	Image: {

		/**
		 * Resize Image into canvas.
		 */
		resizeImage: function( image, canvas ){
			var fullHeight = canvas.height;
			var fullWidth = canvas.width;

			// gets ratio between width & height.
			var diff = image.width / image.height;

			if( image.height > image.width ){
				// height will be max canvas size, width variable.
				var height = fullHeight;
				var width = height * diff;
			}else{
				// width will be max canvas size, height variable.
				var width = fullWidth;
				var height = width / diff;
			}

			var x = ((canvas.width - width) / 2);
			var y = ((canvas.height - height) / 2);

			// print image into canvas.
			var ctx = canvas.getContext("2d");
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(image, x, y, width, height);
		},


		/**
		 * Change canvas drawing image.
		 */
		changeCanvas: function( ev, el, orientation ) {
			var canvasId = $(el).prev().attr('id');

			// Revert every image transformation.
			$('#'+canvasId).css({
				'transform': '',
			});

			// load image.
			var image = new Image();
			image.src = ev.target.result;
			image.onload = function() {
				// get canvas size.
				var canvas = document.getElementById( canvasId );
				FileUploader.Image.resizeImage( image, canvas );
				
				// rotate image if needed.
				FileUploader.Image.rotate( canvasId, orientation );

				$(el).parent().attr('data-changed', 1);
			}
		},

		/**
		 * Get orientation from Exif.
		 */
		getOrientation: function ( f, callback ) {

			var file = new FileReader();
			file.readAsArrayBuffer( f );
			file.onload = function( e ) {
				var view = new DataView(e.target.result);
				if (view.getUint16(0, false) != 0xFFD8) return callback(-2);
				var length = view.byteLength, offset = 2;
				while (offset < length) {
					var marker = view.getUint16(offset, false);
					offset += 2;
					if (marker == 0xFFE1) {
						if (view.getUint32(offset += 2, false) != 0x45786966) return callback(-1);
						var little = view.getUint16(offset += 6, false) == 0x4949;
						offset += view.getUint32(offset + 4, little);
						var tags = view.getUint16(offset, little);
						offset += 2;
						for (var i = 0; i < tags; i++)
							if (view.getUint16(offset + (i * 12), little) == 0x0112)
								return callback(view.getUint16(offset + (i * 12) + 8, little));
					}
					else if ((marker & 0xFF00) != 0xFF00) break;
					else offset += view.getUint16(offset, false);
				}
				return callback(-1);
			}
		},

		/**
		 * Rotate images if needed.
		 */
		rotate: function( canvasId, orientation ){
			if( orientation > 0 && orientation < 9 ){
				// flip if needed
				var flip = "";
				if( orientation == 2){
					$('#'+canvasId).css({
						'transform': 'scaleX(-1)',
					});
				}else if( orientation == 5 || orientation == 7 || orientation == 4 ){
					flip = ' scaleX(-1)';
				}
				// rotate.
				if( orientation == 5 || orientation == 6 ){
					$('#'+canvasId).css({
						'transform': 'rotate(90deg)'+flip,
					});
				}else if( orientation == 3 || orientation == 4 ){
					$('#'+canvasId).css({
						'transform': 'rotate(180deg)'+flip,
					});
				}else if( orientation == 7 || orientation == 8 ){
					$('#'+canvasId).css({
						'transform': 'rotate(-90deg)'+flip,
					});
				}
			}
		}
	}
};


;(function ($) {

	/**
	 * FileUploader Internals
	 */
	var __FileUploader = {

		/**
		 * Options Attributes and Methods
		 */
		Options: {
			allowedOptions: [ // Allowed Option's Keys.
				"defaultImage",
				"readonly",
				"fileType",
				"extraTrigger",
				"autoplay",
				"nocontrols"
			],

			/**
			 * This method validate input options.
			 */
			validateOptions: function( options ) {
				// Options must be an object.
				if( typeof options === 'object' ) {
					var keys = Object.keys( options ); // Get option's keys.
				
					// Check options.
					keys.forEach( function( el ){
						if (__FileUploader.Options.allowedOptions.indexOf( el ) === -1 ){
							throw Error( 'invalid param: '+el );
						}
					});
				}else{
					throw Error( 'invalid params' );
				}
			},

			/**
			 * This method process options.
			 */
			processOptions: function( options ) {
				__FileUploader.Options.validateOptions( options );

				// FileChooserType: IMAGES BY DEFAULT FOR NOW.
				if( options.fileType === undefined ){
					options.fileType = FileUploader.Types.IMAGE;
				}

				// with nocontrols, autoplay must be enabled.
				if( options.nocontrols === 1 || options.nocontrols === true ){
					options.autoplay = 1;
				}

				// with autplay option, fileType must be VIDEO.
				if( options.autoplay === 1 || options.autoplay === true ){
					options.fileType = FileUploader.Types.VIDEO;
				}

				return options;
			}
		},

		/**
		 * Makers Methods.
		 */
		Makers: {

			/**
			 * Image Makers.
			 */
			ImageMakers: {
				/**
				 * Creates Image Canvas.
				 */
				createCanvas: function( id, width, height, options ) {
					return $('<canvas id="canvas_'+id+'" width="'+width+'" height="'+height+'"></canvas>');
				},

				/**
				 * Gets onchange image name.
				 */
				getChangeName: function(){
					return 'changeImage';
				}
			},

			/**
			 * Video Makers.
			 */
			VideoMakers: {
				/**
				 * Creates Video Canvas.
				 */
				createCanvas: function( id, width, height, options ) {
					var videoParams = '';
					if( options.autoplay && ( options.autoplay == 1 || options.autoplay == true ) ){
						videoParams += 'autoplay ';
					}

					if( options.nocontrols !== 1 && options.nocontrols !== true ){
						videoParams += 'controls ';
					}

					return $('<video ' + videoParams + ' id="canvas_'+id+'" width="'+width+'" height="'+height+'"></video>');
				},

				/**
				 * Gets onchange video name.
				 */
				getChangeName: function(){
					return 'changeVideo';
				}
			},

			/**
			 * Adapter Method
			 */
			Adapter: {
				get: function( options ){
					if( options.fileType === FileUploader.Types.IMAGE ){
						return __FileUploader.Makers.ImageMakers;
					}else if( options.fileType === FileUploader.Types.VIDEO ){
						return __FileUploader.Makers.VideoMakers;
					}else{
						throw Error( 'unimplemented option' );
					}
				}
			},

			/**
			 * Appends needed elements into div.
			 */
			appendElements: function( el, options ) {
				// Gets div info.
				var width = $(el).width();
				var height = $(el).height();
				var id = $(el).attr('id');

				var maker = __FileUploader.Makers.Adapter.get( options );
		
				// Append canvas.
				var canvas = maker.createCanvas( id, width, height, options );
				$(el).append( canvas );
		
				// Only accept's custom fileType.
				var fileType = ( options.fileType !== null ) ? ' accept="'+options.fileType+'" '  : "";
		
				// Append input file.
				var inputFile = $('<input onchange="FileUploader.OnChange.'+maker.getChangeName()+'(this)" id="file_'+id+'" type="file" style="display:none" '+fileType+'/>');
				$(el).append( inputFile );
			},

			/**
			 * Creates canvas click event.
			 */
			addClickEvents: function( el, options ) {
				var id = $(el).attr('id');
		
				// if readonly option isn't enable.
				if( options.readonly !== 1 && options.readonly !== true ){

					$( '#canvas_'+id ).click(function(){
						$( '#file_'+id ).trigger('click');
					});

				}

				// appends other trigger.
				if( options.extraTrigger !== undefined && options.extraTrigger !== null ){
					if( $( options.extraTrigger ).length > 0 ){
						$( options.extraTrigger ).click(function(){
							$( '#file_'+id ).trigger('click');
						});
					}
				}
			},

			/**
			 * Onchange's file method.
			 */
			change: function( el ) {
				var id = $(el).attr('id');

				// Get file
				var f = FileUploader.Files.getFile( id );

				__FileUploader.Makers.setCanvasFromFile( el, f );
				
			},

			setCanvasFromFile( el, f ) {
				// Get File Orientation.
				FileUploader.Image.getOrientation( f, function( orientation ) {

					var file = new FileReader();
					file.readAsDataURL( f );
					file.onload = function( ev ) {
						// changeCanvas to show image.
						FileUploader.Image.changeCanvas( ev, el, orientation );
					}

				});
			},

			/**
			 * Set's default image.
			 */
			setDefaultImage: function( el, options ) {
				if( options.defaultImage !== undefined && options.defaultImage !== null ){

					var id = $(el).attr('id');
					var canvasId = 'canvas_'+id;

					var img = new Image();
					img.src = options.defaultImage;
					img.onload = function( ev ){
						var canvas = document.getElementById( canvasId );
						FileUploader.Image.resizeImage( img, canvas );
					}

				}
			}
		},

		/**
		 * Main Method. Add elements into div.
		 */
		load: function( el, options ) {
			if( $(el).data('loaded') === undefined || $(el).data('loaded') === null ) {

				$(el).attr('data-loaded', 1);

				__FileUploader.Makers.appendElements( el, options );
				__FileUploader.Makers.addClickEvents( el, options );
	
				__FileUploader.Makers.setDefaultImage( el, options );
			}
		}
	};

	/**
	 * FileUploader Main Method.
	 * 
	 * @param {} options 
	 */
	function fileUploader( options ) {
		var options = ( options === undefined ) ? {} : options;

		var __options = __FileUploader.Options.processOptions( options )
		this.each(function(){
			__FileUploader.load( this, __options );
		});

		// FUNCTIONS
		this.getFile = getFile;
		this.loadFrom = loadFrom;
		this.fill = fill;



		return this;
	}

	function getFile() {
		var id = $(this).attr('id');

		return FileUploader.Files.getFile( 'file_' + id );
	}

	function loadFrom( fileUploader ) {
		var id = $(this).attr('id');

		var el = document.getElementById( 'file_' + id );
		var from = $( fileUploader );

		var f = FileUploader.Files.getFile( 'file_' + $(from).attr('id') );

		__FileUploader.Makers.setCanvasFromFile( el, f );
	}

	function fill( fileUploader ) {
		var id = $(this).attr('id');

		var to = $( fileUploader );
		var el = document.getElementById( 'file_' + $(to).attr('id') );

		var f = FileUploader.Files.getFile( 'file_' + id );

		__FileUploader.Makers.setCanvasFromFile( el, f );
	}

	// jQuery Extension
	$.fn.fileUploader = fileUploader;


}(window.jQuery));