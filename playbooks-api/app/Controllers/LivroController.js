"use strict";

const Livro = require("App/Models/Livro");

class LivroController{

    /* INSERIR NOVO LIVRO */

    async store({ request }){

        const {titulo, autor, genero, numero_paginas, editora, ano_publicacao} = await request.all();

        const novoLivro = Livro.create({
            titulo,
            autor,
            genero,
            numero_paginas,
            editora,
            ano_publicacao
        });

        return {
            message : "Livro criado com sucesso!",
            novoLivro
        }

    }

    /* LISTAR TODOS OS LIVROS */

    /* LISTAR UM LIVRO ESPECIFICO */

    /* REMOVER LIVRO */

    /* BUSCAS */

}

module.exports = LivroController;