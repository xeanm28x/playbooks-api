"use strict";

const { test, trait, beforeEach } = use("Test/Suite")("Usuarios");
const Usuario = use("App/Models/Usuario");

trait("Test/ApiClient");
trait("DatabaseTransactions");

const userTester = {
  nome: "Tester",
  email: "tester@playbooks.com",
  senha: "playbooks",
  telefone: "67901234567",
  avatar: "https://tester.com/image",
};

let token = "";

test("Deve Criar um usuário", async ({ assert, client }) => {
  const response = await client.post("/usuarios").send(userTester).end();
  response.assertStatus(200);

  const usuario = await Usuario.findBy("email", userTester.email);
  assert.equal(usuario.nome, userTester.nome);
});

test("Deve fazer login do usuário criado", async ({ client }) => {
  //cria o usuário primeiro
  const createdResponse = await client.post("/usuarios").send(userTester).end();
  createdResponse.assertStatus(200);

  //testa o login depois de criar
  const loginResponse = await client.post("/login").send(userTester).end();
  loginResponse.assertStatus(200);
});

test("Deve mostrar as informações de perfil do usuário", async ({ client }) => {
  //cria o usuário primeiro
  const createdResponse = await client.post("/usuarios").send(userTester).end();
  createdResponse.assertStatus(200);

  //faz o login depois de criar o usuário
  const loginResponse = await client.post("/login").send(userTester).end();
  loginResponse.assertStatus(200);

  token = `${loginResponse.body.type} ${loginResponse.body.token}`;

  //testa mostrar o perfil do usuário, após testar o login
  const profileResponse = await client
    .get("/usuarios")
    .header("Authorization", token)
    .end();
  profileResponse.assertStatus(200);
});
