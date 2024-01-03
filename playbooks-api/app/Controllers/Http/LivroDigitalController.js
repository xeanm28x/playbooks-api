"use strict";

const Livro = use("App/Models/Livro");
const LivroDigital = use("App/Models/LivroDigital");
const { validate } = use("Validator");
const BadRequestException = use("App/Exceptions/BadRequestException");

const livroDigitalValidador = {
  isbn: "required",
  id_livro: "required",
  url_firebase: "required"
};

class LivroDigitalController{

  // INSERÇÃO
  // !! ADMIN

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
            "Credenciais de e-book inválidas.",
            "E_INVALID_CREDENTIAL"
        );
    }

    // VERIFICANDO SE EXISTE O LIVRO REQUISITADO

    const livroExistente = await Livro.findBy('id', id_livro);

    if(!livroExistente){
      throw new BadRequestException(
        "Livro não encontrado.",
        "E_BOOK_NOT_FOUND"
      );
    }

    const novoLivroDigital = await LivroDigital.create({
        isbn,
        id_livro,
        url_firebase
    });

    return {
        message : `Versão e-book do livro ${livroExistente.titulo} criada com sucesso!`,
        novoLivroDigital
    }

}

// LISTAR UM ÚNICO LIVRO DIGITAL

async show({ request }){

  const { isbn, id_livro } = await request.all();

  const livroDigitalExistente = await LivroDigital.findBy("isbn", isbn);

  if(!livroDigitalExistente){

    throw new BadRequestException(
      "Versão digital não encontrada.",
      "E_EBOOK_NOT_FOUND"
    );

  }

  const livroCorrespondente = await Livro.findBy("id", id_livro);

  return{ livroDigitalExistente, livroCorrespondente }

}

// EDICAO
// !! ADMIN

async update({ request, params }){

  const {id, isbn, id_livro} = await request.all();

  const livroDigitalEditado = {

    isbn : params.isbn,
    id_livro : id_livro,
    url_firebase : params.url_firebase

  };

  const livroDigitalValidado = await validate(
    livroDigitalEditado,
    livroDigitalValidador
  );

  if(livroDigitalValidado.fails()){

    throw new BadRequestException(
      "Credenciais de e-book inválidas.",
      "E_INVALID_CREDENTIAL"
    );

  }

  const livroDigitalExistente = await LivroDigital.query()
                                .where("id", id)
                                .where("id_tabela_livro", id_livro)
                                .where("isbn", isbn)
                                .fetch();

  if(!livroDigitalExistente){

    throw new BadRequestException(
      "Versão digital não encontrada.",
      "E_EBOOK_NOT_FOUND"
    );

  }

  livroDigitalExistente.isbn = livroDigitalEditado.isbn;
  livroDigitalExistente.url_firebase = livroDigitalEditado.url_firebase;

  await livroDigitalExistente.save();

  return{
    message: "E-book atualizado com sucesso!",
    livroDigitalExistente
  }

}

// REMOÇÃO
// !! ADMIN

async destroy({ params }){

  const livroDigitalExistente = await LivroDigital.findBy("isbn", params.isbn);

  if(!livroDigitalExistente){

    throw new BadRequestException(
      "Versão digital não encontrada.",
      "E_EBOOK_NOT_FOUND"
    );

  }

  await livroDigitalExistente.delete();

  return{
    message: "Versão digital removida com sucesso.",
    livroDigitalExistente
  }

}

// BUSCAS

async index({ response }){

  const livrosDigitais = await LivroDigital.all();

  return response.status(200).json(livrosDigitais);

}

async findByCampo(campo, valor) {
  return await LivroDigital.query().where(campo, "LIKE", `%${valor}%`).fetch();
}

// BAIXAR E-BOOK

async downloadEbook({ request }){

  const {id, isbn, url_firebase} = await request.all();

  const livroDigitalExistente = await LivroDigital.query()
                                .where("id", id)
                                .where("isbn", isbn)
                                .fetch();

  if(!livroDigitalExistente){

    throw new BadRequestException(
      "Versão digital não encontrada.",
      "E_EBOOK_NOT_FOUND"
    );

  }

  // TO DO: DOWNLOAD URL

}

}

module.exports = LivroDigitalController;
