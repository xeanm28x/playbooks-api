const moment = require("moment");
const hoje = moment();

async function calcularDevolucao(livro) {
  let dias = ((livro.numero_paginas / 100) | 0) * 7;

  if (dias == 0) dias = 7;

  dias = hoje.add(dias, "days");
  return dias.format();
}

module.exports = { hoje: hoje.format(), calcularDevolucao };
