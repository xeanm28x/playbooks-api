const buscarPorCampo = require("./BuscarPorCampo");
const Livro = use("App/Models/Livro");

async function buscarLivro(params) {
  let response;
  if (params.id) response = await buscarPorCampo("id", params.id);
  if (params.titulo) response = await buscarPorCampo("titulo", params.titulo);
  if (params.autor) response = await buscarPorCampo("autor", params.autor);
  if (params.genero) response = await buscarPorCampo("genero", params.genero);
  if (params.ano_publicacao)
    response = await buscarPorCampo("ano_publicacao", params.ano_publicacao);
  if (params.editora)
    response = await buscarPorCampo("editora", params.editora);
  if (params.numero_paginas)
    response = await buscarPorCampo("numero_paginas", params.numero_paginas);

  if (!response) response = await Livro.query().where("ativo", 1).fetch();

  return response;
}

module.exports = buscarLivro;
