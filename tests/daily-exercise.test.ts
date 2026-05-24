import test from "node:test";
import assert from "node:assert";

// Set environment variables before importing the route handler
process.env.GEMINI_API_KEY = "mocked-gemini-key";
process.env.CRON_SECRET = "mocked-cron-secret";

// Import dependencies to mock
import { prisma } from "../src/lib/prisma";
import { GoogleGenAI } from "@google/genai";

// 1. Mock GoogleGenAI models.generateContentInternal method on prototype via direct assignment
const dummyAI = new GoogleGenAI({ apiKey: "mocked-key" });
const modelsProto = Object.getPrototypeOf(dummyAI.models);
modelsProto.generateContentInternal = async () => {
  return {
    text: JSON.stringify({
      title: "Invertir un Árbol Binario",
      description: "Escribe una función en TypeScript para invertir un árbol binario de búsqueda."
    })
  };
};

// 2. Mock Prisma client methods via direct assignment
prisma.column.findFirst = (async () => {
  return {
    id: "column-todo-id",
    name: "To Do",
    position: 0,
    boardId: "board-123",
    createdAt: new Date(),
    updatedAt: new Date()
  };
}) as any;

prisma.task.findFirst = (async () => {
  return {
    id: "last-task-id",
    title: "🎯 Ejercicio Diario: Invertir cadena",
    description: "Mock",
    position: 5,
    columnId: "column-todo-id",
    createdAt: new Date(),
    updatedAt: new Date()
  };
}) as any;

// We keep track of database inserts to assert them
const createdTasks: any[] = [];
prisma.task.create = (async (args: any) => {
  const createdTask = {
    id: "new-task-uuid",
    title: args.data.title,
    description: args.data.description,
    columnId: args.data.columnId,
    position: args.data.position,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  createdTasks.push(createdTask);
  return createdTask;
}) as any;

// Import the API route handler AFTER environment variables and mocks are set up
import { POST } from "../src/app/api/cron/daily-exercise/route";

test("Daily Exercise API Route - Success Flow", async () => {
  // Create mock Request
  const request = new Request("http://localhost:3000/api/cron/daily-exercise", {
    method: "POST",
    headers: {
      "Authorization": "Bearer mocked-cron-secret"
    }
  });

  // Execute route handler
  const response = await POST(request);
  const json = await response.json();

  // Assert response status and structure
  assert.strictEqual(response.status, 200);
  assert.strictEqual(json.success, true);
  assert.strictEqual(json.task.title, "🎯 Ejercicio Diario: Invertir un Árbol Binario");

  // Assert database insert was called with expected parameters
  assert.strictEqual(createdTasks.length, 1);
  assert.strictEqual(createdTasks[0].title, "🎯 Ejercicio Diario: Invertir un Árbol Binario");
  assert.strictEqual(createdTasks[0].description, "Escribe una función en TypeScript para invertir un árbol binario de búsqueda.");
  assert.strictEqual(createdTasks[0].columnId, "column-todo-id");
  assert.strictEqual(createdTasks[0].position, 6); // 5 (highest task position) + 1
});

test("Daily Exercise API Route - Unauthenticated request fails", async () => {
  const request = new Request("http://localhost:3000/api/cron/daily-exercise", {
    method: "POST",
    headers: {
      "Authorization": "Bearer wrong-secret"
    }
  });

  const response = await POST(request);
  assert.strictEqual(response.status, 401);
});
