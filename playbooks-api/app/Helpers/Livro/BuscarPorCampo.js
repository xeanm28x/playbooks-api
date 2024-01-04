const Livro = use("App/Models/Livro");

async function buscarPorCampo(campo, valor) {
  const livro = await Livro.query().where(campo, "LIKE", `%${valor}%`).fetch();

  if (!livro.rows[0] || livro.ativo == 0) return null;

  return livro;
}

module.exports = buscarPorCampo;
