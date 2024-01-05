const Emprestimo = use("App/Models/Emprestimo");
const { hoje, calcularDiferenca } = use("App/Helpers/Emprestimo");

class AtualizarDiasAtrasoAction{

    async action(){

        try{

            let emprestimos_atrasados = await Emprestimo.query()
                                        .where("data_devolucao", null)
                                        .where("data_prevista_devolucao", "<", hoje)
                                        .fetch();

            if(!emprestimos_atrasados){

                return{
                    message: "Não há empréstimos contendo dias em atraso.",
                    status: 204
                }

            }

            for(let emprestimo_atrasado of emprestimos_atrasados.rows){

                const emprestimo = await Emprestimo.find(emprestimo_atrasado.id);

                emprestimo.dias_atraso = await calcularDiferenca(emprestimo.data_prevista_devolucao);

                await emprestimo.save();

            }

            return{
                message: "Os dias de atraso foram atualizados com sucesso!",
                status: 200
            }

        }catch(erro){
            console.log(erro);
        }
    }

}

module.exports = AtualizarDiasAtrasoAction;