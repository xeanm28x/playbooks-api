"use strict";

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use("Route");

//Usuários
Route.post("/usuarios", "UsuarioController.store");
Route.post("/login", "UsuarioController.login");
Route.get("/usuarios", "UsuarioController.show").middleware("auth");

//Livros
Route.post("/livros", "LivroController.store").middleware("auth");
Route.get("/livros", "LivroController.show").middleware("auth");
Route.delete("/livros", "LivroController.destroy").middleware("auth");
Route.patch("/livros", "LivroController.update").middleware("auth");

//Livros digitais
Route.post("/livrosDigitais", "LivroDigitalController.store").middleware("auth");
Route.get("/livrosDigitais", "LivroDigitalController.show").middleware("auth");
Route.delete("/livrosDigitais", "LivroDigitalController.destroy").middleware("auth");
Route.patch("/livrosDigitais", "LivroDigitalController.update").middleware("auth");

//Livros fisicos
Route.post("/livrosFisicos", "LivroFisicoController.store").middleware("auth");
Route.get("/livrosFisicoS", "LivroFisicoController.show").middleware("auth");
Route.delete("/livrosFisicos", "LivroFisicoController.destroy").middleware("auth");
Route.patch("/livrosFisicos", "LivroFisicoController.update").middleware("auth");

//Emprestimos
Route.post("/emprestimos", "EmprestimoController.store").middleware("auth");
Route.get("/emprestimos", "EmprestimoController.show").middleware("auth");
Route.get("/emprestimos/atuais", "EmprestimoController.empAtuais").middleware("auth");
Route.delete("/emprestimos", "EmprestimoController.destroy").middleware("auth");
Route.patch("/emprestimos", "EmprestimoController.update").middleware("auth");
