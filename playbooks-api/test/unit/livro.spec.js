const { test, trait } = use('Test/Suite')('TesteLivros');
const Livro = use('App/Models/Livro');

trait('Test/ApiClient');

/* LIMPEZA NO BANCO ANTES DO TESTE UNITARIO */

trait('DatabaseTransactions');

test('deve criar um novo livro', async ( {assert, client} ) => {

    const novoLivro = {
        titulo : "Psicose",
        autor : "Robert Bloch",
        genero : "Horror",
        numero_paginas : 256,
        editora : "Darkside",
        ano_publicacao : 2013
    }

    const resposta = await client.post('/livros').send(novoLivro).end();

    resposta.assertStatus(200);
    resposta.assertJSONSubset({
        message: "Livro criado com sucesso!"
    });

    const livroEncontrado = await Livro.findBy('titulo', novoLivro.titulo);
    assert.notEqual(livroEncontrado, null);

});