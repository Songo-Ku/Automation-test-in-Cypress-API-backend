// import { onSmartTablePage } from "../support/page_objects/smartTablePage"\
import { mathNumberRandom } from "../support/funcitonalitiesJs/generatorUniqueId"

describe('Test with backedn', () => {

  beforeEach('login to application by interface', () => {
    cy.intercept('GET', Cypress.env('apiUrl')+'/api/tags', {fixture: 'tags.json'} )
    cy.loginViaApiWithToken()


    // expect(ls.getItem('https://conduit.bondaracademy.com'))
  })

  it('verify login by user interface with type login and password', () => {
    cy.clearLocalStorage()
    cy.getAllLocalStorage()
    cy.visit('/login')
    cy.get('[placeholder="Email"]').type('zbogdancajanko1@gmail.com')
    cy.get('[placeholder="Password"]').type('password123')
    cy.get('form').submit()
  })


  it('verify correct request and response', () => {

    const mathNumberRandom = Math.random() *10
    const titleWithUniqueId = `title${mathNumberRandom}`
    const descriptionWithUniqueId = `description ${mathNumberRandom}`
    const bodyWithUniqueId = `body${mathNumberRandom}`


    cy.intercept('POST', '**/articles/').as('postArticles')
    cy.contains('New Article').click()
    cy.get('[formcontrolname="title"]').type(titleWithUniqueId)
    cy.get('[formcontrolname="description"]').type(descriptionWithUniqueId)
    cy.get('[formcontrolname="body"]').type(bodyWithUniqueId)
    cy.contains("Publish Article").click()

    cy.wait('@postArticles').then(xhr => {
      console.log(xhr)
      expect(xhr.response.statusCode).to.equal(201)
      expect(xhr.request.body.article.body).to.equal(bodyWithUniqueId)
      expect(xhr.response.body.article.body).to.equal(bodyWithUniqueId)
      expect(xhr.response.body.article.description).to.equal(descriptionWithUniqueId)
    })

    cy.get('@token').then(token => {
      cy.request({
          url: Cypress.env('apiUrl')+'/api/articles/'+titleWithUniqueId+'-21016',
          headers: { 'Authorization': 'Token '+token},
          method: 'DELETE'
      }).then( response => {
          expect(response.status).to.equal(204)
      })
    })  

  })

  it('verify popular tags are displayed', () => {
    cy.visit('/')
    cy.get('.tag-list')
    .should('contain', 'Cy')
    .should('contain', 'JS')
    .should('contain', 'Py')
  })


  it('intercepting and modifying the req ', () => {

    const titleWithUniqueId = `title + ${mathNumberRandom}`
    const descriptionWithUniqueId = `description ${mathNumberRandom}`
    const bodyWithUniqueId = `body + ${mathNumberRandom}`

    cy.intercept('POST', '**/articles/', (req) => {
      req.body.article.description = 'Mocked description 2'
    }).as('postArticles')
    cy.contains('New Article').click()
    cy.get('[formcontrolname="title"]').type(titleWithUniqueId)
    cy.get('[formcontrolname="description"]').type(descriptionWithUniqueId)
    cy.get('[formcontrolname="body"]').type(bodyWithUniqueId)
    cy.contains("Publish Article").click()

    cy.wait('@postArticles').then(xhr => {
      console.log(xhr)
      expect(xhr.response.statusCode).to.equal(201)
      expect(xhr.request.body.article.body).to.equal(bodyWithUniqueId)
      expect(xhr.response.body.article.body).to.equal(bodyWithUniqueId)
      expect(xhr.response.body.article.description).to.equal('Mocked description 2')
    })
  })

  it('intercepting and modifying the req ', () => {

    const titleWithUniqueId = `title + ${mathNumberRandom}`
    const descriptionWithUniqueId = `description ${mathNumberRandom}`
    const bodyWithUniqueId = `body + ${mathNumberRandom}`

    //  it cause fake our browser and show different data than backend delivered in response.
    cy.intercept('POST', '**/articles/', (req) => {
      req.reply(res => {
        expect(res.body.article.description).to.equal(descriptionWithUniqueId)
        res.body.article.description = 'Mocked description with fake response and change data'
      })
    }).as('postArticles')
    cy.contains('New Article').click()
    cy.get('[formcontrolname="title"]').type(titleWithUniqueId)
    cy.get('[formcontrolname="description"]').type(descriptionWithUniqueId)
    cy.get('[formcontrolname="body"]').type(bodyWithUniqueId)
    cy.contains("Publish Article").click()

    cy.wait('@postArticles').then(xhr => {
      console.log(xhr.response.body.article.description)
      expect(xhr.response.statusCode).to.equal(201)
      expect(xhr.request.body.article.body).to.equal(bodyWithUniqueId)
      expect(xhr.response.body.article.body).to.equal(bodyWithUniqueId)
      expect(xhr.response.body.article.description).to.equal('Mocked description with fake response and change data')
    })
  })
 


  it.only('verify global feed likes count', () => {
    cy.intercept('GET', Cypress.env('apiUrl')+'/api/articles/feed*', {"articles":[],"articlesCount":0})
    cy.intercept('GET', Cypress.env('apiUrl')+'/api/articles*', {fixture: 'articles.json'})
    cy.contains('Global Feed').click()
    cy.get('app-article-list button').then(heartList => {
      expect(heartList[0]).to.contain('1')
      expect(heartList[1]).to.contain('5')   
    }) 

    cy.fixture('articles').then(file => {
      const article2Link = file.articles[1].slug
      cy.log(file, ' to jest nasz plik ktory chcemy sprawdzic')
      file.articles[1].favoritesCount = 6
      cy.intercept('POST', Cypress.env('apiUrl')+'/api/articles/' + article2Link + '/favorite', file)
    })

    cy.get('app-article-list button').eq(1).click().should('contain', '6')
  })

  it('delete article from user interface tab global feed after create article via api ', () => {

    //  instruction what to do
    // 1 prepare login to get token 2 then request api create article using token 3 get slug, paste it to the interface and url adress
    //  4 generate automate interface access to article, click delete and confir,  5 body request as constant 6 on request
    //  use then and check expect 7  klik w global feed, pierwszy artykul, i sprawdz czy sie zgadza .first()
    //  8 klik w delete, submit()    article-actions  9 wejdz w liste wszystkich artykulow i sprawdz czy pierwsdzy jest innny niz tworzylismy
    //  z tego request get trzeba wziac reqest . its(body) then body expect not to equal nazwa naszego usunietego 

    const bodyNewArticleReq = {
      "article": {
          "title": "req from api postman",
          "description": "api req postman",
          "body": "nvm",
          "tagList": []
      }
    }

    cy.get('@token').then(token => {
      cy.request({
        url: Cypress.env('apiUrl')+'/api/articles/',
        headers: {"Authorization": "Token " + token},
        method: "POST",
        body: bodyNewArticleReq
      }).then(response => {
        expect(response.status).to.equal(201)
      })

      cy.contains('Global Feed').click()
      cy.wait(5000) // without this line tests cant go ahead
      cy.get('.article-preview').first().click()
      cy.get('.article-actions').contains('Delete Article').click()

      cy.request({
        url: Cypress.env('apiUrl')+'/api/articles?limit=10&offset=0',
        headers: {'Authorization': 'Token '+token},
        method: 'GET'
      }).its('body').then(body => {
        expect(body.articles[0].title).not.to.equal("req from api postman")
      })

    })
  })
  
})

