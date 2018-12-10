const http = require('http');
const url = require('url');
const fs = require('fs');
const util = require('util');
const querystring = require('querystring');

let mimetype = {
    'txt': 'text/plain',
    'html': 'text/html',
    'css': 'text/css',
    'xml': 'application/xml',
    'json': 'application/json',
    'js': 'application/javascript',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'png': 'image/png',
    'svg': 'image/svg+xml'
};

let page_404 = function (req, res, path) {
    res.writeHead(404, {
        'Content-Type': 'text/html'
    });
    res.write('<!doctype html>\n');
    res.write('<title>404 Not Found</title>\n');
    res.write('<h1>Not Found</h1>');
    res.write(
        '<p>The requested URL ' +
        path +
        ' was not found on this server.</p>'
    );
    res.end();
};

let page_500 = function (req, res, error) {

    res.writeHead(500, {
        'Content-Type': 'text/html'
    });
    res.write('<!doctype html>\n');
    res.write('<title>Internal Server Error</title>\n');
    res.write('<h1>Internal Server Error</h1>');
    res.write('<pre>' + util.inspect(error) + '</pre>');
};


http.createServer(function (req, res) {

    let pathname = url.parse(req.url).pathname;
    let realPath = __dirname + "/static" + pathname;
    let _callback = querystring.parse(url.parse(req.url).query).callback;

    console.log(_callback, res.write.bind(res))

    fs.exists(realPath, function (exists) {
        if (!exists) {
            return page_404(req, res, pathname);
        } else {
            let file = fs.createReadStream(realPath);

            res.writeHead(200, {
                'Content-Type': mimetype[realPath.split('.').pop()] || 'text/plain'
            });

            if (_callback) {
                file.on('data', function (data) {
                    res.end(_callback + '(' + data.toString() + ')')
                });
            } else {
                file.on('data', res.write.bind(res));
            }

            file.on('close', res.end.bind(res));
            file.on('error', function (err) {
                return page_500(req, res, err);
            });
        }
    });
}).listen(1337);

console.log('Server running at http://127.0.0.1:1337/');
