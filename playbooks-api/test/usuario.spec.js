require("./bootstrap");
const test = require("japa");
const supertest = require("supertest");

const UsuarioModel = use("App/Models/Usuario");

const userPayLoad = {
  nome: "Tester",
  sobrenome: "Do QA",
  email: "tester@playbooks.com",
  senha: "playbooks",
  avatar: "https://imagem.com/tester",
};

let request;
let token;

test.group("Usuários", (group) => {
  group.before(async () => {
    request = supertest.agent(use("Adonis/Src/Server").getInstance());
  });
  test("Deve Criar um usuário", async (assert) => {
    const response = await request
      .post("/usuarios")
      .send(userPayLoad)
      .expect(200);

    assert.equal(userPayLoad.email, response.body.userCreated.email);
  });

  test("Deve fazer login de um usuário", async (assert) => {
    const response = await request.post("/login").send(userPayLoad).expect(200);
    token = `${response.body.type} ${response.body.token}`;

    assert.exists(response.body.token);
  });

  test("Deve mostrar o perfil do usuário, após o login", async (assert) => {
    const response = await request
      .get("/usuarios")
      .set("Authorization", token)
      .expect(200);
    assert.exists(response.body.nome);
    assert.equal(response.body.nome, userPayLoad.nome);
  });

  /* TESTANDO CENÁRIOS DE ERROS */

  test("Não Deve Criar um usuário, por credenciais inválidas (email, por exemplo)", async (assert) => {
    const response = await request
      .post("/usuarios")
      .send({
        nome: userPayLoad.nome,
        sobrenome: userPayLoad.sobrenome,
        email: "testerdoqa.com",
        senha: userPayLoad.senha,
        avatar: userPayLoad.avatar,
      })
      .expect(400);

    assert.notExists(response.body.userCreated);
  });

  test("Não deve fazer login de um usuário, com credenciais inválidas (email, por exemplo)", async (assert) => {
    const response = await request
      .post("/login")
      .send({
        nome: userPayLoad.nome,
        sobrenome: userPayLoad.sobrenome,
        email: "testerdoqa.com",
        senha: userPayLoad.senha,
        avatar: userPayLoad.avatar,
      })
      .expect(400);
    token = `${response.body.type} ${response.body.token}`;

    assert.notExists(response.body.token);
  });

  test("Não Deve mostrar o perfil do usuário, após a falha do login... (Sem token válido)", async (assert) => {
    const response = await request
      .get("/usuarios")
      .set("Authorization", token)
      .expect(401);
    assert.notExists(response.body.nome);
  });
});

module.exports = userPayLoad;
