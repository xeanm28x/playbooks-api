require("./bootstrap");
const test = require("japa");
const supertest = require("supertest");

const LivroModel = use("App/Models/Livro");
const LivroFisicoModel = use("App/Models/LivroFisico");
const LivroDigitalModel = use("App/Models/LivroDigital");
const UsuarioModel = use("App/Models/Usuario");

const userPayLoad = require("./usuario.spec.js");

const LivroFisico = {
  titulo: "Até o verão terminar",
  autor: "Colleen Hover",
  numero_paginas: 334,
  genero: "suspense",
  editora: "playbooks",
  ano_publicacao: 2008,
  isbn: "0123456789012",
  total_disponivel: 1,
  total_emprestado: 0,
  imagem: "https://imagem/capa",
};

const LivroDigital = {
  titulo: "Até o verão terminar",
  autor: "Colleen Hover",
  numero_paginas: 334,
  genero: "suspense",
  editora: "playbooks",
  ano_publicacao: 2010,
  isbn: "0123456789013",
  arquivo_pdf: "https://livro.pdf",
  imagem: "https://imagem/capa",
};

let request;
let token;
let livroID;

test.group("Livros", (group) => {
  group.before(async () => {
    request = supertest.agent(use("Adonis/Src/Server").getInstance());

    const response = await request.post("/login").send(userPayLoad).expect(200);
    token = `${response.body.type} ${response.body.token}`;
  });

  test("Deve Cadastrar um livro físico", async (assert) => {
    const response = await request
      .post("/livros")
      .set("Authorization", token)
      .send(LivroFisico)
      .expect(200);

    assert.equal(LivroFisico.isbn, response.body.novoLivroFisico.isbn);
  });

  test("Deve Cadastrar um livro digital", async (assert) => {
    const response = await request
      .post("/livros")
      .set("Authorization", token)
      .send(LivroDigital)
      .expect(200);

    assert.equal(LivroDigital.isbn, response.body.novoLivroDigital.isbn);
  });

  test("Deve buscar todos os livros", async (assert) => {
    const response = await request
      .get("/livros")
      .set("Authorization", token)
      .expect(200);

    livroID = response.body[0].livro.id;
    assert.exists(response.body[0].livro);
  });

  test("Deve buscar livro por parâmetro", async (assert) => {
    const response = await request
      .get(`/livros?autor=${LivroFisico.autor}`)
      .set("Authorization", token)
      .expect(200);

    assert.exists(response.body[0].livro);
  });

  test("Deve excluir um livro (ativo = 0)", async (assert) => {
    const response = await request
      .delete(`/livros?id=${livroID}`)
      .set("Authorization", token)
      .expect(200);

    assert.equal(response.body.livro.ativo, 0);
  });

  /* TESTANDO CENÁRIOS DE ERROS */

  test("Não Deve Cadastrar qualquer livro, se não passar as credenciais necessárias (autor, por exemplo)", async (assert) => {
    const response = await request
      .post("/livros")
      .set("Authorization", token)
      .send({
        titulo: LivroFisico.titulo,
        numero_paginas: LivroDigital.numero_paginas,
        genero: LivroFisico.genero,
        editora: LivroDigital.editora,
        ano_publicacao: LivroDigital.ano_publicacao,
        isbn: "0123456789010", //isbn tem que ser difente para cada livro
        total_disponivel: LivroFisico.total_disponivel,
        total_emprestado: LivroFisico.total_emprestado,
        imagem: LivroDigital.imagem,
      })
      .expect(204);
  });

  test("Não Deve excluir um livro (ativo = 0), se o ID não existir", async (assert) => {
    const response = await request
      .delete(`/livros?id=-1`)
      .set("Authorization", token)
      .expect(204);

    assert.notExists(response.body.livro);
  });

  group.after(async () => {
    const usuario = await UsuarioModel.query()
      .where("email", userPayLoad.email)
      .first();
    await usuario.delete();

    const livroFisico = await LivroFisicoModel.query()
      .where("isbn", LivroFisico.isbn)
      .first();
    await livroFisico.delete();
    const livroDigital = await LivroDigitalModel.query()
      .where("isbn", LivroDigital.isbn)
      .first();
    await livroDigital.delete();

    const livro = await LivroModel.query()
      .where("id", livroFisico.id_tabela_livro)
      .first();
    await livro.delete();
  });
});
