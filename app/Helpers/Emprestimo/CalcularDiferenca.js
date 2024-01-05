const moment = require("moment");

async function calcularDiferenca(data_prevista_devolucao) {

    const hoje = moment();

    const data_formatada = moment(data_prevista_devolucao);

    return await hoje.diff(data_formatada, "days");

}

module.exports = { calcularDiferenca };
