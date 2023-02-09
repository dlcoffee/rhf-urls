## Goals

- `username` is required to make any requests
- without `username`, the search button should be disabled
- `variant` and (submitted) `query` are reflected in the url (want bookmarkability)
- any update to `query` does not update the url. only when it is submitted will it make the api and reflect in the URL
- any update `variant` updated in the URL, but it is purely UI state to display a particular sprite
