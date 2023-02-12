import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async ({ response }) => response.redirect().toRoute('artists.index')).as('index')

Route.get('/auth/login', 'AuthController.index').as('auth.index')
Route.post('/auth/login', 'AuthController.login').as('auth.login')
Route.post('/auth/logout', 'AuthController.logout').as('auth.logout').middleware('auth')

Route.group(() => {
  Route.resource('/artists', 'ArtistsController').as('artists')
  Route.resource('/missings', 'MissingsController').as('missings')
  Route.get('/users/:id', 'UsersController.show').as('users.show')
  Route.post('/users/:id/password', 'UsersController.changePassword').as('users.changePassword')
}).middleware('auth')
