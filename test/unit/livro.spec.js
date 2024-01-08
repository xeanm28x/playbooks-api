const { test, trait } = use("Test/Suite")("TesteLivros");
const { cadastrar, login } = require("./usuario.spec");

trait("Test/ApiClient");

/* LIMPEZA NO BANCO ANTES DO TESTE UNITARIO */

trait("DatabaseTransactions");

const usuario = {
  nome: "Tester",
  sobrenome: "Da Silva",
  email: "tester@play.com",
  senha: "012345678",
  avatar: "https://imag.com",
};

const novoLivro = {
  titulo: "Psicose",
  autor: "Robert Bloch",
  genero: "Horror",
  numero_paginas: 256,
  editora: "Darkside",
  ano_publicacao: 2013,
  isbn: 13,
  total_disponivel: 10,
  total_emprestado: 0,
};

test("deve criar um novo livro", async ({ client }) => {
  await cadastrar(client, usuario, 200);

  const token = await login(client, usuario, 200);

  const resposta = await client
    .post("/livros")
    .header("Authorization", token)
    .send(novoLivro)
    .end();
  resposta.assertStatus(200);
}, 10000);

test("deve buscar todos os livros", async ({ client }) => {
  await cadastrar(client, usuario, 200);

  const token = await login(client, usuario, 200);

  await client
    .post("/livros")
    .header("Authorization", token)
    .send(novoLivro)
    .end();

  const livro = await client
    .get(`/livros`)
    .header("Authorization", token)
    .end();
  livro.assertStatus(200);
}, 10000);

test("deve buscar o livro específico", async ({ client }) => {
  await cadastrar(client, usuario, 200);

  const token = await login(client, usuario, 200);

  await client
    .post("/livros")
    .header("Authorization", token)
    .send(novoLivro)
    .end();

  const livro = await client
    .get(`/livros?titulo=${novoLivro.titulo}`)
    .header("Authorization", token)
    .end();
  livro.assertStatus(200);
}, 10000);

test("deve remover um livro", async ({ client }) => {
  await cadastrar(client, usuario, 200);

  const token = await login(client, usuario, 200);

  await client
    .post("/livros")
    .header("Authorization", token)
    .send(novoLivro)
    .end();

  const { body } = await client
    .get(`/livros?titulo=${novoLivro.titulo}`)
    .header("Authorization", token)
    .end();
  const livroId = body[0].id;

  const resposta = await client
    .delete(`livros?id=${livroId}`)
    .header("Authorization", token)
    .end();
  resposta.assertStatus(200);
}, 10000);
