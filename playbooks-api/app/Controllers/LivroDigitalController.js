"use strict";

const Livro = require("App/Models/Livro");
const LivroDigital = require("App/Models/LivroDigital");
const { validate } = use("Validator");
const BadRequestException = use("App/Exceptions/BadRequestException");

const livroDigitalValidador = {
  isbn: "required",
  livro: "required",
  url_firebase: "required"
};

class LivroDigitalController{

  /* INSERÇÃO */

  async store({ request }){

    const {isbn, id_livro, url_firebase} = await request.all();

    const livroDigitalValidado = await validate(
        {
          isbn,
          id_livro,
          url_firebase
        },
        livroDigitalValidador
    );

    if (livroDigitalValidado.fails()) {
        throw new BadRequestException(
            "Credenciais de livro digital inválidas.",
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

    const novoLivroDigital = LivroDigital.create({
        isbn,
        id_livro,
        url_firebase
    });

    return {
        message : "Livro digital criado com sucesso!",
        novoLivroDigital
    }

}

}

module.exports = LivroDigitalController;
