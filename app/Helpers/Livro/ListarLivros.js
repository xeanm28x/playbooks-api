const LivroDigitalController = use(
  "App/Controllers/Http/LivroDigitalController"
);
const LivroFisicoController = use("App/Controllers/Http/LivroFisicoController");

async function listarLivros(livros) {
  let livrosRetornados = [];

  for (let livro of livros) {
    if (livro.ativo == 1) {
      const id_tabela_livro = livro.id;

      const livroFisico = await new LivroFisicoController().show({
        request: {
          id_tabela_livro,
        },
      });

      const livroDigital = await new LivroDigitalController().show({
        request: {
          id_tabela_livro,
        },
      });

      livrosRetornados.push({ livro, livroFisico, livroDigital });
    }
  }
  return livrosRetornados;
}

module.exports = listarLivros;
