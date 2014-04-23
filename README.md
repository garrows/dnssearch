DnsSearch
=========

Node.js command line tool to quickly search available DNS names.

Install
----

```bash
npm install -g dnssearch
```

> With [node](http://nodejs.org) installed.

Usage
-----

```bash
dnssearch zombo
```

Options
----

```
Usage: index [options] <domain>

Options:

  -h, --help          output usage information
  -L, --nolog         Do not log to a file
  -t, --tlds <items>  Comma seperated list of TLDS to search
  -v, --verbose       Verbose mode
```


Tips
----

Your DNS server might give you a lot of errors. Feel free to _abort_ anytime with CTRL+C and it will print out what it has so far. 
