Cypress.Commands.add('loginViaApiWithToken', () => {

    const userCredentialsToLogin = {
        "user": {
            "email": Cypress.env("email"),
            "password": Cypress.env("password")
        }
      }
    
    cy.request(
        "POST", 
        "https://conduit-api.bondaracademy.com/api/users/login", 
        userCredentialsToLogin)
        .its('body').
        then(body => {
            cy.log(body)
            const token = body.user.token 
            cy.wrap(token).as('token')
            cy.visit(
                '/', 
                {
                    onBeforeLoad (win){
                        win.localStorage.setItem('jwtToken', token)
                }
            })
            Cypress.env('token', token)
        })

    })