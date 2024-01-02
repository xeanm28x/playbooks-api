'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash');

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

    static boot() {
        super.boot();
        this.addHook('beforeSave', async (userInstance) => {
          if (userInstance.dirty.password) {
            userInstance.password = await Hash.make(userInstance.password)
          }
        });
    }

    tokens() {
        return this.hasMany('App/Models/Token')
    }
}

module.exports = Usuario;
