"use strict";

const Livro = use("App/Models/Livro");
const LivroDigital = use("App/Models/LivroDigital");
const { validate } = use("Validator");
const BadRequestException = use("App/Exceptions/BadRequestException");

const livroDigitalValidador = {
  isbn: "required",
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
          isbn,
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

      const livroExistente = await Livro.findBy("id", id_tabela_livro);

      if (!livroExistente) {
        throw new BadRequestException(
          "Livro não encontrado.",
          "E_BOOK_NOT_FOUND"
        );
      }

      const novoLivroDigital = LivroDigital.create({
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

  async destroy({ request }) {
    try {
      const { id } = request;

      const livro = await LivroDigital.findBy("id_tabela_livro", id);

      const livroDigitalDeletado = await livro.delete();

      return { message: "Livro Digital Excluído", livroDigitalDeletado, livro };
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = LivroDigitalController;
