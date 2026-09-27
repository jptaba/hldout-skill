Author: Priya (Product Owner)
Clarification from refinement: a duplicate favourite is a conflict, so the API must answer **409 Conflict** (not 422 as in the technical notes). The web shop can keep its current message for duplicates.
