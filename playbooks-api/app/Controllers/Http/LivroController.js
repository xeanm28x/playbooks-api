"use strict";

const Livro = use("App/Models/Livro");
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

class LivroController {
  /* INSERÇÃO */

  async store({ request }) {
    const { titulo, autor, genero, numero_paginas, editora, ano_publicacao } =
      await request.all();

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

    return {
      message: "Livro criado com sucesso!",
      novoLivro,
    };
  }

  /* LISTAGEM ÚNICA */

  async show({ request }) {
    const {
      id,
      titulo,
      autor,
      genero,
      numero_paginas,
      editora,
      ano_publicacao,
    } = await request.all();
    return await this.findBook({
      id,
      titulo,
      autor,
      genero,
      numero_paginas,
      editora,
      ano_publicacao,
    });
  }

  /* REMOÇÃO */

  async destroy({ params }) {
    const livro = await Livro.findBy("id", params.id);

    if (!livro) {
      throw new BadRequestException(
        "Livro não encontrado.",
        "E_BOOK_NOT_FOUND"
      );
    }

    await LivroFisicoController.destroy(params);

    await LivroDigitalController.destroy(params);

    return {
      message: "Livro excluído com sucesso.",
      livro,
    };
  }

  /* BUSCAS */

  async findByCampo(campo, valor) {
    return await Livro.query().where(campo, "LIKE", `%${valor}%`).fetch();
  }

  async findBook(params) {
    if (params.id) return this.findByCampo("id", params.id);
    if (params.titulo) return this.findByCampo("titulo", params.titulo);
    if (params.autor) return this.findByCampo("autor", params.autor);
    if (params.genero) return this.findByCampo("genero", params.genero);
    if (params.ano_publicacao)
      return this.findByCampo("ano_publicacao", params.ano_publicacao);
    if (params.editora) return this.findByCampo("editora", params.editora);
    if (params.numero_paginas)
      return this.findByCampo("numero_paginas", params.numero_paginas);

    return await Livro.all();
  }
}

module.exports = LivroController;
