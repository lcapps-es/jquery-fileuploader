/**
 * JavaScript FileUploader Class.
 * 
 * The way to use this plugin is as follows:
 * 	1. Creates a div where the image will be previewed
 *	2. Initialize fileUploader plugin: $(div).fileUploader();
 * 
 * @example $(div).fileUploader();
 * @author Luis Miguel Martín
 */

'use strict';

/**
 * jQuery fileUploader extension.
 */
$.fn.extend({
	fileUploader: function( options ){
		// fileUploader Options.
		var options = ( options === undefined ) ? {} : options;
		FileUploader.Options.processOptions( options );

		// for each element, load fileUploader elements.
		this.each(function(){
			FileUploader.load( this );
		});
	}

});

/**
 * FileUploader Methods.
 */
var FileUploader = {
	/**
	 * Attributes.
	 */
	allowedOptions: [ // Allowed Option's Keys.
		"defaultImage"
	],

	fileType: null, // fileChooser's fileType.
	
	defaultImage: null, // default image to load.

	/**
	 * Methods.
	 */

	/**
	 * Main Method. Add elements into div.
	 */
	load: function( el ) {
		FileUploader.Makers.appendElements( el );
		FileUploader.Makers.addClickEvents( el );

		FileUploader.Makers.setDefaultImage( el );
	},

	/**
	 * Options Methods.
	 */
	Options: {

		/**
		 * This method validate input options.
		 */
		validateOptions: function( options ) {
			// Options must be an object.
			if( typeof options === 'object' ) {
				var keys = Object.keys( options ); // Get option's keys.
				
				// Check options.
				keys.forEach( function( el ){
					if (FileUploader.allowedOptions.indexOf( el ) === -1 ){
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
			FileUploader.Options.validateOptions( options );

			// FileChooserType: ONLY IMAGES FOR NOW.
			FileUploader.fileType = "image/*";

			// Default Image.
			if( options.defaultImage !== undefined ){
				FileUploader.defaultImage = options.defaultImage;
			}
		}

	},

	/**
	 * Makers Methods.
	 */
	Makers: {

		/**
		 * Appends needed elements into div.
		 */
		appendElements: function( el ) {
			// Gets div info.
			var width = $(el).width();
			var height = $(el).height();
			var id = $(el).attr('id');
	
			// Append canvas.
			var canvas = $('<canvas id="canvas_'+id+'" width="'+width+'" height="'+height+'"></canvas>');
			$(el).append( canvas );
	
			// Only accept's custom fileType.
			var fileType = ( FileUploader.fileType !== null ) ? ' accept="'+FileUploader.fileType+'" '  : "";
	
			// Append input file.
			var inputFile = $('<input onchange="FileUploader.Makers.change(this)" id="file_'+id+'" type="file" style="display:none" '+fileType+'/>');
			$(el).append( inputFile );
	
		},

		/**
		 * Creates canvas click event.
		 */
		addClickEvents: function( el ) {
			var id = $(el).attr('id');
	
			$( '#canvas_'+id ).click(function(){
				$( '#file_'+id ).trigger('click');
			});
		},

		/**
		 * Onchange's file method.
		 */
		change: function( el ) {
			var id = $(el).attr('id');

			// Get file
			var f = FileUploader.Files.getFile( id );

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
		setDefaultImage: function( el ) {
			if( FileUploader.defaultImage !== null ){

				var id = $(el).attr('id');
				var canvasId = 'canvas_'+id;

				var img = new Image();
				img.src = FileUploader.defaultImage;
				img.onload = function( ev ){
					var canvas = document.getElementById( canvasId );
					FileUploader.Image.resizeImage( img, canvas );
				}

			}
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
				return document.getElementById( inputId ).files[0];
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
}
