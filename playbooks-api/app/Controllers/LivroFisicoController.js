"use strict";

const Livro = require("App/Models/Livro");
const LivroFisico = require("App/Models/LivroFisico");
const { validate } = use("Validator");
const BadRequestException = use("App/Exceptions/BadRequestException");

const livroFisicoValidador = {
  isbn: "required",
  livro: "required",
  total_disponivel: "required"
};

class LivroFisicoController{

  /* INSERÇÃO */

  async store({ request }){

    const {isbn, id_livro, total_disponivel} = await request.all();

    const livroFisicoValidado = await validate(
        {
          isbn,
          id_livro,
          total_disponivel
        },
        livroFisicoValidador
    );

    if (livroFisicoValidado.fails()) {
        throw new BadRequestException(
            "Credenciais de livro físico inválidas.",
            "E_INVALID_CREDENTIAL"
        );
    }

    const livroExistente = await Livro.findBy('id', id_livro);

    if(!livroExistente){
      throw new BadRequestException(
        "Livro não encontrado.",
        "E_BOOK_NOT_FOUND"
      );
    }

    const novoLivroFisico = LivroFisico.create({
        isbn,
        id_livro,
        total_disponivel,
        total_emprestado : 0
    });

    return {
        message : "Livro físico criado com sucesso!",
        novoLivroFisico
    }

  }

}

module.exports = LivroFisicoController;
