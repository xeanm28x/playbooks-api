"use strict";

const Livro = require("App/Models/Livro");
const LivroFisicoController = require("App/Controller/LivroFisicoController");
const LivroDigitalController = require("App/Controller/LivroDigitalController");
const { validate } = use("Validator");
const BadRequestException = use("App/Exceptions/BadRequestException");

const livroValidador = {
    titulo: "required",
    autor: "required",
    genero: "required",
    numero_paginas: "required",
    editora: "required",
    ano_publicacao: "required",
};

class LivroController{

    /* INSERÇÃO */

    async store({ request }){

        const {titulo, autor, genero, numero_paginas, editora, ano_publicacao} = await request.all();

        const livroValidado = await validate(
            {
              titulo,
              autor,
              genero,
              numero_paginas,
              editora,
              ano_publicacao,
            },
            livroValidador
        );
      
        if (livroValidado.fails()) {
            throw new BadRequestException(
                "Credenciais de livro inválidas.",
                "E_INVALID_CREDENTIAL"
            );
        }

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

    /* LISTAGEM ÚNICA */

    async show({ request }) {

        const { titulo, autor, genero, numero_paginas, editora, ano_publicacao } = await request.all();
        return await this.findBook(titulo, autor, genero, numero_paginas, editora, ano_publicacao);

    }

    /* REMOÇÃO */

    async destroy({params}){

        const livro = await Livro.findBy('id', params.id);

        if(!livro){
            throw new BadRequestException("Livro não encontrado.", "E_BOOK_NOT_FOUND");
        }

        await LivroFisicoController.destroy(params);

        await LivroDigitalController.destroy(params);

        return{
            message: "Livro excluído com sucesso.",
            livro
        }

    }

    /* BUSCAS */

    async findByTitulo(titulo) {
        return await Livro.query()
          .where("titulo", "LIKE", `%${titulo}%`)
          .fetch();
    }
    
    async findByAutor(autor) {
        return await Livro.query()
        .where("autor", "LIKE", `%${autor}%`)
        .fetch();
    }

    async findByGenero(genero) {
        return await Livro.query().where("genero", "LIKE", `%${genero}%`).fetch();
    }

    async findByNumeroPaginas(numero_paginas) {
        return await Livro.query().where("numero_paginas", "=", `%${numero_paginas}%`).fetch();
    }

    async findByEditora(editora) {
        return await Livro.query().where("editora", "LIKE", `%${editora}%`).fetch();
    }

    async findByAnoPublicacao(ano_publicacao) {
        return await Livro.query().where("ano_publicacao", "=", `%${ano_publicacao}%`).fetch();
    }

    async findBook({params}) {
        if (params.titulo) return await this.findByTitulo(titulo);
        if (params.autor) return await this.findByAutor(autor);
        if (params.genero) return await this.findByGenero(genero);
        if (params.numero_paginas) return await this.findByNumeroPaginas(numero_paginas);
        if (params.editora) return await this.findByEditora(editora);
        if (params.ano_publicacao) return await this.findByAnoPublicacao(ano_publicacao);
        return await Livro.all();
    }

}

module.exports = LivroController;