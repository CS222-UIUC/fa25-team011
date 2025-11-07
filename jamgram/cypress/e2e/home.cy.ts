describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/')
  }) // visit before each test


  it('successfully loads', () => {
    cy.contains('JamGram').should('be.visible')
  })


  describe('Header', () => {
    it('displays the JamGram logo', () => {
      cy.get('header').contains('JamGram').should('be.visible')
    })


    it('shows the Connect Spotify button when not logged in', () => {
      cy.contains('button', 'Connect Spotify').should('be.visible')
    })


    it('displays the music emoji icon', () => {
      cy.get('header').contains('🎵').should('be.visible')
    })
  })


  describe('Image Upload Section', () => {
    it('displays the image upload component', () => {
      cy.contains('Upload Your Image').should('be.visible')
    })


    it('shows drag and drop instructions', () => {
      cy.contains('Drag & drop an image here').should('be.visible')
    })


    it('displays the file selection button', () => {
      cy.contains('Select Image').should('be.visible')
    })


    it('shows accepted file types', () => {
      cy.contains('PNG, JPG, JPEG, HEIC').should('be.visible')
    })


    it('allows file upload via input', () => {
      // NOTE: i added  a test image to cypress/fixtures/
      cy.get('input[type="file"]').should('exist')


      cy.get('input[type="file"]').selectFile('cypress/fixtures/test-image.jpg', { force: true })
      cy.get('img[alt="Preview"]').should('be.visible')
    })
  })


  describe('Chat Section', () => {
    it('displays the chat header', () => {
      cy.contains('h2', 'Chat').should('be.visible')
    })


    it('shows chat instructions', () => {
      cy.contains('Tailor and/or tweak recommendations').should('be.visible')
    })


    it('displays empty state message', () => {
      cy.contains('Start the conversation with an image upload').should('be.visible')
    })


    it('shows the message input textarea', () => {
      cy.get('textarea[aria-label="Type a message"]').should('be.visible')
    })


    it('displays the send button', () => {
      cy.contains('button', 'Send').should('be.visible')
    })


    it('send button is disabled when input is empty', () => {
      cy.contains('button', 'Send').should('be.disabled')
    })


    it('enables send button when text is entered', () => {
      cy.get('textarea[aria-label="Type a message"]').type('Hello')
      cy.contains('button', 'Send').should('not.be.disabled')
    })


    it('clears input after sending message', () => {
      cy.get('textarea[aria-label="Type a message"]').type('Test message')
      cy.contains('button', 'Send').click()
      cy.get('textarea[aria-label="Type a message"]').should('have.value', '')
    })
  })


  describe('Layout', () => {
    it('uses responsive grid layout', () => {
      cy.get('.grid').should('exist')
      cy.get('.grid').should('have.class', 'lg:grid-cols-2')
    })


    it('has purple gradient background', () => {
      cy.get('main').should('have.class', 'bg-gradient-to-b')
    })
  })
})


// cypress/e2e/image-upload-flow.cy.ts
describe('Image Upload Flow', () => {
  beforeEach(() => {
    cy.visit('/')
  })


  it('completes full image upload workflow', () => {
    // start at upload section
    cy.contains('Upload Your Image').should('be.visible')
   
    // upload an image
    cy.get('input[type="file"]').selectFile('cypress/fixtures/test-image.jpg', { force: true })
   
    // verify preview appears
    cy.get('img[alt="Preview"]').should('be.visible')
   
    // verify remove button appears
    cy.contains('button', 'Remove Image').should('be.visible')
   
    // click remove button
    cy.contains('button', 'Remove Image').click()
   
    // verify back to initial state
    cy.contains('Select Image').should('be.visible')
  })
})


// cypress/e2e/chat-flow.cy.ts
describe('Chat Interaction Flow', () => {
  beforeEach(() => {
    cy.visit('/')
  })


  it('completes full chat interaction', () => {
    // type a message
    cy.get('textarea[aria-label="Type a message"]').type('Recommend me some indie rock')
   
    // send button should be enabled
    cy.contains('button', 'Send').should('not.be.disabled')
   
    // send the message
    cy.contains('button', 'Send').click()
   
    // input should be cleared
    cy.get('textarea[aria-label="Type a message"]').should('have.value', '')
   
    // send button should be disabled again
    cy.contains('button', 'Send').should('be.disabled')
  })


  it('allows multi-line input with Shift+Enter', () => {
    cy.get('textarea[aria-label="Type a message"]')
      .type('First line{shift}{enter}Second line')
   
    cy.get('textarea[aria-label="Type a message"]')
      .should('contain.value', 'First line\nSecond line')
  })


  it('sends message with Enter key', () => {
    cy.get('textarea[aria-label="Type a message"]')
      .type('Test message{enter}')
   
    // input should be cleared after Enter
    cy.get('textarea[aria-label="Type a message"]').should('have.value', '')
  })
})