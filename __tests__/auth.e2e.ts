import supertest from "supertest";
import { server } from "../src/server";
import { faker } from "@faker-js/faker";

describe("TRIM API STARTER AUTHENTICATION", () => {
  beforeAll(() => {
    return new Promise((resolve, reject) => {
      server.on("listening", resolve);
    });
  });

  beforeEach(() => {
    server.close();
  });

  afterEach(() => {
    server.close();
  });

  let email = faker.internet.email();

  it("should register user with email and password and return access token", async () => {
    const response = await supertest(server)
      .post("/api/v1/auth/register")
      .send({
        email,
        password: "Test123!",
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });

  it("should login user with email and password and return access token", async () => {
    const response = await supertest(server).post("/api/v1/auth/login").send({
      email,
      password: "Test123!",
    });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });
});
