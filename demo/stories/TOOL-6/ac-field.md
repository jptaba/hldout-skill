AC1 - GET /categories/tree returns the top-level categories (Hand Tools, Power Tools, Other), each with its sub-categories.
AC2 - Every sub-category's parent_id is the id of the category it is listed under.
AC3 - GET /categories/tree/{categoryId} returns that one category with its sub-categories. For an id that does not exist the API answers with the error status given in the OpenAPI file.
AC4 - GET /categories/search?q=<text> finds the categories whose name contains the text, ignoring case ("ham" and "HAM" both find Hammer).
AC5 - The shop page's "By category" filter shows the same tree: each top-level category with its sub-categories under it.
