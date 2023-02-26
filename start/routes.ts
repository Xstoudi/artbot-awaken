import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/', 'IndexController.index').as('index')
  Route.get('/auth/login', 'AuthController.index').as('auth.index')
  Route.post('/auth/login', 'AuthController.login').as('auth.login')
  Route.post('/auth/logout', 'AuthController.logout').as('auth.logout').middleware('auth')
}).middleware(['silentAuth'])

Route.group(() => {
  Route.resource('/artists', 'ArtistsController').as('artists')
  Route.post('/artists/:id/toot', 'ArtistsController.toot').as('artists.toot')
  Route.resource('/artists.missings', 'MissingsController')
    .as('missings')
    .paramFor('artists', 'artistId')
    .paramFor('missings', 'paintingId')

  Route.get('/users', 'UsersController.index').as('users.index')
  Route.post('/users', 'UsersController.store').as('users.store')
  Route.get('/users/:id', 'UsersController.show').as('users.show')
  Route.delete('/users/:id', 'UsersController.destroy').as('users.destroy')
  Route.post('/users/:id/password', 'UsersController.changePassword').as('users.changePassword')
}).middleware(['auth'])
