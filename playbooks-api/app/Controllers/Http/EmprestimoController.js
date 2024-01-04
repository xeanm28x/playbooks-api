"use strict";

const Livro = use("App/Models/Livro");
const LivroFisico = use("App/Models/LivroFisico");
const { validate } = use("Validator");
const BadRequestException = use("App/Exceptions/BadRequestException");
const Moment = required("moment");

const emprestimoValidador = {
  id_usuario: "required",
  id_livro_fisico: "required"
};

class EmprestimoController{

  async calcularDevolucao(livro){

    const data_devolucao = Moment();

    const semanas = (livro.numero_paginas / 100) | 0;

    if(semanas == 0) semanas = 1;

    data_devolucao = data_devolucao.add(semanas, "weeks");

    return data_devolucao;

  }

  // EMPRESTAR

  async store({ request }){

    try{

      const {id_usuario, id_livro_fisico} = await request.all();

      const emprestimoValidado = await validate(
        {
          id_usuario,
          id_livro_fisico
        },
        emprestimoValidador
      );

      if(emprestimoValidado.fails()){

        throw new BadRequestException(
          "Informações inválidas.",
          "E_INVALID_CREDENTIAL"
        );

      }

      // VERIFICANDO USUARIO

      const usuarioExistente = await Usuario.findBy("id", id_usuario);

      if(!usuarioExistente){

        throw new BadRequestException(
          "Usuário inexistente.",
          "E_USER_NOT_EXIST"
        );

      }

      // VERIFICANDO VERSAO FISICA

      const livroFisicoExistente = await LivroFisico.findBy("id", id_livro_fisico);

      if(!livroFisicoExistente){

        throw new BadRequestException(
          "Versão física não encontrada.",
          "E_BOOK_NOT_FOUND"
        );

      }

      if(livroFisicoExistente.total_disponivel == 0){

        throw new BadRequestException(
          "Não há volumes disponíveis para empréstimo.",
          "E_BOOK_UNAVAILABLE"
        );

      }

      const livroExistente = await Livro.findBy("id", livroFisicoExistente.id_tabela_livro);

      if(!livroExistente){

        throw new BadRequestException(
          "Livro não encontrado.",
          "E_BOOK_NOT_FOUND"
        );

      }

      const data_devolucao = (await calcularDevolucao(livroExistente)).unix();

      const novoEmprestimo = await Emprestimo.create({
        id_usuario,
        id_livro_fisico,
        data_devolucao,
        dias_atraso: 0
      });

      livroFisicoExistente.total_emprestado += 1;

      livroFisicoExistente.total_disponivel -= 1;

      await livroFisicoExistente.save();

      return{
        message: "Emprestimo realizado com sucesso!",
        novoEmprestimo,
        livroFisicoExistente,
        livroExistente
      }

    }catch(erro){

    }

  }

  // DEVOLUCAO

  async update({ params }){

    try{

      const emprestimoExistente = await Emprestimo.findBy(params.id);

      const dataAtual = Moment();

      if(!emprestimoExistente){

        throw new BadRequestException(
          "Empréstimo não encontrado",
          "E_EMPRESTIMO_NOT_FOUND"
        );

      }

      emprestimoExistente.data_devolucao = dataAtual.unix();

      await emprestimoExistente.save();

      return{
        message: "Empréstimo encerrado com sucesso!",
        emprestimoExistente
      }

    }catch(erro){

    }

  }

  // BUSCAR EMPRESTIMOS EM ANDAMENTO

  async empAtuais({ params, response }){

    try{

      const dataAtual = Moment();

      const emprestimosAtuais = await Emprestimo.query()
                                .where("id", params.id)
                                .where(function (){
                                  this.where("data_devolucao", ">=", dataAtual.unix())
                                      .orWhere("dias_atraso", ">", 0);
                                })
                                .fetch();

      return response.status(200).json(emprestimosAtuais);

    }catch(erro){

    }

  }

  // LISTAR UM UNICO EMPRESTIMO

  async show({ request }){

    try{

      const {id_usuario, id_livro_fisico, data_devolucao} = await request.all();

      const emprestimoExistente = await Emprestimo.query()
                                  .where("id_usuario", id_usuario)
                                  .where("id_livro_fisico", id_livro_fisico)
                                  .where("data_devolucao", data_devolucao)
                                  .fetch();

      if(!emprestimoExistente){

        throw new BadRequestException(
          "Empréstimo não encontrado.",
          "E_EMPRESTIMO_NOT_FOUND"
        );

      }

      return emprestimoExistente;

    }catch(erro){

    }

  }

  // BUSCAR HISTORICO DE EMPRESTIMO

  async index({ response }){

    try{

      const emprestimos = await Emprestimo.all();

      return response.status(200).json(emprestimos);

    }catch(erro){

    }

  }

}

module.exports = EmprestimoController;
