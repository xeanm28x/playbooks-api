const Model = use('Model');

class Usuario extends Model {

    static get table(){
        return 'usuario';
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

    static get hidden(){
        return['senha'];
    }
}

module.exports = Usuario;
