"use strict";

const Hash = use("Hash");
const { rule, validate } = use("Validator");
const Usuario = use("App/Models/Usuario");
const BadRequestException = use("App/Exceptions/BadRequestException");

const UsuarioValidador = {
  nome: "required",
  sobrenome: "required",
  email: "required|email",
  senha: [rule("required"), rule("min", 8)],
};

class UsuarioController {
  async store({ request }) {
    const { nome, sobrenome, email, senha, avatar } = request.all();

    const credencialValidadas = await validate(
      { nome, sobrenome, email, senha },
      UsuarioValidador
    );

    if (credencialValidadas.fails())
      throw new BadRequestException(
        "Credencial Inválida.",
        "E_INVALID_CREDENTIAL"
      );

    const userExists = await Usuario.findBy({ email });
    if (userExists)
      throw new BadRequestException("Usuário já cadastrado.", "E_REPEAT_USER");

    const userCreated = await Usuario.create({
      nome,
      sobrenome,
      email,
      senha,
      avatar,
    });

    return {
      message: `Usuário criado com sucesso!`,
      userCreated,
    };
  }

  async login({ request, auth }) {
    const { email, senha } = request.all();

    const usuario = await Usuario.findBy({ email });
    if (!usuario)
      throw new BadRequestException("Usuário inexistente.", "E_USER_NOT_EXIST");

    const senhaValida = await Hash.verify(senha, usuario.senha);
    if (!senhaValida)
      throw new BadRequestException(
        "E-mail ou senha incorretos!",
        "E_INVALID_CREDENTIAL"
      );

    return auth.generate(usuario);
  }

  async show({ auth }) {
    try {
      const { id, nome, sobrenome, email, avatar } = await auth.getUser();

      return { nome, sobrenome, email, avatar };
    } catch (error) {
      throw new BadRequestException(
        "Credenciais perdidas, faça login novamente.",
        "E_MISSING_CREDENTIALS"
      );
    }
  }
}

module.exports = UsuarioController;
