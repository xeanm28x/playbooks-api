"use strict";

const Livro = use("App/Models/Livro");
const LivroDigital = use("App/Models/LivroDigital");
const { validate } = use("Validator");
const BadRequestException = use("App/Exceptions/BadRequestException");

const livroDigitalValidador = {
  isbn: "required",
  id_tabela_livro: "required",
  url_firebase: "required"
};

class LivroDigitalController{

  // INSERÇÃO

  async store({ request }){

    try{

      const {isbn, id_tabela_livro, url_firebase} = await request.all();

      const livroDigitalValidado = await validate(
          {
            isbn,
            id_tabela_livro,
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

      const livroExistente = await Livro.findBy('id', id_tabela_livro);

      if(!livroExistente){
        throw new BadRequestException(
          "Livro não encontrado.",
          "E_BOOK_NOT_FOUND"
        );
      }

      const novoLivroDigital = await LivroDigital.create({
          isbn,
          id_tabela_livro,
          url_firebase
      });

      return {
          message : `Versão e-book do livro ${livroExistente.titulo} criada com sucesso!`,
          novoLivroDigital
      }

    }catch(erro){

    }

}

// LISTAR UM ÚNICO LIVRO DIGITAL

async show({ request }){

  try{

    const { isbn, id_tabela_livro } = await request.all();

    const livroDigitalExistente = await LivroDigital.findBy("isbn", isbn);

    if(!livroDigitalExistente){

      throw new BadRequestException(
        "Versão digital não encontrada.",
        "E_EBOOK_NOT_FOUND"
      );

    }

    const livroCorrespondente = await Livro.findBy("id", id_tabela_livro);

    return{ livroDigitalExistente, livroCorrespondente }

  }catch(erro){

  }

}

// EDICAO
// REQUEST -> DADOS INSERIDOS PARA UPDATE
// REQUEST.PARAMS -> DADOS ATUAIS DO LIVRO A SER ATUALIZADO

async update({ request, params }){

  try{

    const {id, isbn, id_tabela_livro, url_firebase} = await request.all();

    if(params.id_tabela_livro != id_tabela_livro){

      throw new BadRequestException(
        "Não é permitido alterar o livro correspondente a essa versão digital.",
        "E_INVALID_OPERATION"
      );

    }

    const livroDigitalEditado = {

      isbn : isbn,
      id_tabela_livro : params.id_tabela_livro,
      url_firebase : url_firebase

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
                                  .where("id", params.id)
                                  .where("id_tabela_livro", params.id_tabela_livro)
                                  .where("isbn", params.isbn)
                                  .fetch();

    if(!livroDigitalExistente){

      throw new BadRequestException(
        "Versão digital não encontrada.",
        "E_EBOOK_NOT_FOUND"
      );

    }

    if(livroDigitalEditado.isbn != livroDigitalExistente.isbn || livroDigitalEditado.url_firebase != livroDigitalExistente.url_firebase){

      livroDigitalExistente.isbn = livroDigitalEditado.isbn;

      livroDigitalExistente.total_disponivel = livroDigitalEditado.total_disponivel;

      await livroDigitalExistente.save();

      return{
        message: "E-book atualizado com sucesso!",
        livroDigitalExistente
      }

    }

  }catch(erro){

  }

}

// REMOÇÃO

async destroy({ params }){

  try{

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

  }catch(erro){

  }

}

// BUSCAS

async index({ response }){

  try{

    const livrosDigitais = await LivroDigital.all();

    return response.status(200).json(livrosDigitais);

  }catch(erro){

  }

}

async findByCampo(campo, valor) {

  try{

    return await LivroDigital.query().where(campo, "LIKE", `%${valor}%`).fetch();

  }catch(erro){

  }

}

// BAIXAR E-BOOK

async downloadEbook({ request }){

  try{

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

  }catch(erro){

  }

}

}

module.exports = LivroDigitalController;
