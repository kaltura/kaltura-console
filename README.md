# Kaltura API Console

This is an implementation of [LucyBot's lucy-console](https://github.com/lucybot/lucy-console)

## Installation

The following will start the server on port 3000

```bash
git clone https://github.com/bobby-brennan/kaltura-console && cd kaltura-console
npm install
node server.js
```

You can also set environment variable KALTURA_CONSOLE_PORT to select a different port
```bash
export KALTURA_CONSOLE_PORT=80
```

## Structure

* `./static/swagger.json`: A Swagger representation of Kaltura's API schema, via [kaltura-spec-converter](https://github.com/bobby-brennan/kaltura-spec-converter)
* `./static/README.md`: A markdown file that controls the console's README section
* `./codegen.js`: Generates sample code that uses Kaltura's client libraries
* `./server.js`: The main entry point of this application
