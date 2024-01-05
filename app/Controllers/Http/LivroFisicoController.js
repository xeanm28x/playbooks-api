"use strict";

const LivroFisico = use("App/Models/LivroFisico");
const LivroDigital = use("App/Models/LivroDigital");
const { validate } = use("Validator");
const BadRequestException = use("App/Exceptions/BadRequestException");

const livroFisicoValidador = {
  id_tabela_livro: "required",
  total_disponivel: "required",
  total_emprestado: "required",
};

class LivroFisicoController {
  /* INSERÇÃO */
  async store({ request }) {
    try {
      const { isbn, id_tabela_livro, total_disponivel, total_emprestado } =
        request;

      const livroFisicoValidado = await validate(
        {
          isbn,
          id_tabela_livro,
          total_disponivel,
          total_emprestado,
        },
        livroFisicoValidador
      );

      if (livroFisicoValidado.fails()) {
        throw new BadRequestException(
          "Credenciais de livro físico inválidas.",
          "E_INVALID_CREDENTIAL"
        );
      }

      const livroDigitalExistente = await LivroDigital.query()
        .where({ isbn })
        .first();
      const livroFisicoExistente = await LivroFisico.query()
        .where({ isbn })
        .orWhere({id_tabela_livro})
        .first();

      if (livroDigitalExistente || livroFisicoExistente) {
        throw new BadRequestException("ISBN já cadastrado.", "E_DUPLICATE_KEY");
      }

      const novoLivroFisico = await LivroFisico.create({
        isbn,
        id_tabela_livro,
        total_disponivel,
        total_emprestado,
      });

      return {
        message: "Livro físico criado com sucesso!",
        novoLivroFisico,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async show({ request }) {
    try {
      const { id_tabela_livro } = request;

      const livroFisico = await LivroFisico.query()
        .where({ id_tabela_livro })
        .first();

      return livroFisico;
    } catch (error) {
      console.log(error);
    }
  }

  async update({ request }) {
    try {
      const { isbn, total_disponivel, total_emprestado } = request;

      const livroFisicoAtualizado = await LivroFisico.query()
        .where("isbn", isbn)
        .update({
          total_disponivel,
          total_emprestado,
        });

      if (!livroFisicoAtualizado)
        throw new BadRequestException(
          "E_NOT_UPDATE",
          "Livro Físico não atualizado"
        );

      return {
        message: "Livro físico atualizado com sucesso!",
        livroFisicoAtualizado,
      };
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = LivroFisicoController;
