# beesmall
Resize images on demand.

## Usage
To run as a standalone server, use `$ npm start`.
To use in an already existing server, use
```js
var beesmall = require('beesmall');

/*...*/
besmall.serve(request, response, callback);
```

## Configuration
Configurations can me made in the `conf.js` or by calling ```besmall.setConfig({/*...*/});```


## Todos
* Add image source per image type
* Add logging into file
* Improve cacheinfo script
