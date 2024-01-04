"use strict";

const Livro = use("App/Models/Livro");
const LivroFisico = use("App/Models/LivroFisico");
const { validate } = use("Validator");
const BadRequestException = use("App/Exceptions/BadRequestException");

const livroFisicoValidador = {
  isbn: "required",
  id_tabela_livro: "required",
  total_disponivel: "required"
};

class LivroFisicoController {

  // INSERÇÃO

  async store({ request }) {

    try{

      const { isbn, id_tabela_livro, total_disponivel } = await request.all();

      const livroFisicoValidado = await validate(
        {
          isbn,
          id_tabela_livro,
          total_disponivel,
        },
        livroFisicoValidador
      );

      if (livroFisicoValidado.fails()) {
        throw new BadRequestException(
          "Credenciais de versão física inválidas.",
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
        total_emprestado: 0,
      });

      return {
        message: `Versão física do livro ${livroExistente.titulo} criada com sucesso!`,
        novoLivroFisico,
      };

    }catch(erro){

    }

  }

  // LISTAR UM ÚNICO LIVRO DIGITAL

  async show({ request }){

    try{

      const { isbn, id_tabela_livro } = await request.all();

      const livroFisicoExistente = await LivroFisico.findBy("isbn", isbn);

      if(!livroFisicoExistente){

        throw new BadRequestException(
          "Versão física não encontrada.",
          "E_BOOK_NOT_FOUND"
        );

      }

      const livroCorrespondente = await Livro.findBy("id", id_tabela_livro);

      return{ livroFisicoExistente, livroCorrespondente }

    }catch(erro){

    }

  }

  // EDICAO
  // REQUEST -> DADOS INSERIDOS PARA UPDATE
  // REQUEST.PARAMS -> DADOS ATUAIS DO LIVRO A SER ATUALIZADO

  async update({ request }){

    try{

      const { isbn, id_tabela_livro, total_disponivel, total_emprestado } = await request.all();

      if(params.id_tabela_livro != id_tabela_livro){

        throw new BadRequestException(
          "Não é permitido alterar o livro correspondente a essa versão física.",
          "E_INVALID_OPERATION"
        );

      }

      if(params.total_emprestado != total_emprestado){

        throw new BadRequestException(
          "Não é permitido alterar a quantidade de exemplares emprestados.",
          "E_INVALID_OPERATION"
        );

      }

      const livroFisicoEditado = {

        isbn : isbn,
        id_tabela_livro : params.id_tabela_livro,
        total_disponivel : total_disponivel,
        total_emprestado : params.total_emprestado

      };

      const livroFisicoValidado = await validate(
        livroFisicoEditado,
        livroFisicoValidador
      );

      if(livroFisicoValidado.fails()){

        throw new BadRequestException(
          "Credenciais de livro físico inválidas.",
          "E_INVALID_CREDENTIAL"
        );

      }

      const livroFisicoExistente = await LivroFisico.query()
                                    .where("id", params.id)
                                    .where("id_tabela_livro", params.id_tabela_livro)
                                    .where("isbn", params.isbn)
                                    .fetch();

      if(!livroFisicoExistente){

        throw new BadRequestException(
          "Versão física não encontrada.",
          "E_BOOK_NOT_FOUND"
        );

      }

      if(livroFisicoEditado != livroFisicoExistente){

        livroFisicoExistente.isbn = livroFisicoEditado.isbn;

        livroFisicoExistente.total_disponivel = livroFisicoEditado.total_disponivel;

        await livroFisicoExistente.save();

        return{
          message: "Livro físico atualizado com sucesso!",
          livroFisicoExistente
        }

      }

    }catch(erro){

    }

  }

  // REMOÇÃO

  async destroy({ params }){

    try{

      const livroFisicoExistente = await LivroFisico.findBy("isbn", params.isbn);

      if(!livroFisicoExistente){

        throw new BadRequestException(
          "Versão física não encontrada.",
          "E_BOOK_NOT_FOUND"
        );

      }

      await livroFisicoExistente.delete();

      return{
        message: "Versão física removida com sucesso.",
        livroFisicoExistente
    }

    }catch(erro){

    }

  }

  // BUSCAS

  async index({ response }){

    try{

      const livrosFisicos = await LivroFisico.all();

      return response.status(200).json(livrosFisicos);

    }catch(erro){

    }

  }

  async findByCampo(campo, valor) {

    try{

      return await LivroFisico.query().where(campo, "LIKE", `%${valor}%`).fetch();

    }catch(erro){

    }

  }

}

module.exports = LivroFisicoController;
