"use strict";

const Emprestimo = use("App/Models/Emprestimo");
const Usuario = use("App/Models/Usuario");
const Livro = use("App/Models/Livro");
const LivroFisico = use("App/Models/LivroFisico");
const LivroFisicoController = use("App/Controllers/Http/LivroFisicoController");
const BadRequestException = use("App/Exceptions/BadRequestException");

const data = new Date();

class EmprestimoController {
  async store({ request }) {
    try {
      const { id_usuario, id_livro_fisico } = await request.all();

      if (!id_usuario || !id_livro_fisico)
        throw new BadRequestException(
          "E_INVALID_CREDENCIAL",
          "Credenciais inválidas para fazer um empréstimo!"
        );

      const livroFisico = await LivroFisico.findBy("id", id_livro_fisico);

      if (!livroFisico)
        throw new BadRequestException(
          "E_BOOK_NOT_FOUND",
          "Livro não encontrado para fazer o empréstimo"
        );

      if (livroFisico.total_disponivel <= 0)
        return "Todos os exemplares desse livro, já foram emprestados!";

      const emprestimoExistente = await Emprestimo.findBy({ id_usuario });
      if (emprestimoExistente && !emprestimoExistente.data_devolucao) {
        return "Só pode ler 1 livro por vez!";
      }

      const livro = await Livro.findBy("id", livroFisico.id_tabela_livro);

      const data_prevista_devolucao = this.calcularData(livro);

      const emprestimo = await Emprestimo.create({
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

      const usuarioDoEmprestimo = await Usuario.findBy("id", id_usuario);

      return {
        message: "Empréstimo Feito com Sucesso",
        emprestimo,
        usuarioDoEmprestimo,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async show({ auth }) {
    try {
      const usuario = await auth.getUser();

      const emprestimo = await Emprestimo.findBy("id_usuario", usuario.id);
      const livroFisicoEmprestado = await LivroFisico.findBy(
        "id",
        emprestimo.id_livro_fisico
      );
      const livro = await Livro.findBy(
        "id",
        livroFisicoEmprestado.id_tabela_livro
      );

      if (!emprestimo || emprestimo.data_devolucao)
        return { message: "Sem empréstimos" };
      return { message: "Empréstimos encontrados: ", emprestimo, livro };
    } catch (error) {
      console.log(error);
    }
  }

  async devolver({ request }) {
    try {
      const { id_livro_fisico } = await request.all();

      const emprestimo = await Emprestimo.findBy({ id_livro_fisico });
      if (emprestimo.data_devolucao) return "Livro já devolvido!";

      const livroFisico = await LivroFisico.findBy("id", id_livro_fisico);
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

      const data_devolucao = this.pegarHoje();
      const livroDevolvido = await Emprestimo.query()
        .where("id_livro_fisico", id_livro_fisico)
        .update({ data_devolucao });

      return { message: "Livro devolvido: ", livroDevolvido };
    } catch (error) {
      console.log(error);
    }
  }

  calcularData(livro) {
    const dias_para_ler = (livro.numero_paginas / 100) * 7;

    const diaFormatado = (data.getDate() + parseInt(dias_para_ler))
    const mesFormatado = (data.getMonth() + 1).toString().padStart(2, "0");

    return `${data.getFullYear()}-${mesFormatado}-${diaFormatado}`;
  }

  pegarHoje() {
    const diaFormatado = data.getDate().toString().padStart(2, "0");
    const mesFormatado = (data.getMonth() + 1).toString().padStart(2, "0");

    return `${data.getFullYear()}-${mesFormatado}-${diaFormatado}`;
  }
}

module.exports = EmprestimoController;
