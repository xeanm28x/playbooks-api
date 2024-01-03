"use strict";

const Livro = use("App/Models/Livro");
const LivroFisico = use("App/Models/LivroFisico");
const { validate } = use("Validator");
const BadRequestException = use("App/Exceptions/BadRequestException");

const livroFisicoValidador = {
  isbn: "required",
  id_livro: "required",
  total_disponivel: "required"
};

class LivroFisicoController {

  // INSERÇÃO
  // !! ADMIN

  async store({ request }) {

    const { isbn, id_livro, total_disponivel } = await request.all();

    const livroFisicoValidado = await validate(
      {
        isbn,
        id_livro,
        total_disponivel,
      },
      livroFisicoValidador
    );

    if (livroFisicoValidado.fails()) {
      throw new BadRequestException(
        "Credenciais de livro físico inválidas.",
        "E_INVALID_CREDENTIAL"
      );
    }

    const livroExistente = await Livro.findBy("id", id_livro);

    if (!livroExistente) {
      throw new BadRequestException(
        "Livro não encontrado.",
        "E_BOOK_NOT_FOUND"
      );
    }

    const novoLivroFisico = await LivroFisico.create({
      isbn,
      id_livro,
      total_disponivel,
      total_emprestado: 0,
    });

    return {
      message: `Versão física do livro ${livroExistente.titulo} criada com sucesso!`,
      novoLivroFisico,
    };
  }

  // LISTAR UM ÚNICO LIVRO DIGITAL

  async show({ request }){

    const { isbn, id_livro } = await request.all();

    const livroFisicoExistente = await LivroFisico.findBy("isbn", isbn);

    if(!livroFisicoExistente){

      throw new BadRequestException(
        "Versão física não encontrada.",
        "E_BOOK_NOT_FOUND"
      );

    }

    const livroCorrespondente = await Livro.findBy("id", id_livro);

    return{ livroFisicoExistente, livroCorrespondente }

  }

  // EDICAO
  // !! ADMIN

  async update({ request, params }){

    const {id, isbn, id_livro, total_emprestado} = await request.all();

    const livroFisicoEditado = {

      isbn : params.isbn,
      id_livro : id_livro,
      total_disponivel : params.total_disponivel,
      total_emprestado : total_emprestado

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
                                  .where("id", id)
                                  .where("id_tabela_livro", id_livro)
                                  .where("isbn", isbn)
                                  .fetch();

    if(!livroFisicoExistente){

      throw new BadRequestException(
        "Versão física não encontrada.",
        "E_BOOK_NOT_FOUND"
      );

    }

    livroFisicoExistente.isbn = livroFisicoEditado.isbn;
    livroFisicoExistente.total_disponivel = livroFisicoEditado.total_disponivel;

    await livroFisicoExistente.save();

    return{
      message: "Livro físico atualizado com sucesso!",
      livroFisicoExistente
    }

  }

  // REMOÇÃO
  // !! ADMIN

  async destroy({ params }){

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

  }

  // BUSCAS

  async index({ response }){

    const livrosFisicos = await LivroFisico.all();

    return response.status(200).json(livrosFisicos);

  }

  async findByCampo(campo, valor) {
    return await LivroFisico.query().where(campo, "LIKE", `%${valor}%`).fetch();
  }

}

module.exports = LivroFisicoController;
