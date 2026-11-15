# Favourites: keep a list of products I am interested in

As a signed-in customer I want to mark products as favourites and find them again in my account, so that I can come back to them later without searching.

The "Add to favourites" button is on every product's detail page; the list is under My favorites in the account menu.

**Scenario: add a product to my favourites**
Given I am signed in as a customer and the product is not among my favourites
When I click "Add to favourites" on its detail page
Then the message "Product added to your favorites list." appears
And My favorites lists the product with its name and description

**Scenario: add a product that already is a favourite**
Given the product is already among my favourites
When I click "Add to favourites" on its detail page again
Then the message "Product already in your favorites list." appears
And My favorites still lists the product once

**Scenario: visitor who is not signed in**
Given I am not signed in
When I click "Add to favourites" on a product's detail page
Then the message "Unauthorized, can not add product to your favorite list." appears and nothing is stored

**Scenario: remove a favourite**
Given a product is among my favourites
When I click the remove button next to it on My favorites
Then the product disappears from the list
And it is still gone after I reload the page

**Scenario: the API for other clients**
Given a signed-in customer
When they send POST /favorites with `{"product_id": "<id>"}`
Then the answer is 201 Created with the new favourite, or 409 with "Duplicate Entry" when the product already is their favourite
When they send DELETE /favorites/{id}
Then the answer is 204 No Content and GET /favorites no longer lists it
