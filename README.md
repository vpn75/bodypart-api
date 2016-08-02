#PACS Bodypart API

This NodeJS module provides a REST-API interface for a facility PACS bodypart table. The API was developed using a NodeJS/Express/MongoDB stack.

##Background
Modern PACS systems typically associate a bodypart, best understood as an 'anatomical region' with each imaging procedure. These bodypart values can drive a variety of application workflows and typically determine what display protocol to use along with which relevant priors to hang for a particular study. The mapping of bodypart to imaging study often involves matching a study by patientID/accessionnumber to a particular HL7 order to identify the associated procedure code which is used as the "key" to look up the relevant bodypart value stored in an application config.

##Overview
This API provides an alternate interface using modern software standards for the bodypart lookup. Adopting a RESTful-API approach to the bodypart table simplifies interactions with other 3rd party systems. For example, the facility RIS that maintains imaging procedure details could utilize the API when procedures are added/updated and these changes would be immediately available to the PACS. Convenient web-based tools could also be developed by taking advantage of the REST API.

##Database Design
This API relies on a MongoDB with collection named `bodyparts`.

The collection schema is as follows:
```javascript

const Schema = {
    imgcode: {type: String, required: true},
    bodypart: {type: String, required: true},
    modality: {type: String, required: true},
    description: {type: String, required: true},
  }

```
Most facility RIS systems can provide their procedure table in a CSV format though not all provide associated bodyparts. In that case, you will need to assign bodyparts manually.

The CSV file should have a header line as follows:

`imgcode,bodypart,modality,description`

Once you have the procedure report in CSV format, you can use the following command to import it into MongoDB:

`mongoimport -d <your_dbname> -c bodyparts --type csv --file <your_csv_filename> --headerline`

##API Details
The default API base URL is `http://localhost:3001/api`

###GET: /bodypart/{value}?
This API endpoint allows a user to query for procedures by specified `bodypart`. 

If `bodypart` is excluded, the API will return a listing of distinct bodyparts used at the facility. This can be useful for web-apps using the API to maintain up-to-date bodypart filters.

Example:

```javascript
{
  totalRecords:5,
  records: [
    CHEST,
    ABDOMEN,
    ABDOMEN_PELVIS,
    HEAD,
    PELVIS
    ]
}
```
The JSON response when searching by specific `bodypart` will be in the following format:

```javascript
{
    totalRecords: <integer> Number of matching records
    records: [
        {
            imgcode: Procedure code
            bodypart: Associated anatomical region
            modality: Imaging modality code (ie. CR,CT,MR,US etc.)
            description: Imaging procedure description
        }
    ]
}

If no matching records found, HTTP status of 404 will be returned.
