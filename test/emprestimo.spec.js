require("./bootstrap");
const test = require("japa");
const supertest = require("supertest");
const userPayLoad = require("./usuario.spec.js");
const { LivroDigital, LivroFisico } = require("./livro.spec.js");

const LivroModel = use("App/Models/Livro");
const LivroFisicoModel = use("App/Models/LivroFisico");
const LivroDigitalModel = use("App/Models/LivroDigital");
const UsuarioModel = use("App/Models/Usuario");
const EmprestimoModel = use("App/Models/Emprestimo");

let request;
let token;
let usuario;
let livroFisic;
let Emprestimo;

test.group("Empréstimo", (group) => {
  group.before(async () => {
    request = supertest.agent(use("Adonis/Src/Server").getInstance());

    const response = await request.post("/login").send(userPayLoad).expect(200);
    token = `${response.body.type} ${response.body.token}`;

    usuario = await UsuarioModel.query()
      .where("email", userPayLoad.email)
      .first();
    livroFisic = await LivroFisicoModel.query()
      .where("isbn", LivroFisico.isbn)
      .first();

    Emprestimo = { id_usuario: usuario.id, id_livro_fisico: livroFisic.id };
  });

  test("Deve criar um empréstimo", async (assert) => {
    const response = await request
      .post("/emprestimo")
      .set("Authorization", token)
      .send(Emprestimo)
      .expect(200);

    assert.exists(response.body.livro);
    assert.exists(response.body.usuario);
  });

  test("Deve buscar os empréstimos do usuário autenticado", async (assert) => {
    const response = await request
      .get("/emprestimo")
      .set("Authorization", token)
      .expect(200);

    assert.exists(response.body.emprestimo);
    assert.exists(response.body.livro);
  });

  test("Deve devolver um empréstimo", async (assert) => {
    const response = await request
      .patch("/emprestimo")
      .set("Authorization", token)
      .send(Emprestimo)
      .expect(200);

    assert.exists(response.body.livroDevolvido);
  });

  group.after(async () => {
    const emprestimo = await EmprestimoModel.query()
      .where("id_usuario", Emprestimo.id_usuario)
      .where("id_livro_fisico", Emprestimo.id_livro_fisico)
      .first();
    await emprestimo.delete();

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
