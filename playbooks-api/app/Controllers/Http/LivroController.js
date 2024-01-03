"use strict";

const Livro = use("App/Models/Livro");
const LivroFisico = use("App/Models/LivroFisico");
const LivroDigital = use("App/Models/LivroDigital");
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

  // CRIAÇÃO
  // !! ADMIN

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

  // LISTAGEM DE UM ÚNICO LIVRO

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

  // REMOÇÃO
  // !! ADMIN

  async destroy({ params }) {

    try{

      const livro = await Livro.findBy("id", params.id);

      if (!livro) {
        throw new BadRequestException(
          "Livro não encontrado.",
          "E_BOOK_NOT_FOUND"
        );
      }

      // ANTES DE REMOVER, PRECISA VERIFICAR SE EXISTE
      // EM FORMATO FISICO OU DIGITAL, MAS NAO PELA PROVA
      // REAL E, SIM, PORQUE UM LIVRO NAO NECESSARIAMENTE
      // POSSUI SUA VERSAO DIGITAL E FISICA AO MESMO TEMPO

      const livroFisicoCorrespondente = await LivroFisico.findBy("id_tabela_livro", params.id);

      if(livroFisicoCorrespondente) await livroFisicoCorrespondente.delete();

      const livroDigitalCorrespondente = await LivroDigital.findBy("id_tabela_livro", params.id);

      if(livroDigitalCorrespondente) await livroDigitalCorrespondente.delete();

      return {
        message: "Livro excluído com sucesso.",
        livro,
      };

    }catch(erro){

    }

  }

  // BUSCAS

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
