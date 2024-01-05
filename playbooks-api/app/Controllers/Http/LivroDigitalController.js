"use strict";

const Livro = use("App/Models/Livro");
const LivroDigital = use("App/Models/LivroDigital");
const LivroFisico = use("App/Models/LivroFisico");
const { validate } = use("Validator");
const BadRequestException = use("App/Exceptions/BadRequestException");

const livroDigitalValidador = {
  id_tabela_livro: "required",
  arquivo_pdf: "required",
};

class LivroDigitalController {
  /* INSERÇÃO */

  async store({ request }) {
    try {
      const { isbn, id_tabela_livro, arquivo_pdf } = request;

      const livroDigitalValidado = await validate(
        {
          id_tabela_livro,
          arquivo_pdf,
        },
        livroDigitalValidador
      );

      if (livroDigitalValidado.fails()) {
        throw new BadRequestException(
          "Credenciais de livro digital inválidas.",
          "E_INVALID_CREDENTIAL"
        );
      }

      const livroDigitalExistente = await LivroDigital.query()
        .where({ isbn })
        .orWhere({ id_tabela_livro })
        .first();
      const livroFisicoExistente = await LivroFisico.query()
        .where({ isbn })
        .first();

      if (livroDigitalExistente || livroFisicoExistente) {
        throw new BadRequestException("Livro já cadastrado.", "E_DUPLICATE_KEY");
      }

      const novoLivroDigital = await LivroDigital.create({
        isbn,
        id_tabela_livro,
        arquivo_pdf,
      });

      return {
        message: "Livro digital criado com sucesso!",
        novoLivroDigital,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async show({ request }) {
    try {
      const { id_tabela_livro } = request;

      const livro = await Livro.query().where("id", id_tabela_livro).first();
      if (livro.ativo == 0) return;

      const livroDigital = await LivroDigital.query()
        .where({ id_tabela_livro })
        .first();

      return livroDigital;
    } catch (error) {
      console.log(error);
    }
  }

  async update({ request }) {
    try {
      const { isbn, arquivo_pdf } = request;

      const livroDigitalAtualizado = await LivroDigital.query()
        .where("isbn", isbn)
        .update({ arquivo_pdf });

      if (!livroDigitalAtualizado)
        throw new BadRequestException(
          "E_NOT_UPDATE",
          "Livro Físico não atualizado"
        );

      return {
        message: "Livro físico atualizado com sucesso!",
        livroDigitalAtualizado,
      };
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = LivroDigitalController;
