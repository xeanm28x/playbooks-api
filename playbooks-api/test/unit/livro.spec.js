const { test, trait } = use('Test/Suite')('TesteLivros');
const Livro = use('App/Models/Livro');

trait('Test/ApiClient');

trait('DatabaseTransactions');

test('deve criar um novo livro', async ({assert, client}) => {

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
        message: "Livro criado com sucesso!",
        novoLivro
    });

    const livroEncontrado = await Livro.findBy('titulo', novoLivro.titulo);
    assert.notEqual(livroEncontrado, null);

});

test('deve remover um livro', async ({assert, client}) =>{

    const livro = {
        titulo : "Psicose",
        autor : "Robert Bloch",
        genero : "Horror",
        numero_paginas : 256,
        editora : "Darkside",
        ano_publicacao : 2013
    }

    const resposta = await client.post('/livros/delete').send(livro).end();
    resposta.assertStatus(200);
    resposta.assertJSONSubset({
        message: "Livro removido com sucesso."
    })

    const livroDeletado = await Livro.find(livro);

});
