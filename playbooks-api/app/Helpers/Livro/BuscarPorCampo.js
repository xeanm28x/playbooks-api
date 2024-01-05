const Livro = use("App/Models/Livro");

async function buscarPorCampo(campo, valor) {
  const livro = await Livro.query()
    .where(campo, "LIKE", `%${valor}%`)
    .where("ativo", 1)
    .fetch();

  if (!livro.rows[0]) return null;

  return livro;
}

module.exports = buscarPorCampo;
