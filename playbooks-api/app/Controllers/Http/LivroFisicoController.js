"use strict";

const Livro = use("App/Models/Livro");
const LivroFisico = use("App/Models/LivroFisico");
const { validate } = use("Validator");
const BadRequestException = use("App/Exceptions/BadRequestException");

const livroFisicoValidador = {
  isbn: "required",
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

      const livroExistente = await Livro.findBy("id", id_tabela_livro);

      if (!livroExistente) {
        throw new BadRequestException(
          "Livro não encontrado.",
          "E_BOOK_NOT_FOUND"
        );
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

  async destroy({ request }) {
    try {
      const { id } = request;

      const livro = await LivroFisico.findBy("id_tabela_livro", id);

      const livroFisicoDeletado = await livro.delete();

      return { message: "Livro Físico Excluído", livroFisicoDeletado, livro };
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = LivroFisicoController;
