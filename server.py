from http.server import HTTPServer, SimpleHTTPRequestHandler
import os
import json
from urllib.parse import parse_qs
import cgi

class ImageHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/save-image':
            # Parse the multipart form data
            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={'REQUEST_METHOD': 'POST',
                        'CONTENT_TYPE': self.headers['Content-Type']}
            )

            # Get the file item
            fileitem = form['image']
            
            # Check if a file was uploaded
            if fileitem.filename:
                # Create images directory if it doesn't exist
                if not os.path.exists('images'):
                    os.makedirs('images')
                
                # Save the file
                filepath = os.path.join('images', os.path.basename(fileitem.filename))
                with open(filepath, 'wb') as f:
                    f.write(fileitem.file.read())
                
                # Send success response
                self.send_response(200)
                self.send_header('Content-type', 'text/plain')
                self.end_headers()
                self.wfile.write(b'File saved successfully')
            else:
                self.send_response(400)
                self.send_header('Content-type', 'text/plain')
                self.end_headers()
                self.wfile.write(b'No file received')
            return

        # For all other POST requests
        self.send_response(404)
        self.end_headers()

    def do_GET(self):
        # Handle normal file serving (including images)
        SimpleHTTPRequestHandler.do_GET(self)

def run(server_class=HTTPServer, handler_class=ImageHandler, port=8080):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run() 