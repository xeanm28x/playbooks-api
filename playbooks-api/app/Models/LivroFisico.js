const Model = use('Model');

class LivroFisico extends Model {

    static get table(){
        return 'livro_fisico';
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

    livro(){
        return this.belongsTo('App/Models/Livro', 'id_tabela_livro', 'id');
    }
}

module.exports = LivroFisico;
