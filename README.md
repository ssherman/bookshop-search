# Bookshop Search

A command-line tool to search for books on [Bookshop.org](https://bookshop.org) using Puppeteer. The results are output as JSON to standard output.

## Features

- Parses the search results from Bookshop.org.
- Outputs the results as JSON to standard output.
- Debug mode for troubleshooting and development.

## Installation

First, ensure you have Node.js and npm installed. Then, install the package globally:

```sh
npm install -g bookshop-search
bookshop-search "Nineteen Eighty Four by George Orwell"
```

## Usage

### Basic Search
```sh
bookshop-search "Nineteen Eighty Four by George Orwell"
```

### Debug Mode
To enable debug logging and save the raw HTML for inspection:
```sh
DEBUG=1 bookshop-search "Nineteen Eighty Four by George Orwell"
```

When debug mode is enabled, the tool will:
- Log detailed information about the search process
- Save the raw HTML to `debug_output.html` for inspection
- Show information about each book being processed

example output
```json
[
  {
    "title": "Nineteen Eighty-Four: The Definitive Edition",
    "author": "George Orwell",
    "href": "/book/9780648870593"
  },
  {
    "title": "Nineteen Eighty-Four",
    "author": "George Orwell",
    "href": "/book/9780452284234"
  }
]
```

## Disclaimer
This tool is a proof of concept and should not be used in a production environment. It is designed for educational purposes only. According to Bookshop.org's terms of service, the use of robots, spiders, manual, and/or automatic processes, or devices to data-mine, data-crawl, scrape, or index the Website in any manner is prohibited. Use this tool responsibly and at your own risk.