//server.js
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const { URL } = require('url');

//In-memory "databases" (an arrary of tasks)
let tasks = ['Learn Node.js', 'Build a server', 'Feel the pain of manual parsing'];

const PORT = 3000; 

     //Create the server
     const server = http.createServer((req, res) => {
     //Parse the incoming URL
     const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
     const pathname = parsedUrl.pathname;
     const method = req.method;

     console.log(`${method} request received for: ${pathname}`);

     // ----ROUTE 1: Serve the html frontend---- 
     if (pathname ==='/' && method === 'GET') {
        const filePath = path.join(__dirname, 'Public', 'index.html');

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-type': 'text/plain' });
                res.end('Server error: could not read html file');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data)
        });
        return;
     }

        // ---ROUTE 2: get /api/tasks ---
        if (pathname === '/api/tasks' && method === 'GET') {
            res.writeHead(200, { 'Content-type': 'application/json'});
            res.end(JSON.stringify(tasks));
            return;
        }
        
        // ---ROUTE 3 POST /api/tasks ("The Pain Point") ----
        if (pathname === '/api/tasks' && method === 'POST') {
            let body = '';

            //Because HTTP requests come in "chunks" we must collect them manually
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', () => {
                try {
                    //manually parse the JSON string into an object
                    const parsed = JSON.parse(body);
                    const newTask = parsed.task;

                    if (!newTask) {
                        res.writeHead(400, { 'Content-type': 'application/json'});
                        res.end(JSON.stringify({ error: 'Task is required'}));
                        return;
                    }

                    tasks.push(newTask);
                    console.log(`New tasks added: ${newTask}`);

                    res.writeHead(201, { 'Content-type': 'application/json'});
                    res.end(JSON.stringify({ message: 'Task created', task: newTask}));                    
                } catch (error) {
                    res.writeHead(400, { 'Content-type': 'application/json'});
                    res.end(JSON.stringify({ error: 'Invalid JSON'}));
                }
            });
            return;
        }

        //--- ROUTE 4: 404 Fallback
        res.writeHead(404, { 'Content-type': 'application/json'});
        res.end(JSON.stringify({ error: 'Route not found'}));
     });

     // Start Listening
     server.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
     });
     


