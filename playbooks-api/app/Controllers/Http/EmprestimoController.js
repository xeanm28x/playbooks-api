"use strict";

const Livro = use("App/Models/Livro");
const LivroFisico = use("App/Models/LivroFisico");
const { validate } = use("Validator");
const BadRequestException = use("App/Exceptions/BadRequestException");
const Moment = requiser("moment");

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
        data_devolucao
      });

      return{
        message: "Emprestimo realizado com sucesso!",
        novoEmprestimo,
        livroFisicoExistente,
        livroExistente
      }

    }catch(erro){

    }

  }

  // DEVOLVER

  async update({}){

  }

  // BUSCAR EMPRESTIMOS EM ANDAMENTO

  // LISTAR UM UNICO EMPRESTIMO

  // BUSCAR HISTORICO DE EMPRESTIMO

  // ATUALIZAR DIAS DE ATRASO
  // !! ACTION (?)

  async atualizarAtraso(){

  }

}

module.exports = EmprestimoController;
