const Model = use('Model');

class Emprestimo extends Model {

    static get table(){
        return 'emprestimo';
    }

    static get primaryKey() {
        return 'id';
    }

    static get createdAtColumn(){
        return 'data_criacao';
    }

    static get updatedAtColumn(){
        return 'data_atualizacao';
    }

    usuario(){
        return this.belongsTo('App/Models/Usuario', 'id_usuario', 'id');
    }

    livro(){
        return this.belongsTo('App/Models/LivroFisico', 'id_livro_fisico', 'id');
    }

}

module.exports = Emprestimo;
