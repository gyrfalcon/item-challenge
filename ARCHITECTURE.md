# Architecture Documentation

## Versioning and Auditing

To start with here are some assumptions about the needs of versioning/auditing that I made:

1. The latest version needs to be easily retrievable without knowing what the specific version number is.
1. All updates result in a new version being created.
1. The latest version shouldn't appear twice in the audit log.
1. Old versions can't be updated.
1. `GET /api/items` returns only the latest version of all items.

To achieve this I would add a sort key to the item document (tenatively named 'versionSk') that would partition the item ID based on the version. The partition key would remain the item ID. As I don't believe a property from a nested object can be used as a sort key, a new field is required. Having a separate sort key property does also allow for the definition of a static version key to be used for the latest version, allowing the `metadata.version` to always be the version number. The process would work as such:

1. On item creation, two items are persisted in DynamoDb, one with the `versionSk` set to 1 and the other with `versionSk` set to `'latest'`.
1. The `GET /api/items/:itemId` endpoint would always use the `'latest'` version keyword to return the latest version to the caller.
1. The `PUT /api/items/:itemId` endpoint would get the `'latest'` item, apply any updates from the update payload, update the version in the metadata, insert the updated item with a new `versionSk` and finally update the existing item with the `'latest'` `versionSk`.
    1. The `POST /api/items/:id/versions` endpoint would work similarly, but only the metadata version number and lastUpdated timestamp would need to be updated on the `'latest'` `versionSk` item.
1. The `GET /api/items/:itemId/audit` endpoint would query by the item ID provided and filter out the item with the `'latest'` `versionSk` from the results.
1. The `GET /api/items` would need to filter out non-latest items from the results. A search parameter to include non-latest items in the results could be a possible feature enhancement.

Alternate approach: Rather than putting all items into the same DynamoDb table, a second table could be used to store the versioned items. The advantages to this approach would be 1) read/write units could be better optimized for each table and 2) the audit and list endpoints would not need filtering logic, they could simply query only one of the tables. The `TransactWriteItems` operation would help to ensure both tables are updated together, helping to keep the tables in sync.
