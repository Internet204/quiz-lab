from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse
import os
import webbrowser

parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int, default=int(os.environ.get('PORT', '8766')))
parser.add_argument('--host', default=os.environ.get('HOST', '127.0.0.1'))
parser.add_argument('--open', action='store_true')
args = parser.parse_args()
root = Path(__file__).resolve().parent / 'dist'
class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, '.mjs': 'text/javascript'}
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(root), **kw)
server = ThreadingHTTPServer((args.host, args.port), Handler)
url = f'http://127.0.0.1:{args.port}'
print(f'Local quiz: {url}\nPress Ctrl+C to stop.', flush=True)
if args.open:
    webbrowser.open(url)
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()

