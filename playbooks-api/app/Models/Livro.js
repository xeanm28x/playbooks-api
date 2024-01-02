const Model = use('Model');

class Livro extends Model {

    static get table(){
        return 'livro';
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
}

module.exports = Livro;
