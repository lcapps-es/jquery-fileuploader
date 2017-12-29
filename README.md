# jquery-fileuploader
jQuery FileUploader Plugin.
https://www.npmjs.com/package/jquery-fileuploader

## Usage
You only need to add the following line to initialize the plugin.

$(div).fileUploader();

## How It Works
This is a simple plugin:

1. Creates a div where the image will be previewed.
2. Initialize fileUploader plugin: $(div).fileUploader();
3. A canvas fill 100% div's area.
4. A hidden input type file will be added.
5. Append onclick event listener in canvas.
6. Onchange event for input file that draw an image into canvas.
7. Rotate canvas reading EXIF data.


## License
```
MIT License

Copyright (c) 2017 Luis Miguel Martín Bardanca

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

```

## To-Do List
* FileUploader Options.
* Modal handler.
* Multi image.
* Video support.
* Cropper.
* Rotate buttons.

(If you have any suggestion please feel free to contact me)

## History of Changes

### v1.0.0
Initial version
