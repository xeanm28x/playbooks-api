const LivroDigitalController = use(
  "App/Controllers/Http/LivroDigitalController"
);
const LivroFisicoController = use("App/Controllers/Http/LivroFisicoController");

async function escolherController(arquivo_pdf) {
  if (arquivo_pdf) return new LivroDigitalController();
  return new LivroFisicoController();
}

module.exports = escolherController;
