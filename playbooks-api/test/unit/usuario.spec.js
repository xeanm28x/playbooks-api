"use strict";

const { test, trait, before } = use("Test/Suite")("Usuarios");
const Usuario = use("App/Models/Usuario");

trait("Test/ApiClient");
trait("DatabaseTransactions");

const userTester = {
  nome: "Tester",
  sobrenome: "Da Silva",
  email: "tester@playbook.com",
  senha: "playbooks",
  avatar: "https://tester.com/image",
};

let token = "";

test("Deve Criar um usuário", async ({ client }) => {
  await cadastrar(client, userTester, 200);
});

test("Deve fazer login do usuário criado", async ({ client }) => {
  await cadastrar(client, userTester, 200);

  //testa o login depois de criar
  await login(client, userTester, 200);
});

test("Deve mostrar as informações de perfil do usuário", async ({ client }) => {
  //cria o usuário primeiro
  await cadastrar(client, userTester, 200);
  //faz o login depois de criar o usuário
  await login(client, userTester, 200);

  //testa mostrar o perfil do usuário, após testar o login
  const profileResponse = await client
    .get("/usuarios")
    .header("Authorization", token)
    .end();
  profileResponse.assertStatus(200);
});

const userError = {
  nome: "Tester",
  sobrenome: "Da Silva",
  email: "testerplaybook.com",
  senha: "playbooks",
  avatar: "https://tester.com/image",
};

test("Não Deve Criar um usuário, por causa de crendeciais inválidas", async ({
  client,
}) => {
  await cadastrar(client, userError, 400);
});

test("Não Deve fazer login do usuário criado, por causa de credenciais inválidas", async ({
  client,
}) => {
  await cadastrar(client, userTester, 200);

  //testa o login depois de criar
  await login(client, userError, 400);
});

test("Não Deve mostrar as informações de perfil do usuário, por não estar logado", async ({
  client,
}) => {
  //cria o usuário primeiro
  await cadastrar(client, userTester, 200);
  //faz o login depois de criar o usuário
  await login(client, userError, 400);

  //testa mostrar o perfil do usuário, após testar o login
  const profileResponse = await client
    .get("/usuarios")
    .header("Authorization", token)
    .end();
  profileResponse.assertStatus(401);
});

async function cadastrar(client, user, resultadoEsperado) {
  const response = await client.post("/usuarios").send(user).end();
  return response.assertStatus(resultadoEsperado);
}

async function login(client, user, resultadoEsperado) {
  const loginResponse = await client.post("/login").send(user).end();
  loginResponse.assertStatus(resultadoEsperado);

  token = `${loginResponse.body.type} ${loginResponse.body.token}`;

  return token;
}

module.exports = { cadastrar, login };
