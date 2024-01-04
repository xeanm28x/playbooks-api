const buscarPorCampo = require("./BuscarPorCampo");
const Livro = use("App/Models/Livro");

async function buscarLivro(params) {
  if (params.id) return buscarPorCampo("id", params.id);
  if (params.titulo) return buscarPorCampo("titulo", params.titulo);
  if (params.autor) return buscarPorCampo("autor", params.autor);
  if (params.genero) return buscarPorCampo("genero", params.genero);
  if (params.ano_publicacao)
    return buscarPorCampo("ano_publicacao", params.ano_publicacao);
  if (params.editora) return buscarPorCampo("editora", params.editora);
  if (params.numero_paginas)
    return buscarPorCampo("numero_paginas", params.numero_paginas);

  return null;
}

module.exports = buscarLivro;
