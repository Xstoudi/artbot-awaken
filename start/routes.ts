import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async ({ response }) => response.redirect().toRoute('artists.index')).as('index')

Route.get('/auth/login', 'AuthController.index').as('auth.index')
Route.post('/auth/login', 'AuthController.login').as('auth.login')
Route.post('/auth/logout', 'AuthController.logout').as('auth.logout').middleware('auth')

Route.group(() => {
  Route.resource('/artists', 'ArtistsController').as('artists')
  Route.post('/artists/:id/toot', 'ArtistsController.toot').as('artists.toot')
  Route.resource('/artists.missings', 'MissingsController')
    .as('missings')
    .paramFor('artists', 'artistId')
    .paramFor('missings', 'paintingId')
  Route.get('/users/:id', 'UsersController.show').as('users.show')
  Route.post('/users/:id/password', 'UsersController.changePassword').as('users.changePassword')
}).middleware('auth')
