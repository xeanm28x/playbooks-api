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

  async store({ request }) {

    try{

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

      if(numero_paginas == 0){
        throw new BadRequestException(
          "O número de páginas não pode ser 0.",
          "E_INVALID_NUMBER_PAGES"
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

    }catch(erro){

    }

  }

  // LISTAGEM DE UM ÚNICO LIVRO

  async show({ request }) {

    try{

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

    }catch(erro){

    }

  }

  // EDIÇÃO
  // REQUEST -> DADOS INSERIDOS PARA UPDATE
  // REQUEST.PARAMS -> DADOS ATUAIS DO LIVRO A SER ATUALIZADO

  async update({ request, params }){

    try{

      const { titulo, autor, numero_paginas, editora, genero, ano_publicacao} = await request.all();

      const livroEditado = {

        id: params.id,
        titulo: titulo,
        autor: autor,
        numero_paginas: numero_paginas,
        editora: editora,
        genero: genero,
        ano_publicacao: ano_publicacao

      }

      const livroValidado = await validate({
        livroEditado,
        livroValidador
      });

      if(livroValidado.fails()){

        throw new BadRequestException(
          "Credenciais de livro físico inválidas.",
          "E_INVALID_CREDENTIAL"
        );

      }

      const livroExistente = await Livro.findBy("id", params.id);

      if(!livroExistente){

        throw new BadRequestException(
          "Livro não encontrado.",
          "BOOK_NOT_FOUND"
        );

      }

      if(livroEditado != livroExistente){

        livroExistente.titulo = livroEditado.titulo;
        livroExistente.autor = livroEditado.autor;
        livroExistente.numero_paginas = livroEditado.numero_paginas;
        livroExistente.editora = livroEditado.editora;
        livroExistente.genero = livroEditado.genero;
        livroExistente.ano_publicacao = livroEditado.ano_publicacao;

        await livroExistente.save();

        return{
          message: "Livro atualizado com sucesso!",
          livroExistente
        }

      }

    }catch(erro){

    }

  }

  // REMOÇÃO

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

    try{

      return await Livro.query().where(campo, "LIKE", `%${valor}%`).fetch();

    }catch(erro){

    }

  }

  async findBook(params) {

    try{

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

    }catch(erro){

    }

  }

}

module.exports = LivroController;
