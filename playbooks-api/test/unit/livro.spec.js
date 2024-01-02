const { test, trait } = use("Test/Suite")("TesteLivros");
const Livro = use("App/Models/Livro");
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

test("deve criar um novo livro", async ({ assert, client }) => {
  await cadastrar(assert, client, usuario, 200);

  const token = await login(client, usuario, 200);

  const novoLivro = {
    titulo: "Psicose",
    autor: "Robert Bloch",
    genero: "Horror",
    numero_paginas: 256,
    editora: "Darkside",
    ano_publicacao: 2013,
  };

  const resposta = await client
    .post("/livros")
    .header("Authorization", token)
    .send(novoLivro)
    .end();
  resposta.assertStatus(200);
  resposta.assertJSONSubset({
    message: "Livro criado com sucesso!",
  });

  const livroEncontrado = await Livro.findBy("titulo", novoLivro.titulo);
  assert.notEqual(livroEncontrado, null);
});

test("deve remover um livro", async ({ assert, client }) => {
  await cadastrar(assert, client, usuario, 200);

  const token = await login(client, usuario, 200);

  const livro = {
    titulo: "Psicose",
    autor: "Robert Bloch",
    genero: "Horror",
    numero_paginas: 256,
    editora: "Darkside",
    ano_publicacao: 2013,
  };

  const resposta = await client
    .delete("/livros")
    .header("Authorization", token)
    .send(livro)
    .end();
  resposta.assertStatus(200);
});
