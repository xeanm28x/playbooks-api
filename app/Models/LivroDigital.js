/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class LivroDigital extends Model {

    static get table(){
        return 'livro_digital';
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
        return['ebook'];
    }

    livro(){
        return this.belongsTo('App/Models/Livro', 'id_tabela_livro', 'id');
    }
}

module.exports = LivroDigital;
