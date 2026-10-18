import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { cp, mkdtemp, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import type { TodoDto, TodoPage } from "../../src/features/todos/contracts/todo";

// A scratch project gives these tests their own Workers runtime and D1 database.
// Neither the developer's local DB nor a remote database is used.
let directory = "";
let origin = "";
let server: ReturnType<typeof Bun.spawn> | undefined;
let logs: Promise<string> | undefined;
async function request(path = "", method = "GET", body?: unknown) {
  const options: RequestInit = { method };
  if (body !== undefined) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(body);
  }
  return fetch(`${origin}/api/todos${path}`, options);
}
async function create(title: string): Promise<TodoDto> {
  const response = await request("", "POST", { title });
  expect(response.status).toBe(201);
  return response.json();
}
async function list(query = ""): Promise<TodoPage> {
  const response = await request(query);
  expect(response.status).toBe(200);
  return response.json();
}

beforeAll(async () => {
  directory = await mkdtemp(join(tmpdir(), "void-todo-integration-"));
  for (const file of ["src", "vite.config.ts", "void.config.ts", "tsconfig.json", "package.json"]) {
    await cp(resolve(file), join(directory, file), { recursive: true });
  }
  await symlink(resolve("node_modules"), join(directory, "node_modules"), "dir");
  const reservation = Bun.serve({ port: 0, hostname: "127.0.0.1", fetch: () => new Response() });
  const port = reservation.port;
  reservation.stop(true);
  origin = `http://127.0.0.1:${port}`;
  server = Bun.spawn(
    [process.execPath, "run", "dev", "--host", "127.0.0.1", "--port", String(port), "--strictPort"],
    {
      cwd: directory,
      stdout: "pipe",
      stderr: "pipe",
    },
  );
  logs = Promise.all([new Response(server.stdout).text(), new Response(server.stderr).text()]).then(
    (parts) => parts.join("\n"),
  );
  const deadline = Date.now() + 55000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`Dev server stopped: ${await logs}`);
    try {
      if ((await request()).ok) return;
    } catch {
      /* Wait until Workers is ready. */
    }
    await Bun.sleep(300);
  }
  server.kill();
  await server.exited;
  throw new Error(`Dev server did not become ready: ${await logs}`);
}, 60000);

afterAll(async () => {
  if (server) {
    server.kill();
    await server.exited;
  }
  if (directory) await rm(directory, { recursive: true, force: true });
});

describe("Todo API → service → repository → real D1", () => {
  test("CRUD, validation, pagination, and SSR", async () => {
    expect((await list()).total).toBe(0);
    const todo = await create("  買い物 <script>bad()</script>  ");
    expect(todo.title).toBe("買い物 <script>bad()</script>");
    expect(todo.completed).toBe(false);
    expect(Number.isNaN(Date.parse(todo.createdAt))).toBe(false);
    expect(Object.keys(todo).sort()).toEqual([
      "completed",
      "createdAt",
      "id",
      "title",
      "updatedAt",
    ]);

    const patch = await request(`/${todo.id}`, "PATCH", { title: "更新済み", completed: true });
    expect(patch.status).toBe(200);
    const updated: TodoDto = await patch.json();
    expect(updated.completed).toBe(true);
    expect(updated.createdAt).toBe(todo.createdAt);
    expect(Date.parse(updated.updatedAt)).toBeGreaterThanOrEqual(Date.parse(todo.updatedAt));
    expect((await list("?status=completed")).items.map((row) => row.id)).toEqual([todo.id]);
    expect((await list("?status=active")).total).toBe(0);

    for (const body of [
      { title: " " },
      { title: "a".repeat(201) },
      { title: "valid", completed: true },
    ]) {
      const response = await request("", "POST", body);
      expect(response.status).toBe(400);
      expect(await response.json()).toHaveProperty("error");
    }
    for (const body of [{}, { completed: "true" }, { id: 2 }, { title: " " }]) {
      expect((await request(`/${todo.id}`, "PATCH", body)).status).toBe(400);
    }
    const malformed = await fetch(`${origin}/api/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    });
    expect(malformed.status).toBe(400);
    expect((await request("/0", "DELETE")).status).toBe(400);
    expect((await request("?status=bad")).status).toBe(400);
    expect((await request("?page=0")).status).toBe(400);
    const missing = await request("/999999", "PATCH", { completed: true });
    expect(missing.status).toBe(404);
    expect(await missing.json()).toEqual({ error: expect.any(String), code: "TODO_NOT_FOUND" });

    for (let i = 0; i < 22; i++) await create(`task-${i}`);
    const firstPage = await list();
    expect(firstPage.total).toBe(23);
    expect(firstPage.items).toHaveLength(20);
    expect(firstPage.activeCount).toBe(22);
    expect(firstPage.items[0]?.title).toBe("task-21");
    const secondPage = await list("?page=2");
    expect(secondPage.items).toHaveLength(3);
    expect(new Set([...firstPage.items, ...secondPage.items].map((row) => row.id)).size).toBe(23);
    expect((await list("?page=100")).page).toBe(2);

    const html = await (await fetch(`${origin}/?status=completed`)).text();
    expect(html).toContain("今日のやること");
    expect(html).toContain("更新済み");
    expect(html).toContain('lang="ja"');
    const unsafe = await create("<script>alert(1)</script>");
    const escapedHtml = await (await fetch(origin)).text();
    expect(escapedHtml).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(escapedHtml).not.toContain("<script>alert(1)</script>");
    expect((await request(`/${unsafe.id}`, "DELETE")).status).toBe(204);

    const removed = await request(`/${todo.id}`, "DELETE");
    expect(removed.status).toBe(204);
    expect(await removed.text()).toBe("");
    expect((await request(`/${todo.id}`, "DELETE")).status).toBe(404);
    expect((await list("?status=completed")).total).toBe(0);
  }, 60000);
});
