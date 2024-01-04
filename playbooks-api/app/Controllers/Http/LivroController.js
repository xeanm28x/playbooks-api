"use strict";

const Livro = use("App/Models/Livro");

const { buscarLivro, escolherController, listarLivros } =
  use("App/Helpers/Livro");

const { validate, rule } = use("Validator");
const BadRequestException = use("App/Exceptions/BadRequestException");

const livroValidador = {
  titulo: "required",
  autor: "required",
  genero: "required",
  numero_paginas: "required",
  editora: "required",
  ano_publicacao: "required",
  isbn: [rule("required"), rule("min", 13), rule("max", 13)],
};

class LivroController {
  /* INSERÇÃO */

  async store({ request }) {
    try {
      const {
        titulo,
        autor,
        genero,
        numero_paginas,
        editora,
        ano_publicacao,
        arquivo_pdf,
        isbn,
        total_disponivel,
        total_emprestado,
      } = await request.all();

      const livroValidado = await validate(
        {
          titulo,
          autor,
          genero,
          numero_paginas,
          editora,
          ano_publicacao,
          isbn,
        },
        livroValidador
      );

      if (livroValidado.fails()) {
        throw new BadRequestException(
          "Credenciais de livro inválidas.",
          "E_INVALID_CREDENTIAL"
        );
      }

      const livroExistente = await Livro.query()
        .where({ titulo, autor })
        .first();

      let id_tabela_livro;
      if (!livroExistente) {
        const novoLivro = await Livro.create({
          titulo,
          autor,
          genero,
          numero_paginas,
          editora,
          ano_publicacao,
          ativo: 1,
        });
        id_tabela_livro = novoLivro.id;
      } else id_tabela_livro = livroExistente.id;

      const controller = await escolherController(arquivo_pdf);
      const controllerResponse = await controller.store({
        request: {
          titulo,
          autor,
          genero,
          numero_paginas,
          editora,
          ano_publicacao,
          arquivo_pdf,
          isbn,
          total_disponivel,
          total_emprestado,
          id_tabela_livro,
        },
      });
      return controllerResponse;
    } catch (error) {
      console.log(error);
    }
  }

  /* LISTAGEM ÚNICA */

  async show({ request }) {
    try {
      const {
        id,
        titulo,
        autor,
        genero,
        numero_paginas,
        editora,
        ano_publicacao,
      } = await request.all();

      let livrosRetornados;
      livrosRetornados = await buscarLivro({
        id,
        titulo,
        autor,
        genero,
        numero_paginas,
        editora,
        ano_publicacao,
      });

      if (!livrosRetornados) {
        const livro = await Livro.all();
        livrosRetornados = await listarLivros(livro.rows);
      }
      return livrosRetornados;
    } catch (error) {
      console.log(error);
    }
  }

  /* UPDATE */

  async update({ request }) {
    try {
      const {
        titulo,
        autor,
        genero,
        numero_paginas,
        editora,
        ano_publicacao,
        arquivo_pdf,
        isbn,
        total_disponivel,
        total_emprestado,
        id_tabela_livro,
      } = await request.all();

      const controller = await escolherController(arquivo_pdf);
      const controllerResponse = await controller.update({
        request: {
          titulo,
          autor,
          genero,
          numero_paginas,
          editora,
          ano_publicacao,
          arquivo_pdf,
          isbn,
          total_disponivel,
          total_emprestado,
          id_tabela_livro,
        },
      });
      return controllerResponse;
    } catch (error) {
      console.log(error);
    }
  }

  /* REMOÇÃO */

  async destroy({ request }) {
    try {
      const { id } = await request.all();
      let livro = await Livro.query().where({ id }).first();

      if (!livro) {
        throw new BadRequestException(
          "Livro não encontrado.",
          "E_BOOK_NOT_FOUND"
        );
      }

      livro.ativo = 0;
      await livro.save();
      livro = await Livro.find(livro.id);

      return { message: "Livro Excluído", livro };
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = LivroController;
