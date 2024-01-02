"use strict";

const Livro = use("App/Models/Livro");
const LivroFisicoModel = use("App/Models/LivroFisico");
const LivroFisicoController = use("App/Controllers/Http/LivroFisicoController");
const LivroDigitalController = use(
  "App/Controllers/Http/LivroDigitalController"
);
const { validate } = use("Validator");
const BadRequestException = use("App/Exceptions/BadRequestException");

const livroValidador = {
  titulo: "required",
  autor: "required",
  genero: "required",
  numero_paginas: "required",
  editora: "required",
  ano_publicacao: "required",
};

let deleteResponse;

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
        },
        livroValidador
      );

      if (livroValidado.fails()) {
        throw new BadRequestException(
          "Credenciais de livro inválidas.",
          "E_INVALID_CREDENTIAL"
        );
      }

      const novoLivro = await Livro.create({
        titulo,
        autor,
        genero,
        numero_paginas,
        editora,
        ano_publicacao,
      });
      const id_tabela_livro = novoLivro.id;

      const controller = await this.escolherTipoDoLivro(arquivo_pdf);
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
      return await this.buscarLivro({
        id,
        titulo,
        autor,
        genero,
        numero_paginas,
        editora,
        ano_publicacao,
      });
    } catch (error) {
      console.log(error);
    }
  }

  /* REMOÇÃO */

  async destroy({ request }) {
    try {
      const { id } = await request.all();
      const livro = await Livro.findBy({ id });

      if (!livro) {
        throw new BadRequestException(
          "Livro não encontrado.",
          "E_BOOK_NOT_FOUND"
        );
      }

      const livroFisico = await LivroFisicoModel.findBy("id_tabela_livro", id);
      if (livroFisico) {
        deleteResponse = await new LivroFisicoController().destroy({
          request: {
            id,
          },
        });
      } else {
        deleteResponse = await new LivroDigitalController().destroy({
          request: {
            id,
          },
        });
      }

      await livro.delete();

      return deleteResponse;
    } catch (error) {
      console.log(error);
    }
  }

  /* BUSCAS */

  async buscarPorCampo(campo, valor) {
    return await Livro.query().where(campo, "LIKE", `%${valor}%`).fetch();
  }

  async buscarLivro(params) {
    if (params.id) return this.buscarPorCampo("id", params.id);
    if (params.titulo) return this.buscarPorCampo("titulo", params.titulo);
    if (params.autor) return this.buscarPorCampo("autor", params.autor);
    if (params.genero) return this.buscarPorCampo("genero", params.genero);
    if (params.ano_publicacao)
      return this.buscarPorCampo("ano_publicacao", params.ano_publicacao);
    if (params.editora) return this.buscarPorCampo("editora", params.editora);
    if (params.numero_paginas)
      return this.buscarPorCampo("numero_paginas", params.numero_paginas);

    return await Livro.all();
  }

  async escolherTipoDoLivro(arquivo_pdf) {
    if (arquivo_pdf) return new LivroDigitalController();
    return new LivroFisicoController();
  }
}

module.exports = LivroController;
