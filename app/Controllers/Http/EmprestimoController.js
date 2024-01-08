"use strict";

const Emprestimo = use("App/Models/Emprestimo");
const Usuario = use("App/Models/Usuario");
const Livro = use("App/Models/Livro");
const LivroFisico = use("App/Models/LivroFisico");
const LivroFisicoController = use("App/Controllers/Http/LivroFisicoController");
const BadRequestException = use("App/Exceptions/BadRequestException");

const { hoje, calcularDevolucao } = use("App/Helpers/Emprestimo");

class EmprestimoController {
  async store({ request }) {
    try {
      const { id_usuario, id_livro_fisico } = await request.all();

      if (!id_usuario || !id_livro_fisico)
        throw new BadRequestException(
          "E_INVALID_CREDENCIAL",
          "Credenciais inválidas para fazer um empréstimo!"
        );

      const livroFisico = await LivroFisico.query()
        .where("id", id_livro_fisico)
        .first();

      if (!livroFisico)
        throw new BadRequestException(
          "E_BOOK_NOT_FOUND",
          "Livro não encontrado para fazer o empréstimo"
        );

      if (livroFisico.total_disponivel <= 0)
        return "Todos os exemplares desse livro, já foram emprestados!";

      const emprestimoExistente = await Emprestimo.query()
        .where({ id_usuario })
        .first();
      if (emprestimoExistente && !emprestimoExistente.data_devolucao) {
        return "Só pode pegar 1 livro por vez!";
      }

      const livro = await Livro.query()
        .where("id", livroFisico.id_tabela_livro)
        .first();

      const data_prevista_devolucao = await calcularDevolucao(livro);

      await Emprestimo.create({
        id_usuario,
        id_livro_fisico,
        data_prevista_devolucao,
      });

      await new LivroFisicoController().update({
        request: {
          isbn: livroFisico.isbn,
          total_disponivel: livroFisico.total_disponivel - 1,
          total_emprestado: livroFisico.total_emprestado + 1,
        },
      });

      let usuario = await Usuario.query().where("id", id_usuario).first();
      usuario.total_emprestimos_realizados += 1;
      await usuario.save();
      usuario = await Usuario.find(usuario.id);

      return {
        message: "Empréstimo Feito com Sucesso",
        livro,
        usuario,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async show({ auth }) {
    try {
      const usuario = await auth.getUser();

      const emprestimo = await Emprestimo.query()
        .where("id_usuario", usuario.id)
        .first();

      if (!emprestimo || emprestimo.data_devolucao)
        return { message: "Sem empréstimos" };

      const livroFisicoEmprestado = await LivroFisico.query()
        .where("id", emprestimo.id_livro_fisico)
        .first();
      const livro = await Livro.query()
        .where("id", livroFisicoEmprestado.id_tabela_livro)
        .first();

      return { message: "Empréstimos encontrados: ", emprestimo, livro };
    } catch (error) {
      console.log(error);
    }
  }

  async devolver({ request }) {
    try {
      const { id_livro_fisico } = await request.all();

      const emprestimo = await Emprestimo.query()
        .where({ id_livro_fisico, data_devolucao: null })
        .first();

      if (emprestimo) {
        const livroFisico = await LivroFisico.query()
          .where("id", id_livro_fisico)
          .first();
        if (!livroFisico)
          throw new BadRequestException(
            "E_BOOK_NOT_FOUND",
            "Livro não encontrado para atualizar"
          );

        await new LivroFisicoController().update({
          request: {
            isbn: livroFisico.isbn,
            total_disponivel: livroFisico.total_disponivel + 1,
            total_emprestado: livroFisico.total_emprestado - 1,
          },
        });

        const data_devolucao = hoje;
        const livroDevolvido = await Emprestimo.query()
          .where("id_livro_fisico", id_livro_fisico)
          .first();
        await Emprestimo.query()
          .where("id_livro_fisico", id_livro_fisico)
          .update({ data_devolucao });

        return { message: "Livro devolvido: ", livroDevolvido };
      }

      return "Sem livros para devolver";
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = EmprestimoController;
