import http from "http";
import url from "url";

import { TodoListService } from "./todolist-service.mjs";

const service = new TodoListService();
const server = http.createServer((request, response) => {
  const parsedUrl = url.parse(request.url, true);

  response.setHeader("Content-Type", "application/json");
  if (request.method === "GET") {
    service.getTodoList(request, response);
  }
  if (request.method === "POST") {
    service.createTodo(request, response);
  }
  if (request.method === "PUT") {
    if (parsedUrl.pathname === "/complete") {
      service.completeTodo(request, response);
      return;
    }
    service.updateTodo(request, response);
  }
  if (request.method === "DELETE") {
    service.deleteTodo(request, response);
  }
});

server.listen(3000);
